/* 静心 — CBT 五步梳理 + AI 辅助 */
window.JingXin = window.JingXin || {};

JingXin.LightCBT = {
  step: 0, // 0=start, 1-5=cards, 6=done
  facts: '', thoughts: '', evidence: '', alternatives: '', newView: '',
  aiSuggestions: [], aiLoading: false,

  async init() { this.render(); },

  render() {
    const el = document.getElementById('cbt-body'); if (!el) return;
    if (this.step === 0) this._renderStart(el);
    else if (this.step === 6) this._renderDone(el);
    else this._renderCard(el, this.step);
  },

  _renderStart(el) {
    el.innerHTML = `
      <div class="cbt-start fade-in">
        <p class="cbt-page-title">标准 CBT 五步梳理</p>
        <p class="cbt-page-sub">事实 → 自动想法 → 证据 → 别的解释 → 新想法</p>
        <button class="btn-primary" onclick="JingXin.LightCBT.start()" style="width:100%;margin-top:20px">开始梳理</button>
      </div>`;
  },

  start() { this.step = 1; this.render(); },

  _renderCard(el, n) {
    const cards = [
      { id:1, title:'📋 事实', sub:'客观发生了什么？', ph:'只描述事实，不加评价。就像监控摄像头看到的那样。\n\n比如：今天开会时，我的方案被同事质疑了三个问题。', field:'facts' },
      { id:2, title:'💭 自动想法', sub:'当时脑子里冒出了什么念头？', ph:'那些一闪而过的想法，不用修改，写下来就行。\n\n比如：我是不是能力不行？大家肯定觉得我很差劲。', field:'thoughts' },
      { id:3, title:'⚖️ 证据支持？', sub:'有什么证据支持这个想法？', ph:'不管多小的证据都算。\n\n比如：他确实指出了方案的问题。当时会议室里安静了几秒。', field:'evidence' },
      { id:4, title:'🔍 还有别的解释吗？', sub:'试试看你能否找到其他可能性', ph:'哪怕只是可能性，不是确定答案。\n\n比如：他可能只是想帮忙完善方案。其他同事也可能早就想提这些问题。他刚才跟老板吵了架，心情不好。', field:'alternatives' },
      { id:5, title:'🪞 新的想法', sub:'基于以上分析，换个更客观的角度看', ph:'现在，写出一个更平衡、更接近真实的想法。\n\n比如：方案确实有可以改进的地方，但这不等于我能力差。同事的反馈让我有机会完善它。', field:'newView', hasAI: true },
    ];
    const c = cards[n-1];

    const aiHtml = c.hasAI ? `
      <div class="ai-assist" style="margin-top:12px">
        <button class="btn-secondary" onclick="JingXin.LightCBT.askAI()" style="font-size:12px;padding:8px 16px" ${this.aiLoading?'disabled':''}>${this.aiLoading ? '⏳ AI思考中...' : '🤖 AI 帮我换角度'}</button>
        ${this.aiSuggestions.length > 0 ? `
        <div class="ai-suggestions" style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
          ${this.aiSuggestions.map((s, i) => `
            <div class="ai-suggestion-item" onclick="JingXin.LightCBT.newView='${this.esc(s).replace(/'/g, "\\'")}';JingXin.LightCBT.render()" style="padding:10px 14px;background:#FFF5EC;border-radius:12px;font-size:13px;color:#8C7B6A;cursor:pointer;border:1px solid rgba(232,168,124,0.2)">
              💡 ${s}
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    ` : '';

    const progressPct = Math.round(n / 5 * 100);

    el.innerHTML = `
      <div class="cbt-card-container fade-in">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-size:11px;color:#D4916A;font-weight:600">CBT ${n}/5</span>
          <div style="flex:1;height:3px;background:#E8D5C8;border-radius:2px"><div style="height:100%;width:${progressPct}%;background:#E8A87C;border-radius:2px;transition:width 0.3s"></div></div>
        </div>
        <div class="cbt-card-item">
          <p class="cbt-card-title">${c.title}</p>
          <p class="cbt-card-subtitle">${c.sub}</p>
          <textarea oninput="JingXin.LightCBT.${c.field}=this.value" placeholder="${c.ph}" class="cbt-card-input" style="min-height:100px">${this.esc(this[c.field] || '')}</textarea>
          ${aiHtml}
        </div>
        <div class="cbt-card-nav">
          ${n > 1 ? `<button class="btn-secondary" style="flex:1" onclick="JingXin.LightCBT.step=${n-1};JingXin.LightCBT.render()">← 上一步</button>` : ''}
          <button class="btn-primary" style="flex:1" onclick="JingXin.LightCBT.step=${n+1};JingXin.LightCBT.render()">${n < 5 ? '下一步 →' : '生成梳理结果'}</button>
        </div>
        <button class="exit-btn" onclick="JingXin.LightCBT.exit()">暂时退出</button>
      </div>`;
  },

  // === AI assist: generate alternative perspectives ===
  async askAI() {
    const apiKey = localStorage.getItem('ds_api_key');
    if (!apiKey) {
      // Show key input inline
      const key = prompt('请输入 DeepSeek API Key（免费获取：platform.deepseek.com/api_keys）');
      if (key) localStorage.setItem('ds_api_key', key);
      else return;
    }

    this.aiLoading = true;
    this.render();

    try {
      const prompt = `用户正在做CBT认知行为疗法练习。\n\n【客观事实】${this.facts}\n【自动消极想法】${this.thoughts}\n【支持证据】${this.evidence}\n【已有其他解释】${this.alternatives}\n\n请生成3个"更客观、更温和的新视角"。每个视角20-40字。用温暖的中文，像朋友在开导。格式：每行一个视角，不要编号。`;

      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('ds_api_key') },
        body: JSON.stringify({
          model: 'deepseek-chat', max_tokens: 300, temperature: 0.8,
          messages: [
            { role: 'system', content: '你是一个温暖的心理咨询师。用中文回复。' },
            { role: 'user', content: prompt }
          ]
        }),
        signal: AbortSignal.timeout(15000)
      });

      const json = await resp.json();
      if (json.choices && json.choices[0]) {
        const text = json.choices[0].message.content;
        this.aiSuggestions = text.split('\n').filter(s => s.trim().length > 5).slice(0, 3);
      }
    } catch (e) {
      this.aiSuggestions = ['一次不代表永远，把这件事限定在具体情境里', '试着站在旁观者的角度，你会看到更完整的画面', '你有权利给自己一个更温柔的解读'];
    }

    this.aiLoading = false;
    this.render();
  },

  // === Done ===
  _renderDone(el) {
    // Save
    const worry = `【事实】${this.facts}\n【自动想法】${this.thoughts}\n【证据】${this.evidence}\n【别的解释】${this.alternatives}\n【新想法】${this.newView}`;
    JingXin.IPC.invoke('anxiety:save', { worry, anxietyLevel: 5, emotions: [] });

    // Generate analysis
    const analysis = [];
    if (this.facts && this.thoughts) {
      analysis.push('你完成了"事实"和"自动想法"的分离——这是CBT最关键的一步。事实是摄像头拍到的画面，自动想法是大脑给画面配的旁白。它们不是同一件事。');
    }
    if (this.evidence) {
      analysis.push('你找到了支持自动想法的证据。看见证据不等于自动想法是对的——有时候证据只是巧合，不能证明因果。');
    }
    if (this.alternatives) {
      const altCount = this.alternatives.split('\n').filter(s => s.trim().length > 5).length;
      analysis.push(`你找到了至少 ${altCount} 种别的解释。这说明同一件事有多种可能的解读——而最初的自动想法只是其中一种，往往不是最准确的那种。`);
    }
    if (this.newView) {
      analysis.push('你写下了新的、更平衡的想法。这不是强迫自己乐观——这是基于事实、证据和多种解释之后，做出的更接近真实的判断。');
    }
    analysis.push('CBT的核心不是消灭负面想法，而是学会和它们对话。你今天完成了这五次对话。每一次练习，大脑的"新通道"都会更宽一点。');

    const analysisHtml = analysis.map(p => `<p style="margin-bottom:8px;line-height:1.65;font-size:0.9rem;color:#8C7B6A">${p}</p>`).join('');

    el.innerHTML = `
      <div class="cbt-done fade-in">
        <p style="text-align:center;font-size:1.5rem;margin-bottom:4px">🌿</p>
        <p class="cbt-page-title">梳理完成</p>

        <div class="analysis-rich" style="background:#FFFBF8;border-radius:16px;padding:16px 20px;margin:16px 0;text-align:left">
          <p style="font-weight:600;font-size:0.9rem;color:#D4916A;margin-bottom:12px">📋 CBT 分析</p>
          ${analysisHtml}
        </div>

        <button class="btn-primary" onclick="JingXin.LightCBT.exit()" style="width:100%">完成</button>
      </div>`;
  },

  exit() { this.step = 0; this.facts = ''; this.thoughts = ''; this.evidence = ''; this.alternatives = ''; this.newView = ''; this.aiSuggestions = []; this.render(); },
  esc(s) { const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
};
