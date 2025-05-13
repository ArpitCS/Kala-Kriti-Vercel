// Global variables
let currentPage = 1;
let itemsPerPage = 10;
let currentData = {
  users: [],
  artworks: [],
  events: [],
  orders: []
};

// DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Set overview as default section
  showSection('overview');
  
  // Initialize dashboard data
  fetchDashboardData();
  
  // Add event listeners to search inputs and filters
  addEventListeners();
});

// Section visibility handling
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Remove active class from all sidebar links
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Show selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.remove('hidden');
  }
  
  // Add active class to selected sidebar link
  const selectedLinks = document.querySelectorAll(`.sidebar-link[onclick="showSection('${sectionId}')"]`);
  selectedLinks.forEach(link => {
    link.classList.add('active');
  });
  
  // Load data for the selected section if needed
  if (sectionId === 'overview' && !document.querySelector('#userCount').textContent) {
    fetchDashboardData();
  } else if (sectionId === 'users' && currentData.users.length === 0) {
    fetchUsers();
  } else if (sectionId === 'artworks' && currentData.artworks.length === 0) {
    fetchArtworks();
  } else if (sectionId === 'events' && currentData.events.length === 0) {
    fetchEvents();
  } else if (sectionId === 'orders' && currentData.orders.length === 0) {
    fetchOrders();
  }
}

// Fetch dashboard data
function fetchDashboardData() {
  fetch('/api/admin/dashboard')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update count cards
      document.querySelector('#userCount').textContent = data.counts.users;
      document.querySelector('#artworkCount').textContent = data.counts.artworks;
      document.querySelector('#eventCount').textContent = data.counts.events;
      document.querySelector('#orderCount').textContent = data.counts.orders;
      
      // Update growth indicators
      document.querySelector('#userGrowth').textContent = `+${data.growth.users || 0}%`;
      document.querySelector('#artworkGrowth').textContent = `+${data.growth.artworks || 0}%`;
      document.querySelector('#eventGrowth').textContent = `+${data.growth.events || 0}%`;
      document.querySelector('#orderGrowth').textContent = `+${data.growth.orders || 0}%`;
      
      // Update activities table
      updateActivitiesTable(data.activities);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
      showNotification('Error loading dashboard data. Please try again.', 'error');
    });
}

// Update activities table
function updateActivitiesTable(activities) {
  const tableBody = document.querySelector('#activitiesTable tbody');
  tableBody.innerHTML = '';
  
  if (activities && activities.length > 0) {
    activities.forEach(activity => {
      const row = document.createElement('tr');
      
      const userCell = document.createElement('td');
      userCell.className = 'flex items-center';
      userCell.innerHTML = `
        <img src="${activity.user.profilePicture || '/default.jpg'}" alt="User" class="w-8 h-8 rounded-full mr-3">
        <span>${activity.user.name}</span>
      `;
      
      const actionCell = document.createElement('td');
      actionCell.textContent = activity.action;
      
      const resourceCell = document.createElement('td');
      resourceCell.textContent = activity.resource;
      
      const timeCell = document.createElement('td');
      timeCell.textContent = timeAgo(new Date(activity.timestamp));
      
      row.appendChild(userCell);
      row.appendChild(actionCell);
      row.appendChild(resourceCell);
      row.appendChild(timeCell);
      
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 4;
    emptyCell.className = 'text-center py-4';
    emptyCell.textContent = 'No recent activities';
    row.appendChild(emptyCell);
    tableBody.appendChild(row);
  }
}

// Initialize Charts
function initializeCharts() {
  // Monthly Sales Chart
  const salesCtx = document.getElementById('monthlySalesChart').getContext('2d');
  const monthlySalesChart = new Chart(salesCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Sales ($)',
        data: [1200, 1900, 3000, 5000, 2000, 3000, 4500, 3800, 4000, 5500, 6500, 7000],
        backgroundColor: 'rgba(75, 85, 99, 0.2)',
        borderColor: 'rgba(75, 85, 99, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  // User Growth Chart
  const userCtx = document.getElementById('userGrowthChart').getContext('2d');
  const userGrowthChart = new Chart(userCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'New Users',
        data: [5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75, 90],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Update sales chart with real data
function updateSalesChart(salesData) {
  if (!salesData || !Array.isArray(salesData) || salesData.length === 0) return;
  
  const ctx = document.getElementById('monthlySalesChart').getContext('2d');
  const labels = salesData.map(item => item.month);
  const values = salesData.map(item => item.total);
  
  // If chart already exists, destroy it
  if (window.monthlySalesChart) {
    window.monthlySalesChart.destroy();
  }
  
  window.monthlySalesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Sales ($)',
        data: values,
        backgroundColor: 'rgba(75, 85, 99, 0.2)',
        borderColor: 'rgba(75, 85, 99, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Update user growth chart with real data
function updateUserGrowthChart(growthData) {
  if (!growthData || !Array.isArray(growthData) || growthData.length === 0) return;
  
  const ctx = document.getElementById('userGrowthChart').getContext('2d');
  const labels = growthData.map(item => item.month);
  const values = growthData.map(item => item.count);
  
  // If chart already exists, destroy it
  if (window.userGrowthChart) {
    window.userGrowthChart.destroy();
  }
  
  window.userGrowthChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'New Users',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Add event listeners
function addEventListeners() {
  // User search
  const userSearchInput = document.querySelector('#userSearch');
  if (userSearchInput) {
    userSearchInput.addEventListener('input', debounce(() => {
      filterUsers(userSearchInput.value);
    }, 300));
  }
  
  // User role filter
  const userRoleFilter = document.querySelector('#userRoleFilter');
  const applyUserFilters = document.querySelector('#applyUserFilters');
  if (userRoleFilter && applyUserFilters) {
    applyUserFilters.addEventListener('click', () => {
      const role = userRoleFilter.value;
      const searchTerm = userSearchInput ? userSearchInput.value : '';
      filterUsersByRole(role, searchTerm);
    });
  }
  
  // Add User button
  const addUserBtn = document.querySelector('#addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', showAddUserModal);
  }
  
  // Artwork search
  const artworkSearchInput = document.querySelector('#artworkSearch');
  if (artworkSearchInput) {
    artworkSearchInput.addEventListener('input', debounce(() => {
      filterArtworks(artworkSearchInput.value);
    }, 300));
  }
  
  // Artwork category filter
  const artworkCategoryFilter = document.querySelector('#artworkCategoryFilter');
  const applyArtworkFilters = document.querySelector('#applyArtworkFilters');
  if (artworkCategoryFilter && applyArtworkFilters) {
    applyArtworkFilters.addEventListener('click', () => {
      const category = artworkCategoryFilter.value;
      const searchTerm = artworkSearchInput ? artworkSearchInput.value : '';
      filterArtworksByCategory(category, searchTerm);
    });
  }
  
  // Add Artwork button
  const addArtworkBtn = document.querySelector('#addArtworkBtn');
  if (addArtworkBtn) {
    addArtworkBtn.addEventListener('click', showAddArtworkModal);
  }
  
  // Event search
  const eventSearchInput = document.querySelector('#eventSearch');
  if (eventSearchInput) {
    eventSearchInput.addEventListener('input', debounce(() => {
      filterEvents(eventSearchInput.value);
    }, 300));
  }
  
  // Event type filter
  const eventTypeFilter = document.querySelector('#eventTypeFilter');
  const applyEventFilters = document.querySelector('#applyEventFilters');
  if (eventTypeFilter && applyEventFilters) {
    applyEventFilters.addEventListener('click', () => {
      const type = eventTypeFilter.value;
      const searchTerm = eventSearchInput ? eventSearchInput.value : '';
      filterEventsByType(type, searchTerm);
    });
  }
  
  // Add Event button
  const addEventBtn = document.querySelector('#addEventBtn');
  if (addEventBtn) {
    addEventBtn.addEventListener('click', showAddEventModal);
  }
  
  // Order search
  const orderSearchInput = document.querySelector('#orderSearch');
  if (orderSearchInput) {
    orderSearchInput.addEventListener('input', debounce(() => {
      filterOrders(orderSearchInput.value);
    }, 300));
  }
  
  // Order status filter
  const orderStatusFilter = document.querySelector('#orderStatusFilter');
  const applyOrderFilters = document.querySelector('#applyOrderFilters');
  if (orderStatusFilter && applyOrderFilters) {
    applyOrderFilters.addEventListener('click', () => {
      const status = orderStatusFilter.value;
      const searchTerm = orderSearchInput ? orderSearchInput.value : '';
      filterOrdersByStatus(status, searchTerm);
    });
  }
}

// Users CRUD operations
function fetchUsers() {
  fetch('/api/admin/users')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(users => {
      currentData.users = users;
      renderUsers(users);
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      showNotification('Error loading users. Please try again.', 'error');
    });
}

function renderUsers(users, page = 1) {
  const tableBody = document.querySelector('#usersTable tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  // Calculate pagination
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedUsers = users.slice(start, end);
  
  if (paginatedUsers.length > 0) {
    paginatedUsers.forEach(user => {
      const row = document.createElement('tr');
      
      // User info cell
      const userCell = document.createElement('td');
      userCell.className = 'flex items-center';
      userCell.innerHTML = `
        <img src="${user.profilePicture || '/default.jpg'}" alt="${user.username}" class="w-8 h-8 rounded-full mr-3">
        <div>
          <div class="font-medium">${user.username}</div>
          <div class="text-sm text-gray-500">${user.email}</div>
        </div>
      `;
      
      // Full name cell
      const nameCell = document.createElement('td');
      nameCell.textContent = user.fullName || 'N/A';
      
      // Role cell
      const roleCell = document.createElement('td');
      let roleClass = '';
      
      switch (user.role) {
        case 'admin':
          roleClass = 'bg-red-100 text-red-800';
          break;
        case 'artist':
          roleClass = 'bg-blue-100 text-blue-800';
          break;
        default:
          roleClass = 'bg-gray-100 text-gray-800';
      }
      
      roleCell.innerHTML = `<span class="px-2 py-1 ${roleClass} rounded-full text-xs font-medium">${user.role}</span>`;
      
      // Joined date cell
      const joinedCell = document.createElement('td');
      joinedCell.textContent = new Date(user.createdAt).toLocaleDateString();
      
      // Actions cell
      const actionsCell = document.createElement('td');
      actionsCell.className = 'flex space-x-2';
      actionsCell.innerHTML = `
        <button onclick="editUser('${user._id}')" class="p-1 text-blue-600 hover:text-blue-800" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteUser('${user._id}')" class="p-1 text-red-600 hover:text-red-800" title="Delete">
          <i class="fas fa-trash-alt"></i>
        </button>
        <button onclick="viewUserDetails('${user._id}')" class="p-1 text-gray-600 hover:text-gray-800" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
      `;
      
      row.appendChild(userCell);
      row.appendChild(nameCell);
      row.appendChild(roleCell);
      row.appendChild(joinedCell);
      row.appendChild(actionsCell);
      
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 5;
    emptyCell.className = 'text-center py-4';
    emptyCell.textContent = 'No users found';
    row.appendChild(emptyCell);
    tableBody.appendChild(row);
  }
  
  // Update pagination info
  updatePaginationInfo('users', users.length, page);
}

function filterUsers(query) {
  if (!query) {
    renderUsers(currentData.users);
    return;
  }
  
  query = query.toLowerCase();
  const filteredUsers = currentData.users.filter(user => 
    user.username.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query) || 
    (user.fullName && user.fullName.toLowerCase().includes(query))
  );
  
  renderUsers(filteredUsers);
}

function editUser(userId) {
  const user = currentData.users.find(u => u._id === userId);
  if (!user) return;
  
  // Create modal for editing user
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'editUserModal';
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-md rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Edit User</h3>
        <button onclick="closeModal('editUserModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="editUserForm">
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" id="username" name="username" value="${user.username}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" name="email" value="${user.email}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" id="fullName" name="fullName" value="${user.fullName || ''}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-6">
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select id="role" name="role" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
            <option value="artist" ${user.role === 'artist' ? 'selected' : ''}>Artist</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </div>
        
        <div class="flex justify-end">
          <button type="button" onclick="closeModal('editUserModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
          <button type="button" onclick="updateUser('${userId}')" class="px-4 py-2 bg-black text-white rounded-md">Save Changes</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function updateUser(userId) {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const fullName = document.getElementById('fullName').value;
  const role = document.getElementById('role').value;
  
  // Validate inputs
  if (!username || !email) {
    showNotification('Username and email are required.', 'error');
    return;
  }
  
  fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, fullName, role })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update user in the current data
      const index = currentData.users.findIndex(u => u._id === userId);
      if (index !== -1) {
        currentData.users[index] = { ...currentData.users[index], ...data.user };
        renderUsers(currentData.users);
      }
      
      closeModal('editUserModal');
      showNotification('User updated successfully.', 'success');
    })
    .catch(error => {
      console.error('Error updating user:', error);
      showNotification('Error updating user. Please try again.', 'error');
    });
}

// Function to delete a user
function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }
  
  fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      showNotification('User deleted successfully!', 'success');
      fetchUsers();
    })
    .catch(error => {
      console.error('Error deleting user:', error);
      showNotification('Error deleting user. Please try again.', 'error');
    });
}

// View user details
function viewUserDetails(userId) {
  const user = currentData.users.find(u => u._id === userId);
  if (!user) return;
  
  // Create modal for viewing user details
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'viewUserModal';
  
  // Format date for better readability
  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Prepare address display
  const address = user.address ? 
    `${user.address.street || ''}, 
     ${user.address.city || ''}, 
     ${user.address.state || ''} 
     ${user.address.postalCode || ''}, 
     ${user.address.country || ''}`.replace(/\s+/g, ' ').trim() : 
    'Not provided';
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-2xl rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">User Details</h3>
        <button onclick="closeModal('viewUserModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1">
          <div class="text-center">
            <img src="${user.profilePicture || '/default.jpg'}" alt="${user.username}" class="w-32 h-32 rounded-full mx-auto object-cover border">
            <h4 class="text-lg font-medium mt-2">${user.fullName || user.username}</h4>
            <span class="inline-block px-2 py-1 ${user.role === 'admin' ? 'bg-red-100 text-red-800' : user.role === 'artist' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'} rounded-full text-xs font-medium mt-1">
              ${user.role}
            </span>
          </div>
        </div>
        
        <div class="md:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 class="text-sm font-medium text-gray-500">Username</h5>
              <p>${user.username}</p>
            </div>
            
            <div>
              <h5 class="text-sm font-medium text-gray-500">Email</h5>
              <p>${user.email}</p>
            </div>
            
            <div>
              <h5 class="text-sm font-medium text-gray-500">Phone Number</h5>
              <p>${user.phoneNumber || 'Not provided'}</p>
            </div>
            
            <div>
              <h5 class="text-sm font-medium text-gray-500">Joined Date</h5>
              <p>${formattedDate}</p>
            </div>
            
            <div class="md:col-span-2">
              <h5 class="text-sm font-medium text-gray-500">Address</h5>
              <p>${address}</p>
            </div>
            
            <div class="md:col-span-2">
              <h5 class="text-sm font-medium text-gray-500">Bio</h5>
              <p>${user.bio || 'No bio provided'}</p>
            </div>
          </div>
          
          ${user.role === 'artist' ? `
          <div class="mt-4 border-t pt-4">
            <h5 class="text-sm font-medium text-gray-500 mb-2">Artist Information</h5>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <h6 class="text-xs font-medium text-gray-500">Artist Statement</h6>
                <p>${user.artistStatement || 'No artist statement provided'}</p>
              </div>
              
              <div class="md:col-span-2">
                <h6 class="text-xs font-medium text-gray-500">Exhibition History</h6>
                <p>${user.exhibitionHistory && user.exhibitionHistory.length > 0 ? user.exhibitionHistory.join(', ') : 'No exhibition history provided'}</p>
              </div>
              
              <div class="md:col-span-2">
                <h6 class="text-xs font-medium text-gray-500">Social Media</h6>
                <div class="flex flex-wrap gap-2 mt-1">
                  ${user.socialMedia?.instagram ? `<a href="https://instagram.com/${user.socialMedia.instagram}" target="_blank" class="text-pink-600 hover:underline"><i class="fab fa-instagram mr-1"></i>${user.socialMedia.instagram}</a>` : ''}
                  ${user.socialMedia?.twitter ? `<a href="https://twitter.com/${user.socialMedia.twitter}" target="_blank" class="text-blue-400 hover:underline"><i class="fab fa-twitter mr-1"></i>${user.socialMedia.twitter}</a>` : ''}
                  ${user.socialMedia?.facebook ? `<a href="https://facebook.com/${user.socialMedia.facebook}" target="_blank" class="text-blue-600 hover:underline"><i class="fab fa-facebook mr-1"></i>${user.socialMedia.facebook}</a>` : ''}
                  ${user.socialMedia?.website ? `<a href="${user.socialMedia.website}" target="_blank" class="text-gray-600 hover:underline"><i class="fas fa-globe mr-1"></i>Website</a>` : ''}
                </div>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button type="button" onclick="closeModal('viewUserModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Close</button>
        <button type="button" onclick="editUser('${userId}')" class="px-4 py-2 bg-black text-white rounded-md">Edit User</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Artwork CRUD operations
function fetchArtworks() {
  fetch('/api/admin/artworks')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(artworks => {
      currentData.artworks = artworks;
      renderArtworks(artworks);
    })
    .catch(error => {
      console.error('Error fetching artworks:', error);
      showNotification('Error loading artworks. Please try again.', 'error');
    });
}

function renderArtworks(artworks, page = 1) {
  const tableBody = document.querySelector('#artworksTable tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  // Calculate pagination
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedArtworks = artworks.slice(start, end);
  
  if (paginatedArtworks.length > 0) {
    paginatedArtworks.forEach(artwork => {
      const row = document.createElement('tr');
      
      // Image cell
      const imageCell = document.createElement('td');
      imageCell.innerHTML = `
        <img src="${artwork.imageUrl || '/art/default.png'}" alt="${artwork.title}" class="w-16 h-16 object-cover rounded">
      `;
      
      // Title cell
      const titleCell = document.createElement('td');
      titleCell.textContent = artwork.title;
      
      // Artist cell
      const artistCell = document.createElement('td');
      artistCell.textContent = artwork.artist;
      
      // Category cell
      const categoryCell = document.createElement('td');
      categoryCell.textContent = artwork.category ? artwork.category.charAt(0).toUpperCase() + artwork.category.slice(1) : 'N/A';
      
      // Price cell
      const priceCell = document.createElement('td');
      priceCell.textContent = `$${parseFloat(artwork.price).toFixed(2)}`;
      
      // Actions cell
      const actionsCell = document.createElement('td');
      actionsCell.className = 'flex space-x-2';
      actionsCell.innerHTML = `
        <button onclick="editArtwork('${artwork._id}')" class="p-1 text-blue-600 hover:text-blue-800" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteArtwork('${artwork._id}')" class="p-1 text-red-600 hover:text-red-800" title="Delete">
          <i class="fas fa-trash-alt"></i>
        </button>
        <button onclick="viewArtworkDetails('${artwork._id}')" class="p-1 text-gray-600 hover:text-gray-800" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
      `;
      
      row.appendChild(imageCell);
      row.appendChild(titleCell);
      row.appendChild(artistCell);
      row.appendChild(categoryCell);
      row.appendChild(priceCell);
      row.appendChild(actionsCell);
      
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 6;
    emptyCell.className = 'text-center py-4';
    emptyCell.textContent = 'No artworks found';
    row.appendChild(emptyCell);
    tableBody.appendChild(row);
  }
  
  // Update pagination info
  updatePaginationInfo('artworks', artworks.length, page);
}

function filterArtworks(query) {
  if (!query) {
    renderArtworks(currentData.artworks);
    return;
  }
  
  query = query.toLowerCase();
  const filteredArtworks = currentData.artworks.filter(artwork => 
    artwork.title.toLowerCase().includes(query) || 
    artwork.artist.toLowerCase().includes(query) || 
    (artwork.description && artwork.description.toLowerCase().includes(query))
  );
  
  renderArtworks(filteredArtworks);
}

function filterArtworksByCategory(category, searchTerm = '') {
  let filteredArtworks = currentData.artworks;
  
  if (category) {
    filteredArtworks = filteredArtworks.filter(artwork => artwork.category === category);
  }
  
  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    filteredArtworks = filteredArtworks.filter(artwork => 
      artwork.title.toLowerCase().includes(query) || 
      artwork.artist.toLowerCase().includes(query) || 
      (artwork.description && artwork.description.toLowerCase().includes(query))
    );
  }
  
  renderArtworks(filteredArtworks);
}

function showAddArtworkModal() {
  // Create modal for adding a new artwork
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'addArtworkModal';
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-md rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Add New Artwork</h3>
        <button onclick="closeModal('addArtworkModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="addArtworkForm">
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" id="title" name="title" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="artist" class="block text-sm font-medium text-gray-700 mb-1">Artist</label>
          <input type="text" id="artist" name="artist" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="description" name="description" rows="3" class="w-full p-2 border border-gray-300 rounded-md" required></textarea>
        </div>
        
        <div class="mb-4">
          <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
          <input type="number" id="price" name="price" min="0" step="0.01" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select id="category" name="category" class="w-full p-2 border border-gray-300 rounded-md" required>
            <option value="">Select Category</option>
            <option value="painting">Painting</option>
            <option value="sculpture">Sculpture</option>
            <option value="photography">Photography</option>
            <option value="digital-art">Digital Art</option>
            <option value="mixed-media">Mixed Media</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="text" id="imageUrl" name="imageUrl" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="dimensions" class="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
          <input type="text" id="dimensions" name="dimensions" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" id="location" name="location" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="flex justify-end">
          <button type="button" onclick="closeModal('addArtworkModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
          <button type="button" onclick="createArtwork()" class="px-4 py-2 bg-black text-white rounded-md">Add Artwork</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function createArtwork() {
  const title = document.getElementById('title').value;
  const artist = document.getElementById('artist').value;
  const description = document.getElementById('description').value;
  const price = document.getElementById('price').value;
  const category = document.getElementById('category').value;
  const imageUrl = document.getElementById('imageUrl').value;
  const dimensions = document.getElementById('dimensions').value;
  const location = document.getElementById('location').value;
  
  // Validate inputs
  if (!title || !artist || !description || !price || !category || !imageUrl) {
    showNotification('Please fill in all required fields.', 'error');
    return;
  }
  
  fetch('/api/admin/artworks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      title, 
      artist, 
      description, 
      price: parseFloat(price), 
      category, 
      imageUrl, 
      dimensions, 
      location 
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Add new artwork to current data
      currentData.artworks.push(data.artwork);
      renderArtworks(currentData.artworks);
      
      closeModal('addArtworkModal');
      showNotification('Artwork created successfully.', 'success');
    })
    .catch(error => {
      console.error('Error creating artwork:', error);
      showNotification('Error creating artwork. Please try again.', 'error');
    });
}

function editArtwork(artworkId) {
  const artwork = currentData.artworks.find(a => a._id === artworkId);
  if (!artwork) return;
  
  // Create modal for editing artwork
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'editArtworkModal';
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-md rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Edit Artwork</h3>
        <button onclick="closeModal('editArtworkModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="editArtworkForm">
        <div class="mb-4">
          <label for="edit-title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" id="edit-title" name="title" value="${artwork.title}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="edit-artist" class="block text-sm font-medium text-gray-700 mb-1">Artist</label>
          <input type="text" id="edit-artist" name="artist" value="${artwork.artist}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="edit-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="edit-description" name="description" rows="3" class="w-full p-2 border border-gray-300 rounded-md" required>${artwork.description}</textarea>
        </div>
        
        <div class="mb-4">
          <label for="edit-price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
          <input type="number" id="edit-price" name="price" min="0" step="0.01" value="${artwork.price}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="edit-category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select id="edit-category" name="category" class="w-full p-2 border border-gray-300 rounded-md" required>
            <option value="painting" ${artwork.category === 'painting' ? 'selected' : ''}>Painting</option>
            <option value="sculpture" ${artwork.category === 'sculpture' ? 'selected' : ''}>Sculpture</option>
            <option value="photography" ${artwork.category === 'photography' ? 'selected' : ''}>Photography</option>
            <option value="digital-art" ${artwork.category === 'digital-art' ? 'selected' : ''}>Digital Art</option>
            <option value="mixed-media" ${artwork.category === 'mixed-media' ? 'selected' : ''}>Mixed Media</option>
            <option value="other" ${artwork.category === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label for="edit-imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="text" id="edit-imageUrl" name="imageUrl" value="${artwork.imageUrl}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="edit-dimensions" class="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
          <input type="text" id="edit-dimensions" name="dimensions" value="${artwork.dimensions || ''}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="edit-location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" id="edit-location" name="location" value="${artwork.location || ''}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="flex justify-end">
          <button type="button" onclick="closeModal('editArtworkModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
          <button type="button" onclick="updateArtwork('${artworkId}')" class="px-4 py-2 bg-black text-white rounded-md">Save Changes</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function updateArtwork(artworkId) {
  const title = document.getElementById('edit-title').value;
  const artist = document.getElementById('edit-artist').value;
  const description = document.getElementById('edit-description').value;
  const price = document.getElementById('edit-price').value;
  const category = document.getElementById('edit-category').value;
  const imageUrl = document.getElementById('edit-imageUrl').value;
  const dimensions = document.getElementById('edit-dimensions').value;
  const location = document.getElementById('edit-location').value;
  
  // Validate inputs
  if (!title || !artist || !description || !price || !category || !imageUrl) {
    showNotification('Please fill in all required fields.', 'error');
    return;
  }
  
  fetch(`/api/admin/artworks/${artworkId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      title, 
      artist, 
      description, 
      price: parseFloat(price), 
      category, 
      imageUrl, 
      dimensions, 
      location 
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update artwork in the current data
      const index = currentData.artworks.findIndex(a => a._id === artworkId);
      if (index !== -1) {
        currentData.artworks[index] = data.artwork;
        renderArtworks(currentData.artworks);
      }
      
      closeModal('editArtworkModal');
      showNotification('Artwork updated successfully.', 'success');
    })
    .catch(error => {
      console.error('Error updating artwork:', error);
      showNotification('Error updating artwork. Please try again.', 'error');
    });
}

function deleteArtwork(artworkId) {
  if (confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
    fetch(`/api/admin/artworks/${artworkId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        // Remove artwork from current data
        currentData.artworks = currentData.artworks.filter(a => a._id !== artworkId);
        renderArtworks(currentData.artworks);
        showNotification('Artwork deleted successfully.', 'success');
      })
      .catch(error => {
        console.error('Error deleting artwork:', error);
        showNotification('Error deleting artwork. Please try again.', 'error');
      });
  }
}

function viewArtworkDetails(artworkId) {
  const artwork = currentData.artworks.find(a => a._id === artworkId);
  if (!artwork) return;
  
  // Create modal for viewing artwork details
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'viewArtworkModal';
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-lg rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Artwork Details</h3>
        <button onclick="closeModal('viewArtworkModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="flex flex-col md:flex-row gap-6">
        <div class="md:w-1/2">
          <img src="${artwork.imageUrl}" alt="${artwork.title}" class="w-full h-auto rounded-md object-cover">
        </div>
        
        <div class="md:w-1/2">
          <h4 class="text-lg font-medium mb-2">${artwork.title}</h4>
          <p class="text-gray-600 mb-4">by ${artwork.artist}</p>
          
          <div class="mb-4">
            <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">${artwork.category.charAt(0).toUpperCase() + artwork.category.slice(1)}</span>
          </div>
          
          <p class="text-gray-700 mb-4">${artwork.description}</p>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Price</label>
              <p class="text-black font-semibold">$${parseFloat(artwork.price).toFixed(2)}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Dimensions</label>
              <p class="text-black">${artwork.dimensions || 'N/A'}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Location</label>
              <p class="text-black">${artwork.location || 'N/A'}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Added On</label>
              <p class="text-black">${new Date(artwork.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button onclick="closeModal('viewArtworkModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Similar CRUD functions for artworks, events, and orders...
function fetchEvents() {
  fetch('/api/admin/events')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(events => {
      currentData.events = events;
      renderEvents(events);
    })
    .catch(error => {
      console.error('Error fetching events:', error);
      showNotification('Error loading events. Please try again.', 'error');
    });
}

function renderEvents(events, page = 1) {
  const tableBody = document.querySelector('#eventsTable tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  // Calculate pagination
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedEvents = events.slice(start, end);
  
  if (paginatedEvents.length > 0) {
    paginatedEvents.forEach(event => {
      const row = document.createElement('tr');
      
      // Image cell
      const imageCell = document.createElement('td');
      imageCell.innerHTML = `
        <img src="${event.imageUrl || '/images/event-default.jpg'}" alt="${event.name}" class="w-16 h-16 object-cover rounded">
      `;
      
      // Name cell
      const nameCell = document.createElement('td');
      nameCell.textContent = event.name;
      
      // Date cell
      const dateCell = document.createElement('td');
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);
      const formattedDate = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      dateCell.textContent = formattedDate;
      // Location cell
      const locationCell = document.createElement('td');
      locationCell.textContent = event.location;
      
      // Type cell
      const typeCell = document.createElement('td');
      const typeClass = event.type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
      typeCell.innerHTML = `<span class="px-2 py-1 ${typeClass} rounded-full text-xs font-medium">${event.type}</span>`;
      
      // Actions cell
      const actionsCell = document.createElement('td');
      actionsCell.className = 'flex space-x-2';
      actionsCell.innerHTML = `
        <button onclick="editEvent('${event._id}')" class="p-1 text-blue-600 hover:text-blue-800" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteEvent('${event._id}')" class="p-1 text-red-600 hover:text-red-800" title="Delete">
          <i class="fas fa-trash-alt"></i>
        </button>
        <button onclick="viewEventDetails('${event._id}')" class="p-1 text-gray-600 hover:text-gray-800" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
      `;
      
      row.appendChild(imageCell);
      row.appendChild(nameCell);
      row.appendChild(dateCell);
      row.appendChild(locationCell);
      row.appendChild(typeCell);
      row.appendChild(actionsCell);
      
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 6;
    emptyCell.className = 'text-center py-4';
    emptyCell.textContent = 'No events found';
    row.appendChild(emptyCell);
    tableBody.appendChild(row);
  }
  
  // Update pagination info
  updatePaginationInfo('events', events.length, page);
}

function filterEvents(query) {
  if (!query) {
    renderEvents(currentData.events);
    return;
  }
  
  query = query.toLowerCase();
  const filteredEvents = currentData.events.filter(event => 
    event.name.toLowerCase().includes(query) || 
    event.location.toLowerCase().includes(query) || 
    (event.description && event.description.toLowerCase().includes(query))
  );
  
  renderEvents(filteredEvents);
}

function filterEventsByType(type, searchTerm = '') {
  let filteredEvents = currentData.events;
  
  if (type) {
    filteredEvents = filteredEvents.filter(event => event.type === type);
  }
  
  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    filteredEvents = filteredEvents.filter(event => 
      event.name.toLowerCase().includes(query) || 
      event.location.toLowerCase().includes(query) || 
      (event.description && event.description.toLowerCase().includes(query))
    );
  }
  
  renderEvents(filteredEvents);
}

// Orders CRUD operations
function fetchOrders() {
  fetch('/api/admin/orders')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(orders => {
      currentData.orders = orders;
      renderOrders(orders);
    })
    .catch(error => {
      console.error('Error fetching orders:', error);
      showNotification('Error loading orders. Please try again.', 'error');
    });
}

function renderOrders(orders, page = 1) {
  const tableBody = document.querySelector('#ordersTable tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  // Calculate pagination
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedOrders = orders.slice(start, end);
  
  if (paginatedOrders.length > 0) {
    paginatedOrders.forEach(order => {
      const row = document.createElement('tr');
      
      // Order ID cell
      const idCell = document.createElement('td');
      idCell.innerHTML = `<span class="font-mono">#${order._id.toString().slice(-8).toUpperCase()}</span>`;
      
      // Customer cell
      const customerCell = document.createElement('td');
      customerCell.className = 'flex items-center';
      const username = order.user ? (order.user.username || 'Unknown User') : 'Guest';
      const profilePic = order.user && order.user.profilePicture ? order.user.profilePicture : '/default.jpg';
      const email = order.user ? order.user.email || 'No email' : 'Guest checkout';
      
      customerCell.innerHTML = `
        <img src="${profilePic}" alt="${username}" class="w-8 h-8 rounded-full mr-3">
        <div>
          <div class="font-medium">${username}</div>
          <div class="text-sm text-gray-500">${email}</div>
        </div>
      `;
      
      // Date cell
      const dateCell = document.createElement('td');
      const orderDate = new Date(order.orderDate || order.createdAt);
      dateCell.textContent = orderDate.toLocaleDateString();
      
      // Total cell
      const totalCell = document.createElement('td');
      const total = order.totalPrice || 
                   (order.items ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0);
      totalCell.innerHTML = `<span class="font-medium">$${parseFloat(total).toFixed(2)}</span>`;
      
      // Status cell
      const statusCell = document.createElement('td');
      let statusClass = '';
      switch(order.status) {
        case 'pending':
          statusClass = 'bg-yellow-100 text-yellow-800';
          break;
        case 'processing':
          statusClass = 'bg-blue-100 text-blue-800';
          break;
        case 'shipped':
          statusClass = 'bg-indigo-100 text-indigo-800';
          break;
        case 'delivered':
          statusClass = 'bg-green-100 text-green-800';
          break;
        case 'cancelled':
          statusClass = 'bg-red-100 text-red-800';
          break;
        default:
          statusClass = 'bg-gray-100 text-gray-800';
      }
      
      const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
      statusCell.innerHTML = `
        <span class="px-2 py-1 ${statusClass} rounded-full text-xs font-medium">${statusText}</span>
      `;
      
      // Actions cell
      const actionsCell = document.createElement('td');
      actionsCell.className = 'flex space-x-2';
      actionsCell.innerHTML = `
        <button onclick="editOrder('${order._id}')" class="p-1 text-blue-600 hover:text-blue-800" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="viewOrderDetails('${order._id}')" class="p-1 text-gray-600 hover:text-gray-800" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
        <button onclick="printOrderInvoice('${order._id}')" class="p-1 text-green-600 hover:text-green-800" title="Print Invoice">
          <i class="fas fa-file-invoice"></i>
        </button>
      `;
      
      row.appendChild(idCell);
      row.appendChild(customerCell);
      row.appendChild(dateCell);
      row.appendChild(totalCell);
      row.appendChild(statusCell);
      row.appendChild(actionsCell);
      
      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 6;
    emptyCell.className = 'text-center py-4';
    emptyCell.textContent = 'No orders found';
    row.appendChild(emptyCell);
    tableBody.appendChild(row);
  }
  
  // Update pagination info
  updatePaginationInfo('orders', orders.length, page);
}

function filterOrders(query) {
  if (!query) {
    renderOrders(currentData.orders);
    return;
  }
  
  query = query.toLowerCase();
  const filteredOrders = currentData.orders.filter(order => {
    const orderId = order._id.toString().toLowerCase();
    const username = order.user && order.user.username ? order.user.username.toLowerCase() : '';
    const email = order.user && order.user.email ? order.user.email.toLowerCase() : '';
    
    return orderId.includes(query) || 
           username.includes(query) || 
           email.includes(query);
  });
  
  renderOrders(filteredOrders);
}

function filterOrdersByStatus(status, searchTerm = '') {
  let filteredOrders = currentData.orders;
  
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status);
  }
  
  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    filteredOrders = filteredOrders.filter(order => {
      const orderId = order._id.toString().toLowerCase();
      const username = order.user && order.user.username ? order.user.username.toLowerCase() : '';
      const email = order.user && order.user.email ? order.user.email.toLowerCase() : '';
      
      return orderId.includes(query) || 
             username.includes(query) || 
             email.includes(query);
    });
  }
  
  renderOrders(filteredOrders);
}

// Event CRUD operations
function showAddEventModal() {
  // Create modal for adding a new event
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'addEventModal';
  
  const currentDate = new Date().toISOString().slice(0, 16);
  const nextHour = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-md rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Add New Event</h3>
        <button onclick="closeModal('addEventModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="addEventForm">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
          <input type="text" id="name" name="name" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="startTime" class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input type="datetime-local" id="startTime" name="startTime" value="${currentDate}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="endTime" class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input type="datetime-local" id="endTime" name="endTime" value="${nextHour}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" id="location" name="location" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select id="type" name="type" class="w-full p-2 border border-gray-300 rounded-md" required>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input type="text" id="eventCategory" name="category" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4" id="platformField">
          <label for="platform" class="block text-sm font-medium text-gray-700 mb-1">Platform (for Online events)</label>
          <input type="text" id="platform" name="platform" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="eventDescription" name="description" rows="3" class="w-full p-2 border border-gray-300 rounded-md"></textarea>
        </div>
        
        <div class="mb-4">
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="text" id="eventImageUrl" name="imageUrl" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input type="text" id="tags" name="tags" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="flex justify-end">
          <button type="button" onclick="closeModal('addEventModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
          <button type="button" onclick="createEvent()" class="px-4 py-2 bg-black text-white rounded-md">Add Event</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Show/hide platform field based on event type
  const typeSelect = document.getElementById('type');
  const platformField = document.getElementById('platformField');
  
  typeSelect.addEventListener('change', function() {
    if (this.value === 'Online') {
      platformField.style.display = 'block';
    } else {
      platformField.style.display = 'none';
    }
  });
}

function createEvent() {
  const name = document.getElementById('name').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const location = document.getElementById('location').value;
  const type = document.getElementById('type').value;
  const category = document.getElementById('eventCategory').value;
  const platform = document.getElementById('platform').value;
  const description = document.getElementById('eventDescription').value;
  const imageUrl = document.getElementById('eventImageUrl').value;
  const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
  
  // Validate inputs
  if (!name || !startTime || !endTime || !location || !type || !category) {
    showNotification('Please fill in all required fields.', 'error');
    return;
  }
  
  // Validate dates
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  if (startDate >= endDate) {
    showNotification('End time must be after start time.', 'error');
    return;
  }
  
  fetch('/api/admin/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      name, 
      startTime: startDate.toISOString(), 
      endTime: endDate.toISOString(), 
      location, 
      type, 
      category, 
      platform: type === 'Online' ? platform : null, 
      description, 
      imageUrl, 
      tags 
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Add new event to current data
      currentData.events.push(data.event);
      renderEvents(currentData.events);
      
      closeModal('addEventModal');
      showNotification('Event created successfully.', 'success');
    })
    .catch(error => {
      console.error('Error creating event:', error);
      showNotification('Error creating event. Please try again.', 'error');
    });
}

function editEvent(eventId) {
  const event = currentData.events.find(e => e._id === eventId);
  if (!event) return;
  
  // Create modal for editing event
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'editEventModal';
  
  const startTime = new Date(event.startTime).toISOString().slice(0, 16);
  const endTime = new Date(event.endTime).toISOString().slice(0, 16);
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-md rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Edit Event</h3>
        <button onclick="closeModal('editEventModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="editEventForm">
        <div class="mb-4">
          <label for="edit-name" class="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
          <input type="text" id="edit-name" name="name" value="${event.name}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="edit-startTime" class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input type="datetime-local" id="edit-startTime" name="startTime" value="${startTime}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="edit-endTime" class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input type="datetime-local" id="edit-endTime" name="endTime" value="${endTime}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="edit-location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" id="edit-location" name="location" value="${event.location}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4">
          <label for="edit-type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select id="edit-type" name="type" class="w-full p-2 border border-gray-300 rounded-md" required>
            <option value="Online" ${event.type === 'Online' ? 'selected' : ''}>Online</option>
            <option value="Offline" ${event.type === 'Offline' ? 'selected' : ''}>Offline</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label for="edit-category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input type="text" id="edit-category" name="category" value="${event.category}" class="w-full p-2 border border-gray-300 rounded-md" required>
        </div>
        
        <div class="mb-4" id="edit-platformField" style="display: ${event.type === 'Online' ? 'block' : 'none'}">
          <label for="edit-platform" class="block text-sm font-medium text-gray-700 mb-1">Platform (for Online events)</label>
          <input type="text" id="edit-platform" name="platform" value="${event.platform || ''}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="edit-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="edit-description" name="description" rows="3" class="w-full p-2 border border-gray-300 rounded-md">${event.description || ''}</textarea>
        </div>
        
        <div class="mb-4">
          <label for="edit-imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="text" id="edit-imageUrl" name="imageUrl" value="${event.imageUrl || ''}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="edit-tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input type="text" id="edit-tags" name="tags" value="${(event.tags || []).join(', ')}" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="flex justify-end">
          <button type="button" onclick="closeModal('editEventModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
          <button type="button" onclick="updateEvent('${eventId}')" class="px-4 py-2 bg-black text-white rounded-md">Save Changes</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Show/hide platform field based on event type
  const typeSelect = document.getElementById('edit-type');
  const platformField = document.getElementById('edit-platformField');
  
  typeSelect.addEventListener('change', function() {
    if (this.value === 'Online') {
      platformField.style.display = 'block';
    } else {
      platformField.style.display = 'none';
    }
  });
}

function updateEvent(eventId) {
  const name = document.getElementById('edit-name').value;
  const startTime = document.getElementById('edit-startTime').value;
  const endTime = document.getElementById('edit-endTime').value;
  const location = document.getElementById('edit-location').value;
  const type = document.getElementById('edit-type').value;
  const category = document.getElementById('edit-category').value;
  const platform = document.getElementById('edit-platform').value;
  const description = document.getElementById('edit-description').value;
  const imageUrl = document.getElementById('edit-imageUrl').value;
  const tags = document.getElementById('edit-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
  
  // Validate inputs
  if (!name || !startTime || !endTime || !location || !type || !category) {
    showNotification('Please fill in all required fields.', 'error');
    return;
  }
  
  // Validate dates
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  if (startDate >= endDate) {
    showNotification('End time must be after start time.', 'error');
    return;
  }
  
  fetch(`/api/admin/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      name, 
      startTime: startDate.toISOString(), 
      endTime: endDate.toISOString(), 
      location, 
      type, 
      category, 
      platform: type === 'Online' ? platform : null, 
      description, 
      imageUrl, 
      tags 
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update event in the current data
      const index = currentData.events.findIndex(e => e._id === eventId);
      if (index !== -1) {
        currentData.events[index] = data.event;
        renderEvents(currentData.events);
      }
      
      closeModal('editEventModal');
      showNotification('Event updated successfully.', 'success');
    })
    .catch(error => {
      console.error('Error updating event:', error);
      showNotification('Error updating event. Please try again.', 'error');
    });
}

function deleteEvent(eventId) {
  if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
    fetch(`/api/admin/events/${eventId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        // Remove event from current data
        currentData.events = currentData.events.filter(e => e._id !== eventId);
        renderEvents(currentData.events);
        showNotification('Event deleted successfully.', 'success');
      })
      .catch(error => {
        console.error('Error deleting event:', error);
        showNotification('Error deleting event. Please try again.', 'error');
      });
  }
}

function viewEventDetails(eventId) {
  const event = currentData.events.find(e => e._id === eventId);
  if (!event) return;
  
  // Create modal for viewing event details
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'viewEventModal';
  
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const formattedStartDate = startDate.toLocaleDateString() + ' ' + startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const formattedEndDate = endDate.toLocaleDateString() + ' ' + endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-lg rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Event Details</h3>
        <button onclick="closeModal('viewEventModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="flex flex-col md:flex-row gap-6">
        <div class="md:w-1/2">
          <img src="${event.imageUrl || '/images/event-default.jpg'}" alt="${event.name}" class="w-full h-auto rounded-md object-cover">
        </div>
        
        <div class="md:w-1/2">
          <h4 class="text-lg font-medium mb-2">${event.name}</h4>
          
          <div class="mb-4">
            <span class="px-2 py-1 ${event.type === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} rounded-full text-xs font-medium">${event.type}</span>
            <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">${event.category}</span>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Date & Time</label>
            <p class="text-black">${formattedStartDate} to ${formattedEndDate}</p>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Location</label>
            <p class="text-black">${event.location}</p>
          </div>
          
          ${event.platform ? `
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Platform</label>
            <p class="text-black">${event.platform}</p>
          </div>
          ` : ''}
          
          ${event.description ? `
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <p class="text-gray-700">${event.description}</p>
          </div>
          ` : ''}
          
          ${event.tags && event.tags.length > 0 ? `
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Tags</label>
            <div class="flex flex-wrap gap-2">
              ${event.tags.map(tag => `<span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">${tag}</span>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button onclick="closeModal('viewEventModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Helper functions
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
    type === 'success' ? 'bg-green-100 text-green-800 border-green-300' :
    type === 'error' ? 'bg-red-100 text-red-800 border-red-300' :
    'bg-blue-100 text-blue-800 border-blue-300'
  }`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${
        type === 'success' ? 'check-circle' :
        type === 'error' ? 'exclamation-circle' :
        'info-circle'
      } mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function updatePaginationInfo(entityType, totalItems, currentPage) {
  const paginationInfo = document.querySelector(`#${entityType}PaginationInfo`);
  if (!paginationInfo) return;
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(start + itemsPerPage - 1, totalItems);
  
  paginationInfo.innerHTML = `
    Showing <span class="font-medium">${start}</span> to <span class="font-medium">${end}</span> of <span class="font-medium">${totalItems}</span> results
  `;
  
  // Update pagination buttons
  const paginationButtons = document.querySelector(`#${entityType}Pagination`);
  if (!paginationButtons) return;
  
  paginationButtons.innerHTML = '';
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-btn';
  prevButton.innerHTML = '&laquo;';
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => goToPage(entityType, currentPage - 1);
  paginationButtons.appendChild(prevButton);
  
  // Page buttons
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // Adjust the range to show 5 pages
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
    pageButton.textContent = i;
    pageButton.onclick = () => goToPage(entityType, i);
    paginationButtons.appendChild(pageButton);
  }
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-btn';
  nextButton.innerHTML = '&raquo;';
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => goToPage(entityType, currentPage + 1);
  paginationButtons.appendChild(nextButton);
}

function goToPage(entityType, page) {
  currentPage = page;
  
  switch (entityType) {
    case 'users':
      renderUsers(currentData.users, page);
      break;
    case 'artworks':
      renderArtworks(currentData.artworks, page);
      break;
    case 'events':
      renderEvents(currentData.events, page);
      break;
    case 'orders':
      renderOrders(currentData.orders, page);
      break;
  }
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Order management operations
function editOrder(orderId) {
  const order = currentData.orders.find(o => o._id === orderId);
  if (!order) return;
  
  // Create modal for editing order status
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'editOrderModal';
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-md rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Update Order Status</h3>
        <button onclick="closeModal('editOrderModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="editOrderForm">
        <div class="mb-4">
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select id="status" name="status" class="w-full p-2 border border-gray-300 rounded-md" required>
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="flex items-center">
            <input type="checkbox" id="isPaid" ${order.isPaid ? 'checked' : ''} class="mr-2">
            <span class="text-sm text-gray-700">Mark as Paid</span>
          </label>
        </div>
        
        <div class="mb-4">
          <label class="flex items-center">
            <input type="checkbox" id="isShipped" ${order.isShipped ? 'checked' : ''} class="mr-2">
            <span class="text-sm text-gray-700">Mark as Shipped</span>
          </label>
        </div>
        
        <div class="mb-4">
          <label class="flex items-center">
            <input type="checkbox" id="isDelivered" ${order.isDelivered ? 'checked' : ''} class="mr-2">
            <span class="text-sm text-gray-700">Mark as Delivered</span>
          </label>
        </div>
        
        <div class="flex justify-end">
          <button type="button" onclick="closeModal('editOrderModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
          <button type="button" onclick="updateOrder('${orderId}')" class="px-4 py-2 bg-black text-white rounded-md">Save Changes</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function updateOrder(orderId) {
  const status = document.getElementById('status').value;
  const isPaid = document.getElementById('isPaid').checked;
  const isShipped = document.getElementById('isShipped').checked;
  const isDelivered = document.getElementById('isDelivered').checked;
  
  fetch(`/api/admin/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      status, 
      isPaid, 
      isShipped, 
      isDelivered 
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update order in the current data
      const index = currentData.orders.findIndex(o => o._id === orderId);
      if (index !== -1) {
        currentData.orders[index] = data.order;
        renderOrders(currentData.orders);
      }
      
      closeModal('editOrderModal');
      showNotification('Order updated successfully.', 'success');
    })
    .catch(error => {
      console.error('Error updating order:', error);
      showNotification('Error updating order. Please try again.', 'error');
    });
}

function viewOrderDetails(orderId) {
  const order = currentData.orders.find(o => o._id === orderId);
  if (!order) return;
  
  // Fetch full order details
  fetch(`/api/admin/orders/${orderId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(orderDetails => {
      // Create modal for viewing order details
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
      modal.id = 'viewOrderModal';
      
      const orderDate = new Date(orderDetails.orderDate || orderDetails.createdAt);
      
      let statusClass = '';
      switch(orderDetails.status) {
        case 'pending':
          statusClass = 'bg-yellow-100 text-yellow-800';
          break;
        case 'processing':
          statusClass = 'bg-blue-100 text-blue-800';
          break;
        case 'shipped':
          statusClass = 'bg-indigo-100 text-indigo-800';
          break;
        case 'delivered':
          statusClass = 'bg-green-100 text-green-800';
          break;
        case 'cancelled':
          statusClass = 'bg-red-100 text-red-800';
          break;
        default:
          statusClass = 'bg-gray-100 text-gray-800';
      }
      
      modal.innerHTML = `
        <div class="relative mx-auto p-8 bg-white w-full max-w-lg rounded-md shadow-lg">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-medium text-gray-900">Order Details</h3>
            <button onclick="closeModal('viewOrderModal')" class="text-gray-400 hover:text-gray-500">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h4 class="text-lg font-medium">Order #${orderDetails._id.toString().slice(-8).toUpperCase()}</h4>
                <p class="text-gray-500">${orderDate.toLocaleDateString()} at ${orderDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
              <span class="px-2 py-1 ${statusClass} rounded-full text-xs font-medium">${orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}</span>
            </div>
            
            <div class="border-t border-b py-4 my-4">
              <h5 class="font-medium mb-2">Customer</h5>
              <div class="flex items-center">
                <img src="${orderDetails.user.profilePicture || '/default.jpg'}" alt="${orderDetails.user.username}" class="w-12 h-12 rounded-full mr-4">
                <div>
                  <p class="font-medium">${orderDetails.user.username}</p>
                  <p class="text-gray-500">${orderDetails.user.email}</p>
                  <p class="text-gray-500">${orderDetails.user.fullName || ''}</p>
                </div>
              </div>
            </div>
            
            <div class="my-4">
              <h5 class="font-medium mb-2">Order Items</h5>
              <div class="border rounded-md overflow-hidden">
                ${orderDetails.items.map(item => `
                  <div class="flex items-center p-3 border-b last:border-b-0">
                    <img src="${item.artwork.imageUrl}" alt="${item.artwork.title}" class="w-16 h-16 rounded object-cover mr-4">
                    <div class="flex-grow">
                      <p class="font-medium">${item.artwork.title}</p>
                      <p class="text-gray-500">Artist: ${item.artwork.artist}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-medium">$${parseFloat(item.price).toFixed(2)}</p>
                      <p class="text-gray-500">Qty: ${item.quantity}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="mt-4">
              <div class="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>$${orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span>Shipping</span>
                <span>$${orderDetails.shippingCost ? parseFloat(orderDetails.shippingCost).toFixed(2) : '0.00'}</span>
              </div>
              <div class="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>$${parseFloat(orderDetails.totalPrice).toFixed(2)}</span>
              </div>
            </div>
            
            <div class="mt-6 border-t pt-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-700">Payment Status</p>
                  <p class="font-medium">${orderDetails.isPaid ? `Paid on ${new Date(orderDetails.paidAt).toLocaleDateString()}` : 'Not Paid'}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Shipping Status</p>
                  <p class="font-medium">${orderDetails.isShipped ? `Shipped on ${new Date(orderDetails.shippedAt).toLocaleDateString()}` : 'Not Shipped'}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Delivery Status</p>
                  <p class="font-medium">${orderDetails.isDelivered ? `Delivered on ${new Date(orderDetails.deliveredAt).toLocaleDateString()}` : 'Not Delivered'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button onclick="closeModal('viewOrderModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Close</button>
            <button onclick="editOrder('${orderDetails._id}')" class="px-4 py-2 bg-black text-white rounded-md">Update Status</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    })
    .catch(error => {
      console.error('Error fetching order details:', error);
      showNotification('Error loading order details. Please try again.', 'error');
    });
}

function printOrderInvoice(orderId) {
  window.open(`/checkout/confirmation/${orderId}`, '_blank');
}

// Show Add User Modal
function showAddUserModal() {
  // Create modal for adding new user
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
  modal.id = 'addUserModal';
  
  modal.innerHTML = `
    <div class="relative mx-auto p-8 bg-white w-full max-w-md rounded-md shadow-lg">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-medium text-gray-900">Add New User</h3>
        <button onclick="closeModal('addUserModal')" class="text-gray-400 hover:text-gray-500">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form id="addUserForm">
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" id="username" name="username" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" name="email" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" id="fullName" name="fullName" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" id="password" name="password" class="w-full p-2 border border-gray-300 rounded-md">
        </div>
        
        <div class="mb-6">
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select id="role" name="role" class="w-full p-2 border border-gray-300 rounded-md">
            <option value="user">User</option>
            <option value="artist">Artist</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div class="flex justify-end">
          <button type="button" onclick="closeModal('addUserModal')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2">Cancel</button>
          <button type="button" onclick="createUser()" class="px-4 py-2 bg-black text-white rounded-md">Create User</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Function to create a new user
function createUser() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const fullName = document.getElementById('fullName').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  
  // Validate inputs
  if (!username || !email || !password) {
    showNotification('Username, email, and password are required.', 'error');
    return;
  }
  
  // Create user object
  const userData = {
    username,
    email,
    fullName,
    password,
    role
  };
  
  // Send request to create user
  fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Close modal
      closeModal('addUserModal');
      
      // Show success notification
      showNotification('User created successfully!', 'success');
      
      // Refresh users list
      fetchUsers();
    })
    .catch(error => {
      console.error('Error creating user:', error);
      showNotification('Error creating user. Please try again.', 'error');
    });
}