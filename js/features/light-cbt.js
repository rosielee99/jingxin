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
      { title: '客观发生的事实', sub: 'CBT 第1步：情境觉察', ph: '只描述发生的事，不带好坏评价。就像监控摄像头看到的那样。\n\n比如：今天开会时我的方案被同事质疑了', icon: '📋', tag: 'Situation' },
      { title: '我当下冒出的消极想法', sub: 'CBT 第2步：自动思维捕捉', ph: '心里第一时间浮现的负面念头，可能很夸张也没关系——写下来才能看清它。\n\n比如：我是不是能力不行？大家肯定觉得我很差劲', icon: '💭', tag: 'Automatic Thoughts' },
      { title: '更平和、客观的新视角', sub: 'CBT 第3步：认知重构', ph: '换一种温柔、客观的方式重新看待这件事。这不是强迫乐观，而是基于事实的重新评估。\n\n比如：同事质疑的是方案，不是我这个人。过去5次类似的方案都通过了', icon: '🪞', tag: 'Reframing' },
    ];
    const c = cards[n-1];
    el.innerHTML = `
      <div class="cbt-card-container fade-in">
        <div class="cbt-method-badge">🧠 认知行为疗法 (CBT)</div>
        <div class="cbt-progress">
          ${[1,2,3].map(i => `<span class="cbt-dot ${i <= n ? 'active' : ''}" onclick="JingXin.LightCBT.goStep(${i})"></span>`).join('')}
        </div>
        <div class="cbt-card-item">
          <div class="cbt-card-header">
            <span class="cbt-card-icon">${c.icon}</span>
            <span class="cbt-card-tag">${c.tag}</span>
          </div>
          <p class="cbt-card-title">${c.title}</p>
          <p class="cbt-card-subtitle">${c.sub}</p>
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
      // Save and generate analysis
      this._analysis = this._generateCbtAnalysis();
      JingXin.IPC.invoke('anxiety:save', {
        worry: `【事实】${this.card1} | 【消极想法】${this.card2} | 【新视角】${this.card3}`,
        anxietyLevel: 5, emotions: []
      });
      this.step = 4; this.render();
      return;
    }
    this.step = n; this.render();
  },

  _generateCbtAnalysis() {
    const analysis = [];
    if (this.card1) analysis.push('你客观地描述了发生的事实——不带评价地看清"发生了什么"，是CBT的第一步。这让你和事件之间拉开了一点距离。');
    if (this.card2) {
      analysis.push('你捕捉到了自动冒出的消极想法。这些念头往往是习惯性的——大脑的"快速通道"总是先往坏处想。把它们写下来，你就看到了它们的样子，而不是被它们牵着走。');
      if (this.card3) {
        const oldLen = this.card2.length;
        const newLen = this.card3.length;
        if (newLen >= oldLen * 0.8) {
          analysis.push('你写下的新视角和原来的消极想法一样详细——这不是强迫乐观，而是真正的认知重构。你在用事实和温柔的方式，重新给自己一个解释。');
        } else {
          analysis.push('你试着找了一个新的视角。即使它还比较简短，但这是一个开始——每一次练习，大脑的"新通道"都会更宽阔一点。');
        }
      }
    }
    if (this.card3) {
      analysis.push('CBT的核心不是消除消极想法，而是学会和它们对话。今天的练习就是一次对话——旧的自动思维和新视角之间的对话。你站在中间，有选择权。');
    }
    analysis.push('三张卡片已经帮你完成了一次认知行为疗法的记录。焦虑不是你的敌人，它是大脑在努力保护你——只是方式有点过时了。慢慢来，每一次练习都在帮你更新这套系统。');
    return analysis;
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

        ${this._analysis ? `
        <div class="analysis-rich" style="background:#FFFBF8;border-radius:16px;padding:16px 20px;margin-top:16px;text-align:left">
          <p style="font-weight:600;font-size:0.9rem;color:#D4916A;margin-bottom:12px">📋 CBT 分析</p>
          ${this._analysis.map(p => `<p style="margin-bottom:10px;line-height:1.65;font-size:0.9rem;color:#8C7B6A">${p}</p>`).join('')}
        </div>
        ` : ''}
        <button class="btn-primary" onclick="JingXin.LightCBT.exit()" style="width:100%;margin-top:16px">完成</button>
      </div>`;
  },

  exit() { this.step = 0; this.card1 = ''; this.card2 = ''; this.card3 = ''; this.render(); },
  esc(s) { const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
};
