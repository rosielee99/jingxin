/* 静心 — 私人月度情绪报告 */
window.JingXin = window.JingXin || {};

JingXin.Report = {
  async init() { this.render(); },

  render() {
    const el = document.getElementById('report-body'); if (!el) return;
    const raw = JingXin.Storage._get('jingxin-brain-dump', []);

    // Get current month entries
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEntries = raw.filter(c => c.createdAt >= monthStart);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();

    if (monthEntries.length < 3) {
      el.innerHTML = `
        <div class="cbt-start fade-in" style="text-align:center">
          <p style="font-size:3rem;margin-bottom:12px">📊</p>
          <p class="cbt-page-title">暂无月度报告</p>
          <p style="font-size:0.9rem;color:#8C7B6A">坚持记录满一个月，就能拥有专属情绪总结啦</p>
        </div>`;
      return;
    }

    // Parse tags
    const happyTags = {}, annoyTags = {};
    for (const c of monthEntries) {
      let tags = []; try { tags = JSON.parse(c.content).tags || []; } catch(_) {}
      for (const t of tags) {
        if (JingXin.Checkin && JingXin.Checkin.HAPPY_TAGS && JingXin.Checkin.HAPPY_TAGS.includes(t)) {
          happyTags[t] = (happyTags[t]||0)+1;
        } else if (JingXin.Checkin && JingXin.Checkin.ANNOY_TAGS && JingXin.Checkin.ANNOY_TAGS.includes(t)) {
          annoyTags[t] = (annoyTags[t]||0)+1;
        }
      }
    }
    const topHappy = Object.entries(happyTags).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const topAnnoy = Object.entries(annoyTags).sort((a,b)=>b[1]-a[1]).slice(0,3);

    // Simple SVG chart for the month
    const W=340, H=120, P=10;
    const daysWithData = {};
    for (const c of monthEntries) {
      const d = c.createdAt.split('T')[0];
      daysWithData[d] = (daysWithData[d]||0)+1;
    }

    // SVG mood dots for each day
    let dots = '';
    for (let i=1; i<=daysInMonth; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i).toISOString().split('T')[0];
      const count = daysWithData[d] || 0;
      const x = ((i-1)/(daysInMonth-1))*(W-2*P)+P;
      const y = H-P-(count*15);
      const r = count > 0 ? Math.min(3+count, 8) : 2;
      const color = count > 0 ? '#E8A87C' : '#E8D5C8';
      dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${count>0?0.8:0.3}"/>`;
    }

    el.innerHTML = `
      <div class="report-container fade-in">
        <p class="cbt-page-title">你的本月情绪总结</p>
        <p style="text-align:center;font-size:0.8rem;color:#B5A595;margin-bottom:12px">🍑 暖色=有记录 | 浅色=空白</p>

        <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:400px;display:block;margin:0 auto 20px">
          <line x1="${P}" y1="${H-P}" x2="${W-P}" y2="${H-P}" stroke="#E8D5C8" stroke-width="1"/>
          ${dots}
        </svg>

        ${topHappy.length > 0 ? `
        <div class="report-block">
          <p class="report-label">✨ 带给你快乐的小事 TOP</p>
          ${topHappy.map(([k,v]) => `<p class="report-item">${k} <span class="report-count">${v}次</span></p>`).join('')}
        </div>` : ''}

        ${topAnnoy.length > 0 ? `
        <div class="report-block">
          <p class="report-label">🌧 困扰你的烦恼来源 TOP</p>
          ${topAnnoy.map(([k,v]) => `<p class="report-item">${k} <span class="report-count">${v}次</span></p>`).join('')}
        </div>` : ''}

        <div class="report-block">
          <p class="report-label">🌱 下月小建议</p>
          <p class="report-item">多记录让你开心的小事，它们是你对抗焦虑的力量。</p>
          <p class="report-item">下次纠结重大选择，来这里留存你的思考。</p>
        </div>

        <button class="btn-ghost" style="width:100%;margin-top:8px;color:#B5A595;font-size:0.8rem">🔄 左右滑动翻看往期报告（即将推出）</button>
      </div>`;
  }
};
