// This function will run when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is admin
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.User_Type.toLowerCase() !== "admin") {
    window.location.href = "index.html"; // redirect unauthorized users
    return;
  }
  
  // Fetch claims data
  fetchClaims();
});

// Function to fetch all claims
async function fetchClaims() {
  try {
    // Show loading state
    const tbody = document.querySelector("#claimsTable tbody");
    tbody.innerHTML = '<tr><td colspan="7">Loading claims data...</td></tr>';
    
    // Fetch claims from API
    const response = await fetch('http://localhost:5000/api/claims', {
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem("user")).User_ID}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const claims = await response.json();
    
    // Clear the table
    tbody.innerHTML = "";
    
    // Check if we have claims
    if (claims.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No claims found</td></tr>';
      return;
    }
    
    // Populate the table with claims
    claims.forEach(claim => {
      const row = document.createElement("tr");
      
      row.innerHTML = `
        <td>${claim.Claim_ID}</td>
        <td>${claim.Claimant_Name || claim.Claimant_ID}</td>
        <td>${claim.Found_Item_ID}</td>
        <td>${claim.Description || 'No description provided'}</td>
        <td>${claim.Status || 'Pending'}</td>
        <td><input type="text" id="verify-${claim.Claim_ID}" placeholder="Verification details"></td>
        <td>
          <button onclick="updateClaim(${claim.Claim_ID}, 'Approved')">Approve</button>
          <button onclick="updateClaim(${claim.Claim_ID}, 'Rejected')">Reject</button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching claims:", error);
    document.querySelector("#claimsTable tbody").innerHTML = 
      `<tr><td colspan="7">Error loading claims: ${error.message}</td></tr>`;
  }
}

// Function to update a claim
async function updateClaim(claimId, status) {
  try {
    const details = document.getElementById(`verify-${claimId}`).value;
    
    if (!details) {
      alert("Please provide verification details before approving/rejecting.");
      return;
    }
    
    const response = await fetch(`http://localhost:5000/api/claims/${claimId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${JSON.parse(localStorage.getItem("user")).User_ID}`
      },
      body: JSON.stringify({ 
        status, 
        verificationDetails: details 
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    alert(`Claim ${claimId} has been ${status.toLowerCase()}`);
    
    // Refresh the claims table
    fetchClaims();
  } catch (error) {
    console.error("Error updating claim:", error);
    alert(`Error updating claim: ${error.message}`);
  }
}

// Logout function
function logout() {
  localStorage.removeItem("user");
  window.location.href = "home.html";
}