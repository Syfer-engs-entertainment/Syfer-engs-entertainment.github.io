const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use('/sites', express.static('sites'));

app.post('/api/create-site', (req, res) => {
    const { siteId, content } = req.body;
    const siteDir = path.join(__dirname, 'sites', siteId);
    
    fs.mkdirSync(siteDir, { recursive: true });
    fs.writeFileSync(path.join(siteDir, 'index.html'), content);
    
    res.json({ 
        success: true, 
        url: `/sites/${siteId}/index.html` 
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
