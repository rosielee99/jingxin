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

    // Section 3: Anxiety pattern analysis
    if (this.emotion && /焦虑|急|来不及|担心|害怕|后悔|压力/.test(this.emotion)) {
      sections.push({
        title: '🧠 焦虑正在影响你的判断',
        text: '你的描述中出现了焦虑相关的词语。焦虑会做三件事：1）放大短期后果，让你觉得"不立刻做就完蛋了"；2）缩小长期风险，让你忽略"做了之后会怎样"；3）制造假性紧迫感。研究表明，人在焦虑状态下做的决定，事后后悔率比冷静时高出约40%。先让情绪降下来，你的判断力会回来。'
      });
    }

    // Section 4: Rich personalized suggestions
    const suggestions = [];

    // Suggestion based on what they wrote
    if (this.emotion && this.reality) {
      suggestions.push('你已经完成了最困难的一步：把情绪和现实分开。很多人做决定时，情绪和现实是搅在一起的——分不清"我想要"和"我应该"、"我害怕"和"确实有风险"。你把它们分开了，这个动作本身就价值巨大。');
    }

    if (allFilled) {
      if (doLen > waitLen * 1.5) {
        suggestions.push('你对"立刻做"思考得更深入。接下来7天里，试着每天花5分钟想一想"如果不做"——不是永远不做，只是再等等。你会注意到一些之前被忽略的角度。把它们写下来。');
      } else if (waitLen > doLen * 1.5) {
        suggestions.push('你对"不做"想得更多。这也许说明你内心已经有了倾向。接下来7天里，观察一下：当你想到"不做这个决定"时，身体是什么感觉？是放松还是失落？身体的感觉往往比脑子更诚实。');
      } else {
        suggestions.push('你在两个方向上思考很均衡——这说明你还没有被情绪完全推到一个方向。接下来7天，每天记录一下你对这个决定的感觉（1-10分），看看分数是上升还是下降。趋势会告诉你答案。');
      }
    }

    // Keyword-specific suggestions
    if (/工作|辞职|跳槽|离职|创业/.test(this.goal + this.emotion + this.reality)) {
      suggestions.push('这涉及职业选择。一个实用的方法：假设你已经做了决定，想象6个月后的自己——你会在哪里、做什么、感觉如何？这个画面是最诚实的答案。');
    }
    if (/感情|分手|离婚|恋爱|结婚|对象/.test(this.goal + this.emotion + this.reality)) {
      suggestions.push('这涉及感情决定。感情决定有一个特点：它不完全是理性的。给彼此一点空间——有时候距离和时间是最好的判断工具。7天后，你可能会更清楚自己是"舍不得"还是"真的想要"。');
    }
    if (/钱|买|投资|贷款|房租|买房/.test(this.goal + this.emotion + this.reality)) {
      suggestions.push('这涉及财务决定。一个硬性建议：把数字算清楚。焦虑的人往往会高估或低估实际的金额——因为情绪在篡改数字。拿一张纸，把收入和支出列出来，让数字说话。');
    }

    // Universal 7-day plan
    suggestions.push('在接下来的7天里：每天来"今日心情"签到1次，记录你对这个决定的感受变化。7天后打开"月度报告"，你会看到一条情绪曲线——它会比任何一刻的感受都更接近真相。到时候再回来看看这个决定，你会比现在更清楚。');

    sections.push({
      title: '🌱 给你的具体建议',
      text: suggestions.join('\n\n')
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
