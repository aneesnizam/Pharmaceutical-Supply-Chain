const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files from the public folder

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Update if needed
    database: "medicine_system"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected!");
});

// ----- USER ENDPOINTS ----- //

// Register User
app.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;
    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, password, role], (err, result) => {
        if (err) return res.status(500).json({ error: "Error registering user" });
        res.json({ message: "User registered successfully!" });
    });
});

// Login User (now returning email as well)
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT name, email, role FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length > 0) {
            const user = results[0];
            res.json({ success: true, name: user.name, email: user.email, role: user.role });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    });
});

// ----- MEDICINE ENDPOINTS ----- //

// Create Medicine (Manufacturer creates a medicine)
app.post("/createMedicine", (req, res) => {
    const { medicine_name, manufacturer } = req.body;
    if (!medicine_name || !manufacturer) {
        return res.status(400).json({ error: "Medicine name and manufacturer are required." });
    }
    // Generate a random ID (for simplicity)
    const medicine_id = Math.floor(Math.random() * 1000000);
    const sql = "INSERT INTO medicines (id, medicine_name, manufacturer, distributor, retailer, customer) VALUES (?, ?, ?, '', '', '')";
    db.query(sql, [medicine_id, medicine_name, manufacturer], (err, result) => {
        if (err) return res.status(500).json({ error: "Error creating medicine" });
        res.json({ message: "Medicine created successfully!" });
    });
});
// Get Customer by Email (only for customers with role 'C')
// Get Customer by Email (only for customers with role 'C')
app.get("/getCustomer", (req, res) => {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "Customer email is required." });
    }
    const sql = "SELECT name FROM users WHERE email = ? AND role = 'C'";
    db.query(sql, [email], (err, results) => {
      if (err) {
        console.error("Error fetching customer:", err);
        return res.status(500).json({ error: "Error fetching customer" });
      }
      if (results.length > 0) {
        res.json({ exists: true, customer: results[0] });
      } else {
        res.json({ exists: false });
      }
    });
  });
  

  // Get Distributors: filtering by role 'D'
app.get("/getDistributors", (req, res) => {
    const sql = "SELECT name FROM users WHERE role = 'D'";
    db.query(sql, (err, result) => {
      if (err) return res.status(500).json({ error: "Error fetching distributors" });
      res.json(result);
    });
  });
  
  // Get Retailers: filtering by role 'R'
  app.get("/getRetailers", (req, res) => {
    const sql = "SELECT name FROM users WHERE role = 'R'";
    db.query(sql, (err, result) => {
      if (err) return res.status(500).json({ error: "Error fetching retailers" });
      res.json(result);
    });
  });


// Get All Medicines
app.get("/getMedicines", (req, res) => {
    const sql = "SELECT * FROM medicines";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: "Error fetching medicines" });
        res.json(result);
    });
});

// Supply Medicine to Distributor
app.post("/supplyMedicine", (req, res) => {
    const { medicine_id, distributor } = req.body;
    const sql = "UPDATE medicines SET distributor = ? WHERE id = ?";
    db.query(sql, [distributor, medicine_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Error supplying medicine" });
        res.json({ message: "Medicine supplied to distributor!" });
    });
});

// Distribute Medicine to Retailer
app.post("/distributeMedicine", (req, res) => {
    const { medicine_id, retailer } = req.body;
    const sql = "UPDATE medicines SET retailer = ? WHERE id = ?";
    db.query(sql, [retailer, medicine_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Error distributing medicine" });
        res.json({ message: "Medicine distributed to retailer!" });
    });
});

// Sell Medicine to Customer – update customer and set sold_date
app.post("/sellMedicine", (req, res) => {
    const { medicine_id, customer } = req.body;
    const sql = "UPDATE medicines SET customer = ?, sold_date = NOW() WHERE id = ?";
    db.query(sql, [customer, medicine_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Error selling medicine" });
        res.json({ message: "Medicine sold to customer!" });
    });
});

// ----- CUSTOMER ENDPOINTS ----- //

// Verify Medicine by ID (for customer)
app.get("/verifyMedicineById", (req, res) => {
    const medicine_id = req.query.medicine_id;
    if (!medicine_id) return res.status(400).json({ error: "Medicine ID required" });
    const sql = "SELECT * FROM medicines WHERE id = ?";
    db.query(sql, [medicine_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Error verifying medicine" });
        if (results.length > 0) {
            res.json({ exists: true, medicine: results[0] });
        } else {
            res.json({ exists: false });
        }
    });
});

// Search Users (Manufacturers, Distributors, Retailers)
app.get("/searchUsers", (req, res) => {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: "Query required" });
    const sql = "SELECT name, role FROM users WHERE (role = 'M' OR role = 'D' OR role = 'R') AND name LIKE ?";
    db.query(sql, [`%${query}%`], (err, results) => {
        if (err) return res.status(500).json({ error: "Error searching users" });
        res.json(results);
    });
});

// Search Medicine by Name – list retailers that have the medicine
app.get("/searchMedicineByName", (req, res) => {
    const medicine_name = req.query.medicine_name;
    if (!medicine_name) return res.status(400).json({ error: "Medicine name required" });
    const sql = "SELECT retailer FROM medicines WHERE medicine_name LIKE ? AND retailer <> ''";
    db.query(sql, [`%${medicine_name}%`], (err, results) => {
        if (err) return res.status(500).json({ error: "Error searching medicine" });
        if (results.length > 0) {
            const retailers = [...new Set(results.map(r => r.retailer))];
            res.json({ found: true, retailers });
        } else {
            res.json({ found: false });
        }
    });
});

// Buying History: Get all medicines sold to a customer (by customer email)
app.get("/buyingHistory", (req, res) => {
    const customer = req.query.customer;
    if (!customer) return res.status(400).json({ error: "Customer required" });
    const sql = "SELECT id, medicine_name, retailer, sold_date FROM medicines WHERE customer = ? ORDER BY sold_date DESC";
    db.query(sql, [customer], (err, results) => {
       if (err) return res.status(500).json({ error: "Error fetching buying history" });
       res.json(results);
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
