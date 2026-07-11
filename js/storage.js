/* ============================================
   静心 — Data Storage Layer (Web Version)
   Replaces IPC + electron-store with localStorage
   Also includes: quotes library, default settings,
   and notification scheduler
   ============================================ */

window.JingXin = window.JingXin || {};

// ============================================================
// Quotes Library (52 entries, inlined from quotes.js)
// ============================================================
const QUOTES = [
  { text: '你不需要完美，你只需要真实。', author: '佚名' },
  { text: '每一次呼吸，都是新的开始。', author: '一行禅师' },
  { text: '焦虑只是你身体里的一阵风，让它吹过去。', author: '佚名' },
  { text: '你已经做得很好了，不必事事完美。', author: '佚名' },
  { text: '允许自己休息，这不叫懒惰。', author: '佚名' },
  { text: '你值得被温柔对待，尤其是被自己。', author: '佚名' },
  { text: '此刻，就是你唯一需要关心的时刻。', author: '佚名' },
  { text: '放下手机，看看窗外的天空。', author: '佚名' },
  { text: '你不是你的想法，你是观察想法的人。', author: '一行禅师' },
  { text: '感受你的呼吸，感受你的存在。', author: '佚名' },
  { text: '慢慢来，比较快。', author: '佚名' },
  { text: '今天有什么让你感到感恩的？', author: '佚名' },
  { text: '身体在这里，心也在这里。', author: '佚名' },
  { text: '一切都会过去，包括现在的焦虑。', author: '佚名' },
  { text: '你已经足够完整。', author: '佚名' },
  { text: '深呼吸，让肩膀下沉。', author: '佚名' },
  { text: '没有一朵花会为明天忧虑。', author: '佚名' },
  { text: '软弱不是失败，它只是人类的一部分。', author: '佚名' },
  { text: '活在当下，这个词很美，因为它就是答案。', author: '佚名' },
  { text: '只有放下，才能提起。', author: '禅语' },
  { text: '心若计较，处处是怨言；心若放宽，时时是晴天。', author: '佚名' },
  { text: '人生最大的修养是包容。', author: '佚名' },
  { text: '不要为明天忧虑，明天自有明天的忧虑。', author: '圣经' },
  { text: '世界以痛吻我，要我报之以歌。', author: '泰戈尔' },
  { text: '你比你想象的更勇敢，比你看起来更坚强。', author: '佚名' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
  { text: '当我们真正接纳自己的时候，改变就开始了。', author: '卡尔·罗杰斯' },
  { text: '不是路到了尽头，而是该转弯了。', author: '佚名' },
  { text: '即使在冬天，你的内心也有一个不可战胜的夏天。', author: '加缪' },
  { text: '幸福不是拥有你想要的，而是珍惜你已经拥有的。', author: '佚名' },
  { text: '善待自己，是每个人最重要的功课。', author: '佚名' },
  { text: '平静不是没有波浪，而是知道如何在浪中保持平衡。', author: '佚名' },
  { text: '水滴石穿，不是力量大，而是功夫深。', author: '佚名' },
  { text: '昨日已去，明日未来，今日即是礼物。', author: '佚名' },
  { text: '你关注什么，什么就会成长。关注平静，平静就成长。', author: '佚名' },
  { text: '焦虑是迷雾，但你是山。', author: '佚名' },
  { text: '一生很短，善待自己。', author: '佚名' },
  { text: '最大的勇气是在风暴中依然能保持内心的宁静。', author: '佚名' },
  { text: '做自己最好的朋友，而不是最苛刻的批评者。', author: '佚名' },
  { text: '静水深流，人亦如此。', author: '佚名' },
  { text: '忙中有序，心静如水。', author: '佚名' },
  { text: '一花一世界，一叶一菩提。', author: '禅语' },
  { text: '心中若有桃花源，何处不是水云间。', author: '佚名' },
  { text: '生命中最美好的事情，都是免费的。', author: '佚名' },
  { text: '与自己的不完美和解。', author: '佚名' },
  { text: '没有一个冬天不能逾越，没有一个春天不会到来。', author: '佚名' },
  { text: '治愈自己的第一步，是承认自己需要治愈。', author: '佚名' },
  { text: '脆弱不是弱点，它是你仍然在乎的证明。', author: '佚名' },
  { text: '不要害怕走得慢，只要不停下脚步。', author: '佚名' },
  { text: '万般烦恼，皆因心动。心若不动，万事从容。', author: '佚名' },
  { text: '你没法让每个人高兴，但你可以让自己平静。', author: '佚名' },
  { text: '深呼吸。所有问题，都等这口气呼出去再说。', author: '佚名' },
  { text: '先照顾好自己，再照顾世界。', author: '佚名' },
];

// ============================================================
// Default Settings
// ============================================================
const DEFAULT_SETTINGS = {
  reminders: {
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
  },
  breathing: {
    defaultMode: '478',
    defaultDurationMinutes: 3
  }
};

// ============================================================
// Storage Engine (replaces IPC.invoke)
// ============================================================
JingXin.Storage = {
  // --- localStorage helpers ---
  _get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  },

  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('localStorage full or unavailable:', e.message);
    }
  },

  _genId(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
  },

  /**
   * Same interface as JingXin.IPC.invoke(channel, ...args)
   * so all 5 feature modules work without changes.
   */
  async invoke(channel, ...args) {
    switch (channel) {

      // --- Brain Dump ---
      case 'brain-dump:get-all':
        return this._get('jingxin-brain-dump', []);

      case 'brain-dump:save': {
        const entry = args[0] || {};
        const dumps = this._get('jingxin-brain-dump', []);
        const now = new Date().toISOString();
        if (entry.id) {
          const idx = dumps.findIndex(d => d.id === entry.id);
          if (idx >= 0) {
            dumps[idx].content = entry.content;
            dumps[idx].updatedAt = now;
          }
        } else {
          const newEntry = {
            id: this._genId('dump'),
            content: entry.content || '',
            createdAt: now,
            updatedAt: now
          };
          dumps.unshift(newEntry);
          this._set('jingxin-brain-dump', dumps);
          return newEntry;
        }
        this._set('jingxin-brain-dump', dumps);
        return dumps.find(d => d.id === entry.id);
      }

      case 'brain-dump:delete': {
        const { id } = args[0] || {};
        const dumps = this._get('jingxin-brain-dump', []).filter(d => d.id !== id);
        this._set('jingxin-brain-dump', dumps);
        return;
      }

      // --- Anxiety Journal ---
      case 'anxiety:get-all':
        return this._get('jingxin-anxiety', []);

      case 'anxiety:save': {
        const entry = args[0] || {};
        const entries = this._get('jingxin-anxiety', []);
        const newEntry = {
          id: this._genId('anx'),
          worry: entry.worry || '',
          anxietyLevel: entry.anxietyLevel || 5,
          emotions: entry.emotions || [],
          evidence: {
            forThought: (entry.evidence && entry.evidence.forThought) || '',
            againstThought: (entry.evidence && entry.evidence.againstThought) || '',
            alternatives: (entry.evidence && entry.evidence.alternatives) || '',
            factVsFeeling: (entry.evidence && entry.evidence.factVsFeeling) || '',
            observerView: (entry.evidence && entry.evidence.observerView) || ''
          },
          reframe: {
            balancedThought: (entry.reframe && entry.reframe.balancedThought) || '',
            actionPlan: (entry.reframe && entry.reframe.actionPlan) || '',
            growthInsight: (entry.reframe && entry.reframe.growthInsight) || '',
            futureSelf: (entry.reframe && entry.reframe.futureSelf) || '',
            friendAdvice: (entry.reframe && entry.reframe.friendAdvice) || '',
            aiAnalysis: (entry.reframe && entry.reframe.aiAnalysis) || (entry.aiAnalysis) || ''
          },
          distortions: entry.distortions || [],
          selfNote: entry.selfNote || '',
          createdAt: new Date().toISOString()
        };
        entries.unshift(newEntry);
        this._set('jingxin-anxiety', entries);
        return newEntry;
      }

      case 'anxiety:delete': {
        const { id } = args[0] || {};
        const entries = this._get('jingxin-anxiety', []).filter(e => e.id !== id);
        this._set('jingxin-anxiety', entries);
        return;
      }

      // --- Gratitude ---
      case 'gratitude:get-all':
        return this._get('jingxin-gratitude', []);

      case 'gratitude:save': {
        const g = args[0] || {};
        const entries = this._get('jingxin-gratitude', []);
        const newEntry = {
          id: this._genId('grat'),
          happiness: g.happiness || 7,
          note: g.note || '',
          category: g.category || '生活小事',
          createdAt: g.createdAt || new Date().toISOString()
        };
        entries.unshift(newEntry);
        this._set('jingxin-gratitude', entries);
        return newEntry;
      }

      // --- Daily Sentence ---
      case 'daily:get-all':
        return this._get('jingxin-daily', {});

      case 'daily:get-by-date': {
        const { date } = args[0] || {};
        const sentences = this._get('jingxin-daily', {});
        return sentences[date] || null;
      }

      case 'daily:save': {
        const entry = args[0] || {};
        const sentences = this._get('jingxin-daily', {});
        sentences[entry.date] = {
          date: entry.date,
          sentence: entry.sentence,
          createdAt: new Date().toISOString()
        };
        this._set('jingxin-daily', sentences);
        return sentences[entry.date];
      }

      // --- Settings ---
      case 'settings:get-all': {
        const saved = this._get('jingxin-settings', {});
        // Deep merge defaults
        return deepMerge(DEFAULT_SETTINGS, saved);
      }

      case 'settings:set': {
        const { key, value } = args[0] || {};
        const settings = this._get('jingxin-settings', {});
        settings[key] = value;
        this._set('jingxin-settings', settings);
        // Restart notification scheduler on reminder changes
        if (key === 'reminders' || key.startsWith('reminders')) {
          JingXin.Notifications.restart();
        }
        return { success: true };
      }

      // --- Quotes ---
      case 'quotes:get-random':
        return QUOTES[Math.floor(Math.random() * QUOTES.length)];

      case 'quotes:get-daily': {
        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        return QUOTES[dayOfYear % QUOTES.length];
      }

      // --- Notifications ---
      case 'notification:send':
        JingXin.Notifications.send(args[0]?.title || '', args[0]?.body || '');
        return { success: true };

      case 'notification:preview':
        JingXin.Notifications.send('正念提醒', args[0]?.message || '');
        return { success: true };

      // --- Tray (no-op in web) ---
      case 'tray:update-tooltip':
        return { success: true };

      default:
        console.warn('[Storage] Unknown channel:', channel);
        return null;
    }
  }
};

// --- Deep merge for settings ---
function deepMerge(defaults, current) {
  const result = {};
  for (const key of Object.keys(defaults)) {
    if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key]) &&
        current[key] && typeof current[key] === 'object' && !Array.isArray(current[key])) {
      result[key] = deepMerge(defaults[key], current[key]);
    } else {
      result[key] = (current[key] !== undefined) ? current[key] : defaults[key];
    }
  }
  // Carry over any extra keys from current
  for (const key of Object.keys(current)) {
    if (!(key in defaults)) result[key] = current[key];
  }
  return result;
}

// ============================================================
// IPC Alias — so features can call JingXin.IPC.invoke()
// without any changes
// ============================================================
JingXin.IPC = {
  invoke: (channel, ...args) => JingXin.Storage.invoke(channel, ...args),
  on: () => () => {}  // no-op for web
};

// ============================================================
// CrossFeature — shared data queries across features
// All features call these instead of raw localStorage reads
// ============================================================
JingXin.CrossFeature = {
  _parseCheckin(c) {
    try { return JSON.parse(c.content); } catch (_) { return null; }
  },

  _todayStr() {
    return new Date().toISOString().split('T')[0];
  },

  /** Returns today's most recent brain-dump checkin, or null */
  getTodayCheckin() {
    const today = this._todayStr();
    const dumps = JingXin.Storage._get('jingxin-brain-dump', []);
    const todayDumps = dumps.filter(d => d.createdAt.startsWith(today));
    if (todayDumps.length === 0) return null;
    const latest = todayDumps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    return this._parseCheckin(latest);
  },

  /** Returns today's gratitude entries */
  getTodayGratitude() {
    const today = this._todayStr();
    const entries = JingXin.Storage._get('jingxin-gratitude', []);
    return entries.filter(e => e.createdAt.startsWith(today));
  },

  /** Returns entries of a given type for the last N days */
  getRecent(type, days) {
    const keyMap = { checkin: 'jingxin-brain-dump', anxiety: 'jingxin-anxiety', gratitude: 'jingxin-gratitude' };
    const key = keyMap[type];
    if (!key) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString();
    const entries = JingXin.Storage._get(key, []);
    if (type === 'checkin') {
      return entries.filter(e => e.createdAt >= cutoffStr).map(e => this._parseCheckin(e)).filter(Boolean);
    }
    return entries.filter(e => e.createdAt >= cutoffStr);
  },

  /** Returns paired daily data for correlation */
  getCorrelationData(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString();

    const anxietyEntries = JingXin.Storage._get('jingxin-anxiety', []).filter(e => e.createdAt >= cutoffStr);
    const gratitudeEntries = JingXin.Storage._get('jingxin-gratitude', []).filter(e => e.createdAt >= cutoffStr);

    // Build date-indexed map
    const map = {};
    for (const e of anxietyEntries) {
      const d = e.createdAt.split('T')[0];
      if (!map[d]) map[d] = { date: d, anxietyLevels: [], happinessLevels: [], gratitudeCount: 0, checkinLevels: [] };
      map[d].anxietyLevels.push(e.anxietyLevel || 5);
    }
    for (const e of gratitudeEntries) {
      const d = e.createdAt.split('T')[0];
      if (!map[d]) map[d] = { date: d, anxietyLevels: [], happinessLevels: [], gratitudeCount: 0, checkinLevels: [] };
      map[d].happinessLevels.push(e.happiness || 7);
      map[d].gratitudeCount++;
    }
    // Also pull checkins
    const checkins = JingXin.Storage._get('jingxin-brain-dump', []).filter(e => e.createdAt >= cutoffStr);
    for (const c of checkins) {
      const d = c.createdAt.split('T')[0];
      const parsed = this._parseCheckin(c);
      if (parsed && parsed.level) {
        if (!map[d]) map[d] = { date: d, anxietyLevels: [], happinessLevels: [], gratitudeCount: 0, checkinLevels: [] };
        map[d].checkinLevels.push(parsed.level);
      }
    }

    return Object.values(map).map(day => ({
      date: day.date,
      anxietyAvg: day.anxietyLevels.length ? (day.anxietyLevels.reduce((a, b) => a + b, 0) / day.anxietyLevels.length).toFixed(1) : null,
      happinessAvg: day.happinessLevels.length ? (day.happinessLevels.reduce((a, b) => a + b, 0) / day.happinessLevels.length).toFixed(1) : null,
      checkinAvg: day.checkinLevels.length ? (day.checkinLevels.reduce((a, b) => a + b, 0) / day.checkinLevels.length).toFixed(1) : null,
      gratitudeCount: day.gratitudeCount,
      anxietyCount: day.anxietyLevels.length,
    })).sort((a, b) => a.date.localeCompare(b.date));
  },

  /** Returns a random past gratitude entry */
  getRandomGratitude() {
    const entries = JingXin.Storage._get('jingxin-gratitude', []);
    if (entries.length === 0) return null;
    return entries[Math.floor(Math.random() * entries.length)];
  },

  /** Returns combined daily mood map for last N days */
  getDailyMoodMap(days = 30) {
    return this.getCorrelationData(days);
  },
};

// ============================================================
// Notification Scheduler (Web Notification API)
// ============================================================
JingXin.Notifications = {
  schedulerTimer: null,
  lastNotificationTime: null,

  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  start() {
    this.stop();
    this._tick(); // run once immediately
    this.schedulerTimer = setInterval(() => this._tick(), 60000);
  },

  stop() {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  },

  restart() {
    this.stop();
    this.start();
  },

  _tick() {
    const settings = JingXin.Storage._get('jingxin-settings', {});
    const r = settings.reminders;
    if (!r || !r.enabled) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const quietStart = timeToMinutes(r.quietHoursStart || '22:00');
    const quietEnd = timeToMinutes(r.quietHoursEnd || '07:00');

    // Check quiet hours (handles wrap-around like 22:00-07:00)
    let inQuiet = false;
    if (quietStart <= quietEnd) {
      inQuiet = currentMinutes >= quietStart && currentMinutes < quietEnd;
    } else {
      inQuiet = currentMinutes >= quietStart || currentMinutes < quietEnd;
    }
    if (inQuiet) return;

    // Check interval
    if (this.lastNotificationTime) {
      const elapsed = (now.getTime() - this.lastNotificationTime.getTime()) / 60000;
      if (elapsed < r.intervalMinutes) return;
    }

    // Send notification
    const messages = r.messages || ['深呼吸，回到当下。'];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    this.send('正念提醒', msg);
  },

  send(title, body) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body, silent: false, icon: '/icon-192.png' });
    }
    this.lastNotificationTime = new Date();
  }
};

function timeToMinutes(timeStr) {
  const [h, m] = (timeStr || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
