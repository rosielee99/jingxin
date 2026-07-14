/* 静心 — 趋势（波动曲线） */
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

    // Build daily data for last 21 days
    const days = [];
    for (let i = 20; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayEntries = recent.filter(c => c.createdAt.startsWith(ds));
      let level = null;
      if (dayEntries.length > 0) {
        const avg = dayEntries.reduce((s,c) => { let l=5; try{l=JSON.parse(c.content).level||5}catch(_){} return s+l; },0) / dayEntries.length;
        level = Math.round(avg);
      }
      const labels = ['日','一','二','三','四','五','六'];
      days.push({ date: ds, level, label: labels[d.getDay()], isToday: i === 0 });
    }

    // SVG curve chart
    const W = 340, H = 160, PAD = { top: 20, right: 20, bottom: 25, left: 20 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    // Map level 1-10 to Y (inverted: high anxiety = top, low = bottom)
    const y = l => PAD.top + chartH - ((l - 1) / 9 * chartH);

    // Grid lines
    let gridLines = '';
    for (let l = 2; l <= 10; l += 2) {
      const gy = y(l);
      gridLines += `<line x1="${PAD.left}" y1="${gy}" x2="${W-PAD.right}" y2="${gy}" stroke="#E8F0F8" stroke-width="1"/>`;
    }

    // Data points and lines
    const validDays = days.filter(d => d.level !== null);
    let points = '';
    let polyline = '';
    let labels_html = '';

    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      const x = PAD.left + (i / (days.length - 1)) * chartW;
      // X axis labels (every 3 days)
      if (i % 3 === 0) {
        labels_html += `<text x="${x}" y="${H-4}" text-anchor="middle" font-size="9" fill="#8A9AAA">${d.label}</text>`;
      }
      if (d.level !== null) {
        const py = y(d.level);
        const color = d.level <= 3 ? '#6CB4A1' : d.level <= 6 ? '#7CB8E8' : d.level <= 8 ? '#6B7ED8' : '#7B5EA7';
        points += `<circle cx="${x}" cy="${py}" r="${d.isToday?5:3}" fill="${color}" stroke="white" stroke-width="1.5"/>`;
        polyline += `${x},${py} `;
      }
    }

    // Gradient area under curve
    const firstPt = validDays.length > 0 ? validDays[0] : null;
    const lastPt = validDays.length > 0 ? validDays[validDays.length-1] : null;
    let areaPath = '';
    if (validDays.length >= 2) {
      areaPath = `<polygon points="${polyline}${PAD.left+chartW},${y(1)} ${PAD.left},${y(1)}" fill="url(#curveGrad)" opacity="0.3"/>`;
    }

    const svg = `
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:400px;display:block;margin:0 auto">
        <defs>
          <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#5B8DEE"/>
            <stop offset="100%" stop-color="#5B8DEE" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${gridLines}
        ${areaPath}
        <polyline points="${polyline}" fill="none" stroke="#5B8DEE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${points}
        ${labels_html}
        <!-- Y axis labels -->
        <text x="${PAD.left-4}" y="${y(1)+4}" text-anchor="end" font-size="9" fill="#8A9AAA">1</text>
        <text x="${PAD.left-4}" y="${y(5)+4}" text-anchor="end" font-size="9" fill="#8A9AAA">5</text>
        <text x="${PAD.left-4}" y="${y(10)+4}" text-anchor="end" font-size="9" fill="#8A9AAA">10</text>
      </svg>`;

    // Trend calculation
    const half = Math.floor(validDays.length / 2);
    const first = validDays.slice(0, half), second = validDays.slice(half);
    const avg = arr => arr.reduce((s,d) => s+d.level, 0)/arr.length;
    const a1 = avg(first), a2 = avg(second);
    const diff = a2 - a1;
    const trendHtml = diff < -0.3 ? `<span style="color:#519987">↓ ${Math.abs(diff).toFixed(1)} 在变好 🌱</span>` :
                      diff > 0.3 ? `<span style="color:#6B7ED8">↑ ${diff.toFixed(1)} 近期偏高</span>` :
                      `<span style="color:#8A9AAA">→ 基本持平</span>`;

    // Trigger breakdown
    const counts = {}; let total = 0;
    for (const c of recent) {
      let t=''; try{t=JSON.parse(c.content).trigger||''}catch(_){}
      if(t){counts[t]=(counts[t]||0)+1;total++;}
    }
    const maxVal = Math.max(...Object.values(counts), 1);
    const triggerHtml = Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`
      <div class="distro-row"><span style="width:50px;font-size:13px;color:#5A6B7D">${k}</span><div style="flex:1;height:14px;background:#E8F0F8;border-radius:7px;overflow:hidden"><div style="height:100%;width:${Math.round(v/maxVal*100)}%;background:#5B8DEE;border-radius:7px"></div></div><span style="width:30px;font-size:12px;color:#8A9AAA;text-align:right">${total>0?Math.round(v/total*100):0}%</span></div>
    `).join('');

    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];

    el.innerHTML = `
      <p style="font-size:16px;font-weight:600;text-align:center;margin-bottom:8px">📈 情绪波动</p>
      ${svg}
      <div style="text-align:center;font-size:14px;margin:8px 0 16px">焦虑指数 ${trendHtml}</div>
      ${total > 0 ? `
        <p style="font-size:14px;color:#5A6B7D;margin-bottom:8px">触发因素分布</p>
        ${triggerHtml}
        ${top ? `<p style="text-align:center;margin-top:12px;padding:12px;background:#F8FAFD;border-radius:12px;font-size:14px;color:#5A6B7D">💡 最近焦虑主要来自 <b style="color:#3B6FCE">${top[0]}</b></p>` : ''}
      ` : ''}`;
  }
};
