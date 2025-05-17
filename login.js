function loginUser() {
  let email = document.getElementById("loginEmail").value.trim();
  let password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(response => response.json())
    .then(data => {
      console.log("Login response:", data); // Debug log
      if (data.success) {
        // Check role and store accordingly
        if (data.role === "C") {
          // Store both name and email for customers
          localStorage.setItem("customerName", data.name);
          localStorage.setItem("customerEmail", data.email);
          window.location.href = "customer.html";
        } else if (data.role === "M") {
          localStorage.setItem("manufacturerName", data.name);
          window.location.href = "manufacturer.html";
        } else if (data.role === "D") {
          localStorage.setItem("distributorName", data.name);
          window.location.href = "distributor.html";
        } else if (data.role === "R") {
          localStorage.setItem("retailerName", data.name);
          window.location.href = "retailer.html";
        } else {
          alert("User role is not recognized.");
        }
      } else {
        alert(data.message || "Invalid credentials. Please try again.");
      }
    })
    .catch(error => {
      console.error("Error during login:", error);
      alert("An error occurred during login. Please try again.");
    });
}
