/* ============================================
   静心 — Breathing Guide Feature
   ============================================ */

window.JingXin = window.JingXin || {};

JingXin.Breathing = {
  mode: '478',
  durationMinutes: 3,
  isRunning: false,
  isPaused: false,
  sessionTimer: null,
  phaseTimer: null,
  phaseIndex: 0,
  phaseSeconds: 0,
  elapsedSeconds: 0,
  elements: {},

  phases: {
    '478': [
      { name: '吸气', duration: 4, scale: 'inhale', color: 'amber' },
      { name: '屏息', duration: 7, scale: 'hold', color: 'neutral' },
      { name: '呼气', duration: 8, scale: 'exhale', color: 'green' }
    ],
    'box': [
      { name: '吸气', duration: 4, scale: 'inhale', color: 'amber' },
      { name: '屏息', duration: 4, scale: 'hold', color: 'neutral' },
      { name: '呼气', duration: 4, scale: 'exhale', color: 'green' },
      { name: '屏息', duration: 4, scale: 'hold', color: 'neutral' }
    ],
    'simple': [
      { name: '吸气', duration: 4, scale: 'inhale', color: 'amber' },
      { name: '呼气', duration: 6, scale: 'exhale', color: 'green' }
    ]
  },

  async init() {
    this.cacheElements();
    this.attachListeners();

    // Load saved defaults
    const settings = JingXin.settings;
    if (settings && settings.breathing) {
      this.mode = settings.breathing.defaultMode || '478';
      this.durationMinutes = settings.breathing.defaultDurationMinutes || 3;
    }

    this.updateModeUI();
    this.updateDurationUI();
    this.resetCircle();
  },

  cacheElements() {
    this.elements = {
      circle: document.getElementById('breathing-circle'),
      phaseLabel: document.getElementById('breathing-phase-label'),
      phaseTimer: document.getElementById('breathing-phase-timer'),
      startBtn: document.getElementById('breathing-start-btn'),
      modeBtns: document.querySelectorAll('#breathing-modes .mode-btn'),
      durationBtns: document.querySelectorAll('#duration-selector .duration-btn'),
      progress: document.getElementById('breathing-progress')
    };
  },

  attachListeners() {
    // Mode selection
    this.elements.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isRunning) return;
        this.mode = btn.dataset.mode;
        this.updateModeUI();
      });
    });

    // Duration selection
    this.elements.durationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isRunning) return;
        this.durationMinutes = parseInt(btn.dataset.duration);
        this.updateDurationUI();
      });
    });

    // Start/Pause/Stop
    this.elements.startBtn.addEventListener('click', () => {
      if (!this.isRunning) {
        this.start();
      } else if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    });
  },

  updateModeUI() {
    this.elements.modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.mode);
    });
  },

  updateDurationUI() {
    this.elements.durationBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.duration) === this.durationMinutes);
    });
  },

  resetCircle() {
    this.elements.circle.className = 'breathing-circle';
    this.elements.phaseLabel.textContent = '准备';
    this.elements.phaseTimer.textContent = '';
    this.elements.progress.classList.remove('active');
    this.elements.startBtn.textContent = '开始';
    this.elements.startBtn.classList.remove('pause');
  },

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.phaseIndex = 0;
    this.elapsedSeconds = 0;
    this.elements.startBtn.textContent = '暂停';
    this.elements.progress.classList.add('active');
    this.updateProgressBar();
    this.runPhase();

    // Disable mode/duration changes
    this.elements.modeBtns.forEach(b => b.style.pointerEvents = 'none');
    this.elements.durationBtns.forEach(b => b.style.pointerEvents = 'none');
  },

  pause() {
    this.isPaused = true;
    this.elements.startBtn.textContent = '继续';
    this.elements.startBtn.classList.add('pause');
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    if (this.sessionTimer) clearInterval(this.sessionTimer);
  },

  resume() {
    this.isPaused = false;
    this.elements.startBtn.textContent = '暂停';
    this.elements.startBtn.classList.remove('pause');
    this.runPhase();
  },

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    if (this.sessionTimer) clearInterval(this.sessionTimer);
    this.resetCircle();
    this.elements.modeBtns.forEach(b => b.style.pointerEvents = '');
    this.elements.durationBtns.forEach(b => b.style.pointerEvents = '');

    // Show completion message
    this.elements.phaseLabel.textContent = '做得好';
    this.elements.phaseTimer.textContent = '🌿';
  },

  runPhase() {
    if (!this.isRunning || this.isPaused) return;
    if (this.elapsedSeconds >= this.durationMinutes * 60) {
      this.stop();
      return;
    }

    const phases = this.phases[this.mode];
    const phase = phases[this.phaseIndex % phases.length];
    this.phaseSeconds = phase.duration;

    // Update circle class
    this.elements.circle.className = 'breathing-circle';
    // Force reflow then set class
    void this.elements.circle.offsetWidth;
    this.elements.circle.classList.add(phase.scale);

    // Set transition duration to match phase
    this.elements.circle.style.transition = `transform ${phase.duration}s ease, box-shadow ${phase.duration}s ease`;

    // Update labels
    this.elements.phaseLabel.textContent = phase.name;
    this.elements.phaseTimer.textContent = phase.duration;

    // Countdown within phase
    let remaining = phase.duration;
    this.phaseTimer = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        this.elements.phaseTimer.textContent = remaining;
      }
    }, 1000);

    // Move to next phase after duration
    this.sessionTimer = setTimeout(() => {
      clearInterval(this.phaseTimer);
      this.elapsedSeconds += phase.duration;
      this.phaseIndex++;
      this.updateProgressBar();
      this.runPhase();
    }, phase.duration * 1000);
  },

  updateProgressBar() {
    const totalSeconds = this.durationMinutes * 60;
    const pct = Math.min(100, Math.round((this.elapsedSeconds / totalSeconds) * 100));
    this.elements.progress.innerHTML = `<div class="breathing-progress-bar" style="width:${pct}%"></div>`;
  },

  onShow() {
    if (!this.isRunning) {
      this.resetCircle();
      this.updateModeUI();
      this.updateDurationUI();
    }
  }
};
