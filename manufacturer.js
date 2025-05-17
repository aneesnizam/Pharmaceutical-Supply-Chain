document.addEventListener("DOMContentLoaded", function () {
    fetchMedicines();
    fetchDistributors();
});

function createMedicine() {
    let medicineName = document.getElementById("medicineName").value.trim();
    let manufacturer = localStorage.getItem("manufacturerName");

    if (!medicineName) {
        alert("Please enter a valid medicine name.");
        return;
    }
    if (!manufacturer) {
        alert("You're not logged in as a manufacturer. Please log in.");
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:3000/createMedicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicine_name: medicineName, manufacturer: manufacturer })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchMedicines(); // Refresh list of medicines
        document.getElementById("medicineName").value = "";
    })
    .catch(error => console.error("Error creating medicine:", error));
}

function fetchMedicines() {
    fetch("http://localhost:3000/getMedicines")
        .then(response => response.json())
        .then(data => {
            let medicineDropdown = document.getElementById("medicineDropdown");
            let medicineList = document.getElementById("createdMedicineList");
            medicineDropdown.innerHTML = "";
            medicineList.innerHTML = "";
            let manufacturer = localStorage.getItem("manufacturerName");

            data.forEach(med => {
                // Only show medicines that are created by this manufacturer and NOT yet supplied (distributor is empty)
                if (med.manufacturer === manufacturer && !med.distributor) {
                    // Add to dropdown for supply
                    let option = document.createElement("option");
                    option.value = med.id;
                    option.textContent = `${med.medicine_name} (ID: ${med.id})`;
                    medicineDropdown.appendChild(option);

                    // Also add to the list
                    let li = document.createElement("li");
                    li.textContent = `${med.medicine_name} (ID: ${med.id})`;
                    medicineList.appendChild(li);
                }
            });
        })
        .catch(error => console.error("Error fetching medicines:", error));
}

function fetchDistributors() {
    fetch("http://localhost:3000/getDistributors")
        .then(response => response.json())
        .then(data => {
            let distributorDropdown = document.getElementById("distributorList");
            distributorDropdown.innerHTML = "";
            if (data.length === 0) {
                let option = document.createElement("option");
                option.textContent = "No Distributors Available";
                distributorDropdown.appendChild(option);
            } else {
                data.forEach(distributor => {
                    let option = document.createElement("option");
                    option.value = distributor.name;
                    option.textContent = distributor.name;
                    distributorDropdown.appendChild(option);
                });
            }
        })
        .catch(error => console.error("Error fetching distributors:", error));
}

function supplyMedicine() {
    let medicineId = document.getElementById("medicineDropdown").value;
    let distributor = document.getElementById("distributorList").value;

    if (!medicineId || !distributor) {
        alert("Please select a medicine and a distributor.");
        return;
    }

    fetch("http://localhost:3000/supplyMedicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicine_id: medicineId, distributor: distributor })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // After supplying, re-fetch medicines so that the supplied one is removed from the dropdown.
        fetchMedicines();
    })
    .catch(error => console.error("Error supplying medicine:", error));
}
