/* ============================================
   静心 — Daily Sentence Feature
   ============================================ */

window.JingXin = window.JingXin || {};

JingXin.DailySentence = {
  sentences: {},
  calendarYear: 0,
  calendarMonth: 0,
  selectedDate: null,
  elements: {},

  async init() {
    this.cacheElements();
    this.attachListeners();
    await this.loadSentences();
    await this.loadDailyQuote();
    this.renderDate();
    this.loadToday();
    this.renderStreak();
    this.renderCalendar();
  },

  cacheElements() {
    this.elements = {
      quote: document.getElementById('daily-quote'),
      date: document.getElementById('daily-date'),
      input: document.getElementById('daily-sentence-input'),
      charCount: document.getElementById('daily-char-count'),
      saveBtn: document.getElementById('daily-save-btn'),
      streak: document.getElementById('daily-streak'),
      calendar: document.getElementById('daily-calendar')
    };
  },

  attachListeners() {
    this.elements.input.addEventListener('input', () => {
      this.elements.charCount.textContent = `${this.elements.input.value.length}/150`;
    });

    this.elements.saveBtn.addEventListener('click', () => this.saveToday());
  },

  async loadSentences() {
    this.sentences = await JingXin.IPC.invoke('daily:get-all') || {};
  },

  async loadDailyQuote() {
    const quote = await JingXin.IPC.invoke('quotes:get-daily');
    if (quote) {
      this.elements.quote.innerHTML = `
        "${quote.text}"
        <span class="quote-author">—— ${quote.author}</span>
      `;
    }
  },

  renderDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    this.elements.date.textContent = now.toLocaleDateString('zh-CN', options);
  },

  getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },

  loadToday() {
    const key = this.getTodayKey();
    if (this.sentences[key]) {
      this.elements.input.value = this.sentences[key].sentence;
      this.elements.charCount.textContent = `${this.sentences[key].sentence.length}/150`;
    } else {
      this.elements.input.value = '';
      this.elements.charCount.textContent = '0/150';
    }
  },

  async saveToday() {
    const sentence = this.elements.input.value.trim();
    if (!sentence) return;

    const key = this.getTodayKey();
    await JingXin.IPC.invoke('daily:save', { date: key, sentence });
    await this.loadSentences();
    this.renderStreak();
    this.renderCalendar();

    // Brief feedback
    this.elements.saveBtn.textContent = '已保存 ✓';
    this.elements.saveBtn.style.background = 'var(--color-green)';
    setTimeout(() => {
      this.elements.saveBtn.textContent = '保存';
      this.elements.saveBtn.style.background = '';
    }, 1500);
  },

  renderStreak() {
    const streak = this.calculateStreak();
    this.elements.streak.innerHTML = `
      <span class="streak-icon">🔥</span>
      <span>连续 ${streak} 天</span>
    `;
  },

  calculateStreak() {
    let streak = 0;
    const now = new Date();
    // Check today first
    const todayKey = this.getTodayKey();
    if (this.sentences[todayKey]) {
      streak = 1;
    }
    // Walk backwards
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    while (true) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (this.sentences[key]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  // --- Calendar ---

  renderCalendar(year, month) {
    const now = new Date();
    year = year || now.getFullYear();
    month = month !== undefined ? month : now.getMonth(); // 0-indexed

    this.calendarYear = year;
    this.calendarMonth = month;

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let html = `
      <div class="calendar-header">
        <button class="calendar-nav" id="cal-prev">‹</button>
        <span class="calendar-month">${year}年 ${monthNames[month]}</span>
        <button class="calendar-nav" id="cal-next">›</button>
      </div>
      <div class="calendar-weekdays">
        ${weekDays.map(d => `<span>${d}</span>`).join('')}
      </div>
      <div class="calendar-grid">
    `;

    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasEntry = !!this.sentences[key];
      html += `<div class="calendar-day other-month${hasEntry ? ' has-entry' : ''}" data-date="${key}">${d}</div>`;
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasEntry = !!this.sentences[key];
      const isToday = key === todayKey;
      const isSelected = key === this.selectedDate;
      html += `<div class="calendar-day${isToday ? ' today' : ''}${hasEntry ? ' has-entry' : ''}${isSelected ? ' selected' : ''}" data-date="${key}">${d}</div>`;
    }

    // Next month filler
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasEntry = !!this.sentences[key];
      html += `<div class="calendar-day other-month${hasEntry ? ' has-entry' : ''}" data-date="${key}">${d}</div>`;
    }

    html += '</div>';
    html += '<div class="calendar-entry-preview" id="calendar-preview" style="display:none;"></div>';

    this.elements.calendar.innerHTML = html;

    // Navigation
    document.getElementById('cal-prev').addEventListener('click', () => {
      if (month === 0) this.renderCalendar(year - 1, 11);
      else this.renderCalendar(year, month - 1);
    });
    document.getElementById('cal-next').addEventListener('click', () => {
      if (month === 11) this.renderCalendar(year + 1, 0);
      else this.renderCalendar(year, month + 1);
    });

    // Day click
    this.elements.calendar.querySelectorAll('.calendar-day').forEach(day => {
      day.addEventListener('click', () => {
        const dateKey = day.dataset.date;
        this.selectedDate = dateKey;
        this.renderCalendar(this.calendarYear, this.calendarMonth);

        // Show preview
        const preview = document.getElementById('calendar-preview');
        if (preview && this.sentences[dateKey]) {
          preview.style.display = 'block';
          preview.textContent = `"${this.sentences[dateKey].sentence}"`;
        } else if (preview) {
          preview.style.display = 'block';
          preview.textContent = '这天还没有记录';
        }
      });
    });
  },

  onShow() {
    this.loadSentences().then(() => {
      this.loadDailyQuote();
      this.renderDate();
      this.loadToday();
      this.renderStreak();
      this.renderCalendar();
    });
  }
};
