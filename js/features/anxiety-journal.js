/* ============================================
   静心 — CBT Anxiety Journal (5-Step)
   ============================================ */

window.JingXin = window.JingXin || {};

// --- CBT Helper Data ---
const CBT = {
  // Emotion options for Step 2
  emotions: [
    '焦虑', '恐惧', '担忧', '烦躁', '不安',
    '无助', '沮丧', '愤怒', '自责', '疲惫',
    '孤独', '迷茫', '自卑', '紧张', '失落',
    '平静', '开心', '放松', '满足', '感恩',
    '期待', '自信', '充实', '安心', '愉快',
    '温暖', '兴奋', '自豪', '舒适', '好奇'
  ],

  // Evidence prompts for Step 3
  evidencePrompts: [
    '支持这个想法的证据是什么？',
    '反对这个想法的证据是什么？',
    '有没有其他可能的解释？'
  ],

  // Soothing messages by anxiety level (growth-oriented)
  sootheMessages: {
    1: '轻轻的波动。你已经有了觉察，这就是成长的开始。',
    2: '小小的不安。你完全有能力把它变成前行的动力。',
    3: '轻微的焦虑是成长的信号。它在提醒你什么对你重要。',
    4: '这些情绪是你内心深处在乎的东西在说话。听一听，然后往前走。',
    5: '这种不舒服其实是你在突破舒适区。回头看时会感谢现在的自己。',
    6: '你的感受很重要，但它不定义你。每一次面对，你都在变强。',
    7: '真的很难，但你在这里面对它，这本身就证明了你有多勇敢。',
    8: '痛苦是暂时的，而你从中获得的力量是永久的。',
    9: '我知道这很难。但请你相信：你比自己想象的更坚韧，这次经历会让你成长。',
    10: '这是最不舒服的时刻，也是最大的成长机会。你已经迈出了最重要的一步——面对它。'
  },

  // Self-compassion templates based on common themes
  selfNoteTemplates: [
    '我注意到我的焦虑来自于「{worry}」。\n\n经过分析，我发现：\n· 我能控制的：{control}\n· 我不能控制的：我选择放下\n\n最平衡的想法是：{balanced}\n\n我可以做的具体行动：{action}\n\n最后，我想对自己说：{soothe}',
  ],

  // Growth-oriented closing quotes
  closingQuotes: [
    '使你成长的不是焦虑本身，而是你选择面对它的勇气。',
    '每一次不舒服，都是成长的信号。你在变好。',
    '回头看时你会发现：这些经历让你更了解自己。',
    '你不是在逃避，你是在学习。这就是成长。',
    '今天比昨天多了解自己一点，这就是胜利。'
  ],

  // Cognitive distortion patterns for auto-analysis
  distortionPatterns: [
    { name: '灾难化', icon: '🌪️', desc: '把事情的后果想得比实际情况严重得多', explain: '你的大脑正在放大最坏的可能性。试着问自己：最坏情况真的会发生吗？概率有多大？', rules: [/完蛋|毁了|完了|无法承受|活不下去|最可怕|极其严重/] },
    { name: '读心术', icon: '🔮', desc: '假设自己知道别人在想什么（通常是负面的）', explain: '你无法真正知道别人心里怎么想。与其猜测，不如直接沟通，或者接受"不确定"本身。', rules: [/TA.{0,3}(一定|肯定|绝对|必然|就是)/, /(觉得我|认为我|看我|讨厌我|嫌弃我|笑话我)/] },
    { name: '非黑即白', icon: '⚫⚪', desc: '把事情看成非好即坏，没有中间地带', explain: '现实世界大多数事情在灰色地带。不完美≠失败，有缺点≠不够好。', rules: [/必须|绝对要|否则就|要么.*要么|不.*就/] },
    { name: '过度概括', icon: '🔁', desc: '从单一事件得出广泛结论', explain: '一次不代表永远，一件事不代表全部。试着限定在具体情境中看问题。', rules: [/总是|从来不|每次|从来没|回回|一辈子/] },
    { name: '情绪推理', icon: '💭', desc: '把感受当作事实："我感觉不好，所以事情一定很糟"', explain: '感受不等于事实。焦虑是一种情绪，不是对现实的准确判断。', rules: [/我感觉.{0,5}(所以|一定|肯定)|我害怕.{0,5}所以|我焦虑.{0,5}所以/] },
    { name: '个人化', icon: '🎯', desc: '把所有责任都归咎于自己', explain: '很多事情不是单方面的。试着分清你的责任和别人的责任，把不属于你的那部分还回去。', rules: [/都是我|怪我|是我的错|我不够|我不配|我太差/] },
    { name: '负面过滤', icon: '🔍', desc: '只看到负面信息，忽略积极因素', explain: '你的注意力被焦虑劫持了。试着刻意找出三个积极的信号或可能。', rules: [/只看到|全都是坏的|一点好的都没有|完全没有|什么都没有/] }
  ]
};

// Cognitive distortion analyzer
function analyzeDistortions(text) {
  if (!text || text.length < 5) return [];
  const found = [];
  for (const p of CBT.distortionPatterns) {
    let matched = false;
    for (const rule of p.rules) {
      if (rule.test(text)) { matched = true; break; }
    }
    if (matched) found.push(p);
  }
  return found;
}

JingXin.AnxietyJournal = {
  entries: [],
  mode: 'choose',          // 'choose' | 'quick' | 'cbt'
  currentStep: 1,
  totalSteps: 5,

  // Quick relief data
  quickData: {
    anxietyLevel: 5,
    emotions: [],
    worry: '',
    aiResult: '',
    _distortions: [],
    _reRatedLevel: 0   // 0 = not re-rated yet
  },

  formData: {
    worry: '',
    anxietyLevel: 5,
    emotions: [],
    evidence: { forThought: '', againstThought: '', alternatives: '', factVsFeeling: '', observerView: '' },
    reframe: { balancedThought: '', actionPlan: '', growthInsight: '', futureSelf: '', friendAdvice: '', aiAnalysis: '' },
    _selfNote: '',
    _distortions: []
  },

  elements: {},

  async init() {
    this.generateStepIndicators();
    this.cacheElements();
    this.attachListeners();
    await this.loadEntries();
    // 直接进入快速输入，不用选
    this.startQuickRelief();
  },

  generateStepIndicators() {
    const container = document.getElementById('anxiety-steps');
    if (!container) return;
    let html = '';
    for (let i = 1; i <= this.totalSteps; i++) {
      html += `<div class="step" data-step="${i}"><span>${i}</span></div>`;
      if (i < this.totalSteps) html += '<div class="step-line"></div>';
    }
    container.innerHTML = html;
  },

  cacheElements() {
    this.elements = {
      stepContent: document.getElementById('anxiety-step-content'),
      stepNav: document.getElementById('anxiety-step-nav'),
      stepIndicators: document.querySelectorAll('#anxiety-steps .step'),
      historyToggle: document.getElementById('anxiety-history-toggle'),
      historyList: document.getElementById('anxiety-history-list')
    };
  },

  attachListeners() {
    this.elements.historyToggle.addEventListener('click', () => {
      this.elements.historyToggle.classList.toggle('open');
      this.elements.historyList.classList.toggle('open');
    });
  },

  // ==========================================
  // Mode Selection (入口页)
  // ==========================================

  showModeSelection() {
    this.mode = 'choose';
    // Hide step indicators and nav
    document.getElementById('anxiety-steps').style.display = 'none';
    this.elements.stepNav.innerHTML = '';

    this.elements.stepContent.innerHTML = `
      <div class="mode-choose-container fade-in">
        <div class="mode-choose-header">
          <h2 style="font-family:var(--font-serif);font-size:var(--font-size-xl);margin-bottom:4px">今天感觉怎么样？</h2>
          <p class="text-muted">选一个入口，我会陪着你</p>
        </div>

        <!-- Quick Relief Card -->
        <div class="mode-card mode-card-quick" id="mode-quick">
          <div class="mode-card-badge">🆘 焦虑峰值首选</div>
          <div class="mode-card-icon">🌊</div>
          <h3 class="mode-card-title">快速缓解</h3>
          <p class="mode-card-desc">只填情绪强度 + 简单说说发生了什么<br>AI 马上帮你分析，给出即时安抚</p>
          <div class="mode-card-steps">
            <span>🔢 打分</span><span class="mode-arrow">→</span>
            <span>🏷️ 情绪</span><span class="mode-arrow">→</span>
            <span>🤖 AI 分析</span>
          </div>
          <p class="mode-card-hint">约 1 分钟 · 适合焦虑峰值时使用</p>
        </div>

        <!-- Deep CBT Card -->
        <div class="mode-card mode-card-cbt" id="mode-cbt">
          <div class="mode-card-badge">📝 深度梳理</div>
          <div class="mode-card-icon">🧘</div>
          <h3 class="mode-card-title">CBT 深度日记</h3>
          <p class="mode-card-desc">完整的 5 步认知行为疗法引导<br>适合平静时有精力深入探索</p>
          <div class="mode-card-steps">
            <span>💭 想法</span><span class="mode-arrow">→</span>
            <span>🔍 分析</span><span class="mode-arrow">→</span>
            <span>🪞 重构</span><span class="mode-arrow">→</span>
            <span>💌 内化</span>
          </div>
          <p class="mode-card-hint">约 10-15 分钟 · 适合有精力时深度探索</p>
        </div>
      </div>
    `;

    document.getElementById('mode-quick').addEventListener('click', () => this.startQuickRelief());
    document.getElementById('mode-cbt').addEventListener('click', () => this.startCBT());

    // Show history below
    this.elements.historyToggle.style.display = '';
  },

  startQuickRelief() {
    this.mode = 'quick';
    this.quickData = { anxietyLevel: 5, emotions: [], worry: '', aiResult: '' };
    document.getElementById('anxiety-steps').style.display = 'none';
    this.renderQuickInput();
  },

  startCBT() {
    this.mode = 'cbt';
    this.currentStep = 1;
    document.getElementById('anxiety-steps').style.display = 'flex';
    this.resetForm();
    this.renderStep();
  },

  // ==========================================
  // Quick Relief Mode (快速缓解)
  // ==========================================

  renderQuickInput() {
    const q = this.quickData;
    // Try to get last check-in from Tab 1 (brain-dump storage)
    let lastCheckin = null;
    try {
      const raw = localStorage.getItem('jingxin-brain-dump');
      if (raw) {
        const dumps = JSON.parse(raw);
        if (dumps.length > 0) {
          const latest = dumps[0];
          const age = Date.now() - new Date(latest.createdAt).getTime();
          if (age < 30 * 60 * 1000) { // within 30 min
            lastCheckin = JSON.parse(latest.content);
          }
        }
      }
    } catch (_) {}

    this.elements.stepContent.innerHTML = `
      <div class="quick-container fade-in">
        <div class="quick-header">
          <h3>发生了什么？</h3>
          <p class="cbt-explain">写下让你焦虑的事情或想法，然后帮你分析</p>
        </div>

        ${lastCheckin ? `
        <div class="cbt-card" style="background:var(--color-bg-secondary);text-align:center;padding:var(--space-sm)">
          <p style="font-size:12px;color:var(--color-text-muted);margin-bottom:4px">📌 刚才签到的状态</p>
          <span class="badge" style="background:${this.getLevelColor(lastCheckin.level || 5)}20;color:${this.getLevelColor(lastCheckin.level || 5)}">焦虑 ${lastCheckin.level}/10</span>
          ${(lastCheckin.emotions || []).slice(0,3).map(e => `<span class="mini-tag">${e}</span>`).join(' ')}
        </div>
        ` : ''}

        <!-- What happened -->
        <div class="cbt-card">
          <textarea id="quick-worry" placeholder="比如：刚才开会时心跳很快，感觉喘不过气...&#10;比如：TA 一直没回复我，是不是我哪里做错了...&#10;&#10;想到什么写什么，这里很安全。">${this.escapeHtml(q.worry)}</textarea>
        </div>

        <!-- Anxiety level (compact) -->
        <div class="cbt-card" style="padding:var(--space-sm) var(--space-md)">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:13px;color:var(--color-text-secondary)">焦虑程度</span>
            <span style="font-weight:600;color:${this.getLevelColor(q.anxietyLevel)};font-size:18px">${q.anxietyLevel}/10</span>
          </div>
          <input type="range" min="1" max="10" value="${q.anxietyLevel}" class="anxiety-slider" id="quick-slider" style="margin-top:4px">
        </div>

        <!-- Action -->
        <div class="quick-actions">
          <button class="btn-primary quick-ai-btn" id="quick-ai-btn" type="button"
                  onclick="JingXin.AnxietyJournal.analyzeQuick()">
            🌿 帮我分析
          </button>
          <p class="cbt-hint" style="text-align:center">零配置，立刻出结论</p>
        </div>

        <!-- Deep CBT link -->
        <div style="text-align:center;margin-top:var(--space-lg)">
          <button class="btn-ghost" onclick="JingXin.AnxietyJournal.startCBT()" style="color:var(--color-text-muted);font-size:12px">
            📝 需要深度梳理？CBT 5步法 →
          </button>
        </div>

        <!-- Trend Dashboard -->
        <div id="trend-dashboard-container">
          ${this._renderTrendDashboard()}
        </div>

        <!-- History -->
        <div class="anxiety-history" style="margin-top:var(--space-xl)">
          <button class="history-toggle btn-ghost" id="anxiety-history-toggle">
            历史记录 <span class="toggle-arrow">▾</span>
          </button>
          <div class="history-list" id="anxiety-history-list"></div>
        </div>
      </div>
    `;

    // Slider
    document.getElementById('quick-slider').addEventListener('input', (e) => {
      this.quickData.anxietyLevel = parseInt(e.target.value);
    });

    // Worry text
    document.getElementById('quick-worry').addEventListener('input', (e) => {
      this.quickData.worry = e.target.value;
    });

    // Re-attach history toggle
    const histToggle = document.getElementById('anxiety-history-toggle');
    if (histToggle) histToggle.addEventListener('click', () => {
      histToggle.classList.toggle('open');
      document.getElementById('anxiety-history-list').classList.toggle('open');
    });
  },

  // ==========================================
  // Quick Relief Analysis (本地优先，AI可选)
  // ==========================================

  // Rich advice pools — many variants per distortion
  _advicePool: {
    '灾难化': [
      '最坏情况的发生概率其实很低，你的大脑把可能性当成了必然性',
      '问自己一个简单问题：「这件事真的发生了会怎样？」通常答案比你想象的温和得多',
      '你的大脑在拉警报，但大多数警报是假警报。试着一件件拆开来看，每个环节的概率相乘后其实很小',
      '回想一下：过去你担心的事情，有多少真的发生了？比例通常不到10%',
      '把"万一..."换成"就算..."——就算发生了，你也有能力应对',
    ],
    '读心术': [
      '你无法真正知道别人怎么想，你的猜测只是猜测。与其猜，不如问',
      '大多数时候，别人对你的关注远比你想象的要少——他们也在忙自己的事',
      'TA的反应可能跟你完全无关：TA可能只是累了、饿了、或者在想自己的问题',
      '试着问自己：「有没有其他更善意的解释？」比如TA没回复可能只是太忙',
      '读心术消耗大量能量。把"TA一定觉得我..."改成"我不确定TA怎么想，但这不等于最坏可能"',
    ],
    '非黑即白': [
      '生活大多数时候是灰色的。完美和灾难之间有一大片中间地带',
      '不完美≠失败。就像天气不只是"晴天"和"暴雨"，还有多云、小雨、微风',
      '试着打分代替二分：不是"好/坏"，而是"在1-10分里，这件事打几分？"',
      '允许自己做个"足够好"而非"完美"的人。足够好就已经很好了',
      '放下"必须"和"应该"，这些词背后往往藏着一个不现实的完美标准',
    ],
    '过度概括': [
      '一件事不能定义你，就像一天的下雨不意味着整个季节都是雨季',
      '"总是""从来不"这些词是大脑在偷懒。问问自己：真的每次都是这样吗？',
      '把这件事限定在它发生的具体场景里。换个时间、换个地点、换个对象，结果可能完全不同',
      '一个反例就够了——找出一个不符合你那个"总是/从来不"结论的例子',
      '这次的不顺利只是这次的。下一次有下一次的可能性，别让今天决定明天',
    ],
    '情绪推理': [
      '感受不等于事实。焦虑是一种情绪反应，不是对现实的准确评估',
      '"我觉得很糟糕"≠"事情真的很糟糕"。感觉和事实之间有条沟，需要理智去填',
      '你的身体在发出信号，但这个信号可能被放大了。试着把感受和事实分别写下来',
      '焦虑是大脑的保护机制在过度工作。它像个过于敏感的烟雾报警器——有时对着烤面包也会响',
      '告诉你的大脑：「谢谢你提醒我，但我已经检查过了，现在没有真正的危险」',
    ],
    '个人化': [
      '不是所有事情都跟你有关。别人有别人的世界，你有你的',
      '把不属于你的责任还回去。你只需对你可控的部分负责',
      '自责不能解决问题，只会让你更累。试着把"我的错"改为"我能从中学到什么"',
      '这件事里有很多因素，你只是其中之一。不要把所有的重量都扛在自己肩上',
      '对自己温柔一点。如果朋友遇到同样的事，你不会把所有责任都推给TA',
    ],
    '负面过滤': [
      '你的焦虑像一块磁铁，把负面信息都吸过来了。试着主动搜索积极信号',
      '现在，刻意找出3件今天发生的好事——不管多小都算',
      '你关注什么，什么就会放大。把注意力从"出了什么问题"转向"什么还是好的"',
      '焦虑让你戴上了灰色眼镜。摘下它，看看完整的画面——有暗有亮才是真实',
      '记录一下今天做对了的事、被善待的时刻、顺利完成的瞬间。它们真实存在',
    ],
    _generic: [
      '你现在感觉到的，是人类共有的一部分。你不是一个人',
      '焦虑不会永远持续。像波浪一样，它会来，也会走',
      '允许自己暂时不完美，允许自己有个糟糕的时刻。这不代表你的人生是糟糕的',
      '你的感受是真实的，但它也只是暂时的。给自己一点时间去感受，然后慢慢松开',
      '面对情绪本身就已经是勇敢的行为了。你不是在逃避，你是在处理',
    ],
    _highLevel: [
      '你现在可能很难受，但请相信：此刻的感觉不会永远持续。给自己许可，先什么都不做',
      '焦虑峰值的时候，不需要解决任何问题。只需要让自己待着，像陪一个受伤的朋友一样陪自己',
      '深呼吸，感受呼吸进出。现在你能做的最有用的事就是照顾好当下这一刻的自己',
    ],
    _lowLevel: [
      '你的觉察力很好！在焦虑还比较轻微的时候就注意到了，这正是情绪管理的关键能力',
      '这是一个练习的机会——在焦虑还小的时侯练习应对，它会越来越容易',
      '轻微的焦虑是成长的前奏，像运动前的热身。你在突破自己的舒适区',
    ],
  },

  _actionPool: [
    '做3次慢呼吸：鼻子吸气4秒，嘴巴呼气6秒。这个简单的动作可以立刻平复神经系统',
    '喝一杯水，慢慢地喝。感受水的温度和它在身体里的路径',
    '站起来伸个懒腰，转转脖子。身体的紧张和情绪的紧张是连在一起的',
    '把手机屏幕翻过去，看窗外30秒。给大脑一个"停下来"的信号',
    '在纸上写下："我现在感觉_____，因为_____。"然后撕掉它',
    '摸一个你能碰到的物体——桌子、杯子、衣服。感受它的质地和温度。回到当下',
    '对自己说一句话，像对最好的朋友说那样："没事的，我在"',
    '做一个"焦虑清单"：把担心的事列出来，每条旁边写"我能做的"和"我控制不了的"',
  ],

  _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  _keywordMatch(worry) {
    if (!worry) return [];
    const results = [];
    const patterns = [
      { keys: ['工作','老板','领导','同事','加班','考核','绩效','面试','辞职','入职','汇报','开会','KPI'], adv: '和工作相关的事常常让人焦虑，因为它跟我们的成就感和生存感绑定在一起。记住：你的价值不等于你的工作表现' },
      { keys: ['伴侣','对象','男朋友','女朋友','老公','老婆','分手','吵架','冷战','出轨'], adv: '亲密关系中的焦虑往往源于在乎。你在乎这个人，这本身就说明你有爱的能力。给自己和对方一点空间呼吸' },
      { keys: ['孩子','小孩','宝宝','儿子','女儿','带娃','教育','成绩','学校'], adv: '养育中的焦虑是爱和责任交织的结果。你已经做得很好了——孩子在意的不是完美，而是你的存在' },
      { keys: ['父母','爸','妈','家里','长辈','孝顺'], adv: '家庭关系中的焦虑常常来自"想要做好"的压力。你已经尽力了，有时候接受不完美比追求完美更需要勇气' },
      { keys: ['钱','经济','房贷','房租','花呗','信用卡','工资','收入','穷'], adv: '经济压力非常真实，不是"想太多"。但焦虑本身不能多赚一分钱——给自己设定一个可以行动的步骤，哪怕很小' },
      { keys: ['身体','病','疼','失眠','睡不着','头痛','胃','心脏','心跳','检查','医生'], adv: '身体的不适和健康焦虑会互相放大。先深呼吸，然后做一件具体的事：预约检查、吃药、或者只是躺下休息' },
      { keys: ['社交','朋友','聚会','微信','朋友圈','回复','已读','消息','电话'], adv: '社交焦虑的根源往往是"我够不够好"的疑问。答案是：你够好。别人的回应速度不等于对你的评价' },
      { keys: ['考试','学习','成绩','复习','备考','论文','毕业'], adv: '学业压力是真实的，但它也是暂时的。你过去的考试都没有定义你，这次也一样不会' },
    ];
    for (const p of patterns) {
      if (p.keys.some(k => worry.includes(k))) {
        results.push(p.adv);
        if (results.length >= 2) break; // max 2 keyword matches
      }
    }
    return results;
  },

  _generateLocalAdvice(distortions, level, worry) {
    const advice = [];

    // Keyword-matched advice first (most personalized)
    const kwAdvice = this._keywordMatch(worry);
    advice.push(...kwAdvice);

    // Distortion-based advice (random variant)
    for (const d of (distortions || [])) {
      const pool = this._advicePool[d.name];
      if (pool) advice.push(this._pick(pool));
    }

    // Level-based
    if (level >= 8) advice.push(this._pick(this._advicePool._highLevel));
    else if (level <= 3) advice.push(this._pick(this._advicePool._lowLevel));

    // Always add one generic for variety
    advice.push(this._pick(this._advicePool._generic));

    // Shuffle then dedup
    const shuffled = advice.sort(() => Math.random() - 0.5);
    return [...new Set(shuffled)].slice(0, 4); // max 4, keeps it concise
  },

  _generateConclusion(q) {
    const l = q.anxietyLevel;
    const d = q._distortions || [];
    const w = q.worry || '';

    // ===== 1. 你的状态 — 10 levels, each unique =====
    const stateMap = {
      1: `你目前的焦虑程度是 1/10 分。几乎没有什么焦虑感，内心比较平静。这是很好的状态——但即使在这个水平，你仍然选择来关注自己的情绪，说明你对自己的内心世界保持着好奇和觉察。继续保持这种自我观察的习惯，它会在未来帮到你。`,
      2: `你目前的焦虑程度是 2/10 分。有一点点轻微的波动，可能只是某件小事在心里轻轻划过。这个程度的焦虑几乎不会影响你的判断和行动——它更像是大脑的一个友好提醒，告诉你"有件事可以注意一下"。你现在处于非常适合思考和分析的状态。`,
      3: `你目前的焦虑程度是 3/10 分。轻微的不安感，像平静湖面上的一点涟漪。它在提醒你有些事情值得关注，但完全不妨碍你正常思考和行动。这个程度的焦虑其实是健康和有用的——它让你保持警觉，但不至于让你失去判断力。你现在的思维是清晰的，适合做决定、做规划。`,
      4: `你目前的焦虑程度是 4/10 分。有一点明显的不安了，可能某个具体的事情开始让你感到在意。这个水平的焦虑处于一个很好的"分析窗口期"——它足够强让你重视，但又没有强到让你思维混乱。现在是一个很好的时机，把让你不安的事情拆开来看一看。`,
      5: `你目前的焦虑程度是 5/10 分。焦虑感已经比较明显了，可能心跳有一点点快，或者脑子里的念头开始变多。这是中等水平的焦虑，也是最常见的工作状态——它说明你面对的事情对你来说是重要的。焦虑在这个水平上，就像一个稍微调大了音量的提醒铃声：它在叫你注意，但你不必被它吓到。`,
      6: `你目前的焦虑程度是 6/10 分。你开始感觉到身体上的反应了——可能是肩膀发紧、呼吸变浅、或者思维开始有点停不下来。这个水平的焦虑已经跨过了"轻微"的边界，进入了"需要关注"的范围。但好消息是，它还远没有到失控的程度。你在这里停下来写下来，正是最正确的做法——在焦虑继续攀升之前给它一个出口。`,
      7: `你目前的焦虑程度是 7/10 分。这是一个比较高的水平了，难怪你感到不舒服。你的身体可能已经进入了"战斗或逃跑"的应激状态：心跳加速、呼吸急促、注意力难以集中。但你看——你仍然在这里，在把感受写下来、在试着理清它。这说明你的理智还没有被情绪淹没。你没有被它推着走，而是选择了停一停、看一看。这种自控力是非常了不起的。`,
      8: `你目前的焦虑程度是 8/10 分。焦虑感非常强烈了，你可能感觉各种念头在脑子里打转，很难抓住一个清晰的思路。身体的紧张感也很明显——胸闷、手心出汗、或者有点坐立不安。在这种情况下你还能打开这里、把东西写下来，这本身就已经是非常勇敢的行为了。现在最重要的事情不是"想清楚"，而是先让自己的身体和神经系统平复下来。焦虑到了这个程度，它传递的信息已经被放大了很多倍——你不需要完全相信它说的每一句话。`,
      9: `你目前的焦虑程度是 9/10 分。你可能感觉快被情绪吞没了，有一种"再不行动就要爆炸了"的冲动。你的大脑正在以最高音量拉响警报，告诉你有什么事情非常不对劲。但请明白：焦虑到了 9 分的水平，它已经不是对现实事件的客观评估了——它是一场情绪风暴。风暴中不适合做任何重大决定。你能做的、也是最正确的事，就是先稳住自己，什么都不做。风暴会过去，你的判断力会回来。你在这里停下来，而不是被冲动驱使着去行动，这可能是你今天做的最重要、最正确的决定。`,
      10: `你目前的焦虑程度是 10/10 分。你正处于极度不适的状态，可能感觉整个人都要被情绪撕裂了——心慌、窒息感、思绪完全停不下来、甚至有一种"我不行了"的感觉。首先，请知道：这种感觉非常真实，也非常痛苦，但它不会永远持续。焦虑峰值就像一个海浪，它一定会退下去。你现在最重要、也是唯一需要做的事，就是照顾好自己——不分析、不决定、不回复、不行动。先让自己的身体安全地度过这个峰值。如果你需要，放下手机，先用呼吸让自己慢慢回到一个相对平稳的状态。等这波过去，你会看得更清楚。你能在这个时候还在这里面对它、而不是被它推着做出可能后悔的事，这本身就是一种巨大的力量。`,
    };
    let state = stateMap[l] || stateMap[5];

    // ===== 2. 思维分析 — distortion × level =====
    let thought = '';
    const levelPrefix = l >= 9 ? '在你目前极度焦虑的状态下，' : l >= 7 ? '以你现在较高的焦虑水平来看，' : l >= 5 ? '在你目前中等焦虑的状态下，' : '';
    const levelSuffix = l >= 9 ? '但请记住：焦虑到了这个水平，你的大脑会把任何思维模式放大数倍。识别到它们就够了——现在不需要深入分析，先让自己的身心平复下来。等情绪稍降，你自然会看得更清楚。' :
                        l >= 7 ? '不过在你目前的焦虑水平下，这些思维模式可能被情绪放大了。试着把它们当作"参考看法"而不是"确定事实"。给自己一点时间，等情绪稍平稳后再来审视这些分析。' :
                        l >= 5 ? '你现在还有比较好的分析能力，可以趁这个机会深入看看这些思维模式是怎么运作的。理解它们，就是摆脱它们的第一步。' :
                        '你现在状态相对平稳，正是观察自己思维模式的好时机。在不焦虑的时候了解这些模式，等到焦虑来的时候你就能更快地识别它们。';

    if (d.length === 0) {
      const noDist = {
        high: '从你写下的内容来看，没有检测到典型的认知扭曲模式。但这并不意味着你的焦虑不真实——在高焦虑状态下，即使没有系统性的思维陷阱，情绪本身的强度也是真实且值得认真对待的。有时候焦虑不来自"想错了"，而来自确实在乎、确实面对压力。不用给自己额外贴标签。',
        mid: '从你写下的内容来看，没有检测到明显的认知扭曲。这说明你的思维在大方向上没有走偏——你只是在经历一个正常的情绪反应。有时候焦虑不来自想法错误，而来自面对的事情本身就很有挑战性。你的感受是合理的。',
        low: '从你写下的内容来看，你的思维很清晰，没有陷入常见的认知陷阱。你的焦虑更多是情境性的——是某件具体的事情让你在意，而不是你的思维方式出了问题。这是好消息：你的心理基础是健康的，只是在应对一个有挑战的局面。',
      };
      const tier = l >= 7 ? 'high' : l >= 4 ? 'mid' : 'low';
      thought = levelPrefix + noDist[tier] + ' ' + levelSuffix;
    } else if (d.length === 1) {
      const detailed = {
        '灾难化': {
          base: `你的思维出现了「灾难化」的模式。你从一件具体的事情出发，在脑海中把它推演到了最坏的可能——像一个多米诺骨牌，每一步都在往更糟糕的方向滑。`,
          detail: `灾难化的核心问题在于：那些中间环节大多数不会真的发生。你害怕的那个终极场景，发生概率往往比你感觉到的低得多。你的大脑把"有可能"当成了"一定会"。`,
          action: `试着把这个"多米诺链条"写下来——A会发生，然后B会发生，然后C会...每一步之间问自己一个问题："这一步真的有必然联系吗？"你可能会发现中间好几个环节其实站不住脚。另外可以问自己：过去类似的担忧中，有多少真的发生了？比例通常不到十分之一。`,
        },
        '读心术': {
          base: `你的思维出现了「读心术」的模式。你假定了自己知道别人在想什么——而且预设那些想法是负面的："TA肯定觉得我不行""他们一定在笑话我"。`,
          detail: `但事实是：你无法读心。别人的表情、语气、反应，可能出于100种跟你无关的原因。人们对他人的关注通常只有几分钟，然后就会回到自己的世界里。你纠结的那个"糗事"，别人可能根本没注意到。`,
          action: `一个简单的问题："除了你担心的那个解释，还有没有其他更善意的可能？"——TA没回复可能是因为太忙、太累、或者正在想自己的问题。至少列出3种与你无关的可能解释。你会发现可能性被分散了，不再集中在"TA讨厌我"这一个点上。`,
        },
        '非黑即白': {
          base: `你的思维出现了「非黑即白」的模式。你把事情分成了两个极端："要么完美，要么彻底失败""要么成功，要么一文不值"。`,
          detail: `但真实的世界是灰色的。大部分事情既不是100分也不是0分——它们落在60、70、80分的位置。用"足够好"代替"完美"，很多事情就已经过关了。你对自己的要求可能远比你对别人的要求严格。`,
          action: `试着用1-10打分代替"好/坏"二分。比如"这次的结果我打几分？"——6分和0分是完全不同的概念。给自己一个及格线，而不是完美线。允许自己做一个"足够好"的人而不是"完美"的人。`,
        },
        '过度概括': {
          base: `你的思维出现了「过度概括」的模式。你从单一的一次经历中，推导出了一个广泛而绝对的结论——"这次搞砸了，以后肯定也搞不好""这个人这样对我，所有人都会这样"。`,
          detail: `但一次经历就是一次经历。它的适用范围比你想象的要窄得多。不同的时间、不同的对象、不同的条件，结果可能完全不同。你的大脑在用一个点来定义整条线——这在逻辑上是站不住脚的。`,
          action: `试着限定一下范围："在XX时间、XX地点、跟XX人，发生了XX事，结果不太好。"仅此而已。不扩展到"永远"、不扩展到"所有人"、不扩展到"所有事"。这样做之后，你会发现问题变得具体了、可处理了，不再是笼罩一切的阴影。`,
        },
        '情绪推理': {
          base: `你的思维出现了「情绪推理」的模式。你把自己的感受当作了客观事实："我觉得很糟糕，所以情况一定真的很糟糕""我感到不被喜欢，所以肯定没人喜欢我"。`,
          detail: `但情绪和事实是两回事。情绪是你内心的反应，事实是客观发生的事情。焦虑是一种情绪信号——它告诉你有什么在触动你，但它并不能准确评估现实威胁的大小。你的感受是真实且重要的，但它不是现实的完整反映。`,
          action: `一个简单有效的练习：拿一张纸，左边写"我感觉..."（比如：我感觉自己很失败），右边写"事实是..."（比如：事实是这次项目中有一项任务我没有按时完成，但其余四项都做得很不错）。对比两边的信息量，你通常会看到——你的感觉比事实更极端。`,
        },
        '个人化': {
          base: `你的思维出现了「个人化」的模式。你把事情的责任全都归到了自己身上，觉得所有的过错都是自己的、所有的后果都该自己承担。`,
          detail: `但任何一件事的发生，通常都有很多因素在作用——环境条件、时机、他人的选择和行动、运气。你只是这些因素中的一个。把不属于你的那份责任也扛在肩上，既不会改变已经发生的事，也不会解决任何问题——只会让你更累。`,
          action: `画一条线，左边写"我的责任"，右边写"不是我控制的"。诚实地评估每件事属于哪边。你可能会惊讶地发现，很多你一直在自责的事情，其实有一大半不在你的控制范围内。把精力从右边收回来，集中在你真正能改变的事情上。`,
        },
        '负面过滤': {
          base: `你的思维出现了「负面过滤」的模式。你的注意力像被磁铁吸住了一样，只看到事情中不好的一面，而那些顺利的、正常的、甚至做得不错的部分，被自动过滤掉了。`,
          detail: `这不是你故意悲观——这是焦虑状态下大脑的自然倾向。焦虑让大脑进入"扫描威胁"模式，对负面信息特别敏感，同时对正面信息视而不见。你看到的不是全部事实，而是经过焦虑滤镜筛选后的"精简版"。`,
          action: `刻意做一个"积极扫描"：为这件事找出至少2个不算差的方面，或者2件今天还算顺利的小事。哪怕很小——"今天的咖啡很好喝""有个同事对我笑了一下"。这个练习不是在否认问题，而是在恢复平衡——让你看到事情完整的画面，而不仅仅是焦虑让你看到的那一半。`,
        },
      };
      const dd = detailed[d[0].name];
      if (dd) {
        thought = levelPrefix + dd.base + ' ' + dd.detail + ' ' + dd.action + ' ' + levelSuffix;
      } else {
        thought = levelPrefix + `你的思维出现了「${d[0].name}」模式。这是一种常见的认知模式，意味着你的大脑在用一种自动化的旧习惯来处理当前的信息。这些模式往往形成于过去的经历中，曾经可能保护过你，但现在可能已经不太适应了。识别到它，你已经迈出了改变的第一步。` + ' ' + levelSuffix;
      }
    } else {
      const names = d.map(x => `「${x.name}」`).join('、');
      thought = levelPrefix + `你的思维同时出现了${names}等${d.length}种模式。当多种思维陷阱叠加在一起时，它们会互相强化、互相印证，让你感觉焦虑比实际情况更严重、更复杂。比如灾难化和读心术结合在一起——你既觉得事情会往最坏的方向发展，又觉得别人都在用负面的眼光看你，这两种想法会互相"证明"对方的正确性。但实际上它们都基于一个假设，而不是客观事实。` + ' ' + levelSuffix;
    }

    // ===== 3. 情境洞察 — keyword × level =====
    let context = '';
    if (w.length > 5) {
      const ctxLevel = l >= 8 ? 'high' : l >= 5 ? 'mid' : 'low';
      const ctxPools = {
        work: {
          high: '你写的这件事跟工作有关，而你现在焦虑水平很高——这可能意味着你正在给自己施加巨大的压力。但请记住：你不需要在这个时候解决所有工作问题。你的价值远远大于一份工作、一次汇报、一个项目的成败。给自己一个喘息的空间，等情绪稍稳定后再来处理具体的事项。到时候你的效率和判断力会比现在好得多。',
          mid: '你写的这件事跟工作有关。职场焦虑往往和"自我价值感"紧密相连——我们很容易把工作表现等同于自己的价值。但工作是你做的事，不是你这个人。试着把注意力从"别人怎么看我"转移到"我怎么把眼前这件事做好"，焦虑就会自然减轻。',
          low: '你写的这件事跟工作有关，而你目前状态比较平稳——这是处理工作问题的最佳状态。趁冷静的时候，把你在意的那件事拆成一个一个的小步骤，然后从最简单的那个开始做。行动本身会带来掌控感，掌控感会进一步减轻焦虑。',
        },
        love: {
          high: '你写的这件事涉及亲密关系，而你现在情绪非常强烈。此刻最重要的事是：不要立即发送任何消息，不要立刻做出关系决定。强烈的情绪下说出口的话，往往事后会后悔。先让自己冷静下来——哪怕只是20分钟——然后再想你要怎么沟通。好的关系经得起这个缓冲时间。',
          mid: '你写的这件事涉及亲密关系。在重要的关系中感到焦虑，恰恰说明你在乎——冷漠的人才不会焦虑。但亲密关系中的焦虑常常来自"不确定性"：你不知道对方怎么想、不知道未来会怎样。与其被这种不确定消耗，不如聚焦于你能确认的东西：你们之间哪些时刻是真实的、美好的？',
          low: '你写的这件事涉及亲密关系，你目前状态比较平稳——这是建立健康沟通的好时机。想一想：你真正想跟对方表达的是什么？用"我感受..."而不是"你总是..."的方式说出来，对方更可能听到你的真实意思。',
        },
        health: {
          high: '你写的这件事跟身体或健康有关，而你现在焦虑水平很高。身体不适和焦虑会互相放大——焦虑让身体更紧张，紧张又加重焦虑，形成恶性循环。打破它的第一步不是"停止担心"，而是做一个具体动作：深呼吸3次、站起来走一走、喝一杯温水。先让身体从应激状态中退出，情绪会跟着改变。',
          mid: '你写的这件事跟身体或健康有关。身体和情绪是紧密相连的——有时你以为自己在为某件事焦虑，其实身体早已紧张了一天。试着做一个身体检查：肩膀是不是耸起来了？牙关是不是咬紧了？刻意放松这些部位，你会发现焦虑感也会随之减轻。',
          low: '你写的这件事跟身体或健康有关。在状态比较平稳的时候，可以想一想：这次身体的不适可能跟什么有关？是睡眠、饮食、压力、还是缺少运动？有时候一个小小的调整——比如今晚早睡一小时——就能带来明显的改变。',
        },
        money: {
          high: '你写的这件事跟经济或金钱有关，而你正处于高度焦虑中。经济压力非常真实，不是"想太多"。但焦虑本身不能改变数字——此刻先让自己冷静下来，然后再考虑可以实际做什么。哪怕只是列一个简单的收支清单，也比在原地反复担心要好。',
          mid: '你写的这件事跟经济或金钱有关。这种焦虑是人类最普遍的焦虑之一——不是你的错。试着把焦虑从"情绪"转化为"行动"：能不能做一个简单的财务梳理？能不能找到一个小的方法增加收入或减少开支？动起来，哪怕只是一小步。',
          low: '你写的这件事跟经济或金钱有关，而你目前状态相对平稳——这是做财务规划的好时机。不需要宏伟的计划，从一个简单的记录开始：本月收入和支出是多少？有没有可以微调的？这种"掌控感"会比焦虑本身更有用。',
        },
        social: {
          high: '你写的这件事跟社交有关，你现在可能非常在意别人对你的看法。但在高度焦虑状态下，你对别人反应的解读往往被放大了——一个中性的表情可能被理解成反感，一句普通的话可能被解读成批评。先放下"别人怎么想"这个问题，等情绪降下来再评估。到那时你看到的画面会和现在很不一样。',
          mid: '你写的这件事跟社交有关。社交焦虑的核心通常是"害怕被评价"——担心别人觉得你不够好。但实际上，大多数人对你的关注只有几分钟，然后就会回到自己的世界里。你在意的那个"糗事"，别人可能早已忘记。做真实的自己比做完美的自己更让人舒服。',
          low: '你写的这件事跟社交有关，目前状态还比较平稳。社交焦虑往往是因为我们的大脑把"社交评价"当成了"生存威胁"——这是进化留下的旧机制。提醒自己：这不是生死攸关的事，只是一个互动。放松一点，你表现得会比紧张的时候好很多。',
        },
      };
      const matchPool = /工作|老板|领导|同事|加班|考核|面试|开会|汇报|KPI|辞职|入职/.test(w) ? ctxPools.work :
                        /伴侣|对象|男朋友|女朋友|老公|老婆|分手|吵架|冷战|出轨/.test(w) ? ctxPools.love :
                        /身体|病|疼|失眠|头痛|心跳|检查|医生|医院/.test(w) ? ctxPools.health :
                        /钱|经济|房贷|房租|花呗|信用卡|工资|收入|穷|赚钱/.test(w) ? ctxPools.money :
                        /社交|朋友|聚会|微信|朋友圈|回复|已读|消息|电话/.test(w) ? ctxPools.social : null;
      if (matchPool) context = matchPool[ctxLevel] || matchPool.mid;
    }

    // ===== 4. 关键认知 — 10 levels =====
    const insightMap = {
      1: '你的内心现在很平静。趁这个状态好的时刻，可以想一想：什么事情能让你保持这种平静？把它们安排进你的日常，就像给内心存一笔"平静储备金"，在焦虑来的时候可以取用。',
      2: '你几乎感受不到焦虑，这说明你当前的心理状态很好。但这个时刻还有一个价值：你可以在平静中观察到，是什么样的环境、习惯或心态让你保持了这种状态。把它们记录下来，这就是你的"平静配方"。',
      3: '一点点轻微的焦虑，像是内心在轻轻敲门，提醒你有事情值得关注。这是焦虑最有用的形态——它不会打扰你的思考，但会给你一个温和的提示。趁现在思路清晰，把你注意到的那件事理一理，可能只需要几分钟。',
      4: '你的焦虑开始能被察觉到了——身体或心里有一个"嗯，有点在意"的信号。这个信号是健康的：它说明你在乎。不要急着把它压下去，而是问自己一个问题："这个焦虑如果会说话，它想告诉我什么？"它会给你一个有用的答案。',
      5: '你正处在中等焦虑的水平。这个水平其实有一个好处：它让你足够重视，又不至于让你思维混乱。就像一杯浓茶，提神但还不至于心悸。把你担心的事情摊开来看——你可能会发现它没有你感觉到的那么大。',
      6: '你的焦虑已经跨过了"背景噪音"的阶段，开始占据你的注意力了。这是一个需要认真对待的信号，但它仍然是一个信号，不是命令。你有权选择如何回应它。现在停下来、写下来，就是在做出那个选择。你不是被焦虑控制的，你是在管理焦虑的。',
      7: '焦虑开始影响你的身体和思维了。这很难受，但你仍然在这里——在看着它、在写下来、在试着分析。你知道吗？光是"观察自己的情绪"这个行为，就能降低大脑杏仁核的活跃度。你每写一个字，都是在帮自己的神经系统降温。不是"想清楚"才平静，是平静下来才能想清楚。',
      8: '你现在的焦虑水平很高。你的大脑正在以接近最大的音量拉响警报。但有一个重要的真相需要告诉你：焦虑到了这个程度，它的"信息准确度"已经大大降低了。就像一个过于敏感的烟雾报警器——连烤面包的烟都会触发。你可以感谢你的大脑在保护你，但同时不必相信它说的每一次"危险"。先降下来，再回头看。',
      9: '你正在经历一场情绪的暴风雨。这种感觉非常真实、非常难熬。暴风雨中不适合航行——不适合做决定、回复消息、或下结论。但暴风雨一定会过去。你此刻最重要的事就是稳住船，等风浪平息。你不需要在这个时候"解决"任何问题。你能停下来、把东西写下来、而不是被冲动带着去行动——这可能是今天你为自己做的最重要的一件事。',
      10: '此刻你可能感觉要被情绪淹没了。请先做一件事：放下"我需要想清楚"这个念头。在焦虑到达顶峰的时候，"想清楚"是不可能的也是不必要的。你现在唯一的任务就是让自己安全地度过这个峰值。情绪有一个自然规律：它一定会上升，也一定会下降。你现在处于接近最高点的位置，接下来它会往下降。抓住这个事实——它不是永远，它只是现在。你已经很勇敢了，你在这里，没有逃跑。剩下的，等这波过去再说。',
    };
    let insight = insightMap[l] || insightMap[5];

    // ===== 5. 行动指南 — 10 levels =====
    const actionPool10 = {
      1: ['趁平静，做一件让你开心的事——散步、听音乐、看书。把这种平静的感觉存进你的"心理储备"。'],
      2: ['你状态很好。想一想：今天有没有一件想做但一直没做的事？现在是最好的时机。动起来，哪怕很小。'],
      3: ['你只是有一点在意，还没有被焦虑干扰。趁清醒，花5分钟把让你在意的事情写下来，理一理——可能只需要这么一点整理，不安就消失了。'],
      4: ['焦虑开始变得可以察觉了。利用你还在清晰的头脑，把这件事拆成"我能处理的"和"我暂时管不了的"。把能处理的那部分，挑最简单的先做掉。'],
      5: ['你的焦虑到了需要认真对待的水平。但你的思考能力还在——现在做一次"事实vs猜测"的区分练习。拿出一张纸或备忘录，左边写已经发生的客观事实，右边写你脑子里推演的各种可能。通常右边会是左边的3倍以上。把注意力收回到左边。'],
      6: ['焦虑开始影响你的身体了。先关注身体：肩膀沉下来、松开牙关、做三次慢呼气。当身体从紧张中释放，你的脑子里那些打转的念头会自然慢下来。然后再看你在担心的事——它还在，但不会像刚才那么大了。'],
      7: ['暂停一切即将做出的决定和即将发送的消息。你现在不适合做判断——你的判断力正在被情绪干扰。给自己一个硬性缓冲：至少30分钟后再做任何重要的事。这30分钟里，离开你现在的空间，去喝水、走动、或者只是换个地方待着。这不是逃避，这是对自己负责。'],
      8: ['你现在最重要的任务不是"想清楚"，而是让自己的神经系统降下来。找一个安静的地方，做5次循环呼吸：鼻子吸气4秒，嘴巴慢慢呼气6秒。呼气的时长比吸气长——这个节奏会启动你的副交感神经，告诉身体"安全了"。身体先平静，脑子才能跟上。任何决定，都等身体平静了再说。'],
      9: ['什么都不要做。不回复、不操作、不下结论、不联系任何人。你现在正处在情绪风暴的中心——风暴中不适合做任何决定。你唯一的任务是等待这波峰值过去。找一个安全的空间，用呼吸稳住自己。如果愿意，可以把你想说但不敢说的话全都写下来——写下来不等于发出去。等情绪降下来后再回头看，你会感谢自己今天没有冲动。'],
      10: ['首先：你不是一个人，这种感觉虽然极端的痛苦，但它不会永远持续。现在，跟着做：① 放下手机，或至少离开当前的应用；② 找一个安全的位置坐下或躺下；③ 用鼻子慢慢吸气4秒，憋住2秒，用嘴巴慢慢呼气6秒；④ 连续做3-5次；⑤ 感受自己的呼吸，别的什么都不想。你现在不需要解决任何事情——你只需要帮自己度过这一刻。等这波过去了，你还有大量时间去处理那些让你焦虑的事。现在，只是呼吸。'],
    };
    let action = actionPool10[l] || actionPool10[5];

    // ===== 6. 你已经做到的事 =====
    const alreadyDid = [
      '你已经迈出了最重要的一步：把情绪从脑子里搬到外面来。情绪在脑子里的时候，它无边无际、模糊而巨大。一旦写下来，它就变成了一段文字——你看得见它的大小、边界和形状。这就已经比"被情绪吞没"的状态前进了一大步。',
      '你在这里分析自己，而不是被冲动推着做出反应。这说明你的理性大脑还在线——哪怕你自己觉得很不理性。事实上，能够观察自己的情绪、能够给情绪命名、能够写下自己的想法，这些都是心理学上公认的情绪调节能力。你在用这些能力，只是你没意识到。',
      '这一刻的你，比5分钟前的你更了解自己。每一次你把情绪写下来、试着理解它，都是在给自己的心理"肌肉"做一次训练。下一次焦虑来的时候，你会比这次更有准备。这不是空话——神经科学已经证明，仅仅是"标记情绪"这个动作，就能降低杏仁核的活跃度。',
    ];

    return {
      state, thought, context, insight, action,
      alreadyDid: this._pick(alreadyDid)
    };
  },

  _generateAction(distortions, level, worry) {
    // Pick 2 random actions + 1 level-specific
    const actions = [];
    const pool = [...this._actionPool];
    actions.push(this._pick(pool));
    // Remove picked and pick another
    const picked = actions[0];
    const remaining = pool.filter(a => a !== picked);
    actions.push(this._pick(remaining));

    if (level >= 7) actions.push('如果现在真的很不舒服，请允许自己暂停。不是偷懒，是自我照顾。');
    else if (distortions.length > 0) actions.push('你识别出了' + distortions.length + '种思维模式，光是看见就已经在改变了。');

    if (worry && worry.length > 30) actions.push('关于「' + worry.substring(0, 25) + '...」——把这件事写在一张纸上，旁边画一个"24小时后再看"的标记。');

    return this._pick(actions); // randomly pick 1, makes each time different
  },

  async analyzeQuick() {
    try {
      const q = this.quickData;

      // 1) Local analysis — instant, zero config
      q._distortions = analyzeDistortions(q.worry || '');
      const localAdvice = this._generateLocalAdvice(q._distortions, q.anxietyLevel, q.worry);
      const localAction = this._generateAction(q._distortions, q.anxietyLevel, q.worry);
      q._localAdvice = localAdvice;
      q._localAction = localAction;
      // Generate a synthesized conclusion
      q._conclusion = this._generateConclusion(q);

      // 2) Show complete results immediately
      this.renderQuickResult();

      // 3) Optionally try AI in background (only if key configured)
      const apiKey = localStorage.getItem('ds_api_key');
      if (!apiKey) return;

      const aiSection = document.getElementById('quick-ai-section');
      if (!aiSection) return;
      aiSection.innerHTML = '<p style="font-size:12px;color:var(--color-text-muted);text-align:center">🤖 AI 补充分析中...</p>';

      try {
        const aiMessages = [
          { role: 'system', content: '你是一位温暖的心理陪伴者。用200字以内，像朋友聊天一样，帮TA分析并安抚。语气轻柔，不要说教。' },
          { role: 'user', content: `【焦虑程度】${q.anxietyLevel}/10\n【情绪】${q.emotions.length > 0 ? q.emotions.join('、') : '未选择'}\n【描述】${q.worry || '未填写'}\n【检测到的思维模式】${q._distortions.map(d => d.name).join('、') || '无'}\n\n请温暖地回应。200字以内。` }
        ];
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
          body: JSON.stringify({ model: 'deepseek-chat', messages: aiMessages, max_tokens: 400, temperature: 0.8 }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        const json = await resp.json();
        if (json.choices && json.choices[0]) {
          q.aiResult = json.choices[0].message.content;
          aiSection.innerHTML = `
            <div style="font-size:12px;color:var(--color-accent);margin-bottom:6px">🤖 AI 补充视角</div>
            <div class="ai-result-content">${this.escapeHtml(q.aiResult)}</div>`;
        }
      } catch (e) {
        aiSection.innerHTML = '<p style="font-size:11px;color:var(--color-text-muted);text-align:center">（AI 暂不可用，上面结论已经够了 🌱）</p>';
      }
    } catch (err) {
      console.error('analyzeQuick:', err);
    }
  },

  renderQuickResult() {
    const q = this.quickData;
    const distortions = q._distortions || [];
    const localAdvice = q._localAdvice || [];
    const localAction = q._localAction || '';
    const conclusion = q._conclusion || null;
    const level = q.anxietyLevel;
    const soothe = CBT.sootheMessages[level] || CBT.sootheMessages[5];

    this.elements.stepContent.innerHTML = `
      <div class="quick-result-container fade-in">

        <!-- CONCLUSION CARD — rich analysis -->
        ${conclusion ? `
        <div class="conclusion-card">
          <div class="conclusion-header">📋 分析结论</div>

          ${conclusion.state ? `
          <div class="conclusion-section">
            <div class="conclusion-section-title">📊 你的状态</div>
            <div class="conclusion-section-body">${conclusion.state}</div>
          </div>
          ` : ''}

          ${conclusion.thought ? `
          <div class="conclusion-section">
            <div class="conclusion-section-title">🧠 思维分析</div>
            <div class="conclusion-section-body">${conclusion.thought}</div>
          </div>
          ` : ''}

          ${conclusion.context ? `
          <div class="conclusion-section conclusion-section-context">
            <div class="conclusion-section-title">📍 情境洞察</div>
            <div class="conclusion-section-body">${conclusion.context}</div>
          </div>
          ` : ''}

          ${conclusion.insight ? `
          <div class="conclusion-section conclusion-section-key">
            <div class="conclusion-section-title">🔑 关键认知</div>
            <div class="conclusion-section-body">${conclusion.insight}</div>
          </div>
          ` : ''}

          ${conclusion.action ? `
          <div class="conclusion-action">
            <span class="conclusion-action-label">👉 现在可以做什么</span>
            <p>${conclusion.action}</p>
          </div>
          ` : ''}

          ${conclusion.alreadyDid ? `
          <div class="conclusion-already">✅ ${conclusion.alreadyDid}</div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Soothing card (compact) -->
        <div class="cbt-soothe-card" style="border-left-color: ${this.getLevelColor(level)};margin-bottom:var(--space-md)">
          <p class="soothe-text">${soothe}</p>
        </div>

        <!-- Detected Patterns -->
        ${distortions.length > 0 ? `
        <div class="cbt-card" style="background:var(--color-bg-secondary)">
          <label class="cbt-label">🧠 你的思维可能在这样影响你</label>
          ${distortions.map(d => `
            <div class="distortion-item">
              <span class="distortion-name">${d.icon} ${d.name}</span>
              <p class="distortion-desc">${d.desc}</p>
              <p class="distortion-fix">💡 ${d.explain}</p>
            </div>
          `).join('')}
        </div>
        ` : `
        <div class="cbt-card" style="background:var(--color-bg-secondary);text-align:center">
          <p style="font-size:14px;color:var(--color-green-dark)">👍 你的描述比较客观，没检测到典型的思维陷阱</p>
        </div>
        `}

        <!-- Local Advice -->
        <div class="cbt-card" style="border-left:4px solid var(--color-green)">
          <label class="cbt-label">🌱 换个角度看</label>
          ${localAdvice.map(a => `<p class="advice-item">✨ ${a}</p>`).join('')}
        </div>

        <!-- Suggested Action -->
        <div class="cbt-card" style="border-left:4px solid var(--color-accent)">
          <label class="cbt-label">🚶 现在就可以做</label>
          <p class="action-text">${localAction}</p>
        </div>

        <!-- What was entered -->
        <div class="cbt-card">
          <label class="cbt-label">📋 你记录的</label>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
            <span class="badge" style="background:${this.getLevelColor(level)}20;color:${this.getLevelColor(level)};font-size:18px;padding:4px 12px">
              焦虑 ${level}/10
            </span>
            ${q.emotions.length > 0 ? q.emotions.map(e => `<span class="mini-tag">${e}</span>`).join(' ') : '<span class="text-muted" style="font-size:12px">未选情绪</span>'}
          </div>
          ${q.worry ? `<p style="font-size:13px;color:var(--color-text-secondary);white-space:pre-wrap">${this.escapeHtml(q.worry)}</p>` : '<p class="text-muted" style="font-size:12px">未填写具体描述</p>'}
        </div>

        <!-- Actions -->
        <div class="quick-actions">
          <button class="btn-primary" id="quick-save-btn" style="width:100%">💾 保存</button>
          <button class="btn-secondary" id="quick-deep-btn" style="width:100%">📝 深度分析（预填数据）</button>
          <button class="btn-ghost" id="quick-new-btn" style="width:100%;color:var(--color-text-muted)">再写一次</button>
        </div>

        <!-- Re-rate -->
        <div class="cbt-card rerate-card" id="rerate-section">
          <label class="cbt-label">🔄 现在感觉焦虑有变化吗？</label>
          <div class="anxiety-slider-container">
            <div class="anxiety-level-display" id="rerate-display" style="color:${this.getLevelColor(level)};font-size:2rem">${level}</div>
            <input type="range" min="1" max="10" value="${level}" class="anxiety-slider" id="rerate-slider">
            <div class="anxiety-labels"><span>好多了</span><span>没变化</span></div>
          </div>
          <div id="rerate-comparison" class="rerate-comparison"></div>
        </div>

        <!-- AI footnote (small, optional, at bottom) -->
        <div id="quick-ai-section" style="margin-top:var(--space-lg);padding-top:var(--space-md);border-top:1px dashed rgba(0,0,0,0.08)">
          ${q.aiResult ? `
            <div style="font-size:12px;color:var(--color-accent);margin-bottom:4px">🤖 AI 补充视角</div>
            <div class="ai-result-content">${this.escapeHtml(q.aiResult)}</div>
          ` : (localStorage.getItem('ds_api_key') ? `
            <p style="font-size:11px;color:var(--color-text-muted);text-align:center">🤖 AI 补充分析中...</p>
          ` : `
            <p style="font-size:11px;color:var(--color-text-muted);text-align:center;cursor:pointer" id="quick-show-ai-config">
              💡 想要 AI 深度分析？点此配置（免费）
            </p>
            <div id="quick-key-area" style="display:none;margin-top:8px">
              <input id="quick-apikey" type="password" placeholder="粘贴 DeepSeek API Key..." style="font-size:12px;padding:6px;width:100%;margin-bottom:6px">
              <button class="btn-primary" id="quick-save-key" style="font-size:12px;width:100%">💾 保存</button>
            </div>
          `)}
        </div>
      </div>
    `;

    // Key config (small optional section)
    const showConfig = document.getElementById('quick-show-ai-config');
    if (showConfig) showConfig.addEventListener('click', () => {
      document.getElementById('quick-key-area').style.display = 'block';
      showConfig.style.display = 'none';
    });
    const saveKeyBtn = document.getElementById('quick-save-key');
    if (saveKeyBtn) saveKeyBtn.addEventListener('click', () => {
      const key = document.getElementById('quick-apikey').value.trim();
      if (key) {
        localStorage.setItem('ds_api_key', key);
        this.analyzeQuick();
      }
    });

    document.getElementById('quick-save-btn').addEventListener('click', () => this.saveQuickEntry());
    document.getElementById('quick-deep-btn').addEventListener('click', () => this.continueToDeep());
    document.getElementById('quick-new-btn').addEventListener('click', () => this.startQuickRelief());

    // Re-rate
    const rerateSlider = document.getElementById('rerate-slider');
    const rerateDisplay = document.getElementById('rerate-display');
    const rerateComparison = document.getElementById('rerate-comparison');
    const origLevel = level;

    const updateRerate = (val) => {
      rerateDisplay.textContent = val;
      rerateDisplay.style.color = this.getLevelColor(val);
      this.quickData._reRatedLevel = val;
      const diff = origLevel - val;
      if (diff > 2) {
        rerateComparison.innerHTML = `<p class="rerate-down">📉 焦虑下降了 ${diff} 分！你在面对，你在变好 🌱</p>`;
      } else if (diff > 0) {
        rerateComparison.innerHTML = `<p class="rerate-slight">📉 略有下降（${diff} 分），觉察就是进步 ✨</p>`;
      } else if (diff === 0) {
        rerateComparison.innerHTML = `<p class="rerate-same">没变化也没关系，面对情绪本身就是勇敢的 🤍</p>`;
      } else {
        rerateComparison.innerHTML = `<p class="rerate-up">有时候情绪浮出来才被真正看见 🌊</p>`;
      }
    };
    rerateSlider.addEventListener('input', (e) => updateRerate(parseInt(e.target.value)));
    updateRerate(origLevel);
  },

  async saveQuickEntry() {
    const q = this.quickData;
    await JingXin.IPC.invoke('anxiety:save', {
      worry: q.worry || '(快速记录)',
      anxietyLevel: q.anxietyLevel,
      emotions: q.emotions,
      evidence: {},
      reframe: { aiAnalysis: q.aiResult || '' },
      selfNote: q.aiResult || '',
      distortions: q._distortions || [],
      isQuick: true
    });

    // Show saved state then go back to choose
    this.elements.stepContent.innerHTML = `
      <div class="completion-card fade-in">
        <div class="completion-icon">🌱</div>
        <h3>已保存</h3>
        <p class="completion-desc">你已经迈出了面对情绪的第一步。<br>任何时候想深入分析，都可以点「深度CBT日记」。</p>
        <button class="btn-primary" id="quick-back-home" style="margin-top:16px">回到首页</button>
      </div>
    `;
    document.getElementById('quick-back-home').addEventListener('click', () => this.startQuickRelief());
    await this.loadEntries();
  },

  continueToDeep() {
    // Pre-fill CBT form data from quick mode
    this.mode = 'cbt';
    this.currentStep = 1;
    this.formData.worry = this.quickData.worry;
    this.formData.anxietyLevel = this.quickData.anxietyLevel;
    this.formData.emotions = [...this.quickData.emotions];
    this.formData.reframe.aiAnalysis = this.quickData.aiResult;
    this.formData._distortions = this.quickData._distortions || [];
    document.getElementById('anxiety-steps').style.display = 'flex';
    this.renderStep();
  },

  // ==========================================
  // Step Rendering (CBT 深度模式)
  // ==========================================

  async loadEntries() {
    this.entries = await JingXin.IPC.invoke('anxiety:get-all') || [];
    this.entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // History rendered inline in quick input or step views
    const list = document.getElementById('anxiety-history-list');
    if (list) this.renderHistory();
  },

  // ==========================================
  // Step Rendering
  // ==========================================

  renderStep() {
    this.updateStepIndicators();
    switch (this.currentStep) {
      case 1: this.renderStep1_Thought(); break;
      case 2: this.renderStep2_Emotion(); break;
      case 3: this.renderStep3_Evidence(); break;
      case '3.5': this.renderStep3_5_Analysis(); break;
      case 4: this.renderStep4_Reframe(); break;
      case 5: this.renderStep5_Summary(); break;
    }
    this.renderNav();
    // Scroll to top of step content
    this.elements.stepContent.scrollIntoView({ behavior: 'smooth' });
  },

  updateStepIndicators() {
    document.querySelectorAll('#anxiety-steps .step').forEach((step, i) => {
      const stepNum = i + 1;
      step.classList.remove('active', 'done');
      if (this.currentStep === '3.5') {
        // During analysis, step 3 is still "active" (dimmed)
        if (stepNum <= 3) step.classList.add('done');
      } else {
        if (stepNum < this.currentStep) step.classList.add('done');
        if (stepNum === this.currentStep) step.classList.add('active');
      }
    });
    document.querySelectorAll('.step-line').forEach((line, i) => {
      if (this.currentStep === '3.5') {
        line.classList.toggle('done', i + 1 <= 3);
      } else {
        line.classList.toggle('done', i + 1 < this.currentStep);
      }
    });
  },

  // --- Step 1: 自动思维 ---
  renderStep1_Thought() {
    this.elements.stepContent.innerHTML = `
      <div class="cbt-guide">
        <span class="step-badge">第 1 步 / 共 5 步</span>
        <h3>💭 捕捉自动思维</h3>
        <p class="cbt-explain">当焦虑来袭时，我们脑海里会自动冒出一些想法。先不做评判，把它们写下来。</p>
      </div>
      <div class="cbt-card">
        <label class="cbt-label">这时候，我心里在想什么？</label>
        <textarea id="cbt-worry" placeholder="比如：我担心明天的演讲会搞砸...&#10;比如：TA 没有回复我，是不是我哪里做错了...&#10;&#10;想到什么写什么，这里很安全。">${this.escapeHtml(this.formData.worry)}</textarea>
        <p class="cbt-hint">💡 试着写下脑海里的原话，不用修饰</p>
      </div>
    `;
    document.getElementById('cbt-worry').addEventListener('input', (e) => {
      this.formData.worry = e.target.value;
    });
  },

  // --- Step 2: 情绪识别 ---
  renderStep2_Emotion() {
    const level = this.formData.anxietyLevel;
    const colors = {
      1: 'var(--color-anxiety-low)', 2: 'var(--color-anxiety-low)', 3: 'var(--color-anxiety-low)',
      4: 'var(--color-anxiety-med)', 5: 'var(--color-anxiety-med)', 6: 'var(--color-anxiety-med)',
      7: 'var(--color-anxiety-high)', 8: 'var(--color-anxiety-high)',
      9: 'var(--color-anxiety-severe)', 10: 'var(--color-anxiety-severe)'
    };

    const selectedEmotions = this.formData.emotions || [];
    const emotionTags = CBT.emotions.map(em => {
      const isSelected = selectedEmotions.includes(em);
      return `<span class="emotion-tag${isSelected ? ' selected' : ''}" data-emotion="${em}">${em}</span>`;
    }).join('');

    this.elements.stepContent.innerHTML = `
      <div class="cbt-guide">
        <span class="step-badge">第 2 步 / 共 5 步</span>
        <h3>🎯 识别情绪</h3>
        <p class="cbt-explain">给情绪命名，可以帮大脑从"混乱"切换到"观察"模式。</p>
      </div>
      <div class="cbt-card">
        <label class="cbt-label">这种焦虑有多强烈？</label>
        <div class="anxiety-slider-container">
          <div class="anxiety-level-display" style="color:${colors[level]}">${level}</div>
          <input type="range" min="1" max="10" value="${level}" class="anxiety-slider" id="anxiety-slider">
          <div class="anxiety-labels">
            <span>一点点</span>
            <span>无法承受</span>
          </div>
        </div>
      </div>
      <div class="cbt-card">
        <label class="cbt-label">我感受到了哪些情绪？（可多选）</label>
        <div class="emotion-tags" id="emotion-tags">${emotionTags}</div>
        <p class="cbt-hint">${selectedEmotions.length > 0 ? '已选 ' + selectedEmotions.length + ' 个' : '💡 点击标签选择你感受到的情绪'}</p>
      </div>
    `;

    // Slider
    document.getElementById('anxiety-slider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      this.formData.anxietyLevel = val;
      const display = document.querySelector('.anxiety-level-display');
      if (display) { display.textContent = val; display.style.color = colors[val]; }
    });

    // Emotion tags
    document.querySelectorAll('.emotion-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const em = tag.dataset.emotion;
        const idx = this.formData.emotions.indexOf(em);
        if (idx >= 0) {
          this.formData.emotions.splice(idx, 1);
          tag.classList.remove('selected');
        } else {
          this.formData.emotions.push(em);
          tag.classList.add('selected');
        }
        const hint = document.querySelector('.cbt-hint');
        if (hint) {
          hint.textContent = this.formData.emotions.length > 0
            ? '已选 ' + this.formData.emotions.length + ' 个'
            : '💡 点击标签选择你感受到的情绪';
        }
      });
    });
  },

  // --- Step 3: 客观分析（增强版）---
  renderStep3_Evidence() {
    const e = this.formData.evidence;
    const worry = this.formData.worry ? '「' + this.formData.worry.substring(0, 40) + '...」' : '这个想法';

    this.elements.stepContent.innerHTML = `
      <div class="cbt-guide">
        <span class="step-badge">第 3 步 / 共 5 步</span>
        <h3>🔍 客观分析</h3>
        <p class="cbt-explain">像一个冷静的侦探，不带情绪地审视 ${worry}</p>
      </div>
      <div class="cbt-card">
        <label class="cbt-label">📋 支持这个想法的证据有哪些？（只写客观事实）</label>
        <textarea id="cbt-for" placeholder="比如：确实有一次类似的事情发生了...">${this.escapeHtml(e.forThought)}</textarea>
      </div>
      <div class="cbt-card">
        <label class="cbt-label">❌ 反对这个想法的证据有哪些？</label>
        <textarea id="cbt-against" placeholder="有没有反面的例子？过去有没有类似情况但结果没那么糟？...">${this.escapeHtml(e.againstThought)}</textarea>
      </div>
      <div class="cbt-card">
        <label class="cbt-label">🔄 还有没有其他可能的解释？</label>
        <textarea id="cbt-alternatives" placeholder="除了我担心的这种情况，还可能是什么？...">${this.escapeHtml(e.alternatives)}</textarea>
      </div>
      <div class="cbt-card" style="background:linear-gradient(135deg,#FFFBF7,rgba(163,181,166,0.06));border:1px solid rgba(163,181,166,0.15)">
        <label class="cbt-label">🏛️ 区分一下：哪些是客观事实，哪些是我的感受/猜测？</label>
        <textarea id="cbt-fact" placeholder="事实：TA没有回复我的消息。&#10;我的感受/猜测：TA讨厌我，故意不理我。&#10;&#10;把事实和猜测分开，往往能发现很多猜测缺乏证据。">${this.escapeHtml(e.factVsFeeling)}</textarea>
      </div>
      <div class="cbt-card" style="background:linear-gradient(135deg,#FFFBF7,rgba(163,181,166,0.06));border:1px solid rgba(163,181,166,0.15)">
        <label class="cbt-label">👁️ 一个完全不了解我的旁观者，看到这些事实会得出什么结论？</label>
        <textarea id="cbt-observer" placeholder="如果是一个路人看到同样的信息，TA会怎么想？旁观者往往比我们自己更客观。">${this.escapeHtml(e.observerView)}</textarea>
        <p class="cbt-hint">💡 这一步帮你跳出自己的情绪漩涡，看到更客观的画面</p>
      </div>
    `;
    document.getElementById('cbt-for').addEventListener('input', e => { this.formData.evidence.forThought = e.target.value; });
    document.getElementById('cbt-against').addEventListener('input', e => { this.formData.evidence.againstThought = e.target.value; });
    document.getElementById('cbt-alternatives').addEventListener('input', e => { this.formData.evidence.alternatives = e.target.value; });
    document.getElementById('cbt-fact').addEventListener('input', e => { this.formData.evidence.factVsFeeling = e.target.value; });
    document.getElementById('cbt-observer').addEventListener('input', e => { this.formData.evidence.observerView = e.target.value; });
  },

  // --- Step 3.5: 自动分析（认知扭曲检测）---
  renderStep3_5_Analysis() {
    const distortions = analyzeDistortions(this.formData.worry);
    this.formData._distortions = distortions;

    if (distortions.length > 0) {
      this.elements.stepContent.innerHTML = `
        <div class="cbt-guide">
          <span class="step-badge">✨ 自动分析</span>
          <h3>🧠 检测到可能的思维模式</h3>
          <p class="cbt-explain">根据你写下的内容，发现以下常见的思维陷阱（仅供参考）</p>
        </div>
        ${distortions.map(d => `
          <div class="cbt-card analysis-card fade-in" style="border-left:4px solid var(--color-accent)">
            <div class="analysis-header">
              <span class="analysis-icon">${d.icon}</span>
              <span class="analysis-name">${d.name}</span>
            </div>
            <p class="analysis-desc">${d.desc}</p>
            <p class="analysis-explain">💡 ${d.explain}</p>
          </div>
        `).join('')}
        <div class="cbt-card" style="background:var(--color-bg-secondary);text-align:center">
          <p style="font-size:14px;color:var(--color-text-secondary)">
            这些模式是大脑的"快捷方式"——它们曾经保护过我们，但现在可能帮倒忙了。<br><br>
            识别它们，就是改变的第一步。🌱
          </p>
        </div>`;
    } else {
      this.elements.stepContent.innerHTML = `
        <div class="cbt-guide">
          <span class="step-badge">✨ 自动分析</span>
          <h3>🧠 思维模式分析</h3>
          <p class="cbt-explain">未检测到明显的思维陷阱模式——你的想法似乎比较平衡。</p>
        </div>
        <div class="cbt-card" style="background:var(--color-bg-secondary);text-align:center">
          <p style="font-size:14px;color:var(--color-green-dark)">
            👍 很好！你的描述方式比较客观。后面的步骤一样能帮助你梳理思路。
          </p>
        </div>`;
    }
  },

  // --- Step 4: 重构认知 + AI分析（增强版）---
  renderStep4_Reframe() {
    const r = this.formData.reframe;
    const f = this.formData;

    // Build AI prompt data
    const aiMessages = [
      { role: 'system', content: '你是一位温暖、专业的认知行为治疗师。用中文回复，300字以内，像朋友一样说话。' },
      { role: 'user', content: `请帮我客观分析：\n\n【焦虑的事】${f.worry || '未填写'}\n【情绪】${f.emotions.length > 0 ? f.emotions.join('、') : '焦虑'} | 强度${f.anxietyLevel}/10\n【支持证据】${f.evidence.forThought || '无'}\n【反对证据】${f.evidence.againstThought || '无'}\n【其他解释】${f.evidence.alternatives || '无'}\n【事实vs感受】${f.evidence.factVsFeeling || '无'}\n\n从以下维度分析：\n1. 哪些是事实、哪些是过度解读？\n2. 有没有更客观的解释？\n3. 如果是朋友这样想，怎么开导TA？\n4. 给一个具体可行的下一步建议。` }
    ];

    this.elements.stepContent.innerHTML = `
      <div class="cbt-guide">
        <span class="step-badge">第 4 步 / 共 5 步</span>
        <h3>🪞 重构认知 & 找到成长</h3>
        <p class="cbt-explain">AI 先帮你客观分析，然后你再深入思考。</p>
      </div>

      <!-- AI Analysis Card -->
      <div class="cbt-card ai-card">
        <div class="ai-card-header">
          <span style="font-size:24px">🤖</span>
          <span class="ai-card-title">AI 客观分析</span>
        </div>
        <div id="ai-config-area" style="${localStorage.getItem('ds_api_key') ? 'display:none' : ''}">
          <p class="cbt-hint" style="margin-bottom:8px">首次使用需配置 DeepSeek API Key（<a href="https://platform.deepseek.com/api_keys" target="_blank" style="color:var(--color-accent)">免费获取</a>，存在浏览器本地）</p>
          <div style="display:flex;gap:8px">
            <input id="cbt-apikey" type="password" placeholder="粘贴 DeepSeek API Key..." style="flex:1;font-size:13px;padding:6px 10px;border:1px solid var(--color-text-muted);border-radius:var(--radius-sm)">
            <button class="btn-primary" id="cbt-save-key" style="font-size:12px;padding:6px 12px;white-space:nowrap">💾 保存密钥</button>
          </div>
        </div>
        <button class="btn-primary ai-analyze-btn" id="cbt-ai-analyze" style="width:100%;margin:8px 0">🤖 AI 帮我客观分析</button>
        <div id="cbt-ai-loading" style="display:none;text-align:center;padding:12px"><span class="ai-loading-text">AI 正在分析...</span></div>
        <textarea id="cbt-ai-result" placeholder="AI 分析结果会出现在这里..." class="ai-result-textarea">${this.escapeHtml(r.aiAnalysis || '')}</textarea>
      </div>

      <div class="cbt-card">
        <label class="cbt-label">⚖️ 综合所有证据，一个更平衡、更现实的想法是什么？</label>
        <textarea id="cbt-balanced" placeholder="把正反证据结合起来...&#10;比如：「虽然TA没回消息让我不安，但TA可能在忙，不代表讨厌我。」">${this.escapeHtml(r.balancedThought)}</textarea>
      </div>
      <div class="cbt-card">
        <label class="cbt-label">🚶 我现在可以做的一个微小行动是什么？</label>
        <textarea id="cbt-action" placeholder="不需要解决所有问题，只需一个具体可操作的小步骤...">${this.escapeHtml(r.actionPlan)}</textarea>
      </div>
      <div class="cbt-card" style="background: linear-gradient(135deg, #FFFBF7, rgba(163,181,166,0.08)); border: 1px solid rgba(163,181,166,0.2);">
        <label class="cbt-label">🌱 这次经历想教会我什么？我能获得什么成长？</label>
        <textarea id="cbt-growth" placeholder="焦虑常常是一面镜子...&#10;比如：「这件事在提醒我要更多相信自己的价值。」">${this.escapeHtml(r.growthInsight)}</textarea>
      </div>
      <div class="cbt-card">
        <label class="cbt-label">🗓️ 三个月后回头看这件事，我会怎么评价它？它还重要吗？</label>
        <textarea id="cbt-future" placeholder="想象三个月后的自己，已经走过了这段时间...那时的我会怎么看待今天这件事？">${this.escapeHtml(r.futureSelf)}</textarea>
        <p class="cbt-hint">💡 时间是最好的滤镜。大部分现在让我们焦虑的事，三个月后都不算什么。</p>
      </div>
      <div class="cbt-card">
        <label class="cbt-label">👫 如果是我最好的朋友遇到同样的事，我会对TA说什么？</label>
        <textarea id="cbt-friend" placeholder="我们通常对朋友比对自己更温柔、更理性...把对朋友说的话，说给自己听。">${this.escapeHtml(r.friendAdvice)}</textarea>
        <p class="cbt-hint">💡 你给朋友的建议，往往也是你自己最需要的。</p>
      </div>
    `;

    // Bind textarea inputs
    document.getElementById('cbt-ai-result').addEventListener('input', e => { this.formData.reframe.aiAnalysis = e.target.value; });
    document.getElementById('cbt-balanced').addEventListener('input', e => { this.formData.reframe.balancedThought = e.target.value; });
    document.getElementById('cbt-action').addEventListener('input', e => { this.formData.reframe.actionPlan = e.target.value; });
    document.getElementById('cbt-growth').addEventListener('input', e => { this.formData.reframe.growthInsight = e.target.value; });
    document.getElementById('cbt-future').addEventListener('input', e => { this.formData.reframe.futureSelf = e.target.value; });
    document.getElementById('cbt-friend').addEventListener('input', e => { this.formData.reframe.friendAdvice = e.target.value; });

    // API Key save
    const saveKeyBtn = document.getElementById('cbt-save-key');
    if (saveKeyBtn) saveKeyBtn.addEventListener('click', () => {
      const key = document.getElementById('cbt-apikey').value.trim();
      if (key) { localStorage.setItem('ds_api_key', key); document.getElementById('ai-config-area').style.display = 'none'; saveKeyBtn.textContent = '✅ 已保存'; }
    });

    // AI Analyze button — auto-trigger if API key exists
    const analyzeBtn = document.getElementById('cbt-ai-analyze');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.callAI());
      // Auto-trigger if API key is saved
      if (localStorage.getItem('ds_api_key') && !r.aiAnalysis) {
        setTimeout(() => this.callAI(), 500);
      }
    }
  },

  async callAI() {
    const apiKey = localStorage.getItem('ds_api_key');
    if (!apiKey) {
      document.getElementById('ai-config-area').style.display = 'block';
      document.getElementById('cbt-apikey').focus();
      return;
    }
    const btn = document.getElementById('cbt-ai-analyze');
    const loading = document.getElementById('cbt-ai-loading');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ 分析中...'; }
    if (loading) loading.style.display = 'block';

    try {
      const f = this.formData;
      const aiMessages = [
        { role: 'system', content: '你是一位温暖、专业的认知行为治疗师。用中文回复，300字以内，像朋友一样说话。' },
        { role: 'user', content: `请帮我客观分析：\n\n【焦虑的事】${f.worry || '未填写'}\n【情绪】${f.emotions.length > 0 ? f.emotions.join('、') : '焦虑'} | 强度${f.anxietyLevel}/10\n【支持证据】${f.evidence.forThought || '无'}\n【反对证据】${f.evidence.againstThought || '无'}\n【其他解释】${f.evidence.alternatives || '无'}\n【事实vs感受】${f.evidence.factVsFeeling || '无'}\n\n从以下维度分析：\n1. 哪些是事实、哪些是过度解读？\n2. 有没有更客观的解释？\n3. 如果是朋友这样想，怎么开导TA？\n4. 给一个具体可行的下一步建议。` }
      ];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({ model: 'deepseek-chat', messages: aiMessages, max_tokens: 500, temperature: 0.7 }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const json = await resp.json();
      if (json.choices && json.choices[0]) {
        const result = json.choices[0].message.content;
        const ta = document.getElementById('cbt-ai-result');
        if (ta) ta.value = result;
        this.formData.reframe.aiAnalysis = result;
      } else {
        alert('API 错误：' + (json.error?.message || '未知错误，请检查 API Key'));
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        const ta = document.getElementById('cbt-ai-result');
        if (ta) ta.value = '[AI 响应超时，请重试或手动填写]\n\n别担心，你自己的思考同样有效。试着按下面的引导写一写吧 🌱';
      } else {
        alert('请求失败：' + e.message + '\n\n请检查网络连接');
      }
    }
    if (btn) { btn.disabled = false; btn.textContent = '🤖 AI 重新分析'; }
    if (loading) loading.style.display = 'none';
  },

  // --- Step 5: 总结 & 给自己的话 ---
  renderStep5_Summary() {
    const level = this.formData.anxietyLevel;
    const soothe = CBT.sootheMessages[level] || CBT.sootheMessages[5];
    const quote = CBT.closingQuotes[Math.floor(Math.random() * CBT.closingQuotes.length)];

    // Build self-compassion note from their answers
    const worry = this.formData.worry || '一些事情';
    const balanced = this.formData.reframe.balancedThought || '我需要给自己多一点时间和空间';
    const action = this.formData.reframe.actionPlan || '先深呼吸，照顾好自己';
    const emotions = this.formData.emotions.length > 0
      ? this.formData.emotions.join('、')
      : '各种复杂的情绪';

    const selfNote = [
      '亲爱的自己，',
      '',
      '我看到了你因为「' + (worry || '一些事情').substring(0, 50) + '」而感到' + emotions + '。你的感受是真实的，不需要否定它们。',
      '',
      ...(this.formData._distortions && this.formData._distortions.length > 0 ? [
        '','🧠 自动分析：我发现了这些思维模式：','',
        ...this.formData._distortions.map(d => '   ' + d.icon + ' ' + d.name + '：' + d.desc), '',
        '   识别它们就是改变的第一步。它们不是我的错，只是大脑的旧习惯。','',
      ] : []),
      ...(this.formData.reframe.aiAnalysis ? ['','🤖 AI 的客观分析：','',this.formData.reframe.aiAnalysis.substring(0, 300),''] : []),
      '',
      '🔍 客观来看：',
      '   事实 vs 感受：' + ((this.formData.evidence.factVsFeeling || '我区分了事实和猜测，发现很多担心其实没有确凿证据').substring(0, 90)),
      '   旁观者视角：' + ((this.formData.evidence.observerView || '一个局外人可能会看到比我想象中更温和的画面').substring(0, 90)),
      '',
      '⚖️ 更平衡的想法：' + (balanced.substring(0, 100)),
      '',
      '🚶 我的一小步：' + (action.substring(0, 80)),
      '',
      '🗓️ 三个月后回看：' + ((this.formData.reframe.futureSelf || '到那时候，这件事可能已经不重要了').substring(0, 90)),
      '',
      '👫 对朋友说的话（也是对自己说的）：' + ((this.formData.reframe.friendAdvice || '宝贝，你已经做得很好了').substring(0, 90)),
      '',
      '🌱 成长：' + ((this.formData.reframe.growthInsight || '我正在学习更好地照顾自己').substring(0, 100)),
      '',
      '最后：' + soothe,
      '',
      '我会越来越好。',
      '',
      '—— ' + quote
    ].join('\n');

    this.formData._selfNote = selfNote;

    this.elements.stepContent.innerHTML = `
      <div class="cbt-guide">
        <span class="step-badge">第 5 步 / 共 5 步</span>
        <h3>💌 给自己的话</h3>
        <p class="cbt-explain">根据你刚才的探索，这是写给你自己的一封信。可以修改它。</p>
      </div>
      <div class="cbt-card cbt-self-note">
        <div class="self-note-header">
          <span class="self-note-icon">💌</span>
          <span>给自己的一封信</span>
        </div>
        <textarea id="cbt-selfnote" class="self-note-textarea">${this.escapeHtml(selfNote)}</textarea>
        <p class="cbt-hint">💡 你可以修改上面的文字，然后保存。以后回来看，会很有力量。</p>
      </div>
      <div class="cbt-soothe-card" style="border-left-color: ${this.getLevelColor(level)}">
        <p class="soothe-text">${soothe}</p>
      </div>
    `;

    document.getElementById('cbt-selfnote').addEventListener('input', (e) => {
      this.formData._selfNote = e.target.value;
    });
  },

  getLevelColor(level) {
    if (level <= 3) return 'var(--color-anxiety-low)';
    if (level <= 6) return 'var(--color-anxiety-med)';
    if (level <= 8) return 'var(--color-anxiety-high)';
    return 'var(--color-anxiety-severe)';
  },

  // ==========================================
  // Navigation
  // ==========================================

  renderNav() {
    let html = '';
    if (this.currentStep === '3.5') {
      // Analysis page: show back + continue buttons
      html += `<button class="btn-secondary" id="step-prev">← 返回修改</button>`;
      html += `<button class="btn-primary" id="step-next" style="margin-left:auto;">继续下一步 →</button>`;
    } else {
      if (this.currentStep > 1) {
        html += `<button class="btn-secondary" id="step-prev">← 上一步</button>`;
      }
      if (this.currentStep < this.totalSteps) {
        html += `<button class="btn-primary" id="step-next" style="margin-left:auto;">下一步 →</button>`;
      } else {
        html += `<button class="btn-primary" id="step-save" style="margin-left:auto;">💾 保存这封信</button>`;
      }
    }
    this.elements.stepNav.innerHTML = html;

    const prevBtn = document.getElementById('step-prev');
    const nextBtn = document.getElementById('step-next');
    const saveBtn = document.getElementById('step-save');

    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (this.currentStep === '3.5') {
        this.currentStep = 3;
      } else {
        this.currentStep--;
      }
      this.renderStep();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (this.currentStep === 3) {
        this.currentStep = '3.5';
      } else if (this.currentStep === '3.5') {
        this.currentStep = 4;
      } else {
        this.currentStep++;
      }
      this.renderStep();
    });
    if (saveBtn) saveBtn.addEventListener('click', () => this.save());
  },

  // ==========================================
  // Save
  // ==========================================

  async save() {
    await JingXin.IPC.invoke('anxiety:save', {
      worry: this.formData.worry,
      anxietyLevel: this.formData.anxietyLevel,
      emotions: this.formData.emotions,
      evidence: { ...this.formData.evidence },
      reframe: { ...this.formData.reframe },
      selfNote: this.formData._selfNote || '',
      aiAnalysis: this.formData.reframe.aiAnalysis || '',
      distortions: this.formData._distortions || []
    });

    // Show growth-oriented completion
    const quote = CBT.closingQuotes[Math.floor(Math.random() * CBT.closingQuotes.length)];
    this.elements.stepContent.innerHTML = `
      <div class="completion-card fade-in">
        <div class="completion-icon">🌱</div>
        <h3>你又成长了一点</h3>
        <p class="completion-desc">
          你完整地走过了 5 个步骤：<br>
          <span class="steps-recap">觉察 → 面对 → 分析 → 重构 → 成长</span>
        </p>
        <div class="completion-quote">
          <p>"${quote}"</p>
        </div>
        <p class="text-muted" style="margin-top:var(--space-md); font-size:var(--font-size-sm);">
          以后回看这封信，你会看到自己的进步轨迹。
        </p>
      </div>
    `;
    this.elements.stepNav.innerHTML = `
      <button class="btn-primary" id="step-new" style="width:100%;">写新的 →</button>
    `;
    document.getElementById('step-new').addEventListener('click', () => {
      this.resetForm();
    });

    await this.loadEntries();
  },

  resetForm() {
    this.currentStep = 1;
    this.formData = {
      worry: '',
      anxietyLevel: 5,
      emotions: [],
      evidence: { forThought: '', againstThought: '', alternatives: '', factVsFeeling: '', observerView: '' },
      reframe: { balancedThought: '', actionPlan: '', growthInsight: '', futureSelf: '', friendAdvice: '', aiAnalysis: '' },
      _selfNote: '',
      _distortions: []
    };
    this.renderStep();
  },

  // ==========================================
  // History
  // ==========================================

  renderHistory() {
    const list = this.elements.historyList;
    if (this.entries.length === 0) {
      list.innerHTML = '<p class="text-muted" style="text-align:center;padding:var(--space-md);">还没有记录，开始你的第一次 CBT 之旅吧</p>';
      return;
    }

    const levelColors = {
      1: 'var(--color-anxiety-low)', 2: 'var(--color-anxiety-low)', 3: 'var(--color-anxiety-low)',
      4: 'var(--color-anxiety-med)', 5: 'var(--color-anxiety-med)', 6: 'var(--color-anxiety-med)',
      7: 'var(--color-anxiety-high)', 8: 'var(--color-anxiety-high)',
      9: 'var(--color-anxiety-severe)', 10: 'var(--color-anxiety-severe)'
    };
    const levelLabels = {
      1: '很轻', 2: '很轻', 3: '轻度',
      4: '中等', 5: '中等', 6: '中等',
      7: '较重', 8: '较重',
      9: '严重', 10: '严重'
    };

    list.innerHTML = this.entries.map(entry => {
      const date = new Date(entry.createdAt);
      const dateStr = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const level = entry.anxietyLevel || 5;
      const emotions = (entry.emotions && entry.emotions.length > 0)
        ? entry.emotions.map(e => `<span class="mini-tag">${this.escapeHtml(e)}</span>`).join(' ')
        : '';
      const selfNote = entry.selfNote || '';
      const ev = entry.evidence || {};
      const rf = entry.reframe || {};
      // Also check root-level aiAnalysis (from older format)
      if (!rf.aiAnalysis && entry.aiAnalysis) rf.aiAnalysis = entry.aiAnalysis;

      return `
        <div class="anxiety-entry-item" data-id="${entry.id}">
          <div class="anxiety-entry-header">
            <span class="anxiety-entry-date">${dateStr}</span>
            <span class="badge" style="background:${levelColors[level]}20;color:${levelColors[level]}">
              焦虑 ${level} · ${levelLabels[level]}
            </span>
          </div>
          <div class="anxiety-entry-worry">${this.escapeHtml((entry.worry || '').substring(0, 100))}</div>
          ${emotions ? `<div class="entry-emotions">${emotions}</div>` : ''}
          <div class="anxiety-entry-analysis">
            ${ev.forThought ? `<div class="analysis-answer"><div class="q">📋 支持证据</div><div class="a">${this.escapeHtml(ev.forThought)}</div></div>` : ''}
            ${ev.againstThought ? `<div class="analysis-answer"><div class="q">❌ 反对证据</div><div class="a">${this.escapeHtml(ev.againstThought)}</div></div>` : ''}
            ${ev.alternatives ? `<div class="analysis-answer"><div class="q">🔄 其他解释</div><div class="a">${this.escapeHtml(ev.alternatives)}</div></div>` : ''}
            ${ev.factVsFeeling ? `<div class="analysis-answer"><div class="q">🏛️ 事实vs感受</div><div class="a">${this.escapeHtml(ev.factVsFeeling)}</div></div>` : ''}
            ${ev.observerView ? `<div class="analysis-answer"><div class="q">👁️ 旁观者视角</div><div class="a">${this.escapeHtml(ev.observerView)}</div></div>` : ''}
            ${(entry.distortions && entry.distortions.length > 0) ? `<div class="analysis-answer"><div class="q">🧠 思维模式</div><div class="a">${entry.distortions.map(d => d.icon + ' ' + d.name).join('、')}</div></div>` : ''}
            ${rf.aiAnalysis ? `<div class="analysis-answer ai-history-block"><div class="q">🤖 AI 分析</div><div class="a">${this.escapeHtml(rf.aiAnalysis.substring(0, 200))}</div></div>` : ''}
            ${rf.balancedThought ? `<div class="analysis-answer"><div class="q">⚖️ 平衡想法</div><div class="a">${this.escapeHtml(rf.balancedThought)}</div></div>` : ''}
            ${rf.actionPlan ? `<div class="analysis-answer"><div class="q">🚶 行动方案</div><div class="a">${this.escapeHtml(rf.actionPlan)}</div></div>` : ''}
            ${rf.growthInsight ? `<div class="analysis-answer"><div class="q">🌱 成长洞察</div><div class="a">${this.escapeHtml(rf.growthInsight)}</div></div>` : ''}
            ${rf.futureSelf ? `<div class="analysis-answer"><div class="q">🗓️ 三个月后</div><div class="a">${this.escapeHtml(rf.futureSelf)}</div></div>` : ''}
            ${rf.friendAdvice ? `<div class="analysis-answer"><div class="q">👫 对朋友说的话</div><div class="a">${this.escapeHtml(rf.friendAdvice)}</div></div>` : ''}
            ${selfNote ? `<div class="analysis-answer"><div class="q">💌 给自己的信</div><div class="a self-note-preview">${this.escapeHtml(selfNote.substring(0, 150))}...</div></div>` : ''}
            <button class="btn-ghost btn-small anxiety-delete-btn" data-id="${entry.id}" style="margin-top:var(--space-sm);color:var(--color-text-muted);">🗑️ 删除</button>
          </div>
        </div>
      `;
    }).join('');

    // Expand/collapse
    list.querySelectorAll('.anxiety-entry-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.anxiety-delete-btn')) return;
        item.classList.toggle('expanded');
      });
    });

    // Delete
    list.querySelectorAll('.anxiety-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await JingXin.IPC.invoke('anxiety:delete', { id: btn.dataset.id });
        await this.loadEntries();
      });
    });
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  // ==========================================
  // Trend Dashboard (跨条目分析)
  // ==========================================

  _getAvgLevel(entries, fromDays, toDays) {
    const now = Date.now();
    const filtered = entries.filter(e => {
      const age = (now - new Date(e.createdAt).getTime()) / 86400000;
      return age >= fromDays && age < toDays;
    });
    if (filtered.length === 0) return null;
    return (filtered.reduce((s, e) => s + (e.anxietyLevel || 5), 0) / filtered.length).toFixed(1);
  },

  _getDistortionFrequency() {
    const counts = {};
    for (const e of this.entries) {
      const dists = e.distortions || [];
      for (const d of dists) {
        counts[d.name] = (counts[d.name] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  },

  _getTopTriggers() {
    const triggers = { work: { keys: /工作|老板|领导|同事|加班|考核|面试|开会/, count: 0, levels: [] }, love: { keys: /伴侣|对象|男朋友|女朋友|分手|吵架|冷战/, count: 0, levels: [] }, health: { keys: /身体|病|疼|失眠|头痛|心跳|检查/, count: 0, levels: [] }, money: { keys: /钱|经济|房贷|房租|花呗|工资|穷/, count: 0, levels: [] }, social: { keys: /社交|朋友|聚会|微信|回复|消息/, count: 0, levels: [] } };
    const labels = { work: '💼 工作', love: '💕 关系', health: '🏥 健康', money: '💰 经济', social: '💬 社交' };
    for (const e of this.entries) {
      const w = e.worry || '';
      for (const [key, t] of Object.entries(triggers)) {
        if (t.keys.test(w)) { t.count++; t.levels.push(e.anxietyLevel || 5); }
      }
    }
    return Object.entries(triggers).filter(([, t]) => t.count > 0).map(([key, t]) => ({
      label: labels[key], count: t.count, avg: (t.levels.reduce((a, b) => a + b, 0) / t.levels.length).toFixed(1)
    })).sort((a, b) => b.count - a.count).slice(0, 3);
  },

  _renderTrendDashboard() {
    if (this.entries.length < 3) return ''; // Need at least 3 entries

    const recentAvg = this._getAvgLevel(this.entries, 0, 7);
    const prevAvg = this._getAvgLevel(this.entries, 7, 14);
    let arrowHtml = '';
    if (recentAvg !== null && prevAvg !== null) {
      const diff = (parseFloat(recentAvg) - parseFloat(prevAvg)).toFixed(1);
      if (diff < -0.5) arrowHtml = `<span class="trend-arrow-down">↓ ${Math.abs(diff)} 降低中 🌱</span>`;
      else if (diff > 0.5) arrowHtml = `<span class="trend-arrow-up">↑ ${diff} 升高了 💛</span>`;
      else arrowHtml = `<span class="trend-arrow-flat">→ 持平</span>`;
    }

    const distro = this._getDistortionFrequency();
    const triggers = this._getTopTriggers();
    const all = this.entries;
    const totalAvg = all.length > 0 ? (all.reduce((s, e) => s + (e.anxietyLevel || 5), 0) / all.length).toFixed(1) : '-';
    const max = all.length > 0 ? Math.max(...all.map(e => e.anxietyLevel || 5)) : '-';

    // Gratitude correlation
    const corrData = JingXin.CrossFeature.getCorrelationData(30);
    const gratitudeDays = corrData.filter(d => d.gratitudeCount > 0 && d.anxietyAvg);
    const noGratDays = corrData.filter(d => d.gratitudeCount === 0 && d.anxietyAvg);
    let corrHtml = '';
    if (gratitudeDays.length >= 3 && noGratDays.length >= 3) {
      const withGratAvg = (gratitudeDays.reduce((s, d) => s + parseFloat(d.anxietyAvg), 0) / gratitudeDays.length).toFixed(1);
      const withoutGratAvg = (noGratDays.reduce((s, d) => s + parseFloat(d.anxietyAvg), 0) / noGratDays.length).toFixed(1);
      const corrDiff = (withGratAvg - withoutGratAvg).toFixed(1);
      if (corrDiff < 0) {
        corrHtml = `<div class="correlation-card">📎 有记录收获的日子，焦虑平均 <b>${withGratAvg}</b> 分（vs 无记录日 <b>${withoutGratAvg}</b>）——觉察开心的能力在帮你 🌿</div>`;
      } else if (corrDiff < 0.3) {
        corrHtml = `<div class="correlation-card">📎 有收获日和无收获日的焦虑水平差不多——多积累几天数据再看看趋势</div>`;
      }
    }

    const trigHtml = triggers.length > 0 ? `
      <div class="trend-section">
        <div class="trend-section-title">🎯 最常触发的领域</div>
        ${triggers.map(t => `<div class="trigger-row"><span>${t.label}</span><span class="trigger-stat">${t.count}次 · 平均${t.avg}分${parseFloat(t.avg) >= 7 ? ' ⚠️' : ''}</span></div>`).join('')}
      </div>
    ` : '';

    return `
      <div class="trend-dashboard fade-in">
        <div class="trend-dashboard-title">📈 你的焦虑趋势</div>
        <div class="trend-section">
          <div class="trend-metrics">
            <div class="trend-metric"><span class="metric-val">${totalAvg}</span><span class="metric-label">总体平均</span></div>
            <div class="trend-metric"><span class="metric-val">${max}</span><span class="metric-label">最高</span></div>
            <div class="trend-metric"><span class="metric-val">${all.length}</span><span class="metric-label">总记录</span></div>
          </div>
          ${recentAvg ? `<div class="trend-compare">近7天平均: <b>${recentAvg}</b> ${arrowHtml}</div>` : ''}
        </div>

        ${trigHtml}

        ${distro.length > 0 ? `
        <div class="trend-section">
          <div class="trend-section-title">🧠 思维模式频率</div>
          ${distro.slice(0, 5).map(([name, count]) => {
            const pct = Math.round(count / all.length * 100);
            return `<div class="distro-row"><span class="distro-label">${name}</span><div class="distro-bar"><div class="distro-bar-fill" style="width:${Math.max(pct, 5)}%"></div></div><span class="distro-count">${count}次</span></div>`;
          }).join('')}
        </div>
        ` : ''}

        ${corrHtml}
      </div>
    `;
  },

  onShow() {
    console.log('[焦虑日记] onShow, 当前步骤:', this.currentStep);
    if (this.elements.stepContent && !this.elements.stepContent.innerHTML.trim()) {
      this.renderStep();
    }
  }
};
