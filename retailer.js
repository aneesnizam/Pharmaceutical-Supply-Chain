document.addEventListener("DOMContentLoaded", function () {
  let retailerName = localStorage.getItem("retailerName");
  if (!retailerName) {
    alert("You're not logged in as a retailer.");
    window.location.href = "login.html";
    return;
  }
  fetchRetailerMedicines(retailerName);
});

function searchCustomer() {
  let customerEmail = document.getElementById("customerEmail").value.trim();
  if (!customerEmail) {
    alert("Please enter a customer email.");
    return;
  }
  console.log("Searching customer for email:", customerEmail);
  fetch(`http://localhost:3000/getCustomer?email=${encodeURIComponent(customerEmail)}`)
    .then(response => response.json())
    .then(data => {
      console.log("Response from getCustomer:", data);
      let customerStatus = document.getElementById("customerStatus");
      if (data.exists) {
        customerStatus.textContent = "Customer found: " + data.customer.name;
        document.getElementById("sellButton").disabled = false;
      } else {
        customerStatus.textContent = "Customer not found.";
        document.getElementById("sellButton").disabled = true;
      }
    })
    .catch(error => {
      console.error("Error searching customer:", error);
      alert("Error searching customer. Please try again.");
    });
}

function fetchRetailerMedicines(retailerName) {
  fetch("http://localhost:3000/getMedicines")
    .then(response => response.json())
    .then(data => {
      let medicineDropdown = document.getElementById("medicineDropdown");
      medicineDropdown.innerHTML = "";
      // Only show medicines assigned to this retailer and not yet sold (i.e. customer field is empty)
      let filteredMedicines = data.filter(med => med.retailer === retailerName && !med.customer);
      if (filteredMedicines.length === 0) {
        let option = document.createElement("option");
        option.textContent = "No Medicines Available";
        option.disabled = true;
        medicineDropdown.appendChild(option);
      } else {
        filteredMedicines.forEach(med => {
          let option = document.createElement("option");
          option.value = med.id;
          option.textContent = `${med.medicine_name} (ID: ${med.id})`;
          medicineDropdown.appendChild(option);
        });
      }
    })
    .catch(error => console.error("Error fetching retailer medicines:", error));
}

function sellMedicine() {
  let medicineId = document.getElementById("medicineDropdown").value;
  let customerEmail = document.getElementById("customerEmail").value.trim();
  if (!medicineId || !customerEmail) {
    alert("Select a medicine and enter a valid customer email.");
    return;
  }
  fetch("http://localhost:3000/sellMedicine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medicine_id: medicineId, customer: customerEmail })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    let retailerName = localStorage.getItem("retailerName");
    fetchRetailerMedicines(retailerName);
  })
  .catch(error => console.error("Error selling medicine:", error));
}
