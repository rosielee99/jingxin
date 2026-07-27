/* 静心 — AI 倾诉对话 */
window.JingXin = window.JingXin || {};

JingXin.Chat = {
  messages: [],
  input: '',

  async init() {
    // Welcome message
    if (this.messages.length === 0) {
      this.messages.push({ role: 'ai', text: '你好呀，我是你的情绪伙伴 🌿 今天想聊什么？可以跟我说任何事——焦虑、困惑、开心、或者只是想有人说说话。' });
    }
    this.render();
  },

  render() {
    const el = document.getElementById('chat-body'); if (!el) return;

    const msgsHtml = this.messages.map(m => `
      <div class="chat-msg ${m.role === 'user' ? 'chat-user' : 'chat-ai'}">
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
        ${!localStorage.getItem('ds_api_key') ? '<p style="font-size:11px;color:#B5A595;text-align:center;margin-top:4px">💡 配置 <a href="https://platform.deepseek.com/api_keys" target="_blank" style="color:#E8A87C">DeepSeek API Key</a> 解锁 AI 对话（免费）</p>' : ''}
      </div>`;

    // Scroll to bottom
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

    const apiKey = localStorage.getItem('ds_api_key');
    if (!apiKey) {
      this.messages.push({ role: 'ai', text: '要开启 AI 对话，需要先配置 DeepSeek API Key。\n\n点击下方链接免费获取 → https://platform.deepseek.com/api_keys\n\n获取后在页面底部粘贴 Key 即可开始对话。' });
      this.render();
      return;
    }

    // Show thinking indicator
    this.messages.push({ role: 'ai', text: '...' });
    this.render();

    try {
      // Build conversation context
      const recentMsgs = this.messages.slice(-10).filter(m => m.text !== '...');
      const apiMessages = [
        { role: 'system', content: '你是一个温暖、共情的情绪伙伴。用中文，像朋友聊天。对方的情绪状态可能不太好，请温和地回应。每次回复在100-200字之间。不要教训人，不要给太多建议，先倾听和理解。' },
        ...recentMsgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
      ];

      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({ model: 'deepseek-chat', messages: apiMessages, max_tokens: 400, temperature: 0.9 }),
        signal: AbortSignal.timeout(20000)
      });

      const json = await resp.json();
      // Remove thinking indicator
      this.messages = this.messages.filter(m => m.text !== '...');

      if (json.choices && json.choices[0]) {
        this.messages.push({ role: 'ai', text: json.choices[0].message.content });
      } else {
        this.messages.push({ role: 'ai', text: '抱歉，我现在有点卡住了。能再说一次吗？ 🌱' });
      }
    } catch (e) {
      this.messages = this.messages.filter(m => m.text !== '...');
      this.messages.push({ role: 'ai', text: e.name === 'TimeoutError' ? '我在思考...再问我一次就好 🌿' : '网络不太稳定。不过我一直在这里，随时可以继续聊 💛' });
    }

    this.render();
  }
};
