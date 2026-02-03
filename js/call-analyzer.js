// Web版话单分析器 - 浏览器环境
class CallAnalyzer {
  constructor() {
    this.calls = [];
    this.userPhone = '';
  }

  parseCSV(content) {
    const lines = content.split('\n');
    const calls = [];
    
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('开始时间')) {
        startIndex = i + 1;
        break;
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.includes('合计') || !line.includes(',')) continue;
      
      const parts = this.parseCSVLine(line);
      if (parts.length >= 6) {
        const call = {
          type: parts[0]?.trim() || '',
          phone: parts[1]?.trim() || '',
          startTime: parts[2]?.trim() || '',
          duration: parts[3]?.trim() || parts[4]?.trim() || '',
          durationSec: this.parseDuration(parts[3]?.trim() || parts[4]?.trim() || '0秒'),
          location: parts[5]?.trim() || '',
          fee: parts[6]?.trim() || '0'
        };
        
        if (call.phone && call.phone.replace(/\D/g, '').length >= 7 && call.phone !== this.userPhone) {
          calls.push(call);
        }
      }
    }
    
    return calls;
  }

  parseDuration(duration) {
    if (!duration) return 0;
    let match = duration.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (match) return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
    match = duration.match(/(\d+)分(\d+)秒/);
    if (match) return parseInt(match[1]) * 60 + parseInt(match[2]);
    match = duration.match(/(\d+)秒/);
    if (match) return parseInt(match[1]);
    return 0;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else current += char;
    }
    result.push(current.trim());
    return result;
  }

  setUserPhone(phone) {
    this.userPhone = phone || '';
    this.calls = this.calls.filter(c => c.phone !== phone);
  }

  getStatistics() {
    const totalCalls = this.calls.length;
    let totalDuration = this.calls.reduce((sum, c) => sum + c.durationSec, 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const seconds = totalDuration % 60;
    return {
      totalCalls,
      totalDuration: `${hours}小时${minutes}分${seconds}秒`,
      avgDuration: totalCalls > 0 ? `${Math.round(totalDuration / totalCalls)}秒` : '0秒',
      callTypes: {
        incoming: this.calls.filter(c => c.type === '被叫').length,
        outgoing: this.calls.filter(c => c.type === '主叫').length
      }
    };
  }

  getContactAnalysis() {
    const contactMap = {};
    this.calls.forEach(call => {
      const phone = call.phone;
      if (!contactMap[phone]) {
        contactMap[phone] = { phone, count: 0, totalDuration: 0, incoming: 0, outgoing: 0, lastCall: null };
      }
      contactMap[phone].count++;
      contactMap[phone].totalDuration += call.durationSec;
      if (call.type === '被叫') contactMap[phone].incoming++;
      else contactMap[phone].outgoing++;
      if (!contactMap[phone].lastCall || call.startTime > contactMap[phone].lastCall) {
        contactMap[phone].lastCall = call.startTime;
      }
    });

    const contacts = Object.values(contactMap).map(c => {
      const d = c.totalDuration;
      return { ...c, durationStr: `${Math.floor(d / 60)}分${d % 60}秒` };
    }).sort((a, b) => b.count - a.count);

    const strangers = contacts.filter(c => c.count === 1 && c.totalDuration < 10);
    const frequent = contacts.filter(c => c.count > 20);

    return {
      totalContacts: contacts.length,
      topContacts: contacts.slice(0, 50),
      strangers: strangers.length,
      strangerList: strangers.slice(0, 50),
      frequentContacts: frequent.length,
      frequentList: frequent.slice(0, 50)
    };
  }

  getTimeAnalysis() {
    const hourDistribution = new Array(24).fill(0);
    const dayDistribution = new Array(7).fill(0);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    this.calls.forEach(call => {
      const match = call.startTime.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
      if (match) {
        const hour = parseInt(match[4]);
        const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        const dayOfWeek = date.getDay();
        hourDistribution[hour]++;
        dayDistribution[dayOfWeek]++;
      }
    });

    let nightCalls = 0;
    for (let i = 22; i < 24; i++) nightCalls += hourDistribution[i];
    for (let i = 0; i < 6; i++) nightCalls += hourDistribution[i];

    const maxCount = Math.max(...hourDistribution);
    const peakHours = hourDistribution
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count === maxCount && maxCount > 0)
      .map(h => `${h.hour.toString().padStart(2, '0')}:00`);
    
    const peakDay = days[dayDistribution.indexOf(Math.max(...dayDistribution)) || 0];

    return {
      hourDistribution,
      dayDistribution: dayDistribution.map((count, i) => ({ day: days[i], count })),
      peakHours,
      peakDay,
      nightCalls,
      nightRate: this.calls.length > 0 ? Math.round(nightCalls / this.calls.length * 100) : 0
    };
  }
}
