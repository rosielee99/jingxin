/* 静心 — 今日心情（新版：表情→一句话→一级→二级） */
window.JingXin = window.JingXin || {};

JingXin.Checkin = {
  step: 'mood', // mood → note → cat → tags → done | 'aiScan'
  aiText: '', aiResult: null, aiLoading: false,
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
      case 'aiScan': this._renderAiScan(el); break;
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
        <button class="btn-ghost" onclick="JingXin.Checkin.step='aiScan';JingXin.Checkin.render()" style="margin-top:20px;color:#D4916A;font-size:13px">🤖 不知道什么情绪？AI 帮你识别</button>
      </div>`;
  },

  // === AI Emotion Scanner ===
  _renderAiScan(el) {
    if (this.aiResult) return this._renderAiResult(el);
    el.innerHTML = `
      <div class="checkin-step fade-in">
        <p class="step-label" style="font-size:1.1rem;margin-bottom:4px">🤖 AI 情绪识别</p>
        <p class="step-hint">写下你遇到的事情，AI 帮你看出里面的情绪</p>
        <textarea oninput="JingXin.Checkin.aiText=this.value" placeholder="比如：今天开会时被领导当众批评了，当时觉得脸上火辣辣的，回工位后一直没法专心工作，心里堵得慌..." style="min-height:120px;margin-top:12px" class="today-note">${this.esc(this.aiText)}</textarea>
        <button class="btn-primary" onclick="JingXin.Checkin.runAiScan()" style="width:100%;margin-top:12px" ${!this.aiText||this.aiLoading?'disabled':''}>${this.aiLoading ? '⏳ AI 分析中...' : '🔍 分析情绪'}</button>
        <button class="btn-ghost" onclick="JingXin.Checkin.aiResult=null;JingXin.Checkin.aiText='';JingXin.Checkin.step='mood';JingXin.Checkin.render()" style="width:100%;margin-top:4px">← 返回</button>
      </div>`;
  },

  async runAiScan() {
    if (!this.aiText.trim()) return;
    this.aiLoading = true; this.render();
    const apiKey = localStorage.getItem('ds_api_key');

    try {
      if (apiKey) {
        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
          body: JSON.stringify({
            model: 'deepseek-chat', max_tokens: 250, temperature: 0.7,
            messages: [
              { role: 'system', content: '你是情绪分析助手。用户描述一件事，你返回JSON：{"emotions":[{"name":"焦虑","level":7}],"positive":["做得好的地方"],"soothe":"一句安抚话术","suggest":"一个小建议"}。只返回JSON，不要其他文字。' },
              { role: 'user', content: this.aiText }
            ]
          }),
          signal: AbortSignal.timeout(15000)
        });
        const json = await resp.json();
        if (json.choices) {
          try { this.aiResult = JSON.parse(json.choices[0].message.content); } catch(e) {
            this.aiResult = { emotions: [{name:'焦虑',level:6}], positive: ['你愿意把感受写下来'], soothe: '你的感受是真实的，也值得被认真对待。写下来本身就是在照顾自己。', suggest: '试试做几次深呼吸，然后看看情绪标签里有没有符合你感受的' };
          }
        }
      } else {
        // Mock mode
        this._mockAiScan();
      }
    } catch(e) {
      this._mockAiScan();
    }
    this.aiLoading = false; this.render();
  },

  _mockAiScan() {
    var t = this.aiText || '';
    var emotions = [];
    if (/批评|骂|指责|当众|丢脸/.test(t)) emotions.push({name:'委屈',level:7},{name:'愤怒',level:5},{name:'尴尬',level:8});
    if (/焦虑|担心|怕|紧张|不安/.test(t)) emotions.push({name:'焦虑',level:7});
    if (/堵|闷|难受|说不清/.test(t)) emotions.push({name:'难受',level:6});
    if (/没法|做不了|做不到|能力/.test(t)) emotions.push({name:'自我怀疑',level:7});
    if (emotions.length === 0) emotions.push({name:'复杂情绪',level:5});

    this.aiResult = {
      emotions: emotions.slice(0, 4),
      positive: ['你愿意停下来感受自己的情绪，这本身就是一种勇敢','把不舒服的经历写下来，你已经迈出了处理它的第一步'],
      soothe: '被当众批评的确很难受——那种"所有人都在看我"的感觉是真实的。但你的价值不取决于一个人的评价，也不取决于一次事件。',
      suggest: '如果还是觉得心里堵，试试去"梳理"模块做一次CBT五步法，把这件事拆开来看看。'
    };
  },

  _renderAiResult(el) {
    var r = this.aiResult;
    var maxLvl = Math.max.apply(null, (r.emotions||[]).map(function(e){return e.level||5}));
    var peak = (r.emotions||[]).find(function(e){return e.level===maxLvl});
    el.innerHTML = `
      <div class="checkin-step fade-in">
        <p class="step-label" style="font-size:1.1rem;margin-bottom:4px">🤖 AI 看出来了</p>
        <p class="step-hint">从你的描述中识别到的情绪</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">
          ${(r.emotions||[]).map(function(e){return '<span class="emotion-tag selected">'+e.name+' '+e.level+'/10</span>';}).join('')}
        </div>
        ${peak ? '<p style="font-size:0.85rem;color:#D4916A;text-align:center;margin-bottom:8px">最强烈的感受是「'+peak.name+'」</p>' : ''}
        <div class="ai-soothe-card">
          <p style="font-weight:500;color:#5C4A3A;margin-bottom:4px">💛 AI 想对你说</p>
          <p style="font-size:0.9rem;color:#8C7B6A;line-height:1.6">${r.soothe}</p>
        </div>
        ${(r.positive||[]).length>0 ? '<div style="margin-top:8px"><p style="font-size:0.8rem;color:#8FA889">✨ '+(r.positive||[])[0]+'</p></div>' : ''}
        ${r.suggest ? '<p style="font-size:0.85rem;color:#D4916A;margin-top:12px;text-align:center">💡 '+r.suggest+'</p>' : ''}
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn-secondary" style="flex:1" onclick="JingXin.Checkin.aiResult=null;JingXin.Checkin.aiText='';JingXin.Checkin.step='mood';JingXin.Checkin.render()">返回</button>
          <button class="btn-primary" style="flex:1" onclick="JingXin.Checkin._applyAiResult()">就用这些情绪签到</button>
        </div>
      </div>`;
  },

  _applyAiResult() {
    if (this.aiResult && this.aiResult.emotions) {
      var maxLvl = Math.max.apply(null, this.aiResult.emotions.map(function(e){return e.level||5}));
      this.moodLevel = maxLvl;
    }
    this.step = 'note'; this.render();
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
