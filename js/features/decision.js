/* 静心 — 重大抉择冷静站 */
window.JingXin = window.JingXin || {};

JingXin.Decision = {
  goal: '', emotion: '', reality: '',
  pros: { shortDo: '', longDo: '', shortWait: '', longWait: '' },
  step: 0,

  async init() { this.render(); },

  render() {
    const el = document.getElementById('decision-body'); if (!el) return;
    if (this.step === 0) return this._renderStart(el);
    if (this.step === 4) return this._renderDone(el);
    this._renderStep(el, this.step);
  },

  _renderStart(el) {
    el.innerHTML = `
      <div class="cbt-start fade-in">
        <div class="decision-bubble">💡 容易上头冲动时，不妨在这里理清思路</div>
        <p class="cbt-page-title">先冷静，再做重要选择</p>
        <textarea placeholder="写下你当下想要做出的决定" oninput="JingXin.Decision.goal=this.value" class="cbt-card-input" style="margin-top:16px">${this.esc(this.goal)}</textarea>
        <button class="btn-primary" onclick="JingXin.Decision.step=1;JingXin.Decision.render()" style="width:100%;margin-top:12px" ${!this.goal?'disabled':''}>开始梳理</button>
      </div>`;
  },

  _renderStep(el, n) {
    if (n === 1) {
      el.innerHTML = `
        <div class="fade-in">
          <p class="cbt-page-title" style="font-size:1rem">先分清情绪和现实</p>
          <div style="margin-bottom:16px">
            <p style="font-size:14px;font-weight:500;color:#D4916A;margin-bottom:4px">💗 当下推动你的情绪感受</p>
            <textarea oninput="JingXin.Decision.emotion=this.value" placeholder="比如：我不做这个决定就来不及了、我很焦虑、我担心后悔" class="cbt-card-input">${this.esc(this.emotion)}</textarea>
          </div>
          <div style="margin-bottom:16px">
            <p style="font-size:14px;font-weight:500;color:#8FA889;margin-bottom:4px">🔒 无法改变的客观现实</p>
            <textarea oninput="JingXin.Decision.reality=this.value" placeholder="比如：目前每月固定支出是8000、孩子必须有人接送、行业确实在收缩" class="cbt-card-input">${this.esc(this.reality)}</textarea>
          </div>
          <button class="btn-primary" onclick="JingXin.Decision.step=2;JingXin.Decision.render()" style="width:100%">下一步：利弊分析</button>
        </div>`;
    } else if (n === 2 || n === 3) {
      const isStep2 = n === 2;
      const cards = isStep2 ? [
        { key: 'shortDo', q: '① 立刻这么做 · 短期感受', ph: '比如：松了一口气、有种解脱感、但也可能感到不安' },
        { key: 'longDo', q: '② 立刻这么做 · 长期影响', ph: '比如：半年后回看这个决定，可能会...' }
      ] : [
        { key: 'shortWait', q: '③ 维持现状 · 短期感受', ph: '比如：继续纠结、暂时安全、可能会错过机会' },
        { key: 'longWait', q: '④ 维持现状 · 长期影响', ph: '比如：一年后回头看，维持现状意味着...' }
      ];
      el.innerHTML = `
        <div class="fade-in">
          <p class="cbt-page-title" style="font-size:1rem">${isStep2 ? '如果立刻做这个决定' : '如果暂时不做'}</p>
          ${cards.map(c => `
            <div style="margin-bottom:12px">
              <p style="font-size:14px;font-weight:500;color:#5C4A3A;margin-bottom:4px">${c.q}</p>
              <textarea oninput="JingXin.Decision.pros.${c.key}=this.value" placeholder="${c.ph}" class="cbt-card-input" style="min-height:70px">${this.esc(this.pros[c.key] || '')}</textarea>
            </div>
          `).join('')}
          <div style="display:flex;gap:12px">
            ${isStep2 ? `<button class="btn-secondary" style="flex:1" onclick="JingXin.Decision.step=1;JingXin.Decision.render()">← 返回</button>` : `<button class="btn-secondary" style="flex:1" onclick="JingXin.Decision.step=2;JingXin.Decision.render()">← 返回</button>`}
            <button class="btn-primary" style="flex:1" onclick="JingXin.Decision.step=${isStep2?3:4};JingXin.Decision.render()">${isStep2?'下一步 →':'完成梳理'}</button>
          </div>
        </div>`;
    }
  },

  _renderDone(el) {
    // Save
    const summary = `【决定】${this.goal}\n【情绪】${this.emotion}\n【现实】${this.reality}\n【立刻做-短期】${this.pros.shortDo}\n【立刻做-长期】${this.pros.longDo}\n【不做-短期】${this.pros.shortWait}\n【不做-长期】${this.pros.longWait}`;
    JingXin.IPC.invoke('anxiety:save', { worry: summary, anxietyLevel: 5, emotions: [] });

    el.innerHTML = `
      <div class="cbt-done fade-in">
        <p style="text-align:center;font-size:1.5rem;margin-bottom:8px">🧘</p>
        <p class="cbt-page-title">梳理完成</p>
        <div class="decision-advice">
          <p>💡 建议先暂缓7天再下定论</p>
          <p style="font-size:0.85rem;color:#8C7B6A">持续记录情绪观察变化</p>
        </div>
        <button class="btn-primary" onclick="JingXin.Decision.exit()" style="width:100%">保存本次梳理</button>
      </div>`;
  },

  exit() { this.step = 0; this.goal = ''; this.emotion = ''; this.reality = ''; this.pros = { shortDo:'', longDo:'', shortWait:'', longWait:'' }; this.render(); },
  esc(s) { const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
};
