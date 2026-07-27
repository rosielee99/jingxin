/* 静心 — 今日心情（新版：表情→一句话→一级→二级） */
window.JingXin = window.JingXin || {};

JingXin.Checkin = {
  step: 'mood', // mood → note → cat → tags → done
  moodLevel: 5,
  note: '',
  category: '',
  tags: [],
  submitted: false,

  CATEGORIES: {
    '工作': ['压力大', '完成项目', '被认可', '职场关系', '加班疲惫'],
    '学习': ['考试焦虑', '效率低', '学到新东西', '作业压力', '拖延'],
    '家庭': ['和爸妈聊天', '被唠叨', '家庭聚会', '想家', '家庭矛盾'],
    '感情': ['甜蜜时刻', '吵架冷战', '想念对方', '感到孤独', '被理解'],
    '健康': ['睡不好', '身体不适', '运动放松', '精力充沛', '饮食问题'],
    '其它': ['说不清', '莫名烦躁', '闲得发慌', '就是emo', '其它']
  },

  async init() { this.render(); },

  render() {
    const el = document.getElementById('checkin-body'); if (!el) return;
    if (this.submitted) return this._renderDone(el);

    switch (this.step) {
      case 'mood': this._renderMood(el); break;
      case 'note': this._renderNote(el); break;
      case 'cat': this._renderCat(el); break;
      case 'tags': this._renderTags(el); break;
    }
  },

  // Step 1: 5 emojis
  _renderMood(el) {
    const moods = [
      { icon:'😊', label:'开心', level:2 },
      { icon:'😌', label:'平静', level:4 },
      { icon:'😐', label:'一般', level:5 },
      { icon:'😟', label:'焦虑', level:7 },
      { icon:'😭', label:'很难受', level:9 },
    ];
    el.innerHTML = `
      <div class="checkin-step fade-in">
        <p class="mood-question" style="font-size:1.3rem">今天感觉怎么样？</p>
        <div class="mood-grid">
          ${moods.map((m, i) => `
            <div class="mood-btn" onclick="JingXin.Checkin.selectMood(${i})" style="background:${['#FFF5EC','#FFFBF8','#F8F5F8','#FFF0E8','#FFF0E8'][i]}">
              <span class="mood-emoji">${m.icon}</span>
              <span class="mood-label">${m.label}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  },

  selectMood(idx) {
    const levels = [2, 4, 5, 7, 9];
    this.moodLevel = levels[idx];
    this.step = 'note';
    this.render();
  },

  // Step 2: What happened today?
  _renderNote(el) {
    el.innerHTML = `
      <div class="checkin-step fade-in">
        <p class="step-label" style="font-size:1.1rem;margin-bottom:16px">今天发生了什么？</p>
        <textarea oninput="JingXin.Checkin.note=this.value" placeholder="简单说一句就好～" class="today-note" style="min-height:80px">${this.esc(this.note)}</textarea>
        <div style="display:flex;gap:12px;margin-top:16px">
          <button class="btn-secondary" style="flex:1;font-size:13px" onclick="JingXin.Checkin.finish()">跳过</button>
          <button class="btn-primary" style="flex:1" onclick="JingXin.Checkin.step='cat';JingXin.Checkin.render()">继续</button>
        </div>
      </div>`;
  },

  // Step 3: First-level category
  _renderCat(el) {
    const cats = Object.keys(this.CATEGORIES);
    el.innerHTML = `
      <div class="checkin-step fade-in">
        <p class="step-label" style="font-size:1.1rem;margin-bottom:12px">和什么有关？（可选）</p>
        <div class="tag-grid">
          ${cats.map(c => `
            <span class="emotion-tag cat-tag${this.category === c ? ' selected' : ''}" onclick="JingXin.Checkin.selectCat('${c}')">${c}</span>
          `).join('')}
        </div>
        <button class="btn-primary" style="width:100%;margin-top:20px" onclick="JingXin.Checkin.finish()" ${!this.category ? 'disabled' : ''}>💾 保存</button>
        <button class="btn-ghost" style="width:100%;margin-top:4px;font-size:13px" onclick="JingXin.Checkin.finish()">跳过分类</button>
      </div>`;
  },

  selectCat(c) {
    this.category = c;
    this.step = 'tags';
    this.render();
  },

  // Step 4: Second-level tags
  _renderTags(el) {
    const subTags = this.CATEGORIES[this.category] || [];
    el.innerHTML = `
      <div class="checkin-step fade-in">
        <p class="step-label" style="font-size:1.1rem;margin-bottom:4px">「${this.category}」方面</p>
        <p class="step-hint">可多选</p>
        <div class="tag-grid" style="margin-top:12px">
          ${subTags.map(t => `
            <span class="emotion-tag${this.tags.includes(t) ? ' selected' : ''}" onclick="JingXin.Checkin.toggleTag('${t}')">${t}</span>
          `).join('')}
        </div>
        <button class="btn-primary" style="width:100%;margin-top:20px" onclick="JingXin.Checkin.finish()">💾 保存</button>
      </div>`;
  },

  toggleTag(t) {
    const idx = this.tags.indexOf(t);
    if (idx >= 0) this.tags.splice(idx, 1);
    else this.tags.push(t);
    document.querySelectorAll('.tag-grid .emotion-tag').forEach(el => {
      el.classList.toggle('selected', this.tags.includes(el.textContent));
    });
  },

  // Save
  finish() {
    JingXin.IPC.invoke('brain-dump:save', {
      content: JSON.stringify({
        level: this.moodLevel, note: this.note, category: this.category,
        tags: this.tags, createdAt: new Date().toISOString()
      })
    });
    this.submitted = true;
    this.render();
    this._sparkleStars();
    setTimeout(() => { this.submitted = false; this._reset(); this.render(); }, 4000);
  },

  _reset() {
    this.step = 'mood'; this.moodLevel = 5; this.note = ''; this.category = ''; this.tags = [];
  },

  _renderDone(el) {
    const hc = this.tags.length;
    const msgs = hc > 0 ? `你记录了 ${hc} 个感受。已经替你记下了 🌱` : '已经替你记下了 🌱';
    el.innerHTML = `
      <div class="done-container fade-in">
        <div class="done-stars">✨⭐💫🌟</div>
        <p class="done-msg">好好接住今天所有情绪啦</p>
        <div class="done-report">
          <span class="done-report-emoji">🌱</span>
          <p class="done-report-title">${this.category ? '「' + this.category + '」方面' : '今天'}的一些感受</p>
          <p class="done-report-text">${msgs}</p>
        </div>
        ${this.tags.length > 0 ? `<div class="done-tags">${this.tags.map(t => `<span class="mini-tag">${t}</span>`).join(' ')}</div>` : ''}
      </div>`;
  },

  _sparkleStars() {
    for (let i=0; i<8; i++) {
      const star = document.createElement('span');
      star.textContent = ['✨','⭐','💫'][Math.floor(Math.random()*3)];
      star.style.cssText = `position:fixed;font-size:${16+Math.random()*16}px;left:${20+Math.random()*60}%;top:${30+Math.random()*30}%;animation:starFall ${1+Math.random()*2}s ease-out forwards;animation-delay:${Math.random()*0.5}s;pointer-events:none;z-index:999;`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 3000);
    }
  },

  esc(s) { const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
};
