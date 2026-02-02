// Load article list on homepage
async function loadArticleList() {
    const articleList = document.getElementById('articleList');
    if (!articleList) return;
    
    try {
        const response = await fetch('/api/articles');
        const articles = await response.json();
        
        // 按日期倒序排列
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'article-card';
            card.onclick = () => window.location.href = `article.html?id=${article.id}`;
            card.innerHTML = `
                <h3>${article.title}</h3>
                <p class="meta">${article.date}</p>
                <p class="excerpt">${article.excerpt}</p>
                <span class="read-more">阅读更多 →</span>
            `;
            articleList.appendChild(card);
        });
    } catch (e) {
        console.error('Failed to load articles:', e);
        articleList.innerHTML = '<p>加载文章失败</p>';
    }
}

// Load article detail
async function loadArticleDetail() {
    const content = document.getElementById('articleContent');
    if (!content) return;
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (!id) {
        content.innerHTML = '<p>文章不存在</p>';
        return;
    }
    
    try {
        const response = await fetch('/api/articles');
        const articles = await response.json();
        const article = articles.find(a => a.id == id);
        
        if (article) {
            content.innerHTML = `
                <h1>${article.title}</h1>
                <p class="meta">发布于 ${article.date}</p>
                <div class="content">${article.content}</div>
            `;
        } else {
            content.innerHTML = '<p>文章不存在</p>';
        }
    } catch (e) {
        console.error('Failed to load article:', e);
        content.innerHTML = '<p>加载文章失败</p>';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadArticleList();
    loadArticleDetail();
});
