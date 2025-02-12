document.addEventListener('DOMContentLoaded', () => {
    // Show login form immediately
    document.querySelector('.auth-container').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'block';
    
    // Hide the content area until logged in
    document.getElementById('content').style.display = 'none';
    
    createFloatingShapes();
    setupEventListeners();
    setupFormAnimations();
    checkSavedCredentials();
    initializeSettings();
    setupProfileFeatures();
});

function createFloatingShapes() {
    const shapes = document.querySelector('.floating-shapes');
    for (let i = 0; i < 50; i++) {
        const shape = document.createElement('div');
        shape.classList.add('shape');
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        shape.style.width = shape.style.height = `${Math.random() * 50 + 10}px`;
        shape.style.animationDelay = `${Math.random() * 5}s`;
        shapes.appendChild(shape);
    }
}

function setupEventListeners() {
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', validateRegistration);
    document.getElementById('registerLink').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });
    document.getElementById('loginLink').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });
    document.getElementById('createSite').addEventListener('click', createNewSite);
    document.getElementById('logout').addEventListener('click', handleLogout);
}

function validateRegistration(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regPasswordConfirm').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    handleRegister(username, password);
}

function handleRegister(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(u => u.username === username)) {
        showNotification('Username already exists!', 'error');
        return;
    }

    const newUser = {
        username,
        password,
        sites: [],
        settings: {
            displayName: username,
            theme: 'default'
        }
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showNotification('Registration successful!', 'success');
    
    // Switch to login form
    document.getElementById('loginLink').click();
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
        }
        loginSuccess(user);
    } else {
        showNotification('Invalid credentials!', 'error');
    }
}

function loginSuccess(user) {
    document.getElementById('preLoginAnim').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('header').style.display = 'flex';
    document.getElementById('content').style.display = 'block';
    document.getElementById('userDisplayName').textContent = user.settings.displayName || user.username;
    
    loadUserSites();
    showNotification('Welcome back!', 'success');
}

async function createNewSite() {
    const siteName = document.getElementById('siteName').value;
    const html = document.getElementById('siteHTML').value;
    const css = document.getElementById('siteCSS').value;
    const js = document.getElementById('siteJS').value;

    if (!siteName || !html) {
        showNotification('Site name and HTML are required!', 'error');
        return;
    }

    const siteId = 'site_' + Date.now();
    const siteContent = generateSiteContent(html, css, js);
    
    try {
        const response = await fetch('/api/create-site', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                siteId,
                content: siteContent
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const siteData = {
                id: siteId,
                name: siteName,
                html: html,
                css: css,
                js: js,
                url: data.url,
                created: new Date().toISOString()
            };

            saveSite(siteData);
            addSiteToGrid(siteData);
            clearSiteForm();
            showNotification('Site created successfully!', 'success');
        }
    } catch (error) {
        showNotification('Failed to create site', 'error');
        console.error(error);
    }
}

function generateSiteContent(html, css, js) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}</script>
</body>
</html>`;
}

function saveSite(siteData) {
    const username = document.getElementById('userDisplayName').textContent;
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === username);
    
    if (!users[userIndex].sites) {
        users[userIndex].sites = [];
    }
    
    users[userIndex].sites.push(siteData);
    localStorage.setItem('users', JSON.stringify(users));
}

function loadUserSites() {
    const username = document.getElementById('userDisplayName').textContent;
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    
    const sitesGrid = document.getElementById('sitesList');
    sitesGrid.innerHTML = '';
    
    if (user.sites) {
        user.sites.forEach(site => addSiteToGrid(site));
    }
}

function addSiteToGrid(siteData) {
    const sitesGrid = document.getElementById('sitesList');
    const siteCard = document.createElement('div');
    siteCard.className = 'site-card';
    siteCard.innerHTML = `
        <h3>${siteData.name}</h3>
        <p>Created: ${new Date(siteData.created).toLocaleDateString()}</p>
        <a href="${siteData.url}" target="_blank" class="site-url">View Live Site</a>
        <div class="site-actions">
            <button onclick="previewSite('${siteData.id}')">Preview</button>
            <button onclick="editSite('${siteData.id}')" class="edit-site">Edit</button>
            <button onclick="deleteSite('${siteData.id}')" class="delete-site">Delete</button>
        </div>
    `;
    sitesGrid.appendChild(siteCard);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.getElementById('notifications').appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 100);
}

function handleLogout() {
    localStorage.removeItem('rememberedUser');
    location.reload();
}

function checkSavedCredentials() {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
        const { username, password } = JSON.parse(remembered);
        document.getElementById('username').value = username;
        document.getElementById('password').value = password;
        document.getElementById('rememberMe').checked = true;
    }
}

function clearSiteForm() {
    document.getElementById('siteName').value = '';
    document.getElementById('siteHTML').value = '';
    document.getElementById('siteCSS').value = '';
    document.getElementById('siteJS').value = '';
}
