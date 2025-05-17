document.addEventListener("DOMContentLoaded", function() {
  // Ensure the customer is logged in by checking both name and email
  let customerName = localStorage.getItem("customerName");
  let customerEmail = localStorage.getItem("customerEmail");
  if (!customerName || !customerEmail) {
    alert("You're not logged in as a customer.");
    window.location.href = "login.html";
    return;
  }
});

// Section 1: Verify Medicine by ID
function verifyMedicineById() {
  let medicineId = document.getElementById("medicineIdInput").value.trim();
  if (!medicineId) {
    alert("Please enter a Medicine ID.");
    return;
  }
  fetch(`http://localhost:3000/verifyMedicineById?medicine_id=${encodeURIComponent(medicineId)}`)
    .then(response => response.json())
    .then(data => {
      let detailsDiv = document.getElementById("medicineDetails");
      if (data.exists) {
        detailsDiv.innerHTML = `<p>Medicine ID: ${data.medicine.id}</p>
          <p>Medicine Name: ${data.medicine.medicine_name}</p>
          <p>Manufacturer: ${data.medicine.manufacturer}</p>
          <p>Distributor: ${data.medicine.distributor || "Not supplied"}</p>
          <p>Retailer: ${data.medicine.retailer || "Not distributed"}</p>
          <p>Customer: ${data.medicine.customer || "Not sold"}</p>
          <p>Sold On: ${data.medicine.sold_date ? data.medicine.sold_date : "Not sold"}</p>`;
      } else {
        alert("Fraud medicine detected! Invalid Medicine ID.");
        detailsDiv.innerHTML = "";
      }
    })
    .catch(error => {
      console.error("Error verifying medicine:", error);
      alert("Error verifying medicine. Please try again.");
    });
}

// Section 2: Search System Users
function searchUsers() {
  let query = document.getElementById("userSearchQuery").value.trim();
  if (!query) {
    alert("Please enter a search query.");
    return;
  }
  fetch(`http://localhost:3000/searchUsers?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      let resultsDiv = document.getElementById("userSearchResults");
      if (data.length > 0) {
        resultsDiv.innerHTML = "<ul>" + data.map(user => `<li>${user.name} (${user.role})</li>`).join("") + "</ul>";
      } else {
        resultsDiv.textContent = "No users found.";
      }
    })
    .catch(error => {
      console.error("Error searching users:", error);
      alert("Error searching users. Please try again.");
    });
}

// Section 3: Search Medicines by Name
function searchMedicineByName() {
  let medicineName = document.getElementById("medicineNameSearch").value.trim();
  if (!medicineName) {
    alert("Please enter a medicine name.");
    return;
  }
  fetch(`http://localhost:3000/searchMedicineByName?medicine_name=${encodeURIComponent(medicineName)}`)
    .then(response => response.json())
    .then(data => {
      let resultsDiv = document.getElementById("medicineSearchResults");
      if (data.found && data.retailers && data.retailers.length > 0) {
        resultsDiv.innerHTML = "<ul>" + data.retailers.map(retailer => `<li>${retailer}</li>`).join("") + "</ul>";
      } else {
        resultsDiv.textContent = "No medicine found or no retailers have this medicine.";
      }
    })
    .catch(error => {
      console.error("Error searching medicine:", error);
      alert("Error searching medicine. Please try again.");
    });
}

// Section 4: Buying History
function fetchBuyingHistory() {
  let customerEmail = localStorage.getItem("customerEmail");
  if (!customerEmail) {
    alert("Customer email not found. Please log in again.");
    return;
  }
  fetch(`http://localhost:3000/buyingHistory?customer=${encodeURIComponent(customerEmail)}`)
    .then(response => response.json())
    .then(data => {
      let historyDiv = document.getElementById("buyingHistory");
      if (data.length > 0) {
        let html = "<table border='1'><tr><th>ID</th><th>Medicine Name</th><th>Retailer</th><th>Date & Time</th></tr>";
        data.forEach(row => {
          html += `<tr><td>${row.id}</td><td>${row.medicine_name}</td><td>${row.retailer}</td><td>${row.sold_date}</td></tr>`;
        });
        html += "</table>";
        historyDiv.innerHTML = html;
      } else {
        historyDiv.textContent = "No buying history found.";
      }
    })
    .catch(error => {
      console.error("Error fetching buying history:", error);
      alert("Error fetching buying history. Please try again.");
    });
}
