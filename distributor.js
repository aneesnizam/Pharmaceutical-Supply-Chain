document.addEventListener("DOMContentLoaded", function () {
    let distributorName = localStorage.getItem("distributorName");
    if (!distributorName) {
        alert("You're not logged in as a distributor.");
        window.location.href = "login.html";
        return;
    }
    fetchDistributorMedicines(distributorName);
    fetchRetailers();
});

function fetchDistributorMedicines(distributorName) {
    fetch("http://localhost:3000/getMedicines")
        .then(response => response.json())
        .then(data => {
            let medicineDropdown = document.getElementById("medicineDropdown");
            medicineDropdown.innerHTML = "";
            // Show only medicines assigned to this distributor and not yet distributed to retailer
            let filteredMedicines = data.filter(med => med.distributor === distributorName && !med.retailer);
            if (filteredMedicines.length === 0) {
                let option = document.createElement("option");
                option.textContent = "No Medicines Assigned";
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
        .catch(error => console.error("Error fetching medicines:", error));
}

function fetchRetailers() {
    fetch("http://localhost:3000/getRetailers")
        .then(response => response.json())
        .then(data => {
            let retailerDropdown = document.getElementById("retailerList");
            retailerDropdown.innerHTML = "";
            if (data.length === 0) {
                let option = document.createElement("option");
                option.textContent = "No Retailers Available";
                option.disabled = true;
                retailerDropdown.appendChild(option);
            } else {
                data.forEach(ret => {
                    let option = document.createElement("option");
                    option.value = ret.name;
                    option.textContent = ret.name;
                    retailerDropdown.appendChild(option);
                });
            }
        })
        .catch(error => console.error("Error fetching retailers:", error));
}

function distributeMedicine() {
    let medicineId = document.getElementById("medicineDropdown").value;
    let retailer = document.getElementById("retailerList").value;

    if (!medicineId || !retailer) {
        alert("Please select a medicine and a retailer.");
        return;
    }

    fetch("http://localhost:3000/distributeMedicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicine_id: medicineId, retailer: retailer })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // Re-fetch medicines so the distributed medicine is removed from the dropdown.
        let distributorName = localStorage.getItem("distributorName");
        fetchDistributorMedicines(distributorName);
    })
    .catch(error => console.error("Error distributing medicine:", error));
}
