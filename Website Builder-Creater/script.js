document.addEventListener('DOMContentLoaded', () => {
    createFloatingShapes();
    initializeSettings();
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

function initializeSettings() {
    const settings = {
        theme: localStorage.getItem('theme') || 'default',
        accentColor: localStorage.getItem('accentColor') || '#ff0066',
        profileVisibility: localStorage.getItem('profileVisibility') === 'true',
        activityStatus: localStorage.getItem('activityStatus') === 'true',
        displayName: localStorage.getItem('displayName') || '',
        bio: localStorage.getItem('bio') || ''
    };

    applySettings(settings);
}

function applySettings(settings) {
    document.getElementById('themeSelect').value = settings.theme;
    document.getElementById('customColor').value = settings.accentColor;
    document.getElementById('profileVisibility').checked = settings.profileVisibility;
    document.getElementById('activityStatus').checked = settings.activityStatus;
    document.getElementById('displayName').value = settings.displayName;
    document.getElementById('bio').value = settings.bio;
    
    applyTheme(settings.theme, settings.accentColor);
}

function setupEventListeners() {
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    document.getElementById('registerLink').addEventListener('click', showRegisterForm);
    document.getElementById('loginLink').addEventListener('click', showLoginForm);
    document.getElementById('createSite').addEventListener('click', createNewSite);
    document.getElementById('closePreview').addEventListener('click', () => {
        document.getElementById('sitePreview').style.display = 'none';
    });
    document.getElementById('logout').addEventListener('click', handleLogout);
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
        alert('Invalid credentials! Please register if you don\'t have an account.');
    }
}

function loginSuccess(username) {
    document.getElementById('preLoginAnim').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('header').style.display = 'block';
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
    const currentUser = document.getElementById('userDisplayName').textContent;
    const userSites = JSON.parse(localStorage.getItem(`sites_${currentUser}`) || '[]');
    userSites.push(siteData);
    localStorage.setItem(`sites_${currentUser}`, JSON.stringify(userSites));
}

function loadUserSites() {
    const currentUser = document.getElementById('userDisplayName').textContent;
    const userSites = JSON.parse(localStorage.getItem(`sites_${currentUser}`) || '[]');
    const sitesGrid = document.getElementById('sitesList');
    sitesGrid.innerHTML = '';
    userSites.forEach(site => addSiteToGrid(site));
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
    const currentUser = document.getElementById('userDisplayName').textContent;
    const userSites = JSON.parse(localStorage.getItem(`sites_${currentUser}`) || '[]');
    const site = userSites.find(s => s.id === siteId);
    
    if (site) {
        const preview = document.getElementById('sitePreview');
        const frame = document.getElementById('previewFrame');
        preview.style.display = 'block';
        const blob = new Blob([site.content], { type: 'text/html' });
        frame.src = URL.createObjectURL(blob);
    }
}

function copySiteUrl(siteId) {
    const currentUser = document.getElementById('userDisplayName').textContent;
    const userSites = JSON.parse(localStorage.getItem(`sites_${currentUser}`) || '[]');
    const site = userSites.find(s => s.id === siteId);
    
    if (site) {
        const blob = new Blob([site.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        navigator.clipboard.writeText(url)
            .then(() => alert('URL copied to clipboard!'))
            .catch(err => alert('Failed to copy URL'));
    }
}

function deleteSite(siteId) {
    if (confirm('Are you sure you want to delete this site?')) {
        const currentUser = document.getElementById('userDisplayName').textContent;
        let userSites = JSON.parse(localStorage.getItem(`sites_${currentUser}`) || '[]');
        userSites = userSites.filter(s => s.id !== siteId);
        localStorage.setItem(`sites_${currentUser}`, JSON.stringify(userSites));
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
