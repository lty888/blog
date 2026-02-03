const fs = require('fs');
const PRICE_FILE = '/tmp/xau-alert.json';

if (fs.existsSync(PRICE_FILE)) {
  const alert = JSON.parse(fs.readFileSync(PRICE_FILE));
  if (!alert.notified && alert.price) {
    console.log(`🚨 XAUUSD 价格警报！\n当前价格: $${alert.price}\n时间: ${alert.time}`);
    alert.notified = true;
    fs.writeFileSync(PRICE_FILE, JSON.stringify(alert, null, 2));
  }
}
