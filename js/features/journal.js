/* 静心 — 焦虑（快速+分步） */
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

  // === 开心 ===
  _renderHappy(el) {
    const colors = l => '#6CB4A1'; // always green for happy
    el.innerHTML = `
      <div style="display:flex;gap:0;margin-bottom:16px;border-radius:12px;overflow:hidden">
        <div class="journal-tab" style="flex:1;text-align:center;padding:10px;font-size:14px;background:#E8F0F8;color:#8A9AAA;cursor:pointer" onclick="JingXin.Journal.mood='anxiety';JingXin.Journal.render()">😟 焦虑</div>
        <div class="journal-tab" style="flex:1;text-align:center;padding:10px;font-size:14px;background:#5B8DEE;color:#fff;font-weight:600;cursor:pointer" onclick="JingXin.Journal.mood='happy';JingXin.Journal.render()">🌟 开心</div>
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
    const l = this.happyLevel;
    const note = this.worry || '';
    const paragraphs = [];

    // Paragraph 1: Level-based opening
    if (l >= 9) paragraphs.push('哇，超级开心！这种时刻值得被大写加粗地记住。它证明你有感知幸福的能力——即使在焦虑的日子里，快乐依然会来敲门。');
    else if (l >= 7) paragraphs.push('一件让人开心的事被你抓住了。这些小小的快乐就像往"情绪银行"里存钱——存得越多，在需要的时候越有底气。');
    else if (l >= 5) paragraphs.push('一份不错的心情，你注意到了它。也许不算惊天动地，但温暖的感觉是真实的。很多人让这种小确幸溜走，而你把它留住了。');
    else paragraphs.push('即使只是一点点好，也值得记下来。积少成多，这些微小的好就是生活的底色。你注意到了它，这本身就是一种能力。');

    // Paragraph 2: Keyword-specific warm commentary
    if (/买|购物|买到|礼物|送自己|奖励/.test(note)) {
      paragraphs.push('你给自己买了一份礼物——这不只是花钱，这是对自己的认可。很多时候我们舍得为别人花钱，却舍不得为自己。你今天做了一件很重要的事：告诉自己"我值得"。这不是乱花钱，这是自我关怀。');
    } else if (/吃|喝|美食|咖啡|奶茶|蛋糕|火锅/.test(note)) {
      paragraphs.push('美食带来的快乐是最直接、最诚实的。一口好吃的，能让整个下午都不一样。你不是在"放纵"，你是在照顾自己的感官，在用味觉告诉自己：生活里有好东西。');
    } else if (/朋友|同事|家人|妈妈|爸爸|聊天|见面/.test(note)) {
      paragraphs.push('人际关系中的温暖，是最珍贵的快乐来源。有人陪你说话、有人理解你、有人在——这些瞬间是抵抗焦虑最有力的武器。你今天感受到了连接，这是人类最基本也最深刻的需要。');
    } else if (/天气|阳光|晴天|下雨|彩虹|日落/.test(note)) {
      paragraphs.push('你能注意到天气的变化、自然的美好，说明你的心没有完全被焦虑占据。你还有空间去感受阳光、去欣赏天空。这个空间就是你的力量，它在扩大。');
    } else if (/猫|狗|宠物|动物|小鸟/.test(note)) {
      paragraphs.push('小动物有一种神奇的能力——它们活在当下，不担心未来，不纠结过去。你和它们在一起的时刻，也在学习这种能力。毛茸茸的治愈力是真实存在的。');
    } else if (/工作|完成|项目|任务|搞定/.test(note)) {
      paragraphs.push('工作中的成就感很重要——你做到了某件事，这证明了你的能力。焦虑常常让我们忘记自己其实很能干，但你刚刚做的事就是证据。记住这种感觉，下次焦虑来的时候拿出来用。');
    } else if (/运动|跑步|散步|健身|瑜伽/.test(note)) {
      paragraphs.push('你动了身体。科学研究一再证明：运动对情绪的改善效果，不亚于药物。你今天选择了照顾自己的身体，身体会回报你的。');
    } else {
      paragraphs.push('生活中的快乐往往藏在小事里——而你有一双能发现它们的眼睛。这双眼睛在焦虑的时候可能会被遮住，但它一直在。今天，它又找到了值得开心的事。');
    }

    // Paragraph 3: Closing - link to overall wellbeing
    const closings = [
      '把这件事记下来是对的。下次焦虑来的时候，回来翻一翻——这些是你的"反焦虑证据"。',
      '你有焦虑，但你也有开心。两个都是真的，两个都值得被记录。这就是完整的人。',
      '今天这件好事不会被焦虑抹掉。它存在过，你感受到了，你记住了。这就是在建造自己的心理免疫力。',
      '每记录一件开心的事，你就在对自己说：我的生活不只有焦虑。这个声音会越来越大的。'
    ];
    paragraphs.push(closings[Math.floor(Math.random() * closings.length)]);

    this._happyAnalysis = paragraphs;
    JingXin.IPC.invoke('gratitude:save', { happiness: this.happyLevel, note: this.worry, category: '生活小事' });
    this.result = true;
    this.render();
  },

  _renderQuick(el) {
    const colors = l => l <= 3 ? '#6CB4A1' : l <= 6 ? '#7CB8E8' : l <= 8 ? '#6B7ED8' : '#7B5EA7';
    el.innerHTML = `
      <div style="display:flex;gap:0;margin-bottom:16px;border-radius:12px;overflow:hidden">
        <div class="journal-tab" style="flex:1;text-align:center;padding:10px;font-size:14px;background:#5B8DEE;color:#fff;font-weight:600;cursor:pointer">😟 焦虑</div>
        <div class="journal-tab" style="flex:1;text-align:center;padding:10px;font-size:14px;background:#E8F0F8;color:#8A9AAA;cursor:pointer" onclick="JingXin.Journal.mood='happy';JingXin.Journal.render()">🌟 开心</div>
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
    const l = this.level;
    const note = this.worry || '';
    const paragraphs = [];

    // Level-based analysis
    if (l <= 3) {
      paragraphs.push('你的焦虑程度很低。这会让你有足够清晰的头脑来看待这件事——把它摊开来看看，它可能没有你最初感觉的那么大。');
    } else if (l <= 5) {
      paragraphs.push('轻度到中度的焦虑。这个水平其实最有价值——够强让你重视，又没强到让你无法思考。你现在写下来的东西，是你了解自己的宝贵线索。');
    } else if (l <= 7) {
      paragraphs.push('焦虑感比较明显了。你身体可能已经有了反应——心跳快一点、呼吸浅一点。但你把这些感受写下来了，而不是让它们在里面打转。写出来这个动作本身，已经在帮你的神经系统降温。');
    } else {
      paragraphs.push('焦虑程度比较高。但你看——你在这里，在试着理清它，而不是被它推着去做什么冲动的决定。在情绪风暴中能做到这一点，是非常了不起的事。');
    }

    // Keyword analysis
    if (/工作|老板|领导|同事|加班/.test(note)) {
      paragraphs.push('这件事和工作有关。工作焦虑常常和"自我价值感"绑在一起——好像一次失误就否定了全部。但工作是你做的事，不是你这个人。你的价值远大于一份工作。');
    } else if (/关系|朋友|家人|伴侣|对象/.test(note)) {
      paragraphs.push('这件事涉及人际关系。在乎才会焦虑——这说明你对这段关系是认真的。但焦虑不能帮你更好地沟通。等情绪稍平复后，用"我感受..."的方式去表达，对方更容易听到。');
    } else if (/身体|健康|病|疼/.test(note)) {
      paragraphs.push('身体和情绪是连在一起的。焦虑会让身体更紧张，身体的紧张又加重焦虑。先照顾身体——深呼吸、喝杯水、站起来走走。让身体先松动，情绪会跟着调整。');
    }

    // What you did right
    paragraphs.push('你把担心的事写下来了。在纸上，它看起来比在脑子里小。这是因为脑子里的焦虑没有边界——写下来就有了。这是你帮自己的第一步，也是最关键的一步。');

    this._anxietyAnalysis = paragraphs;
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
    let analysisHtml = '';
    const analysisArr = isHappy ? this._happyAnalysis : this._anxietyAnalysis;
    if (Array.isArray(analysisArr)) {
      analysisHtml = analysisArr.map((p, i) =>
        `<p style="margin-bottom:12px;line-height:1.7;${i===0?'font-weight:500;':''}">${p}</p>`
      ).join('');
    } else {
      analysisHtml = '<p>已经替你记下了。今天到这里也可以。</p>';
    }

    el.innerHTML = `
      <div style="padding:8px 0">
        <div style="text-align:center;margin-bottom:16px">
          <span style="font-size:56px;display:block">${isHappy ? '🌟' : '🌱'}</span>
          <p style="font-size:18px;font-weight:600;margin:8px 0">${isHappy ? '开心的事值得被记住' : '写下来，就在帮自己了'}</p>
        </div>
        <div class="analysis-rich" style="background:#F8FAFD;border-radius:16px;padding:16px 20px;margin-bottom:16px;font-size:14px;color:#5A6B7D;line-height:1.7">
          ${analysisHtml}
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-primary" style="flex:1" onclick="JingXin.Journal.reset()">再写一次</button>
          <button class="btn-secondary" style="flex:1" onclick="JingXin.Journal.mood='${isHappy ? 'anxiety' : 'happy'}';JingXin.Journal.reset();JingXin.Journal.render()">${isHappy ? '😟 焦虑' : '🌟 开心'}</button>
        </div>
      </div>`;
  },

  reset() { this.result = false; this.worry = ''; this.level = 5; this.gStep = 1; this.gFact = ''; this.gFear = ''; this.gProbability = ''; this.gAction = ''; this.gUncontrol = ''; this.render(); },
  esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
};
