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
    JingXin.IPC.invoke('anxiety:save', {
      worry: `【决定】${this.goal}\n【情绪】${this.emotion}\n【现实】${this.reality}\n【立刻做-短期】${this.pros.shortDo}\n【立刻做-长期】${this.pros.longDo}\n【不做-短期】${this.pros.shortWait}\n【不做-长期】${this.pros.longWait}`,
      anxietyLevel: 5, emotions: []
    });

    const p = this.pros;
    const doLen = (p.shortDo + p.longDo).length;
    const waitLen = (p.shortWait + p.longWait).length;
    const allFilled = p.shortDo && p.longDo && p.shortWait && p.longWait;

    // Build rich analysis sections
    const sections = [];

    // Section 1: Emotional vs Reality
    if (this.emotion) {
      sections.push({
        title: '💗 情绪在说什么',
        text: `你感受到了："${this.emotion.substring(0, 80)}"。这些情绪是真实的——它们不是你需要压抑的东西，而是需要被看见的信号。焦虑常常伪装成"紧迫感"，让你觉得"不立刻做就来不及了"。但真正的紧急决定很少，大多数事可以等一等。`
      });
    }
    if (this.reality) {
      sections.push({
        title: '🔒 现实在说什么',
        text: `你看到了现实："${this.reality.substring(0, 80)}"。这些是客观存在的约束——不因为你焦虑而改变，也不因为你忽略而消失。看清它们之后，你的决定就有了边界。在边界内做选择，比在迷雾中冲撞要安全得多。`
      });
    }

    // Section 2: Compare the four quadrants
    if (allFilled) {
      let comparison = '';
      const doSummary = [];
      if (p.shortDo) doSummary.push(`短期来看：${p.shortDo.substring(0, 60)}`);
      if (p.longDo) doSummary.push(`长期来看：${p.longDo.substring(0, 60)}`);
      const waitSummary = [];
      if (p.shortWait) waitSummary.push(`短期来看：${p.shortWait.substring(0, 60)}`);
      if (p.longWait) waitSummary.push(`长期来看：${p.longWait.substring(0, 60)}`);

      comparison += `【如果立刻做】${doSummary.join('；')}。【如果暂时不做】${waitSummary.join('；')}。`;

      if (doLen > waitLen * 1.5) {
        comparison += `\n\n你花了更多文字描述"立刻做"——这个方向可能让你更有表达欲。但表达欲不一定是正确信号，有时候我们对"立刻做"想得多，只是因为它的短期感受更强烈。试着把"暂时不做"理解为一种主动选择而非被动拖延，你会发现它也有它的力量。`;
      } else if (waitLen > doLen * 1.5) {
        comparison += `\n\n你花了更多文字描述"暂时不做"——也许你的直觉已经在告诉你答案。有时候，不做决定本身就是一个成熟的决策。给自己时间、让更多信息浮现，往往比匆忙做决定更明智。`;
      } else {
        comparison += `\n\n你对两个方向的思考量大致相当——这说明你真的在认真地权衡。没有明显倾向不等于犹豫不决，有时候需要的就是再多一点信息、再多一点时间。`;
      }

      sections.push({ title: '⚖️ 利弊对比', text: comparison });
    }

    // Section 3: General advice
    if (this.emotion && /焦虑|急|来不及|担心|害怕|后悔|压力/.test(this.emotion)) {
      sections.push({
        title: '🧠 焦虑在给你的错觉',
        text: '你的描述中出现了焦虑相关的词。焦虑会制造一种"假性紧迫感"——让你觉得必须马上做决定，不做就来不及了。但研究表明，人在焦虑状态下做决定，后悔率比冷静状态下高出约40%。焦虑不是你的敌人，但它不适合做决策顾问。先让情绪降下来，你的判断力会回来。'
      });
    }

    sections.push({
      title: '🌱 给你的建议',
      text: '你已经完成了很多人做不到的事：在冲动和焦虑中停下来，认真地梳理了自己的感受和思考。无论最终你选择什么——立刻做，还是再等等——这个梳理的过程本身就在保护你。先暂缓7天。7天后，打开"月度报告"看看这段时间的情绪波动，再看看这个决定——到那时候，你会比现在更清楚。'
    });

    const sectionsHtml = sections.map(s => `
      <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px dashed rgba(0,0,0,0.06)">
        <p style="font-weight:600;font-size:0.9rem;color:#D4916A;margin-bottom:6px">${s.title}</p>
        <p style="font-size:0.9rem;color:#8C7B6A;line-height:1.7;white-space:pre-wrap">${s.text}</p>
      </div>
    `).join('');

    el.innerHTML = `
      <div class="cbt-done fade-in">
        <p style="text-align:center;font-size:1.5rem;margin-bottom:4px">🧘</p>
        <p class="cbt-page-title">梳理完成</p>
        <p style="text-align:center;font-size:0.85rem;color:#B5A595;margin-bottom:16px">关于「${this.esc(this.goal.substring(0, 40))}」的思考</p>

        <div class="analysis-rich" style="background:#FFFBF8;border-radius:16px;padding:16px 20px;margin-bottom:12px;text-align:left">
          ${sectionsHtml}
        </div>

        <div class="decision-advice">
          <p style="font-weight:600">💡 建议先暂缓7天再下定论</p>
          <p style="font-size:0.85rem;color:#8C7B6A">持续记录情绪观察变化</p>
        </div>
        <button class="btn-primary" onclick="JingXin.Decision.exit()" style="width:100%;margin-top:12px">保存本次梳理记录</button>
      </div>`;
  },

  exit() { this.step = 0; this.goal = ''; this.emotion = ''; this.reality = ''; this.pros = { shortDo:'', longDo:'', shortWait:'', longWait:'' }; this.render(); },
  esc(s) { const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
};
