document.addEventListener('DOMContentLoaded', () => {
    createFloatingShapes();
    setupEventListeners();
    checkSavedCredentials();
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
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    document.getElementById('registerLink').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    document.getElementById('loginLink').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    document.getElementById('createSite').addEventListener('click', createNewSite);
    document.getElementById('closePreview').addEventListener('click', () => {
        document.getElementById('sitePreview').style.display = 'none';
    });
    document.getElementById('logout').addEventListener('click', handleLogout);
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }

    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users.some(u => u.username === username)) {
        alert('Username already exists! Please choose another.');
        return;
    }

    users.push({ 
        username, 
        password,
        created: new Date().toISOString(),
        sites: []
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    showLoginForm();
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
        loginSuccess(username);
    } else {
        alert('Invalid credentials! Please try again.');
    }
}

function loginSuccess(username) {
    document.getElementById('preLoginAnim').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('header').style.display = 'flex';
    document.getElementById('content').style.display = 'block';
    document.getElementById('userDisplayName').textContent = username;
    loadUserSites();
}

function createNewSite() {
    const siteName = document.getElementById('siteName').value;
    const html = document.getElementById('siteHTML').value;
    const css = document.getElementById('siteCSS').value;
    const js = document.getElementById('siteJS').value;

    if (!siteName || !html) {
        alert('Site name and HTML are required!');
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
            <button onclick="copySiteUrl('${siteData.id}')" class="copy-url">Copy URL</button>
            <button onclick="deleteSite('${siteData.id}')" class="delete-site">Delete</button>
        </div>
    `;
    sitesGrid.appendChild(siteCard);
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
            .then(() => alert('Site URL copied to clipboard!'))
            .catch(() => alert('Failed to copy URL'));
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
    }
}

function clearSiteForm() {
    document.getElementById('siteName').value = '';
    document.getElementById('siteHTML').value = '';
    document.getElementById('siteCSS').value = '';
    document.getElementById('siteJS').value = '';
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
