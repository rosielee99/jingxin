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

    // === Generate trend analysis ===
    const analysis = [];
    const allLevels = validDays.map(d => d.level);
    const overallAvg = allLevels.reduce((a,b)=>a+b,0)/allLevels.length;
    const maxLevel = Math.max(...allLevels);
    const minLevel = Math.min(...allLevels);
    const maxDay = validDays.find(d => d.level === maxLevel);
    const minDay = validDays.find(d => d.level === minLevel);

    // 1. Overall assessment
    if (overallAvg <= 4) analysis.push(`近期的情绪总体比较平稳，平均焦虑 ${overallAvg.toFixed(1)}/10。这说明你最近的状态不错，有比较好的情绪调节能力。继续保持现在的节奏。`);
    else if (overallAvg <= 6) analysis.push(`近期平均焦虑 ${overallAvg.toFixed(1)}/10，处于中等水平。有波动是正常的——你在意的事情值得关注，但你也有处理它们的能力。`);
    else if (overallAvg <= 8) analysis.push(`近期平均焦虑 ${overallAvg.toFixed(1)}/10，偏高。这说明你最近承担了不少压力。记得给自己喘息的空间——你不需要把所有事情都扛在肩上。`);
    else analysis.push(`近期平均焦虑 ${overallAvg.toFixed(1)}/10，比较高。这段时间可能很辛苦。但你看——你每天都在签到，在关注自己。这就是在照顾自己。`);

    // 2. Trend direction
    if (Math.abs(diff) > 0.5) {
      if (diff < 0) analysis.push(`好消息是，最近一周比之前下降了 ${Math.abs(diff).toFixed(1)} 分，趋势在好转。你做的这些记录和分析，正在起作用。`);
      else analysis.push(`最近一周比之前上升了 ${diff.toFixed(1)} 分。可能最近的事情比较多，或者有新的压力源。注意到它就是改变的开始。`);
    } else {
      analysis.push('情绪水平近期基本持平，没有明显上升或下降。这说明你处于一个相对稳定的阶段。');
    }

    // 3. Peak analysis
    if (maxLevel - minLevel >= 4) {
      analysis.push(`你的情绪波动幅度比较大——最高 ${maxLevel}/10（${maxDay ? maxDay.date.split('-').slice(1).join('/') : ''}），最低 ${minLevel}/10（${minDay ? minDay.date.split('-').slice(1).join('/') : ''}）。波动大说明你的情绪很敏感，这其实是一种感知力的表现——你对生活有真实的反应。试着观察一下波动大的日子发生了什么，可能会找到规律。`);
    }

    // 4. Trigger insight
    if (top && total >= 3) {
      analysis.push(`从触发因素来看，「${top[0]}」占了 ${Math.round(top[1]/total*100)}%，是你近期最主要的焦虑来源。如果你愿意，可以在日记里专门针对这个领域做一次分步梳理——把事实和担心分开，找到你能控制的部分。`);
    }

    // 5. Closing
    const closings = [
      '每天签到这个习惯本身，就是在对自己的情绪负责。你在做一件很重要的事。',
      '情绪有高有低是正常的——没有人的心情是一条直线。你在记录它、观察它，这就已经比大多数人做得好。',
      '数据不会说谎：你在变好。即使有时候感觉不到，但曲线会告诉你真相。',
    ];
    analysis.push(closings[Math.floor(Math.random() * closings.length)]);

    const analysisHtml = analysis.map(p => `<p style="margin-bottom:12px;line-height:1.65;font-size:14px">${p}</p>`).join('');

    el.innerHTML = `
      <p style="font-size:16px;font-weight:600;text-align:center;margin-bottom:8px">📈 情绪波动</p>
      ${svg}
      <div style="text-align:center;font-size:14px;margin:8px 0">焦虑指数 ${trendHtml}</div>
      <div class="analysis-rich" style="background:#F8FAFD;border-radius:16px;padding:16px 20px;margin:16px 0;color:#5A6B7D">
        <p style="font-weight:600;font-size:14px;color:#3B6FCE;margin-bottom:12px">📋 趋势分析</p>
        ${analysisHtml}
      </div>
      ${total > 0 ? `
        <p style="font-size:14px;color:#5A6B7D;margin-bottom:8px">触发因素分布</p>
        ${triggerHtml}
      ` : ''}`;
  }
};
