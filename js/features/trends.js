/* 静心 — 趋势 */
window.JingXin = window.JingXin || {};

JingXin.Trends = {
  async init() { this.render(); },

  render() {
    const el = document.getElementById('trends-body'); if (!el) return;
    const raw = JingXin.Storage._get('jingxin-brain-dump', []);
    const now = Date.now();
    const recent = raw.filter(c => (now - new Date(c.createdAt).getTime()) / 86400000 <= 30);

    if (recent.length < 2) {
      el.innerHTML = '<p style="text-align:center;padding:32px;color:#8A9AAA">多记录几天就能看到趋势了 🌱</p>';
      return;
    }

    // Mood grid
    const moodIcons = { 1:'😊',2:'😊',3:'😌',4:'🙂',5:'😐',6:'😐',7:'😟',8:'😟',9:'😣',10:'😣' };
    const sorted = recent.slice().sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    const grid = sorted.map(c => { let l=5; try{l=JSON.parse(c.content).level||5}catch(_){} return moodIcons[l]||'😐'; }).join(' ');

    // Anxiety trend
    const half = Math.floor(sorted.length / 2);
    const first = sorted.slice(0, half), second = sorted.slice(half);
    const avg = arr => { let s=0; arr.forEach(c=>{let l=5;try{l=JSON.parse(c.content).level||5}catch(_){} s+=l}); return s/arr.length; };
    const a1 = avg(first), a2 = avg(second);
    const diff = a1 - a2;
    const trendHtml = diff > 0.3 ? `<span style="color:#519987">↓ ${diff.toFixed(1)} 在变好 🌱</span>` :
                      diff < -0.3 ? `<span style="color:#6B7ED8">↑ ${Math.abs(diff).toFixed(1)} 近期偏高</span>` :
                      `<span style="color:#8A9AAA">→ 基本持平</span>`;

    // Trigger breakdown
    const counts = {};
    let total = 0;
    for (const c of recent) {
      let t=''; try{t=JSON.parse(c.content).trigger||''}catch(_){}
      if(t){counts[t]=(counts[t]||0)+1;total++;}
    }
    const maxVal = Math.max(...Object.values(counts), 1);
    const triggerHtml = Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`
      <div class="distro-row"><span style="width:50px;font-size:13px;color:#5A6B7D">${k}</span><div class="distro-bar" style="flex:1;height:14px;background:#E8F0F8;border-radius:7px;overflow:hidden"><div style="height:100%;width:${Math.round(v/maxVal*100)}%;background:#5B8DEE;border-radius:7px"></div></div><span style="width:30px;font-size:12px;color:#8A9AAA;text-align:right">${Math.round(v/total*100)}%</span></div>
    `).join('');

    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];

    el.innerHTML = `
      <p style="font-size:16px;font-weight:600;text-align:center;margin-bottom:16px">📊 最近 30 天</p>
      <div style="font-size:22px;text-align:center;line-height:1.8;letter-spacing:4px;padding:12px;background:#F8FAFD;border-radius:12px;margin-bottom:16px">${grid}</div>
      <div style="text-align:center;font-size:15px;margin-bottom:16px">焦虑指数 ${trendHtml}</div>
      ${total > 0 ? `
        <p style="font-size:14px;color:#5A6B7D;margin-bottom:8px">触发因素分布</p>
        ${triggerHtml}
        ${top ? `<p style="text-align:center;margin-top:12px;padding:12px;background:#F8FAFD;border-radius:12px;font-size:14px;color:#5A6B7D">💡 看样子最近焦虑主要来自 <b style="color:#3B6FCE">${top[0]}</b></p>` : ''}
      ` : ''}`;
  }
};
