const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'articles.json');

// Middleware
app.use(express.json());

// Initialize data directory and file if not exists
if (!fs.existsSync(DATA_FILE)) {
    const initialData = [
        {
            id: 1,
            title: '欢迎来到我的博客',
            date: '2024-01-01',
            excerpt: '这是一个新开的博客，用于记录我的生活和学习。',
            content: '<p>欢迎来到我的个人博客！</p>'
        }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Helper functions
function readArticles() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function writeArticles(articles) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2));
}

// API Routes
app.get('/api/articles', (req, res) => {
    const articles = readArticles();
    res.json(articles);
});

app.post('/api/articles', (req, res) => {
    const { id, title, date, excerpt, content } = req.body;
    let articles = readArticles();
    
    if (id) {
        // Update existing article
        const index = articles.findIndex(a => a.id === parseInt(id));
        if (index !== -1) {
            articles[index] = { ...articles[index], title, date, excerpt, content };
        }
    } else {
        // Create new article
        const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
        articles.push({ id: newId, title, date, excerpt, content });
    }
    
    writeArticles(articles);
    res.json({ success: true, articles });
});

app.delete('/api/articles/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let articles = readArticles();
    articles = articles.filter(a => a.id !== id);
    writeArticles(articles);
    res.json({ success: true, articles });
});

// Static files (after API routes)
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});
