const https = require('https');

async function checkPrice() {
  try {
    const data = await new Promise((resolve, reject) => {
      https.get('https://api.gold-api.com/price/XAU', (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });
    
    const price = data.price;
    const now = new Date().toISOString();
    
    console.log(`[${now}] XAU/USD: $${price.toFixed(2)}`);
    
    // 检查是否跌破 4500
    if (price < 4500) {
      const message = `🚨 XAUUSD 价格警报\n\n当前价格: $${price.toFixed(2)}\n阈值: $4500\n时间: ${now}`;
      console.log('ALERT: 价格跌破 4500!');
      console.log(message);
    }
    
    return price;
  } catch (e) {
    console.error('Error:', e.message);
    return null;
  }
}

checkPrice();
