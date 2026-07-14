/* 静心 — 焦虑日记（快速+分步） */
window.JingXin = window.JingXin || {};

JingXin.Journal = {
  mood: 'anxiety', // anxiety | happy
  mode: 'quick',   // quick | guided
  worry: '', level: 5, happyLevel: 7,
  gStep: 1, gFact: '', gFear: '', gProbability: '', gAction: '', gUncontrol: '',
  result: false,

  async init() { this.render(); },

  render() {
    const el = document.getElementById('journal-body'); if (!el) return;
    if (this.result) return this._renderResult(el);
    if (this.mode === 'guided') return this._renderGuided(el);
    if (this.mood === 'happy') return this._renderHappy(el);
    this._renderQuick(el);
  },

  // === 快乐日记 ===
  _renderHappy(el) {
    const colors = l => '#6CB4A1'; // always green for happy
    el.innerHTML = `
      <div style="display:flex;gap:0;margin-bottom:16px;border-radius:12px;overflow:hidden">
        <div class="journal-tab" style="flex:1;text-align:center;padding:10px;font-size:14px;background:#E8F0F8;color:#8A9AAA;cursor:pointer" onclick="JingXin.Journal.mood='anxiety';JingXin.Journal.render()">😟 焦虑日记</div>
        <div class="journal-tab" style="flex:1;text-align:center;padding:10px;font-size:14px;background:#5B8DEE;color:#fff;font-weight:600;cursor:pointer" onclick="JingXin.Journal.mood='happy';JingXin.Journal.render()">🌟 快乐日记</div>
      </div>
      <label class="cbt-label">今天有什么让你开心的事？</label>
      <textarea oninput="JingXin.Journal.worry=this.value" placeholder="比如：今天喝到了一杯很好喝的咖啡&#10;比如：路上看到了很漂亮的日落&#10;&#10;小事就行，不用惊天动地。" style="min-height:100px">${this.esc(this.worry)}</textarea>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px">
        <span style="font-size:14px;color:#5A6B7D">有多开心？</span>
        <span style="font-weight:700;font-size:22px;color:#6CB4A1">${this.happyLevel}/10</span>
      </div>
      <input type="range" min="1" max="10" value="${this.happyLevel}" class="anxiety-slider" oninput="JingXin.Journal.happyLevel=parseInt(this.value);this.nextElementSibling.querySelector('span').textContent=this.value+'/10'">
      <button class="btn-primary" style="width:100%;margin-top:16px;background:linear-gradient(135deg,#6CB4A1,#519987)!important" onclick="JingXin.Journal.happySave()">🌟 记下这件好事</button>`;
  },

  happySave() {
    JingXin.IPC.invoke('gratitude:save', { happiness: this.happyLevel, note: this.worry, category: '生活小事' });
    this.result = true;
    this.render();
  },

  _renderQuick(el) {
    const colors = l => l <= 3 ? '#6CB4A1' : l <= 6 ? '#7CB8E8' : l <= 8 ? '#6B7ED8' : '#7B5EA7';
    el.innerHTML = `
      <div style="display:flex;gap:0;margin-bottom:16px;border-radius:12px;overflow:hidden">
        <div class="journal-tab" style="flex:1;text-align:center;padding:10px;font-size:14px;background:#5B8DEE;color:#fff;font-weight:600;cursor:pointer">😟 焦虑日记</div>
        <div class="journal-tab" style="flex:1;text-align:center;padding:10px;font-size:14px;background:#E8F0F8;color:#8A9AAA;cursor:pointer" onclick="JingXin.Journal.mood='happy';JingXin.Journal.render()">🌟 快乐日记</div>
      </div>
      <label class="cbt-label">我现在最担心的是……</label>
      <textarea oninput="JingXin.Journal.worry=this.value" placeholder="一句话就行。比如：我怕明天的演讲搞砸。" style="min-height:80px">${this.esc(this.worry)}</textarea>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px">
        <span style="font-size:14px;color:#5A6B7D">焦虑程度</span>
        <span style="font-weight:700;font-size:22px;color:${colors(this.level)}">${this.level}/10</span>
      </div>
      <input type="range" min="1" max="10" value="${this.level}" class="anxiety-slider" oninput="JingXin.Journal.level=parseInt(this.value);this.nextElementSibling.querySelector('span').textContent=this.value+'/10'">
      <button class="btn-primary" style="width:100%;margin-top:16px" onclick="JingXin.Journal.quickSave()">💾 保存</button>
      <button class="btn-ghost" style="width:100%;margin-top:8px;color:#8A9AAA;font-size:13px" onclick="JingXin.Journal.mode='guided';JingXin.Journal.render()">📋 想要分步梳理？点这里</button>`;
  },

  quickSave() {
    JingXin.IPC.invoke('anxiety:save', { worry: this.worry, anxietyLevel: this.level, emotions: [] });
    this.result = true;
    this.render();
  },

  _renderGuided(el) {
    const steps = [
      { title:'发生了什么？', hint:'只描述事实，不需要解释', field:'gFact', placeholder:'比如：明天要做一个重要的演讲' },
      { title:'我在担心什么？', hint:'写下脑中最坏的想法', field:'gFear', placeholder:'比如：我怕讲到一半忘词，所有人都在看我' },
      { title:'这个担心有多可能发生？', hint:'', field:'gProbability', placeholder:'', type:'select' },
      { title:'我现在能做的一小步是什么？', hint:'哪怕只是喝水、睡觉、发一条消息', field:'gAction', placeholder:'比如：今晚早点睡，明天提前到会场' },
      { title:'有哪些不在我控制范围内？', hint:'允许自己暂时放下这些', field:'gUncontrol', placeholder:'比如：观众的反应、会不会有人刁难' },
    ];
    const s = steps[this.gStep - 1];
    let inputHtml = '';
    if (s.type === 'select') {
      const opts = ['很低','较低','不确定','较高'];
      inputHtml = `<div style="display:flex;gap:8px;margin-top:12px">${opts.map(o => `<span class="emotion-tag${this.gProbability===o?' selected':''}" onclick="JingXin.Journal.gProbability='${o}';JingXin.Journal.render()" style="flex:1;text-align:center;cursor:pointer">${o}</span>`).join('')}</div>`;
    } else {
      inputHtml = `<textarea oninput="JingXin.Journal.${s.field}=this.value" placeholder="${s.placeholder}" style="min-height:80px;margin-top:12px">${this.esc(this[s.field] || '')}</textarea>`;
    }

    el.innerHTML = `
      <div style="margin-bottom:8px;font-size:12px;color:#8A9AAA">第 ${this.gStep} / 5 步</div>
      <div class="step-label" style="font-size:18px;font-weight:600;color:#2D3A4A">${s.title}</div>
      ${s.hint ? `<p class="step-hint" style="font-size:13px;color:#8A9AAA;font-style:italic">${s.hint}</p>` : ''}
      ${inputHtml}
      <div style="display:flex;gap:12px;margin-top:16px">
        ${this.gStep > 1 ? `<button class="btn-secondary" style="flex:1" onclick="JingXin.Journal.gStep--;JingXin.Journal.render()">← 上一步</button>` : ''}
        ${this.gStep < 5 ? `<button class="btn-primary" style="flex:1" onclick="JingXin.Journal.gStep++;JingXin.Journal.render()" ${!this[s.field] && s.type !== 'select' ? 'disabled' : ''}>下一步 →</button>` : `<button class="btn-primary" style="flex:1" onclick="JingXin.Journal.guidedSave()">💾 保存</button>`}
      </div>
      <button class="btn-ghost" style="width:100%;margin-top:8px;color:#8A9AAA;font-size:12px" onclick="JingXin.Journal.mode='quick';JingXin.Journal.render()">回到快速模式</button>`;
  },

  guidedSave() {
    const worry = this.gFact + ' | 担心: ' + this.gFear;
    JingXin.IPC.invoke('anxiety:save', { worry, anxietyLevel: this.level, emotions: [] });
    this.result = true; this.mode = 'quick';
    this.render();
  },

  _renderResult(el) {
    const isHappy = this.mood === 'happy';
    el.innerHTML = `
      <div style="text-align:center;padding:16px 0">
        <span style="font-size:64px;display:block">${isHappy ? '🌟' : '🌱'}</span>
        <p style="font-size:18px;color:#5A6B7D;margin:12px 0;line-height:1.6">${isHappy ? '开心的事值得被记住。<br>这是你对抗焦虑的力量。' : '你写下了心里最担心的事。<br>光是写出来，就已经在帮自己了。'}</p>
        <div style="display:flex;gap:8px">
          <button class="btn-primary" style="flex:1" onclick="JingXin.Journal.reset()">再写一次</button>
          <button class="btn-secondary" style="flex:1" onclick="JingXin.Journal.mood='${isHappy ? 'anxiety' : 'happy'}';JingXin.Journal.reset();JingXin.Journal.render()">${isHappy ? '😟 写焦虑' : '🌟 写开心'}</button>
        </div>
      </div>`;
  },

  reset() { this.result = false; this.worry = ''; this.level = 5; this.gStep = 1; this.gFact = ''; this.gFear = ''; this.gProbability = ''; this.gAction = ''; this.gUncontrol = ''; this.render(); },
  esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
};
