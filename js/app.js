/* ============================================
   静心 — App Shell (Single Page Scroll)
   ============================================ */

window.JingXin = window.JingXin || {};

JingXin.App = {
  async init() {
    // Initialize all features at once — no tabs, all visible
    if (JingXin.BrainDump && JingXin.BrainDump.init) await JingXin.BrainDump.init();
    if (JingXin.AnxietyJournal && JingXin.AnxietyJournal.init) await JingXin.AnxietyJournal.init();
    if (JingXin.Gratitude && JingXin.Gratitude.init) await JingXin.Gratitude.init();
    if (JingXin.DailySentence && JingXin.DailySentence.init) await JingXin.DailySentence.init();

    // Render page overview after all features loaded
    this.renderOverview();
  },

  renderOverview() {
    const el = document.getElementById('page-overview');
    if (!el) return;

    const today = new Date().toISOString().split('T')[0];
    const checkins = JingXin.Storage._get('jingxin-brain-dump', []).filter(c => c.createdAt.startsWith(today));
    const anxieties = JingXin.Storage._get('jingxin-anxiety', []).filter(e => e.createdAt.startsWith(today));
    const gratitudes = JingXin.Storage._get('jingxin-gratitude', []).filter(e => e.createdAt.startsWith(today));

    let checkinLevel = null, checkinEmotions = [];
    if (checkins.length > 0) {
      try {
        const d = JSON.parse(checkins.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0].content);
        checkinLevel = d.level; checkinEmotions = d.emotions || [];
      } catch(_) {}
    }

    const colors = l => l<=3?'var(--color-anxiety-low)':l<=6?'var(--color-anxiety-med)':l<=8?'var(--color-anxiety-high)':'var(--color-anxiety-severe)';

    // Streaks
    const calcStreak = (entries, dateFn) => {
      if (!entries.length) return 0;
      const dates = [...new Set(entries.map(dateFn))].sort().reverse();
      let s = 0;
      const d = new Date(); d.setHours(0,0,0,0);
      for (let i=0; i<31; i++) {
        const check = new Date(d); check.setDate(check.getDate()-i);
        if (dates.includes(check.toISOString().split('T')[0])) s++;
        else break;
      }
      return s;
    };

    const allBrainDumps = JingXin.Storage._get('jingxin-brain-dump', []);
    const allGratitudes = JingXin.Storage._get('jingxin-gratitude', []);
    const cStreak = calcStreak(allBrainDumps, c => c.createdAt.split('T')[0]);
    const gStreak = calcStreak(allGratitudes, e => e.createdAt.split('T')[0]);

    // Random quote
    const quotes = ['觉察是改变的第一步','你不需要完美，只需要真实','每一次呼吸，都是新的开始','你已经做得很好了','允许自己休息，这不叫懒惰','此刻，就是你唯一需要关心的时刻','你不是你的想法，你是观察想法的人','慢慢来，比较快','一切都会过去，包括现在的焦虑','你值得被温柔对待，尤其是被自己'];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    el.innerHTML = `
      <div class="overview-quote">"${quote}"</div>
      <div class="overview-stats">
        <div class="overview-stat">
          <span class="overview-stat-val">${checkinLevel ? checkinLevel + '/10' : '—'}</span>
          <span class="overview-stat-label">今日签到</span>
          ${checkinLevel ? `<span class="overview-stat-dot" style="background:${colors(checkinLevel)}"></span>` : ''}
          ${checkinEmotions.length > 0 ? `<span class="overview-stat-extra">${checkinEmotions.slice(0,2).join('·')}</span>` : ''}
        </div>
        <div class="overview-stat">
          <span class="overview-stat-val">${anxieties.length || 0}</span>
          <span class="overview-stat-label">今日日记</span>
        </div>
        <div class="overview-stat">
          <span class="overview-stat-val">${gratitudes.length || 0}</span>
          <span class="overview-stat-label">今日收获</span>
        </div>
      </div>
      <div class="overview-streaks">
        ${cStreak > 0 ? `<span class="overview-streak">🔥 签到 ${cStreak} 天</span>` : ''}
        ${gStreak > 0 ? `<span class="overview-streak">⭐ 收获 ${gStreak} 天</span>` : ''}
      </div>
    `;
  },

  // Keep switchView for backward compat (cross-linking from check-in)
  switchView(name) {
    const el = document.getElementById('view-' + (name === 'reminders' ? 'reminders' : name));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  JingXin.App.init();
});
