/* 静心 — 情绪签到（引导式） */
window.JingXin = window.JingXin || {};

JingXin.Checkin = {
  step: 'mood',   // mood | intensity | trigger | note | done
  level: 5,
  emotions: [],
  triggers: [],
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
      <div class="step-label">有多强烈？</div>
      <div class="level-display-big" style="color:${colors(this.level)}">${this.level}</div>
      <input type="range" min="1" max="10" value="${this.level}" class="anxiety-slider" oninput="JingXin.Checkin.onIntensity(this.value)">
      <div class="anxiety-labels"><span>轻微</span><span>强烈</span></div>
      <div style="display:flex;gap:12px;margin-top:20px">
        <button class="btn-secondary" style="flex:1;font-size:13px" onclick="JingXin.Checkin.save()">跳过</button>
        <button class="btn-primary" style="flex:1" onclick="JingXin.Checkin.goTrigger()">继续</button>
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
      <div class="step-label">是什么触发了它？（可多选）</div>
      <div class="tag-grid" style="margin-top:12px">
        ${triggers.map(t => `
          <span class="emotion-tag${this.triggers.includes(t) ? ' selected' : ''}" onclick="JingXin.Checkin.toggleTrigger('${t}')">${t}</span>
        `).join('')}
      </div>
      <div style="display:flex;gap:12px;margin-top:20px">
        <button class="btn-secondary" style="flex:1" onclick="JingXin.Checkin.save()">跳过保存</button>
        <button class="btn-primary" style="flex:1" onclick="JingXin.Checkin.goNote()">再说两句 →</button>
      </div>`;
  },

  toggleTrigger(t) {
    const idx = this.triggers.indexOf(t);
    if (idx >= 0) this.triggers.splice(idx, 1);
    else this.triggers.push(t);
    document.querySelectorAll('.tag-grid .emotion-tag').forEach(tag => {
      tag.classList.toggle('selected', this.triggers.includes(tag.textContent));
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
      content: JSON.stringify({ level: this.level, emotions: this.emotions, triggers: this.triggers, note: this.note, createdAt: new Date().toISOString() })
    });
    this.step = 'done';
    this.render();
  },

  _renderDone(el) {
    const colors = l => l <= 3 ? '#6CB4A1' : l <= 6 ? '#7CB8E8' : l <= 8 ? '#6B7ED8' : '#7B5EA7';
    const moods = { '平静':'😌', '还不错':'🙂', '一般':'😐', '焦虑':'😟', '很难受':'😣' };
    const icon = moods[this.emotions[0]] || '🌱';

    // Mini analysis based on level
    let analysis = '';
    if (this.level <= 3) analysis = '状态不错。保持这种觉察，它会在你需要的时候保护你。';
    else if (this.level <= 5) analysis = '轻微的波动是正常的。你已经注意到了它，这本身就是一种能力。';
    else if (this.level <= 7) analysis = '焦虑感比较明显了。把它写下来就已经在帮自己——焦虑在纸上比在脑子里小。';
    else analysis = '现在可能比较难受。你已经做了一件很重要的事：停下来，看见它。剩下的可以慢慢来。';

    // Count today's checkins
    const today = new Date().toISOString().split('T')[0];
    const allCheckins = JingXin.Storage._get('jingxin-brain-dump', []).filter(c => c.createdAt.startsWith(today));
    const countMsg = allCheckins.length > 1 ? `今天第 ${allCheckins.length} 次签到 · ` : '';

    // Week streak
    const weekDays = [...new Set(JingXin.Storage._get('jingxin-brain-dump', []).map(c => c.createdAt.split('T')[0]))];
    const streak = this._calcStreak(weekDays);

    el.innerHTML = `
      <div class="checkin-done-area">
        <div class="done-mood" style="background:${colors(this.level)}15;border:2px solid ${colors(this.level)}40">
          <span class="done-emoji">${icon}</span>
          <div>
            <span class="done-label">${this.emotions[0]}</span>
            <span class="done-level" style="color:${colors(this.level)}">焦虑 ${this.level}/10</span>
          </div>
        </div>

        <div class="done-analysis" style="border-left:3px solid ${colors(this.level)}">
          <p>${analysis}</p>
        </div>

        ${this.triggers.length > 0 ? `<p style="font-size:13px;color:#8A9AAA;text-align:center;margin-bottom:12px">触发：${this.triggers.join('、')}</p>` : ''}
        ${this.note ? `<p style="font-size:13px;color:#5A6B7D;text-align:center;margin-bottom:12px;font-style:italic">"${this.esc(this.note)}"</p>` : ''}

        <div style="text-align:center;margin-bottom:16px">
          <span style="font-size:12px;color:#8A9AAA">${countMsg}${streak > 1 ? '🔥 连续签到 ' + streak + ' 天' : ''}</span>
        </div>

        <div style="display:flex;gap:8px">
          <button class="btn-primary" style="flex:1" onclick="JingXin.Checkin.reset()">再签一次</button>
          <button class="btn-secondary" style="flex:1" onclick="document.getElementById('view-journal').scrollIntoView({behavior:'smooth'})">📝 去写日记</button>
        </div>
      </div>`;
  },

  _calcStreak(dates) {
    let s = 0; const d = new Date(); d.setHours(0,0,0,0);
    for (let i = 0; i < 31; i++) {
      const check = new Date(d); check.setDate(check.getDate() - i);
      if (dates.includes(check.toISOString().split('T')[0])) s++; else break;
    }
    return s;
  },

  reset() {
    this.step = 'mood'; this.level = 5; this.emotions = []; this.triggers = []; this.note = '';
    this.render();
  },

  _pick(a) { return a[Math.floor(Math.random() * a.length)]; },
  esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
};
