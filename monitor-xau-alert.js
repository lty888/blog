const https = require('https');
const fs = require('fs');

const PRICE_FILE = '/tmp/xau-alert.json';
const THRESHOLD = 4500;

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
    
    // 记录日志
    console.log(`[${now}] XAU/USD: $${price.toFixed(2)}`);
    
    // 检查是否跌破阈值
    if (price < THRESHOLD) {
      const lastAlert = fs.existsSync(PRICE_FILE) ? JSON.parse(fs.readFileSync(PRICE_FILE)) : null;
      
      // 如果之前没有alert过，或者价格比之前低，都需要提醒
      if (!lastAlert || price < lastAlert.price) {
        const alertData = {
          price: price,
          time: now,
          notified: false
        };
        fs.writeFileSync(PRICE_FILE, JSON.stringify(alertData, null, 2));
        console.log('⚠️ PRICE DROP DETECTED!');
        return { alert: true, price: price };
      }
    }
    
    return { alert: false, price: price };
  } catch (e) {
    console.error('Error:', e.message);
    return { alert: false, error: e.message };
  }
}

checkPrice();
