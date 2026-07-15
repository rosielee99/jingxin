/* 静心 — 今日心情记录（温柔版） */
window.JingXin = window.JingXin || {};

JingXin.Checkin = {
  selectedTags: [],
  note: '',
  submitted: false,

  HAPPY_TAGS: ['美食治愈', '独处放空', '听歌放松', '出行散心', '工作顺利', '小小惊喜'],
  ANNOY_TAGS: ['职场压力', '被指责委屈', '婚恋内耗', '短视频攀比', '自我否定', '迷茫疲惫'],

  async init() { this.render(); },

  render() {
    const el = document.getElementById('checkin-body'); if (!el) return;

    if (this.submitted) return this._renderDone(el);

    const hTags = this.HAPPY_TAGS.map(t => {
      const sel = this.selectedTags.includes(t);
      return `<span class="checkin-tag happy-tag${sel ? ' selected' : ''}" onclick="JingXin.Checkin.toggleTag('${t}')">${sel ? '✓ ' : ''}${t}</span>`;
    }).join('');

    const aTags = this.ANNOY_TAGS.map(t => {
      const sel = this.selectedTags.includes(t);
      return `<span class="checkin-tag annoy-tag${sel ? ' selected' : ''}" onclick="JingXin.Checkin.toggleTag('${t}')">${sel ? '✓ ' : ''}${t}</span>`;
    }).join('');

    el.innerHTML = `
      <div class="today-container fade-in">
        <!-- Happy section -->
        <div class="tag-section happy-section">
          <div class="section-title">✨ 今日小美好</div>
          <div class="tag-row">${hTags}</div>
        </div>

        <!-- Annoy section -->
        <div class="tag-section annoy-section">
          <div class="section-title">🌧 今日小烦闷</div>
          <div class="tag-row">${aTags}</div>
        </div>

        <!-- Note input -->
        <div class="note-section">
          <textarea placeholder="简单写一句今天发生的小事就好～" oninput="JingXin.Checkin.note=this.value" class="today-note">${this.esc(this.note)}</textarea>
        </div>

        <!-- Buttons -->
        <div class="today-actions">
          <button class="btn-primary today-save-btn" onclick="JingXin.Checkin.submit()">保存今日心情</button>
          <button class="btn-ghost skip-btn" onclick="JingXin.Checkin.skip()">稍后再说</button>
        </div>
      </div>`;
  },

  toggleTag(t) {
    const idx = this.selectedTags.indexOf(t);
    if (idx >= 0) this.selectedTags.splice(idx, 1);
    else this.selectedTags.push(t);
    this.render();
  },

  submit() {
    // Save to storage
    JingXin.IPC.invoke('brain-dump:save', {
      content: JSON.stringify({
        tags: this.selectedTags,
        note: this.note,
        level: 5,
        emotions: [],
        createdAt: new Date().toISOString()
      })
    });
    this.submitted = true;
    this.render();
    // Launch stars animation
    this._sparkleStars();
    // Auto dismiss after 4s
    setTimeout(() => { this.submitted = false; this.selectedTags = []; this.note = ''; this.render(); }, 4000);
  },

  skip() {
    this.submitted = false;
    this.selectedTags = [];
    this.note = '';
    this.render();
  },

  _sparkleStars() {
    const container = document.getElementById('checkin-body');
    if (!container) return;
    for (let i = 0; i < 12; i++) {
      const star = document.createElement('span');
      star.textContent = ['✨','⭐','💫','🌟'][Math.floor(Math.random()*4)];
      star.style.cssText = `
        position:fixed;font-size:${18+Math.random()*20}px;
        left:${20+Math.random()*60}%;top:${30+Math.random()*30}%;
        animation:starFall ${1+Math.random()*2}s ease-out forwards;
        animation-delay:${Math.random()*0.5}s;pointer-events:none;z-index:999;
      `;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 3000);
    }
  },

  _renderDone(el) {
    el.innerHTML = `
      <div class="done-container fade-in">
        <div class="done-stars">✨⭐💫🌟</div>
        <p class="done-msg">好好接住今天所有情绪啦</p>
        <p class="done-sub">已经替你记下了 🌱</p>
        ${this.selectedTags.length > 0 ? `<div class="done-tags">${this.selectedTags.map(t => `<span class="mini-tag">${t}</span>`).join(' ')}</div>` : ''}
      </div>`;
  },

  esc(s) { const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
};
