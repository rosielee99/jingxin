/* 静心 — AI 倾诉对话（深度版） */
window.JingXin = window.JingXin || {};

JingXin.Chat = {
  messages: [],
  input: '',
  emotionState: '', // tracks user's emotional state across conversation

  async init() {
    if (this.messages.length === 0) {
      this.messages.push({ role: 'ai', text: '嗨，我在这儿呢 🌿\n\n你可以跟我说任何事——今天发生了什么、心里在想什么、或者只是想说说话。不用担心说得好不好，这里没有评判，只有倾听。' });
    }
    this.render();
  },

  render() {
    const el = document.getElementById('chat-body'); if (!el) return;

    const msgsHtml = this.messages.map((m, i) => `
      <div class="chat-msg ${m.role === 'user' ? 'chat-user' : 'chat-ai'} fade-in">
        <div class="chat-bubble">${m.text.replace(/\n/g, '<br>')}</div>
      </div>
    `).join('');

    el.innerHTML = `
      <div class="chat-container">
        <div class="chat-messages" id="chat-msgs">${msgsHtml}</div>
        <div class="chat-input-row">
          <textarea id="chat-input" placeholder="说点什么吧..." oninput="JingXin.Chat.input=this.value;this.style.height='auto';this.style.height=this.scrollHeight+'px'" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();JingXin.Chat.send()}" style="min-height:44px;max-height:120px"></textarea>
          <button class="btn-primary chat-send-btn" onclick="JingXin.Chat.send()">发送</button>
        </div>
        ${!localStorage.getItem('ds_api_key') ? '<p style="font-size:11px;color:#B5A595;text-align:center;margin-top:4px">💡 配置 <a href="https://platform.deepseek.com/api_keys" target="_blank" style="color:#E8A87C">DeepSeek API Key</a> 解锁更深入的 AI 对话（免费）</p>' : ''}
      </div>`;

    setTimeout(() => {
      const msgs = document.getElementById('chat-msgs');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }, 100);
  },

  async send() {
    if (!this.input.trim()) return;
    const userText = this.input.trim();
    this.input = '';
    this.messages.push({ role: 'user', text: userText });
    this.render();

    // Update emotion state
    this._detectEmotion(userText);

    const apiKey = localStorage.getItem('ds_api_key');
    if (!apiKey) {
      // Rich mock response
      const reply = this._smartMockReply(userText);
      setTimeout(() => {
        this.messages.push({ role: 'ai', text: reply });
        this.render();
      }, 600 + Math.random() * 800);
      return;
    }

    // Show thinking
    this.messages.push({ role: 'ai', text: '...' });
    this.render();

    try {
      const recentMsgs = this.messages.slice(-12).filter(m => m.text !== '...');
      const apiMessages = [
        { role: 'system', content: `你是一位温暖、专业的心理咨询师风格的陪伴者。你的风格是：
- 先用1-2句话共情和确认对方的感受（"听起来你...""我能感受到你..."）
- 然后问1个开放式问题帮助对方深入探索（不急着给建议）
- 如果对方已经说了很多，可以做一次简短的小结，帮对方梳理
- 语气温暖但不油腻，专业但不冷漠
- 每次回复150-250字
- 如果对方有情绪困扰，先接纳情绪，再引导思考
- 参考CBT、正念、积极心理学的理念，但不要直接提这些术语${this.emotionState ? '\n当前对话中，对方的情绪基调是：' + this.emotionState : ''}` },
        ...recentMsgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
      ];

      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({ model: 'deepseek-chat', messages: apiMessages, max_tokens: 500, temperature: 0.85 }),
        signal: AbortSignal.timeout(20000)
      });

      const json = await resp.json();
      this.messages = this.messages.filter(m => m.text !== '...');
      if (json.choices && json.choices[0]) {
        this.messages.push({ role: 'ai', text: json.choices[0].message.content });
      } else {
        this.messages.push({ role: 'ai', text: '抱歉，信号不太好。能再说一次吗？我在这里 🌱' });
      }
    } catch (e) {
      this.messages = this.messages.filter(m => m.text !== '...');
      const reply = this._smartMockReply(this.messages[this.messages.length - 1]?.text || '');
      this.messages.push({ role: 'ai', text: reply });
    }
    this.render();
  },

  // Smart mock replies based on emotional content
  _smartMockReply(text) {
    if (!text) return '我在听，慢慢说 🌱';

    // Detect what user is talking about
    const hasAnxiety = /焦虑|紧张|担心|害怕|不安|慌/.test(text);
    const hasSad = /难过|哭|伤心|失落|孤独|寂寞|没人/.test(text);
    const hasAnger = /生气|愤怒|气死|火大|讨厌|烦/.test(text);
    const hasWork = /工作|加班|老板|领导|同事|开会|KPI|辞职/.test(text);
    const hasRelationship = /感情|对象|男朋友|女朋友|分手|冷战|吵架/.test(text);
    const hasSelfDoubt = /我不行|能力|差劲|失败|做不到|自卑/.test(text);
    const hasTired = /累|疲惫|没劲|不想动|躺平/.test(text);

    const msgCount = this.messages.filter(m => m.role === 'user').length;

    // First message - acknowledge and ask more
    if (msgCount <= 2) {
      if (hasAnxiety) return '我能感受到你的焦虑。那种"心里悬着"的感觉确实很难受。\n\n愿意跟我说说，具体是什么事让你感到不安吗？有时候把模糊的担心变成具体的事情，它就没那么大了。';
      if (hasSad) return '听起来你现在的心情有些低落。这种时候确实很难熬——谢谢你愿意跟我说。\n\n这种难过的感觉是什么时候开始的？是某件事触发的，还是慢慢累积的？';
      if (hasWork) return '工作上的事确实很容易让人心累——毕竟我们花了那么多时间在上面。\n\n你在工作中最让你感到压力的，是具体的事情，还是某种关系、或者是那种"永远做不完"的感觉？';
      if (hasTired) return '累了就说明你已经撑了很久了。这种感觉不是软弱，是身体在告诉你需要休息。\n\n最近是不是一直在撑着做很多事情？有没有什么是可以暂时放下的？';
      return '我听到了，谢谢你愿意说出来 🌿\n\n你现在最强烈的感受是什么？多说一点，我在听。';
    }

    // Follow-up messages - go deeper
    if (msgCount <= 4) {
      if (hasSelfDoubt) return '你对自己好严格啊。这种感觉我理解——像是有个声音一直在说"你不够好"。\n\n但我注意到一个事实：你在这里，在试着理解自己的感受。这本身就说明你是一个对自己负责任的人。\n\n如果现在让你列举三件你做得很好的事——哪怕很小——你能想到什么？';
      if (hasRelationship && hasAnxiety) return '感情里的焦虑，往往是因为在乎。冷漠的人才不会焦虑呢。\n\n不过有时候我们的大脑会把"不确定"解读成"危险"——对方没回消息，不代表不在乎你；吵架了，不代表关系要结束。\n\n你现在的感受里，哪些是基于事实的，哪些可能是大脑在"脑补"？';
      if (hasAnxiety) return '焦虑有一个特点：它让我们的大脑不断预演最坏的可能。但那些预演的场景，有多少是真的发生了的？\n\n试着做一个很小的练习：把现在最担心的一件事写下来，然后旁边写一句"这件事发生的概率大概是\_\_%"。你可能会发现数字比感觉到的低得多。';
      return '谢谢你继续跟我聊这些。我感觉到你是一个很愿意面对自己内心的人。\n\n如果现在让你用一个词来形容此刻最主要的感觉，会是什么？';
    }

    // Deeper conversation - reflection and insight
    const replies = [
      '跟你聊了这些，我注意到一个模式：你似乎对自己要求很高，但很少给自己肯定。\n\n你知道吗？你在这里、在这个对话里，就说明你是一个愿意成长、愿意面对自己的人。这本身就很了不起。\n\n如果我是你的朋友，我会对你说：你已经做得很好了。',
      '有时候我们以为自己在"解决问题"，其实是在"反复担心"。这两件事看起来很像，但感受完全不同。\n\n解决问题会让你感到"我在做些什么"；反复担心只会让你越来越累。\n\n现在你做的这件事——说出你的感受——其实是一个很好的开始。它帮你从"反复担心"切换到"面对问题"。',
      '我想到一个比喻：情绪就像天气，想法就像天气预报。有时候我们错把"天气预报说有暴雨"当成了"现在已经在下雨了"。\n\n你刚才说的那些担心，有多少是"已经发生了"的，有多少是"可能会发生"的？这个区分很有力量。',
      '你在这个对话里已经说了很多——你知道这本身意味着什么吗？意味着你正在练习一种能力：观察自己的情绪，而不是被情绪推着走。\n\n心理学上把这叫"元认知"——思考自己的思考。每一次你在做这件事，你都在变强一点。',
    ];

    return replies[Math.floor(Math.random() * replies.length)];
  },

  _detectEmotion(text) {
    if (/焦虑|紧张|担心/.test(text)) this.emotionState = '焦虑/担忧';
    else if (/难过|伤心|哭/.test(text)) this.emotionState = '悲伤/低落';
    else if (/生气|愤怒|烦/.test(text)) this.emotionState = '愤怒/不满';
    else if (/开心|高兴|快乐/.test(text)) this.emotionState = '积极/开心';
  }
};
