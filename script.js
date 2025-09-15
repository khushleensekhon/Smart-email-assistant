// API Configuration
const API_BASE_URL = 'http://localhost:8081/api';

// Global state
let currentTab = 'users';
let currentEditId = null;
let currentUserId = null;
let users = [];
let emails = [];
let categories = [];
let templates = [];
let followUps = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadUsers();
    showWelcomeScreen();
}

// User Selection Management
function showWelcomeScreen() {
    // Show welcome screen if no users exist, otherwise show user selection
    if (users.length === 0) {
        document.getElementById('userSelection').style.display = 'none';
    document.getElementById('userDashboard').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'flex';
    document.getElementById('userContent').style.display = 'none';
    } else {
        document.getElementById('userSelection').style.display = 'block';
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('userContent').style.display = 'none';
    }
}

function selectUser() {
    const userSelect = document.getElementById('userSelect');
    const userId = userSelect.value;
    
    if (!userId) {
        showToast('Please select a user first', 'error');
        return;
    }
    
    currentUserId = parseInt(userId);
    const selectedUser = users.find(u => u.id === currentUserId);
    
    if (selectedUser) {
        showUserDashboard(selectedUser);
    } else {
        showToast('User not found', 'error');
    }
}

function selectWelcomeUser() {
    const welcomeUserSelect = document.getElementById('welcomeUserSelect');
    const userId = welcomeUserSelect.value;
    
    if (!userId) {
        showToast('Please select a user first', 'error');
        return;
    }
    
    currentUserId = parseInt(userId);
    const selectedUser = users.find(u => u.id === currentUserId);
    
    if (selectedUser) {
        showUserDashboard(selectedUser);
    } else {
        showToast('User not found', 'error');
    }
}

function showUserDashboard(user) {
    document.getElementById('userSelection').style.display = 'none';
    document.getElementById('userDashboard').style.display = 'block';
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('userContent').style.display = 'block';
    
    document.getElementById('selectedUserName').textContent = `Welcome, ${user.name}!`;
    
    // Load user-specific data
    loadUserData();
    
    // Show the users tab by default
    switchTab('users');
}

function changeUser() {
    currentUserId = null;
    showWelcomeScreen();
    document.getElementById('userSelect').value = '';
}

async function loadUserData() {
    if (!currentUserId) return;
    
    // Load all data for the selected user in sequence to ensure dependencies
    await loadEmails();
    await loadCategories();
    await loadTemplates();
    await loadFollowUps();
}

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Tab Management
async function switchTab(tabName) {
    if (!currentUserId) {
        showToast('Please select a user first', 'error');
        return;
    }
    
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    currentTab = tabName;
    
    // Load data for the active tab
    switch(tabName) {
        case 'emails':
            await loadEmails();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'templates':
            loadTemplates();
            break;
        case 'followups':
            // Ensure emails are loaded before follow-ups so we can map subjects reliably
            await loadEmails();
            await loadFollowUps();
            break;
    }
}

// API Helper Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    showLoading(true);
    
    try {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        console.log(`Making API call: ${method} ${API_BASE_URL}${endpoint}`);
        console.log('Request config:', config);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} - ${errorText}`);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response data:', result);
        showLoading(false);
        return result;
    } catch (error) {
        showLoading(false);
        console.error('API Call Error:', error);
        
        // Check if it's a network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showToast('Network error: Unable to connect to server. Please check if the API server is running on ' + API_BASE_URL, 'error');
        } else if (error.message.includes('Failed to fetch')) {
            showToast('Connection failed: Please check if the API server is running on ' + API_BASE_URL, 'error');
        } else {
        showToast('Error: ' + error.message, 'error');
        }
        throw error;
    }
}

// Loading and Toast Functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'block' : 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Modal Functions
function showModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    currentEditId = null;
}

// Phone number validation
function isValidPhoneNumber(phone) {
    // Basic phone number validation - accepts various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// User Management
async function loadUsers(showSuccessMessage = false) {
    try {
        users = await apiCall('/users');
        populateUserSelector();
        renderUsersTable();
        if (showSuccessMessage) {
            showToast('Users loaded successfully!', 'success');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error loading users: ' + error.message, 'error');
    }
}

async function refreshUsers() {
    showToast('Refreshing user list...', 'info');
    await loadUsers(true);
}

// Test API connection
async function testApiConnection() {
    try {
        console.log('Testing API connection to:', API_BASE_URL);
        const response = await fetch(`${API_BASE_URL}/users`);
        console.log('API Response status:', response.status);
        console.log('API Response headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('API Response data:', data);
            showToast('API connection successful!', 'success');
        } else {
            console.error('API Error:', response.status, response.statusText);
            showToast(`API Error: ${response.status} - ${response.statusText}`, 'error');
        }
    } catch (error) {
        console.error('API Connection Error:', error);
        showToast('API Connection Failed: ' + error.message, 'error');
    }
}

function populateUserSelector() {
    const userSelect = document.getElementById('userSelect');
    const welcomeUserSelect = document.getElementById('welcomeUserSelect');
    
    // Populate main user selector
    userSelect.innerHTML = '<option value="">Choose a user to get started...</option>';
    
    // Populate welcome screen user selector
    if (welcomeUserSelect) {
        welcomeUserSelect.innerHTML = '<option value="">Choose a user to get started...</option>';
    }
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userSelect.appendChild(option);
        
        if (welcomeUserSelect) {
            const welcomeOption = document.createElement('option');
            welcomeOption.value = user.id;
            welcomeOption.textContent = user.name;
            welcomeUserSelect.appendChild(welcomeOption);
        }
    });
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function showUserForm(user = null) {
    const isEdit = user !== null;
    const formContent = `
        <h3>${isEdit ? 'Edit User' : 'Add New User'}</h3>
        <form id="userForm">
            <div class="form-group">
                <label for="userName">Name:</label>
                <input type="text" id="userName" name="name" value="${user ? user.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="userEmail">Email:</label>
                <input type="email" id="userEmail" name="email" value="${user ? user.email : ''}" required>
            </div>
            <div class="form-group">
                <label for="userPhone">Phone Number:</label>
                <input type="tel" id="userPhone" name="phone" value="${user ? (user.phone || '') : ''}" placeholder="e.g., +1-555-123-4567">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button>
            </div>
        </form>
    `;
    
    showModal(formContent);
    
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (isEdit) {
            updateUser(user.id);
        } else {
            createUser();
        }
    });
}

async function createUser() {
    const phone = document.getElementById('userPhone').value.trim();
    
    // Basic phone number validation
    if (phone && !isValidPhoneNumber(phone)) {
        showToast('Please enter a valid phone number (e.g., +1-555-123-4567)', 'error');
        return;
    }
    
    const formData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: phone || null
    };
    
    try {
        const newUser = await apiCall('/users', 'POST', formData);
        showToast('User created successfully!', 'success');
        closeModal();
        
        // Reload users and update UI
        await loadUsers();
        
        // Auto-select the new user
        currentUserId = newUser.id;
        showUserDashboard(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

async function updateUser(userId) {
    const phone = document.getElementById('userPhone').value.trim();
    
    // Basic phone number validation
    if (phone && !isValidPhoneNumber(phone)) {
        showToast('Please enter a valid phone number (e.g., +1-555-123-4567)', 'error');
        return;
    }
    
    const formData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: phone || null
    };
    
    try {
        await apiCall(`/users/${userId}`, 'PUT', formData);
        showToast('User updated successfully!', 'success');
        closeModal();
        
        // Reload users and update UI
        await loadUsers();
        
        // Update the user selector if we're on the user selection screen
        if (document.getElementById('userSelection').style.display !== 'none') {
            showWelcomeScreen();
        }
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        showUserForm(user);
    }
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            console.log('Attempting to delete user with ID:', userId);
            console.log('Current users array:', users);
            
            // Ensure userId is a number
            const numericUserId = parseInt(userId);
            if (isNaN(numericUserId)) {
                throw new Error('Invalid user ID');
            }
            
            // Check if user exists in local array
            const userExists = users.find(u => u.id === numericUserId);
            console.log('User exists in local array:', userExists);
            
            if (!userExists) {
                showToast('User not found in local data. Refreshing list...', 'error');
                await loadUsers();
                return;
            }
            
            console.log('Making DELETE request to:', `${API_BASE_URL}/users/${numericUserId}`);
            await apiCall(`/users/${numericUserId}`, 'DELETE');
            showToast('User deleted successfully!', 'success');
            
            // Reload users and update UI
            await loadUsers();
            
            // If we deleted the current user, go back to user selection
            if (currentUserId === numericUserId) {
                currentUserId = null;
                showWelcomeScreen();
            } else if (document.getElementById('userSelection').style.display !== 'none') {
                showWelcomeScreen();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            
            // Check if it's a 404 error (user not found)
            if (error.message.includes('404') || error.message.includes('User not found')) {
                showToast('User not found on server. Refreshing user list...', 'error');
                // Refresh the user list to sync with server
                await loadUsers();
            } else if (error.message.includes('Network error')) {
                showToast('Network error: Please check if the API server is running on ' + API_BASE_URL, 'error');
            } else {
                showToast('Error deleting user: ' + error.message, 'error');
            }
        }
    }
}

// Email Management
async function loadEmails() {
    if (!currentUserId) return;
    
    try {
        emails = await apiCall(`/emails/user/${currentUserId}`);
        renderEmailsTable();
    } catch (error) {
        console.error('Error loading emails:', error);
    }
}

function renderEmailsTable() {
    const tbody = document.getElementById('emailsTableBody');
    tbody.innerHTML = emails.map(email => `
        <tr>
            <td>${email.id}</td>
            <td>${email.sender}</td>
            <td>${email.recipient}</td>
            <td>${email.subject}</td>
            <td>${email.category ? email.category.name : 'N/A'}</td>
            <td><span class="sentiment-${email.sentiment.toLowerCase()}">${email.sentiment}</span></td>
            <td>${new Date(email.receivedAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editEmail(${email.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmail(${email.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
                <button class="btn btn-sm ${email.archived ? 'btn-success' : 'btn-warning'}" 
                        onclick="${email.archived ? 'unarchiveEmail' : 'archiveEmail'}(${email.id})">
                    <i class="fas fa-${email.archived ? 'inbox' : 'archive'}"></i> 
                    ${email.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button class="btn btn-sm btn-info" onclick="generateReply(${email.id})">
                    <i class="fas fa-reply"></i> Generate Reply
                </button>
            </td>
        </tr>
    `).join('');
}

function showEmailForm(email = null) {
    const isEdit = email !== null;
    // Only allow "Work" and "Personal" in the category dropdown for the Add/Edit Email form
    const allowedCategoryNames = new Set(['Work', 'Personal']);
    const emailFormCategories = categories.filter(cat => allowedCategoryNames.has(cat.name));
    const formContent = `
        <h3>${isEdit ? 'Edit Email' : 'Add New Email'}</h3>
        <form id="emailForm">
            <div class="form-group">
                <label for="emailUserId">User:</label>
                <select id="emailUserId" name="userId" required>
                    <option value="">Select User</option>
                    ${users.map(user => `<option value="${user.id}" ${email && email.userId === user.id ? 'selected' : ''}>${user.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="emailSender">Sender:</label>
                <input type="email" id="emailSender" name="sender" value="${email ? email.sender : ''}" required>
            </div>
            <div class="form-group">
                <label for="emailRecipient">Recipient:</label>
                <input type="email" id="emailRecipient" name="recipient" value="${email ? email.recipient : ''}" required>
            </div>
            <div class="form-group">
                <label for="emailSubject">Subject:</label>
                <input type="text" id="emailSubject" name="subject" value="${email ? email.subject : ''}" required>
            </div>
            <div class="form-group">
                <label for="emailBody">Body:</label>
                <textarea id="emailBody" name="body" required>${email ? email.body : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="emailCategory">Category:</label>
                <select id="emailCategory" name="categoryId">
                    <option value="">Select Category</option>
                    ${emailFormCategories.map(cat => `<option value="${cat.id}" ${email && email.categoryId === cat.id ? 'selected' : ''}>${cat.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="emailSentiment">Sentiment:</label>
                <select id="emailSentiment" name="sentiment" required>
                    <option value="POSITIVE" ${email && email.sentiment === 'POSITIVE' ? 'selected' : ''}>Positive</option>
                    <option value="NEGATIVE" ${email && email.sentiment === 'NEGATIVE' ? 'selected' : ''}>Negative</option>
                    <option value="NEUTRAL" ${email && email.sentiment === 'NEUTRAL' ? 'selected' : ''}>Neutral</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button>
            </div>
        </form>
    `;
    
    showModal(formContent);
    
    document.getElementById('emailForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (isEdit) {
            updateEmail(email.id);
        } else {
            createEmail();
        }
    });
}

async function createEmail() {
    const formData = {
        userId: parseInt(document.getElementById('emailUserId').value),
        sender: document.getElementById('emailSender').value,
        recipient: document.getElementById('emailRecipient').value,
        subject: document.getElementById('emailSubject').value,
        body: document.getElementById('emailBody').value,
        categoryId: document.getElementById('emailCategory').value ? parseInt(document.getElementById('emailCategory').value) : null,
        sentiment: document.getElementById('emailSentiment').value
    };
    
    try {
        await apiCall('/emails', 'POST', formData);
        showToast('Email created successfully!', 'success');
        closeModal();
        loadEmails();
    } catch (error) {
        console.error('Error creating email:', error);
    }
}

async function updateEmail(emailId) {
    const formData = {
        userId: parseInt(document.getElementById('emailUserId').value),
        sender: document.getElementById('emailSender').value,
        recipient: document.getElementById('emailRecipient').value,
        subject: document.getElementById('emailSubject').value,
        body: document.getElementById('emailBody').value,
        categoryId: document.getElementById('emailCategory').value ? parseInt(document.getElementById('emailCategory').value) : null,
        sentiment: document.getElementById('emailSentiment').value,
        archived: false
    };
    
    try {
        await apiCall(`/emails/${emailId}`, 'PUT', formData);
        showToast('Email updated successfully!', 'success');
        closeModal();
        loadEmails();
    } catch (error) {
        console.error('Error updating email:', error);
    }
}

function editEmail(emailId) {
    const email = emails.find(e => e.id === emailId);
    if (email) {
        showEmailForm(email);
    }
}

async function deleteEmail(emailId) {
    if (confirm('Are you sure you want to delete this email?')) {
        try {
            await apiCall(`/emails/${emailId}`, 'DELETE');
            showToast('Email deleted successfully!', 'success');
            loadEmails();
        } catch (error) {
            console.error('Error deleting email:', error);
        }
    }
}

async function archiveEmail(emailId) {
    try {
        await apiCall(`/emails/${emailId}/archive`, 'PATCH');
        showToast('Email archived successfully!', 'success');
        loadEmails();
    } catch (error) {
        console.error('Error archiving email:', error);
    }
}

async function unarchiveEmail(emailId) {
    try {
        await apiCall(`/emails/${emailId}/unarchive`, 'PATCH');
        showToast('Email unarchived successfully!', 'success');
        loadEmails();
    } catch (error) {
        console.error('Error unarchiving email:', error);
    }
}

function searchEmails() {
    const searchInput = document.getElementById("emailSearch").value.trim();
    const categoryFilter = document.getElementById("categoryFilter").value;
    const sentimentFilter = document.getElementById("sentimentFilter").value;

    // Example API call or filtering logic
    fetch(`/api/emails?search=${searchInput}&category=${categoryFilter}&sentiment=${sentimentFilter}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch emails");
            }
            return response.json();
        })
        .then((emails) => {
            const tableBody = document.getElementById("emailsTableBody");
            tableBody.innerHTML = ""; // Clear existing rows

            // Populate table with search results
            emails.forEach((email) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${email.id}</td>
                    <td>${email.sender}</td>
                    <td>${email.recipient}</td>
                    <td>${email.subject}</td>
                    <td>${email.category}</td>
                    <td>${email.sentiment}</td>
                    <td>${email.received}</td>
                    <td>
                        <button class="btn btn-primary" onclick="viewEmail(${email.id})">View</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error fetching emails:", error);
        });
}

function searchEmailsBySubject() {
    const subject = document.getElementById("emailSearch").value.trim();
    console.log("Searching emails by subject:", subject);

    // Add your API call or filtering logic here
}

function searchEmailsByKeywords() {
    const keywords = document.getElementById("emailSearch").value.trim();
    console.log("Searching emails by keywords:", keywords);

    // Add your API call or filtering logic here
}

// New function for advanced email search by subject keywords
async function searchEmailsBySubject() {
    const searchTerm = document.getElementById('emailSearch').value.trim();
    
    if (!searchTerm) {
        showToast('Please enter search keywords', 'error');
        return;
    }
    
    try {
        showToast('Searching emails by subject keywords...', 'info');
        emails = await apiCall(`/emails/search/subject?keywords=${encodeURIComponent(searchTerm)}`);
        renderEmailsTable();
        showToast(`Found ${emails.length} emails with subject containing "${searchTerm}"`, 'success');
    } catch (error) {
        console.error('Error searching emails by subject:', error);
        showToast('Error searching emails: ' + error.message, 'error');
    }
}

// Function to search emails by multiple keywords
async function searchEmailsByKeywords() {
    const searchTerm = document.getElementById('emailSearch').value.trim();
    
    if (!searchTerm) {
        showToast('Please enter search keywords', 'error');
        return;
    }
    
    // Split search term into individual keywords
    const keywords = searchTerm.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    if (keywords.length === 0) {
        showToast('Please enter valid keywords', 'error');
        return;
    }
    
    try {
        showToast(`Searching emails with keywords: ${keywords.join(', ')}`, 'info');
        emails = await apiCall(`/emails/search/keywords?keywords=${encodeURIComponent(keywords.join(','))}`);
        renderEmailsTable();
        showToast(`Found ${emails.length} emails matching keywords`, 'success');
    } catch (error) {
        console.error('Error searching emails by keywords:', error);
        showToast('Error searching emails: ' + error.message, 'error');
    }
}

async function exportEmails() {
    const userId = prompt('Enter User ID to export emails:');
    if (!userId) return;
    
    const format = confirm('Export as CSV? (Click OK for CSV, Cancel for JSON)') ? 'csv' : 'json';
    
    try {
        const data = await apiCall(`/emails/export?userId=${userId}&format=${format}`);
        
        // Create and download file
        const blob = new Blob([format === 'csv' ? data : JSON.stringify(data, null, 2)], {
            type: format === 'csv' ? 'text/csv' : 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emails_export_${userId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('Export completed!', 'success');
    } catch (error) {
        console.error('Error exporting emails:', error);
    }
}

// Category Management
async function loadCategories() {
    try {
        categories = await apiCall('/categories');
        renderCategoriesTable();
        updateCategoryFilters();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderCategoriesTable() {
    const tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.description || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editCategory(${category.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function updateCategoryFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">All Categories</option>' +
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    }
}

function showCategoryForm(category = null) {
    const isEdit = category !== null;
    const formContent = `
        <h3>${isEdit ? 'Edit Category' : 'Add New Category'}</h3>
        <form id="categoryForm">
            <div class="form-group">
                <label for="categoryName">Name:</label>
                <input type="text" id="categoryName" name="name" value="${category ? category.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="categoryDescription">Description:</label>
                <textarea id="categoryDescription" name="description">${category ? category.description || '' : ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button>
            </div>
        </form>
    `;
    
    showModal(formContent);
    
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (isEdit) {
            updateCategory(category.id);
        } else {
            createCategory();
        }
    });
}

async function createCategory() {
    const formData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };
    
    try {
        await apiCall('/categories', 'POST', formData);
        showToast('Category created successfully!', 'success');
        closeModal();
        loadCategories();
    } catch (error) {
        console.error('Error creating category:', error);
    }
}

async function updateCategory(categoryId) {
    const formData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };
    
    try {
        await apiCall(`/categories/${categoryId}`, 'PUT', formData);
        showToast('Category updated successfully!', 'success');
        closeModal();
        loadCategories();
    } catch (error) {
        console.error('Error updating category:', error);
    }
}

function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
        showCategoryForm(category);
    }
}

async function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            await apiCall(`/categories/${categoryId}`, 'DELETE');
            showToast('Category deleted successfully!', 'success');
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }
}

// Template Management
async function loadTemplates() {
    if (!currentUserId) return;
    
    try {
        templates = await apiCall(`/templates/user/${currentUserId}`);
        renderTemplatesTable();
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

function renderTemplatesTable() {
    const tbody = document.getElementById('templatesTableBody');
    tbody.innerHTML = templates.map(template => `
        <tr>
            <td>${template.id}</td>
            <td>${template.title}</td>
            <td>${template.body.substring(0, 50)}${template.body.length > 50 ? '...' : ''}</td>
            <td>${template.user ? template.user.name : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editTemplate(${template.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-info" onclick="processTemplate(${template.id})">
                    <i class="fas fa-magic"></i> Process
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTemplate(${template.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function showTemplateForm(template = null) {
    const isEdit = template !== null;
    const formContent = `
        <h3>${isEdit ? 'Edit Template' : 'Add New Template'}</h3>
        <form id="templateForm">
            <div class="form-group">
                <label for="templateUserId">User:</label>
                <select id="templateUserId" name="userId" required>
                    <option value="">Select User</option>
                    ${users.map(user => `<option value="${user.id}" ${template && template.userId === user.id ? 'selected' : ''}>${user.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="templateTitle">Title:</label>
                <input type="text" id="templateTitle" name="title" value="${template ? template.title : ''}" required>
            </div>
            <div class="form-group">
                <label for="templateBody">Body:</label>
                <textarea id="templateBody" name="body" required placeholder="Use {name}, {date}, {time}, {sender_name} as placeholders">${template ? template.body : ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button>
            </div>
        </form>
    `;
    
    showModal(formContent);
    
    document.getElementById('templateForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (isEdit) {
            updateTemplate(template.id);
        } else {
            createTemplate();
        }
    });
}

async function createTemplate() {
    const formData = {
        userId: currentUserId,
        title: document.getElementById('templateTitle').value,
        body: document.getElementById('templateBody').value
    };
    
    try {
        await apiCall('/templates', 'POST', formData);
        showToast('Template created successfully!', 'success');
        closeModal();
        loadTemplates();
    } catch (error) {
        console.error('Error creating template:', error);
    }
}

async function updateTemplate(templateId) {
    const formData = {
        userId: parseInt(document.getElementById('templateUserId').value),
        title: document.getElementById('templateTitle').value,
        body: document.getElementById('templateBody').value
    };
    
    try {
        await apiCall(`/templates/${templateId}`, 'PUT', formData);
        showToast('Template updated successfully!', 'success');
        closeModal();
        loadTemplates();
    } catch (error) {
        console.error('Error updating template:', error);
    }
}

function editTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
        showTemplateForm(template);
    }
}

async function deleteTemplate(templateId) {
    if (confirm('Are you sure you want to delete this template?')) {
        try {
            await apiCall(`/templates/${templateId}`, 'DELETE');
            showToast('Template deleted successfully!', 'success');
            loadTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    }
}

function processTemplate(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    const formContent = `
        <h3>Process Template: ${template.title}</h3>
        <p><strong>Template Body:</strong></p>
        <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-family: monospace;">
            ${template.body}
        </div>
        <form id="processForm">
            <div class="form-group">
                <label for="processName">Name:</label>
                <input type="text" id="processName" name="name" placeholder="Enter name value">
            </div>
            <div class="form-group">
                <label for="processDate">Date:</label>
                <input type="text" id="processDate" name="date" placeholder="Enter date value">
            </div>
            <div class="form-group">
                <label for="processTime">Time:</label>
                <input type="text" id="processTime" name="time" placeholder="Enter time value">
            </div>
            <div class="form-group">
                <label for="processSenderName">Sender Name:</label>
                <input type="text" id="processSenderName" name="sender_name" placeholder="Enter sender name">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Process Template</button>
            </div>
        </form>
        <div id="processedResult" style="margin-top: 20px; display: none;">
            <h4>Processed Result:</h4>
            <div id="processedContent" style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #38a169;"></div>
        </div>
    `;
    
    showModal(formContent);
    
    document.getElementById('processForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processTemplateData(templateId);
    });
}

async function processTemplateData(templateId) {
    const formData = {
        name: document.getElementById('processName').value,
        date: document.getElementById('processDate').value,
        time: document.getElementById('processTime').value,
        sender_name: document.getElementById('processSenderName').value
    };
    
    try {
        const result = await apiCall(`/templates/${templateId}/process`, 'POST', formData);
        document.getElementById('processedContent').textContent = result;
        document.getElementById('processedResult').style.display = 'block';
        showToast('Template processed successfully!', 'success');
    } catch (error) {
        console.error('Error processing template:', error);
    }
}

// Follow-up Management
async function loadFollowUps() {
    if (!currentUserId) return;
    
    try {
        // Ensure emails are loaded to map follow-ups to user's emails
        if (!emails || emails.length === 0) {
            await loadEmails();
        }

        // Get all follow-ups and filter by user's emails using emailId linkage
        const allFollowUps = await apiCall('/followups');
        const userEmailIds = new Set(emails.map(e => e.id));
        followUps = allFollowUps.filter(followUp => userEmailIds.has(followUp.emailId));
        renderFollowUpsTable();
    } catch (error) {
        console.error('Error loading follow-ups:', error);
    }
}

function renderFollowUpsTable() {
    const tbody = document.getElementById('followupsTableBody');
    // Build a lookup map for email subjects
    const emailById = new Map(emails.map(e => [e.id, e]));
    tbody.innerHTML = followUps.map(followUp => `
        <tr>
            <td>${followUp.id}</td>
            <td>${(emailById.get(followUp.emailId) && emailById.get(followUp.emailId).subject) ? emailById.get(followUp.emailId).subject : 'N/A'}</td>
            <td>${new Date(followUp.dueDate).toLocaleDateString()}</td>
            <td><span class="status-badge status-${followUp.status.toLowerCase()}">${followUp.status}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editFollowUp(${followUp.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-info" onclick="updateFollowUpStatus(${followUp.id})">
                    <i class="fas fa-check"></i> Update Status
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteFollowUp(${followUp.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function showFollowUpForm(followUp = null) {
    const isEdit = followUp !== null;
    const formContent = `
        <h3>${isEdit ? 'Edit Follow-up' : 'Add New Follow-up'}</h3>
        <form id="followUpForm">
            <div class="form-group">
                <label for="followUpEmailId">Email:</label>
                <select id="followUpEmailId" name="emailId" required>
                    <option value="">Select Email</option>
                    ${emails.map(email => `<option value="${email.id}" ${followUp && followUp.emailId === email.id ? 'selected' : ''}>${email.subject}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="followUpDueDate">Due Date:</label>
                <input type="datetime-local" id="followUpDueDate" name="dueDate" value="${followUp ? new Date(followUp.dueDate).toISOString().slice(0, 16) : ''}" required>
            </div>
            <div class="form-group">
                <label for="followUpStatus">Status:</label>
                <select id="followUpStatus" name="status" required>
                    <option value="PENDING" ${followUp && followUp.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                    <option value="DONE" ${followUp && followUp.status === 'DONE' ? 'selected' : ''}>Done</option>
                    <option value="SNOOZED" ${followUp && followUp.status === 'SNOOZED' ? 'selected' : ''}>Snoozed</option>
                    <option value="OVERDUE" ${followUp && followUp.status === 'OVERDUE' ? 'selected' : ''}>Overdue</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'}</button>
            </div>
        </form>
    `;
    
    showModal(formContent);
    
    document.getElementById('followUpForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (isEdit) {
            updateFollowUp(followUp.id);
        } else {
            createFollowUp();
        }
    });
}

async function createFollowUp() {
    const formData = {
        emailId: parseInt(document.getElementById('followUpEmailId').value),
        dueDate: document.getElementById('followUpDueDate').value,
        status: document.getElementById('followUpStatus').value
    };
    
    try {
        await apiCall('/followups', 'POST', formData);
        showToast('Follow-up created successfully!', 'success');
        closeModal();
        loadFollowUps();
    } catch (error) {
        console.error('Error creating follow-up:', error);
    }
}

async function updateFollowUp(followUpId) {
    const formData = {
        emailId: parseInt(document.getElementById('followUpEmailId').value),
        dueDate: document.getElementById('followUpDueDate').value,
        status: document.getElementById('followUpStatus').value
    };
    
    try {
        await apiCall(`/followups/${followUpId}`, 'PUT', formData);
        showToast('Follow-up updated successfully!', 'success');
        closeModal();
        loadFollowUps();
    } catch (error) {
        console.error('Error updating follow-up:', error);
    }
}

function editFollowUp(followUpId) {
    const followUp = followUps.find(f => f.id === followUpId);
    if (followUp) {
        showFollowUpForm(followUp);
    }
}

async function deleteFollowUp(followUpId) {
    if (confirm('Are you sure you want to delete this follow-up?')) {
        try {
            await apiCall(`/followups/${followUpId}`, 'DELETE');
            showToast('Follow-up deleted successfully!', 'success');
            loadFollowUps();
        } catch (error) {
            console.error('Error deleting follow-up:', error);
        }
    }
}

function updateFollowUpStatus(followUpId) {
    const followUp = followUps.find(f => f.id === followUpId);
    if (!followUp) return;
    
    const formContent = `
        <h3>Update Follow-up Status</h3>
        <p><strong>Email:</strong> ${followUp.email ? followUp.email.subject : 'N/A'}</p>
        <p><strong>Due Date:</strong> ${new Date(followUp.dueDate).toLocaleDateString()}</p>
        <form id="statusForm">
            <div class="form-group">
                <label for="newStatus">New Status:</label>
                <select id="newStatus" name="status" required>
                    <option value="PENDING" ${followUp.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                    <option value="DONE" ${followUp.status === 'DONE' ? 'selected' : ''}>Done</option>
                    <option value="SNOOZED" ${followUp.status === 'SNOOZED' ? 'selected' : ''}>Snoozed</option>
                    <option value="OVERDUE" ${followUp.status === 'OVERDUE' ? 'selected' : ''}>Overdue</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Status</button>
            </div>
        </form>
    `;
    
    showModal(formContent);
    
    document.getElementById('statusForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateFollowUpStatusData(followUpId);
    });
}

async function updateFollowUpStatusData(followUpId) {
    const newStatus = document.getElementById('newStatus').value;
    
    try {
        await apiCall(`/followups/${followUpId}/status?status=${newStatus}`, 'PATCH');
        showToast('Follow-up status updated successfully!', 'success');
        closeModal();
        loadFollowUps();
    } catch (error) {
        console.error('Error updating follow-up status:', error);
    }
}

async function loadOverdueFollowUps() {
    try {
        followUps = await apiCall('/followups/overdue');
        renderFollowUpsTable();
        showToast('Overdue follow-ups loaded!', 'info');
    } catch (error) {
        console.error('Error loading overdue follow-ups:', error);
    }
}

// Email Reply Generation
async function generateReply(emailId) {
    try {
        const reply = await apiCall(`/emails/${emailId}/generate-reply`, 'POST');
        showReplyModal(reply);
    } catch (error) {
        console.error('Error generating reply:', error);
        showToast('Error generating reply: ' + error.message, 'error');
    }
}

function showReplyModal(reply) {
    const modalContent = `
        <h3><i class="fas fa-reply"></i> Generated Email Reply</h3>
        <div class="reply-info">
            <div class="reply-type">
                <strong>Reply Type:</strong> <span class="badge badge-info">${reply.type}</span>
            </div>
            <div class="reply-tone">
                <strong>Suggested Tone:</strong> <span class="badge badge-secondary">${reply.suggestedTone}</span>
            </div>
        </div>
        
        <div class="form-group">
            <label for="replySubject">Subject:</label>
            <input type="text" id="replySubject" value="${reply.subject}" class="form-control">
        </div>
        
        <div class="form-group">
            <label for="replyBody">Reply Body:</label>
            <textarea id="replyBody" rows="12" class="form-control">${reply.body}</textarea>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
            <button type="button" class="btn btn-primary" onclick="copyReply()">
                <i class="fas fa-copy"></i> Copy Reply
            </button>
            <button type="button" class="btn btn-success" onclick="sendReply()">
                <i class="fas fa-paper-plane"></i> Send Reply
            </button>
        </div>
    `;
    
    showModal(modalContent);
}

function copyReply() {
    const subject = document.getElementById('replySubject').value;
    const body = document.getElementById('replyBody').value;
    
    const fullReply = `Subject: ${subject}\n\n${body}`;
    
    navigator.clipboard.writeText(fullReply).then(() => {
        showToast('Reply copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy to clipboard', 'error');
    });
}

function sendReply() {
    const subject = document.getElementById('replySubject').value;
    const body = document.getElementById('replyBody').value;
    
    // For now, just copy to clipboard since we don't have email sending functionality
    const fullReply = `Subject: ${subject}\n\n${body}`;
    
    navigator.clipboard.writeText(fullReply).then(() => {
        showToast('Reply copied to clipboard! You can now paste it in your email client.', 'success');
        closeModal();
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy to clipboard', 'error');
    });
}

// Standalone Reply Generation
function showStandaloneReplyForm() {
    const formContent = `
        <h3><i class="fas fa-magic"></i> Generate Email Reply</h3>
        <p>Enter the email details to generate an intelligent reply:</p>
        
        <div class="form-group">
            <label for="standaloneSubject">Original Email Subject:</label>
            <input type="text" id="standaloneSubject" placeholder="Enter the original email subject" required>
        </div>
        
        <div class="form-group">
            <label for="standaloneBody">Original Email Body:</label>
            <textarea id="standaloneBody" rows="6" placeholder="Enter the original email content" required></textarea>
        </div>
        
        <div class="form-group">
            <label for="standaloneSender">Sender Email:</label>
            <input type="email" id="standaloneSender" placeholder="sender@example.com" required>
        </div>
        
        <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="generateStandaloneReply()">
                <i class="fas fa-magic"></i> Generate Reply
            </button>
        </div>
    `;
    
    showModal(formContent);
}

async function generateStandaloneReply() {
    const subject = document.getElementById('standaloneSubject').value;
    const body = document.getElementById('standaloneBody').value;
    const senderEmail = document.getElementById('standaloneSender').value;
    
    if (!subject || !body || !senderEmail) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const reply = await apiCall(`/emails/generate-reply?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&senderEmail=${encodeURIComponent(senderEmail)}`, 'POST');
        showReplyModal(reply);
    } catch (error) {
        console.error('Error generating reply:', error);
        showToast('Error generating reply: ' + error.message, 'error');
    }
}

// Initial data loading
async function loadInitialData() {
    await Promise.all([
        loadUsers(),
        loadCategories()
    ]);
}
