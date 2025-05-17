const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const Web3 = require("web3").default;
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));

// Connect to MySQL
 db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "medicine_system"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected!");
});

// Connect to Blockchain
const web3 = new Web3("http://127.0.0.1:7545"); // Ensure Ganache is running
const contractPath = path.join(__dirname, "my-dapp/build/contracts/MedicineSupplyChain.json");
const contractJSON = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const contractABI = contractJSON.abi;
const contractAddress = "0x72F4b550d4785a374c656ABA568008b13053551C"; // Update as needed
const contract = new web3.eth.Contract(contractABI, contractAddress);

let blockchainAccount;
web3.eth.getAccounts().then(accounts => {
    blockchainAccount = accounts[0];
    console.log("Using blockchain account:", blockchainAccount);
});

// ---- LOGIN ROUTE ---- //
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        
        if (result.length > 0) {
            const user = result[0];
            res.json({
                success: true,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    });
});

// ---- MEDICINE FUNCTIONS ---- //

// Create Medicine (Manufacturer)
app.post("/createMedicine", async (req, res) => {
    try {
        const { medicine_name, manufacturer } = req.body;
        if (!medicine_name || !manufacturer) return res.status(400).json({ error: "Missing fields" });
        
        const medicine_id = Math.floor(Math.random() * 1000000);
        await contract.methods.createMedicine(medicine_id, medicine_name, manufacturer)
            .send({ from: blockchainAccount, gas: 3000000 });
        
        const sql = "INSERT INTO medicines (id, medicine_name, manufacturer, distributor, retailer, customer) VALUES (?, ?, ?, '', '', '')";
        db.query(sql, [medicine_id, medicine_name, manufacturer], (err) => {
            if (err) return res.status(500).json({ error: "Error creating medicine" });
            res.json({ message: "Medicine created successfully!" });
        });
    } catch (error) {
        res.status(500).json({ error: "Blockchain transaction failed" });
    }
});

// Supply Medicine to Distributor
app.post("/supplyMedicine", async (req, res) => {
    try {
        const { medicine_id, distributor } = req.body;
        await contract.methods.supplyMedicine(medicine_id, distributor)
            .send({ from: blockchainAccount, gas: 3000000 });
        
        const sql = "UPDATE medicines SET distributor = ? WHERE id = ?";
        db.query(sql, [distributor, medicine_id], (err) => {
            if (err) return res.status(500).json({ error: "Error supplying medicine" });
            res.json({ message: "Medicine supplied successfully!" });
        });
    } catch (error) {
        res.status(500).json({ error: "Blockchain transaction failed" });
    }
});

// Distribute Medicine to Retailer
app.post("/distributeMedicine", async (req, res) => {
    try {
        const { medicine_id, retailer } = req.body;
        await contract.methods.distributeMedicine(medicine_id, retailer)
            .send({ from: blockchainAccount, gas: 3000000 });
        
        const sql = "UPDATE medicines SET retailer = ? WHERE id = ?";
        db.query(sql, [retailer, medicine_id], (err) => {
            if (err) return res.status(500).json({ error: "Error distributing medicine" });
            res.json({ message: "Medicine distributed successfully!" });
        });
    } catch (error) {
        res.status(500).json({ error: "Blockchain transaction failed" });
    }
});

// Sell Medicine to Customer
app.post("/sellMedicine", async (req, res) => {
    try {
        const { medicine_id, customer } = req.body;
        await contract.methods.sellMedicine(medicine_id, customer)
            .send({ from: blockchainAccount, gas: 3000000 });
        
        const sql = "UPDATE medicines SET customer = ?, sold_date = NOW() WHERE id = ?";
        db.query(sql, [customer, medicine_id], (err) => {
            if (err) return res.status(500).json({ error: "Error selling medicine" });
            res.json({ message: "Medicine sold successfully!" });
        });
    } catch (error) {
        res.status(500).json({ error: "Blockchain transaction failed" });
    }
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
