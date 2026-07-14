/* 静心 — 情绪签到（引导式） */
window.JingXin = window.JingXin || {};

JingXin.Checkin = {
  step: 'mood',   // mood | intensity | trigger | note | done
  level: 5,
  emotions: [],
  trigger: '',
  note: '',

  async init() { this.render(); },

  render() {
    const el = document.getElementById('checkin-body'); if (!el) return;

    switch (this.step) {
      case 'mood': this._renderMood(el); break;
      case 'intensity': this._renderIntensity(el); break;
      case 'trigger': this._renderTrigger(el); break;
      case 'note': this._renderNote(el); break;
      case 'done': this._renderDone(el); break;
    }
    el.scrollIntoView({ behavior: 'smooth' });
  },

  _renderMood(el) {
    const moods = [
      { icon: '😌', label: '平静', level: 2 },
      { icon: '🙂', label: '还不错', level: 4 },
      { icon: '😐', label: '一般', level: 5 },
      { icon: '😟', label: '焦虑', level: 7 },
      { icon: '😣', label: '很难受', level: 9 },
    ];
    el.innerHTML = `
      <div class="mood-question">今天感觉怎么样？</div>
      <div class="mood-grid">
        ${moods.map((m, i) => `
          <div class="mood-btn" onclick="JingXin.Checkin.selectMood(${i})" style="background:${['#E8F5F1','#E3EFFA','#EEF0F5','#EDEEF8','#F3EEF7'][i]}">
            <span class="mood-emoji">${m.icon}</span>
            <span class="mood-label" style="color:${['#6CB4A1','#7CB8E8','#7CB8E8','#6B7ED8','#7B5EA7'][i]}">${m.label}</span>
          </div>
        `).join('')}
      </div>`;
  },

  selectMood(idx) {
    const moods = [
      { icon: '😌', label: '平静', level: 2 },
      { icon: '🙂', label: '还不错', level: 4 },
      { icon: '😐', label: '一般', level: 5 },
      { icon: '😟', label: '焦虑', level: 7 },
      { icon: '😣', label: '很难受', level: 9 },
    ];
    const m = moods[idx];
    this.level = m.level;
    this.emotions = [m.label];
    this.step = 'intensity';
    this.render();
  },

  _renderIntensity(el) {
    const colors = l => l <= 3 ? '#6CB4A1' : l <= 6 ? '#7CB8E8' : l <= 8 ? '#6B7ED8' : '#7B5EA7';
    el.innerHTML = `
      <div class="mood-question">${this.emotions[0]}</div>
      <div class="step-label">这种感受有多强烈？</div>
      <div class="level-display-big" style="color:${colors(this.level)}">${this.level}</div>
      <input type="range" min="1" max="10" value="${this.level}" class="anxiety-slider" oninput="JingXin.Checkin.onIntensity(this.value)">
      <div class="anxiety-labels"><span>一点点</span><span>非常强烈</span></div>
      <div style="display:flex;gap:12px;margin-top:24px">
        <button class="btn-secondary" style="flex:1" onclick="JingXin.Checkin.save()">不想分析，直接保存</button>
        <button class="btn-primary" style="flex:1" onclick="JingXin.Checkin.goTrigger()">继续 →</button>
      </div>`;
  },

  onIntensity(val) {
    this.level = parseInt(val);
    const colors = l => l <= 3 ? '#6CB4A1' : l <= 6 ? '#7CB8E8' : l <= 8 ? '#6B7ED8' : '#7B5EA7';
    const el = document.querySelector('.level-display-big');
    if (el) { el.textContent = val; el.style.color = colors(parseInt(val)); }
  },

  goTrigger() { this.step = 'trigger'; this.render(); },
  goNote() { this.step = 'note'; this.render(); },

  _renderTrigger(el) {
    const triggers = ['工作', '学业', '关系', '健康', '金钱', '未来', '家庭', '说不清'];
    el.innerHTML = `
      <div class="step-label">你觉得是什么触发了它？</div>
      <p class="step-hint">可选，选了有助于以后发现规律</p>
      <div class="tag-grid" style="margin-top:16px">
        ${triggers.map(t => `
          <span class="emotion-tag${this.trigger === t ? ' selected' : ''}" onclick="JingXin.Checkin.selectTrigger('${t}')">${t}</span>
        `).join('')}
      </div>
      <div style="display:flex;gap:12px;margin-top:24px">
        <button class="btn-secondary" style="flex:1" onclick="JingXin.Checkin.save()">跳过，保存</button>
        <button class="btn-primary" style="flex:1" onclick="JingXin.Checkin.goNote()">再说两句 →</button>
      </div>`;
  },

  selectTrigger(t) {
    this.trigger = t;
    document.querySelectorAll('.tag-grid .emotion-tag').forEach(tag => {
      tag.classList.toggle('selected', tag.textContent === t);
    });
  },

  _renderNote(el) {
    el.innerHTML = `
      <div class="step-label">还有什么想说的？</div>
      <p class="step-hint">写不写都行</p>
      <textarea oninput="JingXin.Checkin.note=this.value" placeholder="一句话就行..." style="min-height:80px;margin-top:12px">${this.esc(this.note)}</textarea>
      <button class="btn-primary" style="width:100%;margin-top:16px" onclick="JingXin.Checkin.save()">💾 保存</button>`;
  },

  async save() {
    await JingXin.IPC.invoke('brain-dump:save', {
      content: JSON.stringify({ level: this.level, emotions: this.emotions, trigger: this.trigger, note: this.note, createdAt: new Date().toISOString() })
    });
    this.step = 'done';
    this.render();
  },

  _renderDone(el) {
    const msgs = ['已经替你记下了 🌱', '今天到这里也可以。', '你已经在照顾自己了。', '深呼吸一下，你今天做得够多了。'];
    el.innerHTML = `
      <div style="text-align:center;padding:16px 0">
        <span style="font-size:64px;display:block;margin-bottom:12px">🌱</span>
        <p style="font-size:20px;font-weight:600;margin-bottom:8px">${this._pick(msgs)}</p>
        <p style="font-size:14px;color:#8A9AAA">深呼吸一下，你今天做得够多了。</p>
        <button class="btn-primary" style="width:100%;margin-top:16px" onclick="JingXin.Checkin.reset()">再签一次</button>
      </div>`;
  },

  reset() {
    this.step = 'mood'; this.level = 5; this.emotions = []; this.trigger = ''; this.note = '';
    this.render();
  },

  _pick(a) { return a[Math.floor(Math.random() * a.length)]; },
  esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
};
