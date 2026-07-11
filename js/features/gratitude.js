/* ============================================
   静心 — 收获 (Gratitude & Joy Moments)
   记录开心小事，恢复主体性
   ============================================ */

window.JingXin = window.JingXin || {};

JingXin.Gratitude = {
  moments: [],
  happiness: 7,
  note: '',
  category: '生活小事',

  CATEGORIES: ['🌟 人际关系', '💼 工作成就', '🌱 自我成长', '☕ 生活小事', '🏃 身体健康', '🌿 美好自然'],

  async init() {
    await this.loadMoments();
    this.renderInput();
  },

  async loadMoments() {
    this.moments = await JingXin.IPC.invoke('gratitude:get-all') || [];
    this.moments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // ==========================================
  // Input View
  // ==========================================

  renderInput() {
    const container = document.getElementById('gratitude-body');
    if (!container) return;

    const colors = l => l <= 3 ? 'var(--color-anxiety-low)' : l <= 6 ? 'var(--color-anxiety-med)' : l <= 8 ? 'var(--color-anxiety-high)' : 'var(--color-anxiety-severe)';

    // Today's checkin context
    const todayCheckin = JingXin.CrossFeature.getTodayCheckin();
    const todayContextHtml = todayCheckin ? `
      <div class="today-context">
        💭 今天签到: 焦虑 ${todayCheckin.level}/10${todayCheckin.emotions && todayCheckin.emotions.length > 0 ? ' · ' + todayCheckin.emotions.slice(0,3).join('、') : ''}
      </div>
    ` : '';

    const streak = this._calcStreak();
    const stats = this._computeStats();
    const trendHtml = this._renderTrend();
    const recall = JingXin.CrossFeature.getRandomGratitude();

    const catTags = this.CATEGORIES.map(cat => {
      const isSel = this.category === cat;
      return `<span class="category-tag${isSel ? ' selected' : ''}" data-cat="${cat}">${cat}</span>`;
    }).join('');

    container.innerHTML = `
      <div class="gratitude-input fade-in">
        <div class="gratitude-header">
          <span class="gratitude-icon">🌟</span>
          <h3>今天有什么让你开心的小事？</h3>
          <p class="text-muted">再小的好事也值得被记住。这是你对抗焦虑的力量。</p>
        </div>

        ${streak > 0 ? `<div class="gratitude-streak">🔥 连续记录 ${streak} 天</div>` : ''}

        <!-- Happiness slider -->
        <div class="gratitude-card">
          <label class="checkin-label">这件事有多开心？</label>
          <div class="anxiety-slider-container">
            <div class="anxiety-level-display" style="font-size:3rem;color:${colors(this.happiness)}">${this.happiness}</div>
            <input type="range" min="1" max="10" value="${this.happiness}" class="anxiety-slider" id="grat-slider">
            <div class="anxiety-labels"><span>有点开心</span><span>超级幸福</span></div>
          </div>
        </div>

        <!-- Category selector -->
        <div class="gratitude-card">
          <label class="checkin-label">这属于哪一类？</label>
          <div class="category-tags" id="grat-categories">${catTags}</div>
        </div>

        <!-- What happened -->
        <div class="gratitude-card">
          <label class="checkin-label">发生了什么？</label>
          <textarea id="grat-note" placeholder="比如：今天路上看到一只很可爱的猫&#10;比如：同事夸我做的东西很棒&#10;比如：今天的咖啡特别好喝&#10;&#10;小事就行，不用惊天动地。">${this.esc(this.note)}</textarea>
        </div>

        <!-- Save -->
        ${todayContextHtml}
        <button class="btn-primary gratitude-btn" id="grat-save-btn">💎 记下这件好事</button>

        <!-- Stats -->
        ${stats ? `
        <div class="gratitude-stats fade-in">
          <div class="stats-row">📊 共 <b>${stats.total}</b> 件好事 · 平均开心 <b>${stats.avg}</b> 分 · 🔥 最长 <b>${stats.longestStreak}</b> 天</div>
          <div class="stats-row" style="margin-top:4px">本周 <b>${stats.thisWeek}</b> 件${stats.topCat ? ' · 最多: <b>' + stats.topCat + '</b>' : ''}</div>
          ${stats.contrast ? `<div class="stats-contrast">💡 ${stats.contrast}</div>` : ''}
        </div>
        ` : ''}

        <!-- Trend -->
        ${trendHtml}

        <!-- Random Recall -->
        ${recall ? `
        <div class="recall-section">
          <button class="btn-ghost recall-btn" id="grat-recall-btn">🎲 回忆一件过去的好事</button>
          <div class="recall-card" id="grat-recall-card" style="display:none">
            <div class="recall-date">${new Date(recall.createdAt).toLocaleDateString('zh-CN', {year:'numeric', month:'long', day:'numeric', weekday:'short'})}</div>
            <div class="recall-stars">${'⭐'.repeat(Math.min(recall.happiness || 7, 5))}</div>
            <p class="recall-note">${this.esc(recall.note || '')}</p>
            <span class="recall-cat">${recall.category || '生活小事'}</span>
            <button class="btn-ghost recall-next-btn" id="grat-recall-next">再抽一件 →</button>
          </div>
        </div>
        ` : ''}

        <!-- History -->
        <div class="checkin-history">
          <button class="history-toggle btn-ghost" id="grat-history-toggle">
            开心的记录 <span class="toggle-arrow">▾</span>
          </button>
          <div class="history-list" id="grat-history-list"></div>
        </div>
      </div>
    `;

    // Slider
    document.getElementById('grat-slider').addEventListener('input', (e) => {
      this.happiness = parseInt(e.target.value);
      document.querySelector('.anxiety-level-display').textContent = this.happiness;
      document.querySelector('.anxiety-level-display').style.color = colors(this.happiness);
    });

    // Categories
    document.querySelectorAll('#grat-categories .category-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        document.querySelectorAll('#grat-categories .category-tag').forEach(t => t.classList.remove('selected'));
        tag.classList.add('selected');
        this.category = tag.dataset.cat;
      });
    });

    // Note
    document.getElementById('grat-note').addEventListener('input', e => { this.note = e.target.value; });

    // Save
    document.getElementById('grat-save-btn').addEventListener('click', () => this.save());

    // Recall
    const recallBtn = document.getElementById('grat-recall-btn');
    const recallCard = document.getElementById('grat-recall-card');
    if (recallBtn && recallCard) {
      recallBtn.addEventListener('click', () => {
        recallCard.style.display = recallCard.style.display === 'none' ? 'block' : 'none';
        recallBtn.style.display = 'none';
      });
      const recallNext = document.getElementById('grat-recall-next');
      if (recallNext) recallNext.addEventListener('click', () => {
        const next = JingXin.CrossFeature.getRandomGratitude();
        if (next) {
          document.querySelector('.recall-date').textContent = new Date(next.createdAt).toLocaleDateString('zh-CN', {year:'numeric', month:'long', day:'numeric', weekday:'short'});
          document.querySelector('.recall-stars').textContent = '⭐'.repeat(Math.min(next.happiness || 7, 5));
          document.querySelector('.recall-note').textContent = next.note || '';
          document.querySelector('.recall-cat').textContent = next.category || '生活小事';
        }
      });
    }

    this.renderHistory();

    document.getElementById('grat-history-toggle').addEventListener('click', () => {
      document.getElementById('grat-history-toggle').classList.toggle('open');
      document.getElementById('grat-history-list').classList.toggle('open');
    });
  },

  // ==========================================
  // Save
  // ==========================================

  async save() {
    if (!this.note.trim()) {
      const btn = document.getElementById('grat-save-btn');
      btn.textContent = '写点什么再保存吧 ✏️';
      setTimeout(() => { btn.textContent = '💎 记下这件好事'; }, 1500);
      return;
    }

    await JingXin.IPC.invoke('gratitude:save', {
      happiness: this.happiness,
      note: this.note.trim(),
      category: this.category,
      createdAt: new Date().toISOString()
    });

    // Show done
    const container = document.getElementById('gratitude-body');
    const quotes = [
      '每一件小事，都是你生活的证据。',
      '焦虑让你看到危险，开心让你看到生活。两个都是真的。',
      '今天这件好事，不会被焦虑抹掉。',
      '记住开心的瞬间，就是在建造自己的心理免疫力。',
      '你有焦虑，但你也有收获。这就是完整的人。',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    // Reference today's checkin if available
    const todayCheckin = JingXin.CrossFeature.getTodayCheckin();
    const crossRefHtml = todayCheckin ? `
      <div class="cross-ref-card">
        <p>📌 今天签到: 焦虑 <b>${todayCheckin.level}/10</b></p>
        <p style="font-size:12px;color:var(--color-text-secondary);margin-top:4px">即使在焦虑中，你依然找到了值得开心的事。这就是力量。</p>
      </div>
    ` : '';

    container.innerHTML = `
      <div class="checkin-done fade-in">
        <div class="checkin-done-icon">🌟</div>
        <h3>已收藏</h3>
        <div class="gratitude-quote"><p>"${quote}"</p></div>
        ${crossRefHtml}
        <button class="btn-primary" id="grat-again" style="width:100%;margin-top:var(--space-lg)">再记一件</button>
      </div>
    `;

    document.getElementById('grat-again').addEventListener('click', () => {
      this.happiness = 7; this.note = '';
      this.renderInput();
    });

    await this.loadMoments();
  },

  // ==========================================
  // History
  // ==========================================

  renderHistory() {
    const list = document.getElementById('grat-history-list');
    if (!list) return;

    if (this.moments.length === 0) {
      list.innerHTML = '<p class="text-muted" style="text-align:center;padding:var(--space-md)">还没有记录，记下第一件好事吧 🌟</p>';
      return;
    }

    list.innerHTML = this.moments.slice(0, 20).map(m => {
      const date = new Date(m.createdAt);
      const dateStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' });
      const h = m.happiness || 7;
      const color = h <= 3 ? 'var(--color-anxiety-low)' : h <= 6 ? 'var(--color-anxiety-med)' : h <= 8 ? 'var(--color-anxiety-high)' : 'var(--color-anxiety-severe)';
      return `
        <div class="gratitude-history-item">
          <div class="grat-history-header">
            <span style="font-size:11px;color:var(--color-text-muted)">${dateStr}</span>
            <span style="font-size:${12+h}px">${'⭐'.repeat(Math.min(h, 5))}</span>
          </div>
          <p class="grat-history-note">${this.esc(m.note || '')}</p>
        </div>
      `;
    }).join('');
  },

  _calcStreak() {
    if (this.moments.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 31; i++) {
      const check = new Date(today);
      check.setDate(check.getDate() - i);
      const dateStr = check.toISOString().split('T')[0];
      const found = this.moments.some(m => m.createdAt.startsWith(dateStr));
      if (found) streak++;
      else break;
    }
    return streak;
  },

  _longestStreak() {
    if (this.moments.length === 0) return 0;
    const dates = [...new Set(this.moments.map(m => m.createdAt.split('T')[0]))].sort();
    let longest = 0, current = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i-1]), curr = new Date(dates[i]);
      if ((curr - prev) / 86400000 <= 1.5) { current++; }
      else { if (current > longest) longest = current; current = 1; }
    }
    return Math.max(longest, current);
  },

  _categoryBreakdown() {
    const counts = {};
    for (const m of this.moments) {
      const cat = m.category || '生活小事';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  },

  _computeStats() {
    if (this.moments.length === 0) return null;
    const total = this.moments.length;
    const avg = (this.moments.reduce((s, m) => s + (m.happiness || 7), 0) / total).toFixed(1);
    const longest = this._longestStreak();
    const topCat = this._categoryBreakdown();
    // This week
    const now = new Date(); now.setHours(23, 59, 59, 999);
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 6); weekAgo.setHours(0, 0, 0, 0);
    const thisWeek = this.moments.filter(m => new Date(m.createdAt) >= weekAgo).length;
    // Contrast with checkin
    const moodMap = JingXin.CrossFeature.getDailyMoodMap(14);
    const pairedDays = moodMap.filter(d => d.checkinAvg && d.happinessAvg);
    let contrast = '';
    if (pairedDays.length >= 3) {
      const checkinAvg = (pairedDays.reduce((s, d) => s + parseFloat(d.checkinAvg), 0) / pairedDays.length).toFixed(1);
      const happyAvg = (pairedDays.reduce((s, d) => s + parseFloat(d.happinessAvg), 0) / pairedDays.length).toFixed(1);
      const diff = (happyAvg - checkinAvg).toFixed(1);
      if (diff > 1) contrast = `你收获开心(${happyAvg})比签到情绪(${checkinAvg})高 ${diff} 分——记录好事真的有用 ✨`;
      else if (diff > 0) contrast = `收获时的开心(${happyAvg})略高于签到情绪(${checkinAvg}) 🍃`;
      else contrast = null;
    }
    return { total, avg, longestStreak: longest, topCat, thisWeek, contrast };
  },

  _renderTrend() {
    const now = new Date(); now.setHours(23, 59, 59, 999);
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 6); weekAgo.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayMoments = this.moments.filter(m => m.createdAt.startsWith(dateStr));
      const avg = dayMoments.length > 0 ? (dayMoments.reduce((s, m) => s + (m.happiness || 7), 0) / dayMoments.length) : 0;
      const label = ['日','一','二','三','四','五','六'][d.getDay()];
      days.push({ label, avg, count: dayMoments.length, dateStr });
    }

    const rows = days.map(d => {
      const pct = Math.round(d.avg * 10);
      const color = d.avg <= 3 ? 'var(--color-anxiety-low)' : d.avg <= 6 ? 'var(--color-anxiety-med)' : d.avg <= 8 ? 'var(--color-anxiety-high)' : 'var(--color-anxiety-severe)';
      if (d.count === 0) return `<div class="trend-row"><span class="trend-label">${d.label}</span><span class="trend-empty">无记录</span></div>`;
      return `<div class="trend-row"><span class="trend-label">${d.label}</span><div class="trend-bar-bg"><div class="trend-bar-fill" style="width:${pct}%;background:${color}"></div></div><span class="trend-val">${d.avg.toFixed(1)}</span></div>`;
    }).join('');

    return rows ? `<div class="trend-chart"><div class="trend-title">📈 本周开心指数</div>${rows}</div>` : '';
  },

  esc(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  },

  onShow() {
    if (document.querySelector('.gratitude-input') || document.querySelector('.checkin-done')) {
      this.loadMoments().then(() => this.renderInput());
    }
  }
};
