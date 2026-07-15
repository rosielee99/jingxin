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
    // Generate mini report based on tags
    const happyCount = this.selectedTags.filter(t => this.HAPPY_TAGS.includes(t)).length;
    const annoyCount = this.selectedTags.filter(t => this.ANNOY_TAGS.includes(t)).length;
    let reportTitle, reportText, reportEmoji;

    if (happyCount > annoyCount && happyCount > 0) {
      reportTitle = '今天的美好占了上风 ✨';
      reportText = `你捕捉到了 ${happyCount} 件小美好${annoyCount > 0 ? '，虽然也有' + annoyCount + '件烦闷，但好的感受更强烈' : ''}。记住这种感觉——它是你情绪银行里的存款。`;
      reportEmoji = '☀️';
    } else if (annoyCount > happyCount && annoyCount > 0) {
      reportTitle = '今天不容易，但你接住了 🫂';
      reportText = `你承认了 ${annoyCount} 件烦闷的事，这需要勇气。${happyCount > 0 ? '好在你还发现了' + happyCount + '件小美好——即使在低谷，你也没有完全被淹没。' : '把烦闷写下来，它对你的控制就少了一分。今天辛苦了。'}`;
      reportEmoji = '🌧';
    } else if (happyCount > 0 && annoyCount > 0) {
      reportTitle = '有晴有雨，这就是真实的一天 🌤';
      reportText = `美好和烦闷各占一半——这才是生活的常态。你没有被情绪裹挟，而是把它们都接住了。两边的力量都在，你在中间。`;
      reportEmoji = '🌈';
    } else if (this.note) {
      reportTitle = '你记下了今天的感受 📝';
      reportText = '不一定每天都有明确的好或坏。能停下来、写下来、感受自己——这个动作本身就是在照顾自己。';
      reportEmoji = '🌱';
    } else {
      reportTitle = '你今天来过，就够了 🌿';
      reportText = '不一定非要选标签、写文字。打开这个页面、看一眼自己的情绪状态，就已经在和内心对话了。';
      reportEmoji = '🌱';
    }

    el.innerHTML = `
      <div class="done-container fade-in">
        <div class="done-stars">✨⭐💫🌟</div>
        <p class="done-msg">好好接住今天所有情绪啦</p>

        <div class="done-report">
          <span class="done-report-emoji">${reportEmoji}</span>
          <p class="done-report-title">${reportTitle}</p>
          <p class="done-report-text">${reportText}</p>
        </div>

        ${this.selectedTags.length > 0 ? `<div class="done-tags">${this.selectedTags.map(t => `<span class="mini-tag">${t}</span>`).join(' ')}</div>` : ''}
      </div>`;
  },

  esc(s) { const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
};
