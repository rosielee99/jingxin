/* ============================================
   静心 — Mindfulness Reminders (Web Version)
   ============================================ */

window.JingXin = window.JingXin || {};

JingXin.Reminders = {
  settings: {},
  elements: {},

  async init() {
    this.cacheElements();
    await this.loadSettings();
    this.renderAll();
    this.attachListeners();
  },

  cacheElements() {
    this.elements = {
      enabled: document.getElementById('reminders-enabled'),
      intervalPills: document.getElementById('interval-pills'),
      quietStart: document.getElementById('quiet-start'),
      quietEnd: document.getElementById('quiet-end'),
      previewBtn: document.getElementById('preview-reminder'),
      messageList: document.getElementById('message-list'),
      addMessageBtn: document.getElementById('add-message-btn')
    };
  },

  async loadSettings() {
    const s = await JingXin.IPC.invoke('settings:get-all');
    this.settings = (s && s.reminders) ? s.reminders : {
      enabled: false,
      intervalMinutes: 30,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      messages: [
        '深呼吸，感受此刻的平静。',
        '你已经做得很好了，不必事事完美。',
        '停下来，问问自己：现在我需要什么？',
        '你值得被温柔对待，尤其是被自己。',
        '当下的力量——感受你的呼吸。',
        '放下手机，看看窗外的天空。',
        '你的感受是真实的，也是暂时的。',
        '记住：你不是你的想法，你是观察想法的人。',
        '此刻，三个深呼吸。来。',
        '你比自己想象的更坚强。',
        '允许自己休息，这不叫懒惰。',
        '今天有什么让你感到感恩的？'
      ]
    };
  },

  renderAll() {
    this.elements.enabled.checked = this.settings.enabled;
    this.elements.intervalPills.querySelectorAll('.pill-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.interval) === this.settings.intervalMinutes);
    });
    this.elements.quietStart.value = this.settings.quietHoursStart || '22:00';
    this.elements.quietEnd.value = this.settings.quietHoursEnd || '07:00';
    this.renderMessageList();
  },

  renderMessageList() {
    const messages = this.settings.messages || [];
    this.elements.messageList.innerHTML = messages.map((msg, i) => `
      <div class="message-item">
        <input type="text" value="${this.escapeHtml(msg)}" data-index="${i}" class="message-input">
        <button class="message-delete-btn" data-index="${i}" title="删除">&times;</button>
      </div>
    `).join('');

    this.elements.messageList.querySelectorAll('.message-input').forEach(input => {
      input.addEventListener('input', () => this.saveMessages());
    });
    this.elements.messageList.querySelectorAll('.message-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        this.settings.messages.splice(idx, 1);
        this.renderMessageList();
        this.saveAll();
      });
    });
  },

  attachListeners() {
    this.elements.enabled.addEventListener('change', () => {
      this.settings.enabled = this.elements.enabled.checked;
      if (this.settings.enabled) {
        JingXin.Notifications.requestPermission();
      }
      this.saveAll();
    });

    this.elements.intervalPills.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.settings.intervalMinutes = parseInt(btn.dataset.interval);
        this.elements.intervalPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.saveAll();
      });
    });

    this.elements.quietStart.addEventListener('change', () => {
      this.settings.quietHoursStart = this.elements.quietStart.value;
      this.saveAll();
    });
    this.elements.quietEnd.addEventListener('change', () => {
      this.settings.quietHoursEnd = this.elements.quietEnd.value;
      this.saveAll();
    });

    this.elements.previewBtn.addEventListener('click', async () => {
      const granted = await JingXin.Notifications.requestPermission();
      if (!granted) {
        alert('需要通知权限才能预览提醒。请在浏览器设置中允许通知。');
        return;
      }
      const messages = this.settings.messages || [];
      if (messages.length > 0) {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        JingXin.Notifications.send('正念提醒', msg);
      }
    });

    this.elements.addMessageBtn.addEventListener('click', () => {
      if (this.settings.messages.length >= 20) return;
      this.settings.messages.push('新提醒语');
      this.renderMessageList();
      this.saveAll();
      const inputs = this.elements.messageList.querySelectorAll('.message-input');
      const lastInput = inputs[inputs.length - 1];
      if (lastInput) { lastInput.focus(); lastInput.select(); }
    });
  },

  saveMessages() {
    const inputs = this.elements.messageList.querySelectorAll('.message-input');
    this.settings.messages = Array.from(inputs).map(inp => inp.value.trim()).filter(v => v);
  },

  async saveAll() {
    this.saveMessages();
    await JingXin.IPC.invoke('settings:set', { key: 'reminders', value: this.settings });
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  onShow() {
    this.loadSettings().then(() => this.renderAll());
  }
};
