/* 静心 — 轻量CBT情绪梳理（三卡片） */
window.JingXin = window.JingXin || {};

JingXin.LightCBT = {
  step: 0, // 0=start, 1=card1, 2=card2, 3=card3, 4=done
  card1: '', card2: '', card3: '',

  async init() { this.render(); },

  render() {
    const el = document.getElementById('cbt-body'); if (!el) return;

    if (this.step === 0) return this._renderStart(el);
    if (this.step === 4) return this._renderDone(el);
    this._renderCard(el, this.step);
  },

  _renderStart(el) {
    el.innerHTML = `
      <div class="cbt-start fade-in">
        <p class="cbt-page-title">轻轻梳理当下的内耗</p>
        <p class="cbt-page-sub">三张卡片，帮你换个角度看</p>
        <button class="btn-primary" onclick="JingXin.LightCBT.start()" style="width:100%;margin-top:20px">开始梳理</button>
      </div>`;
  },

  start() { this.step = 1; this.render(); },

  _renderCard(el, n) {
    const cards = [
      { title: '客观发生的事实', ph: '只描述发生的事，不带好坏评价\n\n比如：今天开会时我的方案被同事质疑了', icon: '📋' },
      { title: '我当下冒出的消极想法', ph: '心里第一时间浮现的负面感受\n\n比如：我是不是能力不行？大家肯定觉得我很差劲', icon: '💭' },
      { title: '更平和、客观的新视角', ph: '换一种温柔的方式看待这件事\n\n比如：同事质疑的是方案，不是我这个人。也有可能是我上次帮他，他现在想回报', icon: '🪞' },
    ];
    const c = cards[n-1];
    el.innerHTML = `
      <div class="cbt-card-container fade-in">
        <div class="cbt-progress">
          ${[1,2,3].map(i => `<span class="cbt-dot ${i <= n ? 'active' : ''}" onclick="JingXin.LightCBT.goStep(${i})"></span>`).join('')}
        </div>
        <div class="cbt-card-item">
          <div class="cbt-card-header">
            <span class="cbt-card-icon">${c.icon}</span>
            <span class="cbt-card-label">卡片 ${n}/3</span>
          </div>
          <p class="cbt-card-title">${c.title}</p>
          <textarea oninput="JingXin.LightCBT.card${n}=this.value" placeholder="${c.ph}" class="cbt-card-input">${this.esc(this['card'+n] || '')}</textarea>
        </div>
        <div class="cbt-card-nav">
          ${n > 1 ? `<button class="btn-secondary" onclick="JingXin.LightCBT.goStep(${n-1})">← 上一步</button>` : ''}
          <button class="btn-primary" style="flex:1" onclick="JingXin.LightCBT.goStep(${n+1})">${n < 3 ? '下一张卡片 →' : '生成我的梳理卡片'}</button>
        </div>
        <button class="btn-ghost exit-btn" onclick="JingXin.LightCBT.exit()">暂时退出</button>
      </div>`;
  },

  goStep(n) {
    if (n > 3) {
      // Save and show done
      JingXin.IPC.invoke('anxiety:save', {
        worry: `【事实】${this.card1} | 【消极想法】${this.card2} | 【新视角】${this.card3}`,
        anxietyLevel: 5, emotions: []
      });
      this.step = 4; this.render();
      return;
    }
    this.step = n; this.render();
  },

  _renderDone(el) {
    el.innerHTML = `
      <div class="cbt-done fade-in">
        <div class="cbt-handcard">
          <div class="handcard-inner">
            <p class="handcard-title">🌿 治愈手账</p>
            <div class="handcard-section">
              <p class="handcard-label">📋 客观事实</p>
              <p class="handcard-text">${this.esc(this.card1) || '（未填写）'}</p>
            </div>
            <div class="handcard-section">
              <p class="handcard-label">💭 消极想法</p>
              <p class="handcard-text">${this.esc(this.card2) || '（未填写）'}</p>
            </div>
            <div class="handcard-section">
              <p class="handcard-label">🪞 新视角</p>
              <p class="handcard-text">${this.esc(this.card3) || '（未填写）'}</p>
            </div>
            <div class="handcard-footer">
              <p>你已经慢慢和自己和解啦</p>
            </div>
          </div>
        </div>
        <button class="btn-primary" onclick="JingXin.LightCBT.exit()" style="width:100%;margin-top:16px">完成</button>
      </div>`;
  },

  exit() { this.step = 0; this.card1 = ''; this.card2 = ''; this.card3 = ''; this.render(); },
  esc(s) { const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
};
