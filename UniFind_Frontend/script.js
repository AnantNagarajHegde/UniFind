// GLOBAL: Store all items fetched from backend
let allLostItems = [];
let allFoundItems = [];

// Run after DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // ====== MOBILE MENU ======
  const navMenu = document.getElementById("navLinks"); // Renamed to navMenu
  document.querySelector(".mobile-menu")?.addEventListener("click", () => {
    navMenu?.classList.toggle("show-menu");
  });

  // ====== DARK MODE TOGGLE ======
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle?.querySelector("i");
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.body.classList.add("dark-mode");
    themeIcon?.classList.replace("fa-moon", "fa-sun");
  }
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    themeIcon?.classList.replace(
      dark ? "fa-moon" : "fa-sun",
      dark ? "fa-sun" : "fa-moon"
    );
    localStorage.setItem("theme", dark ? "dark" : "light");
  });

  // ====== MODAL HANDLING ======
  window.onclick = function (event) {
    const modals = document.getElementsByClassName("modal");
    for (let modal of modals) {
      if (event.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    }
  };

  // ====== MODAL OPEN/CLOSE ======
  window.openModal = function (id) {
    document.getElementById(id).style.display = "block";
    document.body.style.overflow = "hidden";
  };

  window.closeModal = function (id) {
    document.getElementById(id).style.display = "none";
    document.body.style.overflow = "auto";
  };

  // ====== SHOW "OTHER LOCATION" FIELDS ======
  document.getElementById('lost-location')?.addEventListener('change', function () {
    const other = document.getElementById('lost-other-location-container');
    const input = document.getElementById('lost-other-location');
    if (this.value === 'other') {
      other.style.display = 'block';
      input.setAttribute('required', true);
    } else {
      other.style.display = 'none';
      input.removeAttribute('required');
    }
  });
  
  document.getElementById('found-location')?.addEventListener('change', function () {
    const other = document.getElementById('found-other-location-container');
    const input = document.getElementById('found-other-location');
    if (this.value === 'other') {
      other.style.display = 'block';
      input.setAttribute('required', true);
    } else {
      other.style.display = 'none';
      input.removeAttribute('required');
    }
  });

  // ====== SIGNUP / LOGIN FORM SUBMISSION ======
  document
    .getElementById("signupForm")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      signupUser();
    });

  document
    .getElementById("loginForm")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      loginUser();
    });

  // ====== INITIAL UI UPDATE ======
  updateUI();

  // ====== POPULATE DROPDOWNS ======
  async function populateDropdowns() {
    try {
      // Populate lost item form dropdowns
      const lostCategorySelect = document.getElementById("lost-category");
      const lostLocationSelect = document.getElementById("lost-location");
      const foundCategorySelect = document.getElementById("found-category");
      const foundLocationSelect = document.getElementById("found-location");

      // Fetch categories
      const categoryRes = await fetch("http://localhost:5000/api/categories");
      const categories = await categoryRes.json();
      if (lostCategorySelect) {
        categories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.Category_Name; // Use Category_Name
          option.textContent = category.Category_Name;
          lostCategorySelect.appendChild(option);
        });
      }
      if (foundCategorySelect) {
        categories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.Category_Name; // Use Category_Name
          option.textContent = category.Category_Name;
          foundCategorySelect.appendChild(option);
        });
      }

      // Fetch locations
      const locationRes = await fetch("http://localhost:5000/api/locations");
      const locations = await locationRes.json();
      if (lostLocationSelect) {
        locations.forEach((location) => {
          const option = document.createElement("option");
          option.value = location.Building_Name; // Use Building_Name
          option.textContent = location.Building_Name;
          lostLocationSelect.appendChild(option);
        });
      }
      if (foundLocationSelect) {
        locations.forEach((location) => {
          const option = document.createElement("option");
          option.value = location.Building_Name; // Use Building_Name
          option.textContent = location.Building_Name;
          foundLocationSelect.appendChild(option);
        });
      }
    } catch (err) {
      console.error("Error populating dropdowns:", err);
    }
  }

  populateDropdowns();

  // ====== LOST ITEM FORM SUBMISSION ======
  document
    .getElementById("lostReportForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("Please log in to report a lost item.");
        return;
      }
      const formData = new FormData();
      formData.append("Reported_By", user.User_ID);
      formData.append(
        "Category_ID",
        document.getElementById("lost-category").value
      ); // Sends Category_Name
      formData.append(
        "Location_ID",
        document.getElementById("lost-location").value
      ); // Sends Building_Name
      formData.append("Item_Name", document.getElementById("lost-name").value);
      formData.append(
        "Description",
        document.getElementById("lost-features").value
      );
      formData.append("Lost_Date", document.getElementById("lost-date").value);
      formData.append(
        "Lost_Time",
        document.getElementById("lost-time").value || null
      );
      formData.append("Color", document.getElementById("lost-color").value);
      formData.append(
        "Features",
        document.getElementById("lost-features").value
      );
      formData.append(
        "Photo_Path",
        document.getElementById("lost-photo").files[0]
      );
      formData.append("Status", "Open");

      try {
        const response = await fetch("http://localhost:5000/api/lost-items", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (response.ok) {
          alert("Lost item reported successfully!");
          document.getElementById("lostReportForm").reset();
        } else {
          alert(`Failed to report lost item: ${result.error}`);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong. Check the console.");
      }
    });

  // ====== FOUND ITEM FORM SUBMISSION ======
  document
    .getElementById("foundReportForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("Please log in to report a found item.");
        return;
      }

      const formData = new FormData();
      formData.append("Reported_By", user.User_ID);
      formData.append(
        "Category_ID",
        document.getElementById("found-category").value
      ); // Sends Category_Name
      formData.append(
        "Location_ID",
        document.getElementById("found-location").value
      ); // Sends Building_Name
      formData.append("Item_Name", document.getElementById("found-name").value);
      formData.append(
        "Description",
        document.getElementById("found-features").value
      );
      formData.append(
        "Found_Date",
        document.getElementById("found-date").value
      );
      formData.append(
        "Found_Time",
        document.getElementById("found-time").value || null
      );
      formData.append("Color", document.getElementById("found-color").value);
      formData.append(
        "Features",
        document.getElementById("found-features").value
      );
      formData.append(
        "Photo_Path",
        document.getElementById("found-photo").files[0]
      );
      formData.append("Status", "Unclaimed");

      try {
        const response = await fetch("http://localhost:5000/api/found-items", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (response.ok) {
          alert("Found item reported successfully!");
          document.getElementById("foundReportForm").reset();
        } else {
          alert(`Failed to report found item: ${result.error}`);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong. Check the console.");
      }
    });

    // ====== FEEDBACK FORM SUBMISSION ======
  document
  .getElementById("feedbackForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const feedbackData = {
      User_ID: user ? user.User_ID : null,
      Message: document.getElementById("feedback-message").value,
      Rating: document.querySelector('input[name="rating"]:checked')?.value || null,
      Feedback_Type: document.getElementById("feedback-type").value || null,
    };

    try {
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });
      const result = await response.json();

      if (response.ok) {
        alert("Feedback submitted successfully!");
        document.getElementById("feedbackForm").reset();
      } else {
        alert(`Failed to submit feedback: ${result.error}`);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Something went wrong. Please try again.");
    }
  });


  // Load initial items when the search page loads
  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector(".items-container")) {
      // Show loading state
      document.querySelector(".items-container").innerHTML =
        '<div class="loading">Loading recent items...</div>';

      // Load some initial items
      Promise.all([
        fetch("http://localhost:5000/api/lost-items?limit=5").then((res) =>
          res.json()
        ),
        fetch("http://localhost:5000/api/found-items?limit=5").then((res) =>
          res.json()
        ),
      ])
        .then(([lostItems, foundItems]) => {
          // Store in global arrays
          allLostItems = lostItems;
          allFoundItems = foundItems;

          // Display items
          displayItemsAsCards(lostItems, foundItems);
        })
        .catch((err) => {
          console.error("Error loading initial items:", err);
          document.querySelector(".items-container").innerHTML = `
        <div class="error">Failed to load items: ${err.message}</div>
        <button class="retry-btn" onclick="loadInitialItems()">Try Again</button>
      `;
        });
    }
  });

  // Function to load initial items (for retry button)
function loadInitialItems() {
  if (document.querySelector(".items-container")) {
    document.querySelector(".items-container").innerHTML =
      '<div class="loading">Loading recent items...</div>';

    Promise.all([
      fetch("http://localhost:5000/api/lost-items?limit=5").then((res) =>
        res.json()
      ),
      fetch("http://localhost:5000/api/found-items?limit=5").then((res) =>
        res.json()
      ),
    ])
      .then(([lostItems, foundItems]) => {
        // Store in global arrays
        allLostItems = lostItems;
        
        // Server already filtered out claimed items, but we'll double-check here
        allFoundItems = foundItems.filter(item => item.Status !== 'Claimed');
        
        displayItemsAsCards(lostItems, allFoundItems);
      })
      .catch((err) => {
        console.error("Error loading initial items:", err);
        document.querySelector(".items-container").innerHTML = `
      <div class="error">Failed to load items: ${err.message}</div>
      <button class="retry-btn" onclick="loadInitialItems()">Try Again</button>
    `;
      });
  }
}

function showClaimForm(foundItemId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please log in to claim an item.");
    openModal("loginModal");
    return;
  }

  // Show the claim modal
  openModal("claimItemModal");
  
  // Set the hidden fields
  document.getElementById("claim-item-id").value = foundItemId;
  document.getElementById("claim-user-id").value = user.User_ID;
}

// Update the claimItemForm submission event handler
document
  .getElementById("claimItemForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const itemId = document.getElementById("claim-item-id").value;
    const userId = document.getElementById("claim-user-id").value;
    const reason = document.getElementById("claim-reason").value;
    const proof = document.getElementById("claim-proof").value;

    try {
      const response = await fetch("http://localhost:5000/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          User_ID: userId,
          Found_Item_ID: itemId,
          Description: reason,
          Claimant_ID: userId,
          Verification_Details: proof
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit claim");
      }

      const result = await response.json();

      alert(
        "Claim submitted successfully! You will be contacted once your claim is reviewed."
      );
      closeModal("claimItemModal");
      document.getElementById("claimItemForm").reset();
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Please try again later.");
    }
  });

  // ====== SEARCH FORM SUBMISSION ======
document.querySelector(".search-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = document.getElementById("item-type").value;
  const location = document.getElementById("location").value;
  const date = document.getElementById("date").value;
  const status = document.getElementById("status").value;
  const keyword = document.getElementById("keyword").value;

  const queryParams = new URLSearchParams({
    category: type,
    location,
    date,
    status,
    keyword,
  });

  try {
    let lostItems = [];
    let foundItems = [];

    // Show loading state
    const itemsContainer = document.querySelector(".items-container");
    if (itemsContainer) {
      itemsContainer.innerHTML =
        '<div class="loading">Searching for items...</div>';
    }

    // Fetch items based on status
    if (!status || status === "Open") {
      const lostResponse = await fetch(
        `http://localhost:5000/api/lost-items?${queryParams}`
      );
      if (!lostResponse.ok) {
        throw new Error(
          `Lost items fetch failed: ${lostResponse.status} ${lostResponse.statusText}`
        );
      }
      lostItems = await lostResponse.json();
    }

    if (!status || status === "Unclaimed") {
      const foundResponse = await fetch(
        `http://localhost:5000/api/found-items?${queryParams}`
      );
      if (!foundResponse.ok) {
        throw new Error(
          `Found items fetch failed: ${foundResponse.status} ${foundResponse.statusText}`
        );
      }
      let fetchedFoundItems = await foundResponse.json();
      
      // Always filter out claimed items client-side as well
      foundItems = fetchedFoundItems.filter(item => item.Status !== 'Claimed');
    }

    // Store in global arrays
    allLostItems = lostItems;
    allFoundItems = foundItems;

    // Display items as cards
    displayItemsAsCards(lostItems, foundItems);
  } catch (err) {
    console.error("Error fetching items:", err);
    const itemsContainer = document.querySelector(".items-container");
    if (itemsContainer) {
      itemsContainer.innerHTML = `
        <div class="error">Failed to fetch items: ${err.message}</div>
        <button class="retry-btn" onclick="retrySearch()">Try Again</button>
      `;
    }
  }
});





    
  // Function to display items as cards
function displayItemsAsCards(lostItems, foundItems) {
  const itemsContainer = document.querySelector(".items-container");
  if (!itemsContainer) return;

  // Clear the container
  itemsContainer.innerHTML = "";

  // Filter out claimed items from foundItems - ensure this happens in all places
  const filteredFoundItems = foundItems.filter(item => item.Status !== 'Claimed');

  // Combine and sort items by date (most recent first)
  const allItems = [
    ...lostItems.map((item) => ({
      ...item,
      itemType: "lost",
      itemDate: item.Lost_Date,
      formattedDate: formatDate(item.Lost_Date),
    })),
    ...filteredFoundItems.map((item) => ({
      ...item,
      itemType: "found",
      itemDate: item.Found_Date,
      formattedDate: formatDate(item.Found_Date),
    })),
  ];

  // Sort by date (most recent first)
  allItems.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

  // Show message if no items found
  if (allItems.length === 0) {
    itemsContainer.innerHTML =
      '<div class="no-results">No items match your search criteria 😔</div>';
    return;
  }

  // Create cards for each item
  allItems.forEach((item) => {
    const card = createItemCard(item);
    itemsContainer.appendChild(card);
  });
}

  // Function to create an item card
  function createItemCard(item) {
    const card = document.createElement("div");
    card.className = "card";

    // Determine if it's a lost or found item
    const isLost = item.itemType === "lost";
    const itemId = isLost ? item.Lost_Item_ID : item.Found_Item_ID;

    // Default image path based on category
    let defaultImage = 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png';
card.innerHTML = `
  <div class="card-img">
    <img src="${item.Photo_Path || defaultImage}" alt="${item.Item_Name}" 
         onerror="this.src='${defaultImage}'">
  </div>
    <div class="card-content">
      <span class="card-category">${item.Category_Name || "Uncategorized"
      }</span>
      <h3 class="card-title">${item.Item_Name}</h3>
      <div class="card-location">
        <i class="fas fa-map-marker-alt"></i>
        <span>${item.Building_Name || "Unknown location"}</span>
      </div>
      <div class="card-date">
        <i class="far fa-calendar-alt"></i>
        <span>${item.formattedDate}</span>
      </div>
    </div>
    <div class="card-footer">
      <span class="card-status ${isLost ? "status-lost" : "status-found"}">${isLost ? "Lost" : "Found"
      }</span>
      <button class="card-${isLost ? "contact" : "claim"
      }" data-id="${itemId}" data-type="${isLost ? "lost" : "found"}">
        ${isLost ? "Contact" : "Claim"}
      </button>
    </div>
  `;

    // Add click event to the card
    card.addEventListener("click", function (e) {
      // Don't trigger if they clicked the claim/contact button
      if (
        !e.target.classList.contains("card-claim") &&
        !e.target.classList.contains("card-contact")
      ) {
        showItemDetails(item);
      }
    });

    // Add click event to the claim/contact button
    const actionButton = card.querySelector(
      `.card-${isLost ? "contact" : "claim"}`
    );
    actionButton.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent card click
      handleItemAction(this.dataset.id, this.dataset.type);
    });

    return card;
  }


  
  // Function to format date
  function formatDate(dateString) {
    if (!dateString) return "Unknown date";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      // Format the date
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  }

  // Tab functionality
document.querySelectorAll(".tab-btn")?.forEach((tab) => {
  tab.addEventListener("click", function () {
    // Remove active class from all tabs
    document
      .querySelectorAll(".tab-btn")
      .forEach((t) => t.classList.remove("active"));

    // Add active class to clicked tab
    this.classList.add("active");

    const tabType = this.dataset.tab;

    // Filter items based on tab
    if (tabType === "all") {
      // Make sure we're using the filtered version of allFoundItems
      displayItemsAsCards(allLostItems, allFoundItems);
    } else if (tabType === "lost") {
      displayItemsAsCards(allLostItems, []);
    } else if (tabType === "found") {
      displayItemsAsCards([], allFoundItems);
    }
  });
});


  // Function to show item details in a modal
function showItemDetails(item) {
  const isLost = item.itemType === "lost";

      // Default image path based on category
      let defaultImage ='https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png';

  // Create HTML for the modal content
  let detailsHTML = `
    <div class="item-details-grid">
    <div class="item-image">
      <img src="${item.Photo_Path || defaultImage}" 
           alt="${item.Item_Name}" 
           onerror="this.src='${defaultImage}'">
    </div>
      <div class="item-info">
        <h3>${item.Item_Name}</h3>
        <p><strong>Status:</strong> ${isLost ? "Lost" : "Found"}</p>
        <p><strong>Category:</strong> ${item.Category_Name || "Uncategorized"}</p>
        <p><strong>Location:</strong> ${item.Building_Name || "Unknown location"}</p>
        <p><strong>Date:</strong> ${item.formattedDate}</p>
      </div>
    </div>
    <div class="item-description-section">
      <h3>Description</h3>
      <p>${item.Description || "No description provided"}</p>
      <p><strong>Color:</strong> ${item.Color || "Not specified"}</p>
      <p><strong>Features:</strong> ${item.Features || "No specific features noted"}</p>
    </div>
    ${isLost ? `
    <div class="item-contact-section">
      <h3>Contact Information</h3>
      <p>If you've found this item, please contact:</p>
      <p><strong>Email:</strong> user@example.com</p>
      <p><strong>Phone:</strong> (123) 456-7890</p>
    </div>
    ` : ''}
  `;

  // Create or update the modal
  let detailsModal = document.getElementById("itemDetailsModal");
  if (!detailsModal) {
    detailsModal = document.createElement("div");
    detailsModal.id = "itemDetailsModal";
    detailsModal.className = "modal";
    document.body.appendChild(detailsModal);
  }

  // Set the modal content
  detailsModal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal" onclick="closeModal('itemDetailsModal')">×</span>
      <h2>Item Details</h2><hr>
      ${detailsHTML}      
    </div>
  `;

  // Show the modal
  openModal("itemDetailsModal");
}
  // Retry search function (for error state)
  function retrySearch() {
    document.querySelector(".search-form").dispatchEvent(new Event("submit"));
  }
});

// ====== SMOOTH SCROLL NAV ======
const scrollLinks = document.querySelectorAll('a[href^="#"]'); // Renamed to scrollLinks
scrollLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").slice(1);
    const targetElement = document.getElementById(targetId);
    window.scrollTo({
      top: targetElement.offsetTop - 50,
      behavior: "smooth",
    });
  });
});

// Function to fetch and display contact details in the modal
async function showContactDetails(lostItemId) {
  console.log('Fetching contact details for ID:', lostItemId);
  try {
    const response = await fetch(`http://localhost:5000/api/lost-items/${lostItemId}/contact-details`);
    if (!response.ok) {
      throw new Error('Failed to fetch contact details');
    }
    const contactDetails = await response.json();
    console.log('Received contact details:', contactDetails);
    const content = `
      <p><strong>Name:</strong> ${contactDetails.Reporter_Name}</p>
      <p><strong>Email:</strong> ${contactDetails.Email}</p>
      <p><strong>Phone:</strong> ${contactDetails.Phone || 'Not provided'}</p>
    `;
    const contentElement = document.getElementById('contactDetailsContent');
    if (contentElement) {
      contentElement.innerHTML = content;
    } else {
      console.error('Element #contactDetailsContent not found');
    }
    const modal = document.getElementById('contactDetailsModal');
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    } else {
      console.error('Modal #contactDetailsModal not found');
    }
  } catch (err) {
    console.error('Error in showContactDetails:', err);
    alert('Unable to load contact details at this time.');
  }
}

// Function to show the claim form for found items
function showClaimForm(foundItemId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please log in to claim an item.");
    openModal("loginModal");
    return;
  }
  openModal("claimItemModal");
  document.getElementById("claim-item-id").value = foundItemId;
  document.getElementById("claim-user-id").value = user.User_ID;
}

// Combined handleItemAction function
function handleItemAction(itemId, itemType) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert(
      "Please log in to " +
      (itemType === "lost" ? "view contact details" : "claim this item")
    );
    openModal("loginModal");
    return;
  }

  if (itemType === "lost") {
    showContactDetails(itemId);
  } else {
    showClaimForm(itemId);
  }
}

// Claim form submission handler
document
  .getElementById("claimItemForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const itemId = document.getElementById("claim-item-id").value;
    const userId = document.getElementById("claim-user-id").value;
    const reason = document.getElementById("claim-reason").value;
    const proof = document.getElementById("claim-proof").value;

    try {
      const response = await fetch(
        `http://localhost:5000/api/found-items/${itemId}/claim`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            reason: reason,
            proof: proof,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit claim");
      }

      const result = await response.json();

      alert(
        "Claim submitted successfully! You will be contacted once your claim is reviewed."
      );
      closeModal("claimItemModal");
      document.getElementById("claimItemForm").reset();
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Please try again later.");
    }
  });

// ====== FEATURE TOGGLE ======
const featureItems = document.querySelectorAll("#features li");
featureItems.forEach((item) => {
  item.addEventListener("click", () => {
    item.classList.toggle("active");
    const description = item.querySelector(".description");
    if (description) {
      description.style.display =
        description.style.display === "block" ? "none" : "block";
    }
  });
});

// ====== SIGNUP FUNCTION ======
function signupUser() {
  const userData = {
    First_Name: document.getElementById("signupFirstName").value,
    Last_Name: document.getElementById("signupLastName").value,
    Email: document.getElementById("signupEmail").value,
    Phone: document.getElementById("signupPhone").value,
    User_Type: document.getElementById("signupUserType").value,
    Department: document.getElementById("signupDepartment").value,
    Password: document.getElementById("signupPassword").value,
  };

  fetch("http://localhost:5000/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message || "Signup complete!");
        closeModal("signupModal");
      }
    })
    .catch((err) => {
      console.error("Signup error:", err);
      alert("An error occurred during signup.");
    });
}

// ====== LOGIN FUNCTION ======
function loginUser() {
  const credentials = {
    Email: document.getElementById("loginEmail").value,
    Password: document.getElementById("loginPassword").value,
  };

  fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Welcome back, " + data.user.First_Name + "!");

        closeModal("loginModal");

        // 🚀 NEW: Redirect based on user role
        if (data.user.User_Type.toLowerCase() === "admin") {
          redirectToAdminDashboard();
        } else {
          updateUI(); // Student or other role
        }
      } else {
        alert(data.error || "Login failed.");
      }
    })
    .catch((err) => {
      console.error("Login error:", err);
      alert("An error occurred during login.");
    });
}

function redirectToAdminDashboard() {
  window.location.href = "admin.html";
}


// ====== LOGOUT FUNCTION ======
function logoutUser() {
  localStorage.removeItem("user");
  alert("You have been logged out.");
  updateUI();
}

// ====== UI UPDATE FUNCTION ======
function updateUI() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authButtons = document.querySelector(".auth-buttons");

  if (user) {
    authButtons.innerHTML = `
      <div class="theme-toggle" id="themeToggle">
        <i class="fas fa-moon"></i>
      </div>
      <span class="hello">Hello, ${user.First_Name}!</span>
      <button class="logout-btn" onclick="logoutUser()">Logout</button>
    `;
  } else {
    authButtons.innerHTML = `
      <div class="theme-toggle" id="themeToggle">
        <i class="fas fa-moon"></i>
      </div>
      <button class="login-btn" onclick="openModal('loginModal')">Login</button>
      <button class="signup-btn" onclick="openModal('signupModal')">Sign Up</button>
    `;
  }

  // Reattach theme toggle listener
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle?.querySelector("i");
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    themeIcon?.classList.replace(
      dark ? "fa-moon" : "fa-sun",
      dark ? "fa-sun" : "fa-moon"
    );
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
}

// Show the button when scrolling down
window.addEventListener("scroll", () => {
  const btn = document.getElementById("scrollToTopBtn");
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
});

// Scroll to top on click
document.getElementById("scrollToTopBtn")?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

