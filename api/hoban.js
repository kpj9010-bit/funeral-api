export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const response = await fetch('http://www.hobanfuneral.co.kr/index.php?mid=sub43&sort_index=var1&order_type=asc');
    const html = await response.text();
    
    const parser = new (await import('node-html-parser')).parse;
    const root = parser(html);
    const links = root.querySelectorAll('table a');
    
    const binsoMap = new Map();
    
    links.forEach(link => {
      const text = link.text.trim();
      
      if (text.match(/^\d+호/)) {
        if (!binsoMap.has(text)) {
          binsoMap.set(text, { num: text, name: '', date: '', place: '' });
        }
      } else if (binsoMap.size > 0 && text && !text.includes('자 :')) {
        const lastKey = Array.from(binsoMap.keys()).pop();
        const entry = binsoMap.get(lastKey);
        if (!entry.name && text.length < 10 && text.match(/[가-힣]/)) {
          entry.name = text;
        } else if (!entry.place && text.includes('공원')) {
          entry.place = text;
        } else if (!entry.date && text.includes('월')) {
          entry.date = text;
        }
      }
    });
    
    const data = Array.from(binsoMap.values()).filter(b => b.name);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
