/* ============================================
   静心 — 情绪签到 (Emotion Check-in)
   快速情绪识别 + 即时反馈
   ============================================ */

window.JingXin = window.JingXin || {};

// Shared emotion data
const EMOTIONS = ['焦虑','恐惧','担忧','烦躁','不安','无助','沮丧','愤怒','自责','疲惫','孤独','迷茫','自卑','紧张','失落'];
const SOOTHE_BY_LEVEL = {
  1:'轻轻的波动。你已经有觉察，这就是开始。', 2:'小小的不安。你有能力把它变成动力。',
  3:'轻微的焦虑是成长的信号。', 4:'这些情绪是你在乎的东西在说话。',
  5:'这种不舒服是你在突破舒适区。', 6:'你的感受很重要，但它不定义你。',
  7:'你在这里面对它，这本身就证明了你有多勇敢。', 8:'痛苦是暂时的，从中获得的力量是永久的。',
  9:'你比自己想象的更坚韧。', 10:'这是最大的成长机会，你已经迈出了最重要的一步。'
};

JingXin.BrainDump = {
  checkins: [],
  level: 5,
  emotions: [],
  note: '',
  elements: {},

  async init() {
    this.cacheElements();
    this.attachListeners();
    await this.loadCheckins();
    this.renderInput();
  },

  cacheElements() {
    // Will be set dynamically since we re-render often
  },

  attachListeners() {
    // Listeners are attached in render methods
  },

  async loadCheckins() {
    this.checkins = await JingXin.IPC.invoke('brain-dump:get-all') || [];
    this.checkins.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // ==========================================
  // Input View
  // ==========================================

  renderInput() {
    const container = document.getElementById('checkin-body');
    if (!container) return;

    const colors = l => {
      if (l <= 3) return 'var(--color-anxiety-low)';
      if (l <= 6) return 'var(--color-anxiety-med)';
      if (l <= 8) return 'var(--color-anxiety-high)';
      return 'var(--color-anxiety-severe)';
    };

    const selected = this.emotions;
    const tagsHtml = EMOTIONS.map(em => {
      const isSel = selected.includes(em);
      return `<span class="emotion-tag${isSel ? ' selected' : ''}" data-emotion="${em}">${em}</span>`;
    }).join('');

    container.innerHTML = `
      <div class="checkin-input-area fade-in">
        <!-- Big Slider -->
        <div class="checkin-slider-card">
          <label class="checkin-big-label">现在感觉怎么样？</label>
          <div class="anxiety-slider-container">
            <div class="anxiety-level-display checkin-level-display" style="color:${colors(this.level)}">${this.level}</div>
            <input type="range" min="1" max="10" value="${this.level}" class="anxiety-slider checkin-slider" id="checkin-slider">
          </div>
          <div id="checkin-soothe" class="checkin-soothe">${SOOTHE_BY_LEVEL[this.level]}</div>
        </div>

        <!-- Emotion Tags -->
        <div class="checkin-tags-card">
          <label class="checkin-label">有哪些情绪？（点选）</label>
          <div class="emotion-tags" id="checkin-emotions">${tagsHtml}</div>
        </div>

        <!-- Optional Note -->
        <div class="checkin-note-card">
          <label class="checkin-label">简单说说（可选）</label>
          <textarea id="checkin-note" placeholder="一句话就够了..." class="checkin-textarea">${this.esc(this.note)}</textarea>
        </div>

        <!-- Sign-in Button -->
        <button class="btn-primary checkin-btn" id="checkin-btn" type="button">✅ 签到</button>

        <!-- Mood Calendar -->
        ${this._renderMoodCalendar()}

        <!-- History -->
        <div class="checkin-history">
          <button class="history-toggle btn-ghost" id="checkin-history-toggle">
            签到记录 <span class="toggle-arrow">▾</span>
          </button>
          <div class="history-list" id="checkin-history-list"></div>
        </div>
      </div>
    `;

    // Slider
    document.getElementById('checkin-slider').addEventListener('input', (e) => {
      this.level = parseInt(e.target.value);
      document.querySelector('.checkin-level-display').textContent = this.level;
      document.querySelector('.checkin-level-display').style.color = colors(this.level);
      document.getElementById('checkin-soothe').textContent = SOOTHE_BY_LEVEL[this.level];
    });

    // Emotion tags
    document.querySelectorAll('#checkin-emotions .emotion-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const em = tag.dataset.emotion;
        const idx = this.emotions.indexOf(em);
        if (idx >= 0) { this.emotions.splice(idx, 1); tag.classList.remove('selected'); }
        else { this.emotions.push(em); tag.classList.add('selected'); }
      });
    });

    // Note
    document.getElementById('checkin-note').addEventListener('input', (e) => {
      this.note = e.target.value;
    });

    // Sign-in button
    document.getElementById('checkin-btn').addEventListener('click', () => this.doCheckin());

    // History
    this.renderHistory();
    document.getElementById('checkin-history-toggle').addEventListener('click', () => {
      document.getElementById('checkin-history-toggle').classList.toggle('open');
      document.getElementById('checkin-history-list').classList.toggle('open');
    });
  },

  // ==========================================
  // Do Check-in
  // ==========================================

  async doCheckin() {
    const entry = {
      level: this.level,
      emotions: [...this.emotions],
      note: this.note,
      createdAt: new Date().toISOString()
    };

    // Save as brain-dump (reuse storage)
    await JingXin.IPC.invoke('brain-dump:save', {
      content: JSON.stringify(entry)
    });

    // Show feedback
    const container = document.getElementById('checkin-body');
    const soothe = SOOTHE_BY_LEVEL[this.level];

    container.innerHTML = `
      <div class="checkin-done fade-in">
        <div class="checkin-done-icon">🌱</div>
        <h3>签到完成</h3>
        <div class="cbt-soothe-card" style="margin:var(--space-md) 0">
          <p class="soothe-text">${soothe}</p>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:var(--space-md)">
          <span class="badge" style="background:${this._levelColor(this.level)}20;color:${this._levelColor(this.level)};font-size:16px;padding:4px 14px">焦虑 ${this.level}/10</span>
          ${this.emotions.length > 0 ? this.emotions.map(e => `<span class="mini-tag">${e}</span>`).join(' ') : ''}
        </div>
        ${this.note ? `<p style="font-size:13px;color:var(--color-text-secondary);text-align:center;margin-bottom:var(--space-md)">"${this.esc(this.note)}"</p>` : ''}

        <button class="btn-primary" id="checkin-again" style="width:100%">再签一次</button>
        <button class="btn-ghost" id="checkin-view-history" style="width:100%;color:var(--color-text-muted);margin-top:4px">查看签到记录</button>
        ${this.level >= 7 ? `
        <div class="cross-link-card fade-in">
          <p style="font-weight:600;color:var(--color-text-primary);margin-bottom:4px">🌿 焦虑比较高的时候，试试记一件好事</p>
          <p class="text-muted" style="font-size:12px;margin-bottom:8px">把你的注意力从焦虑中转移出来一小会儿</p>
          <button class="btn-secondary" id="checkin-goto-gratitude" style="width:100%">去记一件开心的事 →</button>
        </div>
        ` : ''}
      </div>
    `;

    document.getElementById('checkin-again').addEventListener('click', () => {
      this.level = 5; this.emotions = []; this.note = '';
      this.renderInput();
    });
    document.getElementById('checkin-view-history').addEventListener('click', () => {
      this.renderInput();
      setTimeout(() => {
        document.getElementById('checkin-history-toggle').classList.add('open');
        document.getElementById('checkin-history-list').classList.add('open');
        document.getElementById('checkin-history-list').scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    const gotoGrat = document.getElementById('checkin-goto-gratitude');
    if (gotoGrat) gotoGrat.addEventListener('click', () => {
      JingXin.App.switchView('reminders');
    });

    await this.loadCheckins();
  },

  // ==========================================
  // History
  // ==========================================

  renderHistory() {
    const list = document.getElementById('checkin-history-list');
    if (!list) return;

    // Parse stored entries (they're JSON strings in content field)
    const parsed = this.checkins
      .map(c => { try { return { ...c, data: JSON.parse(c.content) }; } catch (_) { return null; } })
      .filter(Boolean);

    if (parsed.length === 0) {
      list.innerHTML = '<p class="text-muted" style="text-align:center;padding:var(--space-md);">还没有签到记录</p>';
      return;
    }

    // Show last 7 days with dots
    const today = new Date();
    const weekHtml = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const found = parsed.find(p => p.createdAt.startsWith(dateStr));
      const level = found ? found.data.level : null;
      const color = level ? this._levelColor(level) : 'var(--color-text-muted)';
      const label = ['日','一','二','三','四','五','六'][d.getDay()];
      return `<div class="week-dot-item">
        <div class="week-dot" style="background:${level ? color : '#e0d8d0'};opacity:${level ? 1 : 0.3}"></div>
        <span style="font-size:10px;color:var(--color-text-muted)">${label}</span>
      </div>`;
    }).join('');

    list.innerHTML = `
      <div class="week-strip">${weekHtml}</div>
      ${parsed.slice(0, 10).map(p => {
        const date = new Date(p.createdAt);
        const dateStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const d = p.data;
        return `
          <div class="checkin-history-item">
            <span style="font-size:11px;color:var(--color-text-muted)">${dateStr}</span>
            <span class="badge" style="background:${this._levelColor(d.level || 5)}20;color:${this._levelColor(d.level || 5)};font-size:11px">${d.level}/10</span>
            ${(d.emotions || []).slice(0,3).map(e => `<span class="mini-tag">${e}</span>`).join(' ')}
            ${d.note ? `<span style="font-size:11px;color:var(--color-text-secondary)">${this.esc(d.note.substring(0,30))}</span>` : ''}
          </div>
        `;
      }).join('')}
    `;
  },

  _renderMoodCalendar() {
    // Build date→level map from checkins
    const dateMap = {};
    for (const c of this.checkins) {
      try {
        const data = JSON.parse(c.content);
        const dateStr = c.createdAt.split('T')[0];
        if (!dateMap[dateStr] || new Date(c.createdAt) > new Date(dateMap[dateStr].createdAt)) {
          dateMap[dateStr] = { level: data.level, createdAt: c.createdAt };
        }
      } catch (_) {}
    }

    // Show last 20 weeks
    const today = new Date(); today.setHours(0,0,0,0);
    const dayOfWeek = today.getDay(); // 0=Sun
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - dayOfWeek - 19 * 7); // 20 weeks back from last Sunday

    // Build weeks array
    const weeks = [];
    const current = new Date(startDate);
    for (let w = 0; w < 20; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const ds = current.toISOString().split('T')[0];
        const entry = dateMap[ds];
        week.push({ date: ds, level: entry ? entry.level : null, isToday: ds === today.toISOString().split('T')[0], isFuture: new Date(current) > today });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    // Month labels
    const months = [];
    for (let w = 0; w < weeks.length; w++) {
      const firstDay = weeks[w][0].date.split('-');
      const m = parseInt(firstDay[1]);
      if (w === 0 || m !== months[months.length - 1]?.month) {
        months.push({ month: m, week: w });
      }
    }

    const monthLabels = months.map(m => {
      const names = ['','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
      return `<span class="cal-month-label" style="grid-column:${m.week + 2}">${names[m.month]}</span>`;
    }).join('');

    const dayLabels = ['日','一','二','三','四','五','六'].map(d => `<span class="cal-day-label">${d}</span>`).join('');

    const cells = weeks.map(week =>
      week.map(day => {
        let cls = 'cal-cell';
        let style = '';
        let title = day.date;
        if (day.isFuture) { cls += ' cal-future'; title = ''; }
        else if (day.level === null) { cls += ' cal-empty'; title = day.date + ' 无记录'; }
        else {
          const l = day.level;
          if (l <= 2) style = 'background:#A3B5A6';
          else if (l <= 4) style = 'background:#C8D8A0';
          else if (l <= 6) style = 'background:#E8C96A';
          else if (l <= 8) style = 'background:#E8906A';
          else style = 'background:#D4686A';
          title = day.date + ' 焦虑 ' + l + '/10';
        }
        if (day.isToday) cls += ' cal-today';
        return `<span class="${cls}" style="${style}" title="${title}"></span>`;
      }).join('')
    ).join('');

    const count = Object.keys(dateMap).length;

    return `
      <div class="mood-calendar fade-in">
        <div class="cal-header">
          <span class="cal-title">📅 心情日历</span>
          <span class="cal-count">${count} 天记录</span>
        </div>
        <div class="cal-legend">
          <span>😌</span><span class="cal-legend-bar" style="background:#A3B5A6"></span>
          <span class="cal-legend-bar" style="background:#C8D8A0"></span>
          <span class="cal-legend-bar" style="background:#E8C96A"></span>
          <span class="cal-legend-bar" style="background:#E8906A"></span>
          <span class="cal-legend-bar" style="background:#D4686A"></span>
          <span>😰</span>
        </div>
        <div class="cal-grid">
          <div class="cal-month-row">${monthLabels}</div>
          <div class="cal-day-col">${dayLabels}</div>
          <div class="cal-cells">${cells}</div>
        </div>
      </div>
    `;
  },

  _levelColor(l) {
    if (l <= 3) return 'var(--color-anxiety-low)';
    if (l <= 6) return 'var(--color-anxiety-med)';
    if (l <= 8) return 'var(--color-anxiety-high)';
    return 'var(--color-anxiety-severe)';
  },

  esc(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  },

  onShow() {
    // Re-render to refresh history
    if (document.querySelector('.checkin-input-area') || document.querySelector('.checkin-done')) {
      this.renderInput();
    }
  }
};
