const ICON_SUN  = '\u2600\uFE0F';
const ICON_MOON = '\uD83C\uDF19';

class QuizGame {
  constructor() {
    this.config = {
      SUPABASE_URL: 'https://qffcnljopolajeufkrah.supabase.co',
      SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZmNubGpvcG9sYWpldWZrcmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzkzNjMsImV4cCI6MjA3NDY1NTM2M30.0vst_km_pweyF2IslQ24JzMF281oYeaaeIEQM0aKkUg',
      APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx0cVV4vnwhYtB1__nYjKRvIpBC9lILEgyfgYomlb7pJh266i7QAItNo5BVPUvFCyLq4A/exec',
      QUESTIONS_URL: './questions.json',
      RANDOMIZE_QUESTIONS: true,
      RANDOMIZE_ANSWERS: true,
      QUESTION_TIME: 80,
      MAX_WRONG_ANSWERS: 3,
      STARTING_SCORE: 100,
      LEVELS: [
        { name: "easy", label: "سهل" },
        { name: "medium", label: "متوسط" },
        { name: "hard", label: "صعب" },
        { name: "impossible", label: "مستحيل" }
      ],
      HELPER_COSTS: {
        fiftyFifty: 100,
        freezeTime: 100,
        skipQuestionBase: 0,
        skipQuestionIncrement: 0
      },
      SKIP_WEIGHT: 0.7,
    };

    this.supabase = null;
    this.questions = {};
    this.gameState = {};
    this.timer = { interval: null, isFrozen: false, total: 0 };
    this.dom = {};
    this.cropper = null;
    this.leaderboardSubscription = null;
    this.recentErrors = [];
    window.addEventListener('error', (ev) => this.logError(ev));
    window.addEventListener('unhandledrejection', (ev) => this.logError(ev));
    this.init();
  }

  logError(ev) {
    const errorData = ev.type === 'error'
      ? { type: 'error', message: ev.message, source: ev.filename, line: ev.lineno, col: ev.colno, time: new Date().toISOString() }
      : { type: 'unhandledrejection', reason: String(ev.reason || ''), time: new Date().toISOString() };
    this.recentErrors.push(errorData);
    this.recentErrors = this.recentErrors.slice(-10);
  }

  async init() {
    this.cacheDomElements();
    this.bindEventListeners();
    this.populateAvatarGrid();
    try {
      this.supabase = supabase.createClient(this.config.SUPABASE_URL, this.config.SUPABASE_KEY);
      if (!this.supabase) throw new Error("Supabase client failed to initialize.");
    } catch (error) {
      console.error("Error initializing Supabase:", error);
      this.showToast("خطأ في الاتصال بقاعدة البيانات", "error");
      this.getEl('#loaderText').textContent = "خطأ في الاتصال بالخادم.";
      return;
    }
    const questionsLoaded = await this.loadQuestions();
    if (questionsLoaded) {
      this.showScreen('start');
    } else {
      this.getEl('#loaderText').textContent = "حدث خطأ في تحميل الأسئلة. الرجاء تحديث الصفحة.";
    }
    this.dom.screens.loader.classList.remove('active');
  }

  cacheDomElements() {
    const byId = (id) => document.getElementById(id);
    this.dom = {
      screens: {
        loader: byId('loader'), start: byId('startScreen'), avatar: byId('avatarScreen'),
        nameEntry: byId('nameEntryScreen'), instructions: byId('instructionsScreen'),
        game: byId('gameContainer'), levelComplete: byId('levelCompleteScreen'),
        end: byId('endScreen'), leaderboard: byId('leaderboardScreen')
      },
      modals: {
        confirmExit: byId('confirmExitModal'), advancedReport: byId('advancedReportModal'),
        avatarEditor: byId('avatarEditorModal'), playerDetails: byId('playerDetailsModal')
      },
      nameInput: byId('nameInput'), nameError: byId('nameError'),
      confirmNameBtn: byId('confirmNameBtn'), confirmAvatarBtn: byId('confirmAvatarBtn'),
      reportProblemForm: byId('reportProblemForm'), imageToCrop: byId('image-to-crop'),
      leaderboardContent: byId('leaderboardContent'), questionText: byId('questionText'),
      optionsGrid: this.getEl('.options-grid'), scoreDisplay: byId('currentScore'),
      reportFab: byId('reportErrorFab'), problemScreenshot: byId('problemScreenshot'),
      reportImagePreview: byId('reportImagePreview'), includeAutoDiagnostics: byId('includeAutoDiagnostics'),
      lbMode: byId('lbMode'), lbAttempt: byId('lbAttempt')
    };
  }

  bindEventListeners() {
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      const handlers = {
        showAvatarScreen: () => this.showScreen('avatar'),
        showNameEntryScreen: () => this.showScreen('nameEntry'),
        confirmName: () => this.handleNameConfirmation(),
        postInstructionsStart: () => this.postInstructionsStart(),
        showLeaderboard: () => this.displayLeaderboard(),
        showStartScreen: () => this.showScreen('start'),
        toggleTheme: () => this.toggleTheme(),
        showConfirmExitModal: () => this.showModal('confirmExit'),
        closeModal: () => {
          const id = target.dataset.modalId;
          if (id === 'avatarEditorModal') this.cleanupAvatarEditor();
          this.hideModal(id);
        },
        endGame: () => this.endGame(),
        nextLevel: () => this.nextLevel(),
        playAgain: () => window.location.reload(),
        shareOnX: () => this.shareOnX(),
        shareOnInstagram: () => this.shareOnInstagram(),
        saveCroppedAvatar: () => this.saveCroppedAvatar(),
      };
      if (handlers[action]) handlers[action]();
    });

    this.dom.nameInput.addEventListener('input', () => this.validateNameInput());
    this.dom.nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.handleNameConfirmation(); });
    this.dom.reportProblemForm.addEventListener('submit', (e) => this.handleReportSubmit(e));
    this.dom.optionsGrid.addEventListener('click', e => { if (e.target.closest('.option-btn')) this.checkAnswer(e.target.closest('.option-btn')); });
    this.getEl('.helpers').addEventListener('click', e => { if (e.target.closest('.helper-btn')) this.useHelper(e.target.closest('.helper-btn')); });
    this.getEl('.avatar-grid').addEventListener('click', e => { if (e.target.matches('.avatar-option')) this.selectAvatar(e.target); });
    this.dom.reportFab.addEventListener('click', () => this.showModal('advancedReport'));
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }));
    this.dom.problemScreenshot.addEventListener('change', e => {
      const file = e.target.files?.[0], prev = this.dom.reportImagePreview;
      if (!file) { prev.style.display = 'none'; prev.querySelector('img').src = ''; return; }
      prev.style.display = 'block'; prev.querySelector('img').src = URL.createObjectURL(file);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { const o = document.querySelector('.modal.active'); if (o) o.classList.remove('active'); } });
    this.dom.lbMode?.addEventListener('change', () => { this.dom.lbAttempt.disabled = (this.dom.lbMode.value !== 'attempt'); this.displayLeaderboard(); });
    this.dom.lbAttempt?.addEventListener('change', () => this.displayLeaderboard());
  }

  postInstructionsStart() {
    this.setupInitialGameState();
    this.startGameFlow(0);
  }

  setupInitialGameState() {
    this.gameState = {
      name: (this.dom.nameInput.value || '').trim(), avatar: this.gameState.avatar,
      playerId: `PL${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      deviceId: this.getOrSetDeviceId(), level: 0, questionIndex: 0,
      wrongAnswers: 0, correctAnswers: 0, skips: 0, startTime: new Date(),
      helpersUsed: { fiftyFifty: false, freezeTime: false },
      currentScore: this.config.STARTING_SCORE
    };
  }

  startGameFlow(levelIndex = 0) {
    this.gameState.level = levelIndex;
    this.updateScore(this.config.STARTING_SCORE, true);
    this.setupGameUI();
    this.showScreen('game');
    this.startLevel();
  }

  startLevel() {
    const currentLevel = this.config.LEVELS[this.gameState.level];
    this.gameState.helpersUsed = { fiftyFifty: false, freezeTime: false };
    document.body.dataset.level = currentLevel.name;
    this.getEl('#currentLevelBadge').textContent = currentLevel.label;
    const levelQuestions = this.getLevelQuestions(currentLevel.name);
    if (this.config.RANDOMIZE_QUESTIONS) this.shuffleArray(levelQuestions);
    this.gameState.shuffledQuestions = levelQuestions;
    this.updateLevelProgressUI();
    this.gameState.questionIndex = 0;
    this.fetchQuestion();
  }

  fetchQuestion() {
    const questions = this.gameState.shuffledQuestions || [];
    if (this.gameState.questionIndex >= questions.length) { this.levelComplete(); return; }
    this.displayQuestion(questions[this.gameState.questionIndex]);
  }

  levelComplete() {
    if (this.gameState.level >= this.config.LEVELS.length - 1) { this.endGame(true); return; }
    this.getEl('#levelCompleteTitle').textContent = `🎉 أكملت المستوى ${this.config.LEVELS[this.gameState.level].label}!`;
    this.getEl('#levelScore').textContent = this.formatNumber(this.gameState.currentScore);
    this.getEl('#levelErrors').textContent = this.gameState.wrongAnswers;
    this.getEl('#levelCorrect').textContent = this.gameState.correctAnswers;
    this.showScreen('levelComplete');
  }

  nextLevel() {
    this.gameState.level++;
    if (this.gameState.level >= this.config.LEVELS.length) { this.endGame(true); }
    else { this.showScreen('game'); this.startLevel(); }
  }

  async endGame(completedAllLevels = false) {
    clearInterval(this.timer.interval);
    this.hideModal('confirmExit');
    const baseStats = this._calculateFinalStats(completedAllLevels);
    try {
        const perf = await this.ratePerformance(baseStats);
        baseStats.performance_rating = perf.label; baseStats.performance_score  = perf.score;
    } catch (_) {
        const acc = Number(baseStats.accuracy || 0);
        baseStats.performance_rating = (acc >= 90) ? "ممتاز 🏆" : (acc >= 75) ? "جيد جدًا ⭐" : (acc >= 60) ? "جيد 👍" : (acc >= 40) ? "مقبول 👌" : "يحتاج إلى تحسين 📈";
    }
    const { attemptNumber, error } = await this.saveResultsToSupabase(baseStats);
    if (error) this.showToast("فشل إرسال النتائج إلى السيرفر", "error");
    baseStats.attempt_number = attemptNumber ?? 'N/A';
    this._displayFinalStats(baseStats);
    this.showScreen('end');
  }

  _calculateFinalStats(completedAll) {
    const totalTimeSeconds = (new Date() - this.gameState.startTime) / 1000;
    const { correctAnswers: corr, wrongAnswers: wrong, skips } = this.gameState;
    const denom = corr + wrong + (this.config.SKIP_WEIGHT * skips);
    const accuracy = denom > 0 ? parseFloat(((corr / denom) * 100).toFixed(1)) : 0.0;
    const avgTime = parseFloat((totalTimeSeconds / ((corr + wrong) || 1)).toFixed(1));
    return {
      ...this.gameState, correct_answers: corr, wrong_answers: wrong,
      total_time: totalTimeSeconds, level: this.config.LEVELS[Math.min(this.gameState.level, this.config.LEVELS.length - 1)].label,
      accuracy, avg_time: avgTime, completed_all: completedAll,
    };
  }

  displayQuestion(questionData) {
    this.answerSubmitted = false;
    const { text, options, correctText } = this.resolveQuestionFields(questionData);
    const totalQuestions = (this.gameState.shuffledQuestions || []).length;
    this.getEl('#questionCounter').textContent = `السؤال ${this.gameState.questionIndex + 1} من ${totalQuestions}`;
    this.dom.questionText.textContent = text;
    this.dom.optionsGrid.innerHTML = '';
    let displayOptions = [...options];
    if (this.config.RANDOMIZE_ANSWERS) this.shuffleArray(displayOptions);
    const frag = document.createDocumentFragment();
    displayOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn'; btn.textContent = opt;
      btn.dataset.correct = (this.normalize(opt) === this.normalize(correctText));
      frag.appendChild(btn);
    });
    this.dom.optionsGrid.appendChild(frag);
    this.updateGameStatsUI();
    this.startTimer();
  }

  checkAnswer(selectedButton = null) {
    if (this.answerSubmitted) return;
    this.answerSubmitted = true;
    clearInterval(this.timer.interval);
    this.getAllEl('.option-btn').forEach(b => b.classList.add('disabled'));
    let isCorrect = selectedButton?.dataset.correct === 'true';
    if (isCorrect) {
      selectedButton.classList.add('correct');
      this.updateScore(this.gameState.currentScore + 100);
      this.gameState.correctAnswers++;
      this.showToast("إجابة صحيحة! +100 نقطة", "success");
    } else {
      if (selectedButton) selectedButton.classList.add('wrong');
      const correctButton = this.dom.optionsGrid.querySelector('[data-correct="true"]');
      if (correctButton) correctButton.classList.add('correct');
      this.gameState.wrongAnswers++;
      this.updateScore(this.gameState.currentScore - 100);
      this.showToast("إجابة خاطئة! -100 نقطة", "error");
    }
    this.gameState.questionIndex++;
    this.updateGameStatsUI();
    const isGameOver = this.gameState.wrongAnswers >= this.config.MAX_WRONG_ANSWERS;
    setTimeout(() => { if (isGameOver) this.endGame(false); else this.fetchQuestion(); }, 2000);
  }

  updateGameStatsUI() {
    this.getEl('#wrongAnswersCount').textContent = `${this.gameState.wrongAnswers} / ${this.config.MAX_WRONG_ANSWERS}`;
    this.getEl('#skipCount').textContent = this.gameState.skips;
    this.getEl('#skipCost').textContent = '(مجانية)';
    const isImpossible = this.config.LEVELS[this.gameState.level]?.name === 'impossible';
    this.getAllEl('.helper-btn').forEach(btn => {
      const type = btn.dataset.type;
      if (isImpossible) { btn.disabled = true; return; }
      btn.disabled = (type !== 'skipQuestion' && this.gameState.helpersUsed[type]);
    });
  }

  _displayFinalStats(stats) {
    this.getEl('#finalName').textContent = stats.name;
    this.getEl('#finalId').textContent = stats.player_id;
    this.getEl('#finalAttemptNumber').textContent = stats.attempt_number;
    this.getEl('#finalCorrect').textContent = stats.correct_answers;
    this.getEl('#finalWrong').textContent = stats.wrong_answers;
    this.getEl('#finalSkips').textContent = stats.skips;
    this.getEl('#finalScore').textContent = this.formatNumber(stats.score);
    this.getEl('#totalTime').textContent = this.formatTime(stats.total_time);
    this.getEl('#finalLevel').textContent = stats.level;
    this.getEl('#finalAccuracy').textContent = `${stats.accuracy}%`;
    this.getEl('#finalAvgTime').textContent = `${this.formatTime(stats.avg_time)}`;
    this.getEl('#performanceText').textContent = stats.performance_rating;
  }

  async loadQuestions() {
    try {
      const response = await fetch(this.config.QUESTIONS_URL, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.questions = await response.json();
      return true;
    } catch (error) { console.error("Failed to load questions file:", error); return false; }
  }

  async saveResultsToSupabase(resultsData) {
    try {
      const { count, error: countError } = await this.supabase.from('log').select('id', { count: 'exact', head: true }).eq('device_id', resultsData.device_id);
      if (countError) throw countError;
      const attemptNumber = (count || 0) + 1;
      await this.supabase.from('log').insert({ ...resultsData, attempt_number: attemptNumber, performance_score: resultsData.performance_score ?? null });
      const { error: leaderboardError } = await this.supabase.from('leaderboard').upsert({ ...resultsData, attempt_number: attemptNumber, is_impossible_finisher: resultsData.completed_all && resultsData.level === 'مستحيل' });
      if (leaderboardError) throw leaderboardError;
      this.showToast("تم حفظ نتيجتك بنجاح!", "success");
      this.sendTelegramNotification('gameResult', { ...resultsData, attempt_number: attemptNumber });
      return { attemptNumber, error: null };
    } catch (error) { console.error("Failed to send results to Supabase:", error); return { attemptNumber: null, error: error.message }; }
  }

  async handleReportSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const reportData = {
      type: formData.get('problemType'), description: formData.get('problemDescription'),
      name: this.gameState.name || 'لم يبدأ اللعب', player_id: this.gameState.playerId || 'N/A',
      question_text: this.dom.questionText.textContent || 'لا يوجد'
    };
    let meta = this.dom.includeAutoDiagnostics?.checked ? this.getAutoDiagnostics() : null;
    if (meta) meta.locationHint = formData.get('problemLocation');
    const ctx = this.buildQuestionRef();
    this.showToast("جاري إرسال البلاغ...", "info"); this.hideModal('advancedReport');
    try {
      let image_url = null;
      const file = this.dom.problemScreenshot.files?.[0];
      if (file) {
        const fileName = `report_${Date.now()}_${Math.random().toString(36).slice(2)}.${(file.type.split('/')[1] || 'png').replace(/[^a-z0-9]/gi,'')}`;
        const { data: up, error: upErr } = await this.supabase.storage.from('reports').upload(fileName, file, { contentType: file.type, upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = this.supabase.storage.from('reports').getPublicUrl(up.path);
        image_url = pub?.publicUrl || null;
      }
      await this.supabase.from('reports').insert({ ...reportData, image_url, meta: { ...(meta || {}), context: ctx } });
      this.showToast("تم إرسال بلاغك بنجاح. شكراً لك!", "success");
      this.sendTelegramNotification('report', { ...reportData, image_url, meta, context: ctx });
    } catch (err) { console.error("Supabase report error:", err); this.showToast("حدث خطأ أثناء إرسال البلاغ.", "error"); }
    finally { event.target.reset(); if(this.dom.reportImagePreview) {this.dom.reportImagePreview.style.display='none'; this.dom.reportImagePreview.querySelector('img').src='';}}
  }

  async sendTelegramNotification(type, data) {
    if (!this.config.APPS_SCRIPT_URL) return;
    try { await fetch(this.config.APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ type, data }) });
    } catch (error) { console.error('Error sending notification:', error.message); }
  }

  useHelper(btn) {
    const type = btn.dataset.type, isSkip = type === 'skipQuestion';
    if (this.config.LEVELS[this.gameState.level]?.name === 'impossible') return this.showToast("المساعدات غير متاحة في المستوى المستحيل.", "error");
    if (!isSkip && this.gameState.helpersUsed[type]) return this.showToast("هذه المساعدة استُخدمت بالفعل.", "error");
    const cost = isSkip ? 0 : this.config.HELPER_COSTS[type];
    if (cost > 0 && this.gameState.currentScore < cost) return this.showToast("نقاطك غير كافية!", "error");
    if (cost > 0) { this.updateScore(this.gameState.currentScore - cost); this.showToast(`تم استخدام المساعدة! -${cost} نقطة`, "info"); }
    else if (isSkip) this.showToast("تم تخطي السؤال.", "info");
    if (isSkip) { clearInterval(this.timer.interval); this.gameState.skips++; this.gameState.questionIndex++; this.updateGameStatsUI(); this.fetchQuestion(); return; }
    this.gameState.helpersUsed[type] = true; this.updateGameStatsUI();
    if (type === 'fiftyFifty') this.shuffleArray([...this.getAllEl('.option-btn:not([data-correct="true"])')]).slice(0, 2).forEach(b => b.classList.add('hidden'));
    else if (type === 'freezeTime') { this.timer.isFrozen = true; this.getEl('.timer-bar').classList.add('frozen'); setTimeout(() => { this.timer.isFrozen = false; this.getEl('.timer-bar').classList.remove('frozen'); }, 10000); }
  }

  startTimer() {
    clearInterval(this.timer.interval); let timeLeft = this.config.QUESTION_TIME;
    const bar = this.getEl('.timer-bar'), label = this.getEl('.timer-text');
    bar.style.transition = 'width 200ms linear'; bar.style.width = '100%';
    const update = () => {
      if (this.timer.isFrozen) return;
      timeLeft = Math.max(0, timeLeft - 1); label.textContent = timeLeft;
      bar.style.width = `${(timeLeft / this.config.QUESTION_TIME) * 100}%`;
      if (timeLeft <= 0) { clearInterval(this.timer.interval); this.showToast("انتهى الوقت!", "error"); this.handleTimeout(); }
    };
    update(); this.timer.interval = setInterval(update, 1000);
  }

  handleTimeout() { this.checkAnswer(this.dom.optionsGrid.querySelector('.option-btn:not([data-correct="true"])') || null); }

  updateScore(newScore) { this.gameState.currentScore = newScore; this.dom.scoreDisplay.textContent = this.formatNumber(newScore); this.updateGameStatsUI(); }

  shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }
  
  getOrSetDeviceId() { let id = localStorage.getItem('quizGameDeviceId'); if (!id) { id = 'D' + Date.now().toString(36) + Math.random().toString(36).substring(2, 11).toUpperCase(); localStorage.setItem('quizGameDeviceId', id); } return id; }

  getPerformanceRating(accuracy) { return (accuracy >= 90) ? "ممتاز 🏆" : (accuracy >= 75) ? "جيد جدًا ⭐" : (accuracy >= 60) ? "جيد 👍" : (accuracy >= 40) ? "مقبول 👌" : "يحتاج تحسين 📈"; }
  
  formatTime(s) { const t = Math.floor(Number(s) || 0); return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`; }
  
  formatNumber(n) { return new Intl.NumberFormat('ar-EG').format(Number(n) || 0); }
  
  getAutoDiagnostics() { try { const n = navigator, c = n.connection, p = performance, m = p.memory; return { url: location.href, userAgent: n.userAgent, platform: n.platform, language: n.language, viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio }, connection: { type: c?.effectiveType, downlink: c?.downlink, rtt: c?.rtt }, performance: { memory: { jsHeapSizeLimit: m?.jsHeapSizeLimit, totalJSHeapSize: m?.totalJSHeapSize, usedJSHeapSize: m?.usedJSHeapSize }, timingNow: Math.round(p.now()) }, appState: { screen: Object.entries(this.dom.screens).find(([,el]) => el.classList.contains('active'))?.[0], level: this.config.LEVELS[this.gameState?.level || 0]?.name, questionIndex: this.gameState?.questionIndex, score: this.gameState?.currentScore }, recentErrors: this.recentErrors }; } catch (e) { return { error: String(e) }; } }
  
  buildQuestionRef() { const l = this.config.LEVELS[this.gameState.level] || {}; const q = (this.dom.questionText?.textContent || '').trim(); const o = [...this.getAllEl('.option-btn')].map(b => (b.textContent || '').trim()); return { level_name: l.name, level_label: l.label, question_index: (this.gameState.questionIndex ?? 0) + 1, total_questions: (this.gameState.shuffledQuestions || []).length, question_text: q, options: o, ref: `${l.name}:${(this.gameState.questionIndex??0)+1}:${this.simpleHash(`${l.name}|${(this.gameState.questionIndex??0)+1}|${q}|${o.join('|')}`).slice(0,6)}` }; }
  
  simpleHash(s) { let h = 0; for (let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0; } return String(Math.abs(h)); }
  
  async ratePerformance(current) { let history = []; try { const { data } = await this.supabase.from('log').select('accuracy,avg_time,completed_all').eq('device_id', current.device_id).order('created_at', { ascending: false }).limit(20); if (data) history = data; } catch (_) {} const hAcc = history.map(h => Number(h.accuracy||0)); const hAvg = history.map(h => Number(h.avg_time||0)); const c = current, acc=Number(c.accuracy||0), avgT=Number(c.avg_time||0), lvl=c.level||''; let score = (0.45*acc) + (0.25*this.normalizeTo100(avgT,3,20)); if(lvl==='متوسط')score+=10;else if(lvl==='صعب')score+=25;else if(lvl==='مستحيل')score+=40;if(c.completed_all)score+=15;score+=Math.min(20,Math.round((c.correct_answers||0)/((c.total_time||1)/60)*4));score-=(c.wrong_answers*4)+(c.skips*2);if(history.length>0){const avgHAcc=hAcc.reduce((a,b)=>a+b,0)/(hAcc.length||1);const d=acc-avgHAcc;if(d>=10)score+=8;else if(d>=5)score+=4;else if(d<=-10)score-=6;if(this.stdDev(hAcc)<=8&&avgHAcc>=70)score+=5;if(history.filter(h=>h.completed_all).length/history.length>=0.5)score+=5;const avgHAvg=hAvg.reduce((a,b)=>a+b,0)/(hAvg.length||1);if(avgHAvg&&avgT<avgHAvg-2)score+=3}score=Math.max(0,Math.min(100,Math.round(score)));const label=this.mapPerformanceLabel(score,{completed_all:c.completed_all,level:lvl});return{score,label};}
  
  normalizeTo100(v,min,max){return Math.round(((max-Math.max(min,Math.min(max,Number(v)||0)))/(max-min))*100);}
  
  stdDev(arr){if(!arr||arr.length<2)return 0;const m=arr.reduce((a,b)=>a+Number(b||0),0)/arr.length;return Math.sqrt(arr.reduce((s,v)=>s+Math.pow(Number(v||0)-m,2),0)/(arr.length-1));}
  
  mapPerformanceLabel(s,{completed_all=false,level=''}={}){if(completed_all&&level==='مستحيل')s=Math.max(s,80);if(s>=97)return'احترافي 🧠';if(s>=92)return'مذهل 🌟';if(s>=85)return'ممتاز 🏆';if(s>=75)return'جيد جدًا ⭐';if(s>=62)return'جيد 👍';if(s>=50)return'مقبول 👌';if(s>=35)return'يحتاج إلى تحسين 📈';return'ضعيف 🧩';}
  
  showScreen(name) { Object.values(this.dom.screens).forEach(s => s.classList.remove('active')); if (this.dom.screens[name]) this.dom.screens[name].classList.add('active'); }
  
  showModal(id) { const el = this.dom.modals[id] || document.getElementById(id); if (el) el.classList.add('active'); }
  
  hideModal(id) { const el = this.dom.modals[id] || document.getElementById(id); if (el) el.classList.remove('active'); }
  
  showToast(message, type = 'info') { const c = this.getEl('#toast-container'), t = document.createElement('div'); t.className = `toast ${type}`; t.textContent = message; t.setAttribute('role', 'alert'); c.appendChild(t); setTimeout(() => t.remove(), 3000); }
  
  toggleTheme() { const n = document.body.dataset.theme === 'dark' ? 'light' : 'dark'; document.body.dataset.theme = n; localStorage.setItem('theme', n); this.getEl('.theme-toggle-btn').textContent = (n === 'dark') ? ICON_SUN : ICON_MOON; }
  
  updateLevelProgressUI() { this.getAllEl('.level-indicator').forEach((indicator, index) => { indicator.classList.toggle('active', index === this.gameState.level); indicator.classList.toggle('completed', index < this.gameState.level); }); }
  
  handleNameConfirmation() { if (!this.dom.confirmNameBtn.disabled) this.showScreen('instructions'); }
  
  validateNameInput() { const name = (this.dom.nameInput.value || '').trim(), isValid = name.length >= 3; this.dom.nameError.textContent = isValid ? "" : "يجب أن يتراوح طول الاسم بين ٣ - ١٥ حرفًا"; this.dom.nameError.classList.toggle('show', !isValid); this.dom.confirmNameBtn.disabled = !isValid; }

  async populateAttemptFilter() {
    const selectEl = this.dom.lbAttempt;
    if (!selectEl) return;
    try {
      const { data, error } = await this.supabase.from('log').select('attempt_number').order('attempt_number', { ascending: false }).limit(1);
      if (error) throw error;
      const maxAttempt = data?.[0]?.attempt_number || 1;
      const currentVal = selectEl.value;
      selectEl.innerHTML = '';
      for (let i = 1; i <= maxAttempt; i++) {
        const option = document.createElement('option');
        option.value = i; option.textContent = `المحاولة ${i}`;
        selectEl.appendChild(option);
      }
      selectEl.value = (currentVal <= maxAttempt) ? currentVal : maxAttempt;
    } catch (error) { console.error("Failed to populate attempt filter:", error); selectEl.innerHTML = '<option value="1">المحاولة 1</option>'; }
  }

  async displayLeaderboard() {
    this.showScreen('leaderboard');
    this.dom.leaderboardContent.innerHTML = '<div class="spinner"></div>';
    await this.populateAttemptFilter(); 
    const mode = this.dom.lbMode?.value || 'best';
    const attemptN = Number(this.dom.lbAttempt?.value || 1);
    try {
      let rows = [];
      if (mode === 'attempt') {
        const { data, error } = await this.supabase.from('log').select('*').eq('attempt_number', attemptN).order('score', { ascending: false }).order('accuracy', { ascending: false }).order('total_time', { ascending: true }).limit(500);
        if (error) throw error;
        rows = data || [];
      } else {
        let q = this.supabase.from('leaderboard').select('*');
        if (mode === 'accuracy') q = q.order('accuracy', { ascending: false }).order('score', { ascending: false }).order('total_time', { ascending: true });
        else if (mode === 'time') q = q.order('total_time', { ascending: true }).order('accuracy', { ascending: false }).order('score', { ascending: false });
        else q = q.order('is_impossible_finisher', { ascending: false }).order('score', { ascending: false }).order('accuracy', { ascending: false }).order('total_time', { ascending: true });
        const { data, error } = await q.limit(500);
        if (error) throw error;
        rows = data || [];
        if (mode === 'best') { const seen = new Map(); for (const r of rows) if (!seen.has(r.device_id)) seen.set(r.device_id, r); rows = [...seen.values()]; }
      }
      this.renderLeaderboard(rows.slice(0, 100));
      if (mode !== 'attempt') this.subscribeToLeaderboardChanges();
    } catch (error) { console.error("Error loading leaderboard:", error); this.dom.leaderboardContent.innerHTML = '<p>حدث خطأ في تحميل لوحة الصدارة.</p>'; }
  }

  renderLeaderboard(players) {
    if (!players.length) { this.dom.leaderboardContent.innerHTML = '<p>لوحة الصدارة فارغة حاليًا!</p>'; return; }
    const list = document.createElement('ul'); list.className = 'leaderboard-list';
    const medals = ['🥇', '🥈', '🥉']; let rankCounter = 1;
    players.forEach(player => {
      const item = document.createElement('li'); item.className = 'leaderboard-item';
      let rankDisplay = player.is_impossible_finisher ? '🎖️' : (rankCounter <= 3 ? medals[rankCounter - 1] : rankCounter);
      if (player.is_impossible_finisher) item.classList.add('impossible-finisher');
      else if (rankCounter <= 3) item.classList.add(`rank-${rankCounter}`);
      if (!player.is_impossible_finisher) rankCounter++;
      item.innerHTML = `<span class="leaderboard-rank">${rankDisplay}</span><img src="${player.avatar || ''}" alt="صورة ${player.name || ''}" class="leaderboard-avatar" loading="lazy" style="visibility:${player.avatar ? 'visible' : 'hidden'}"><div class="leaderboard-details"><span class="leaderboard-name">${player.name || 'غير معروف'}</span><span class="leaderboard-score">${this.formatNumber(player.score)}</span></div>`;
      item.addEventListener('click', () => this.showPlayerDetails(player));
      list.appendChild(item);
    });
    this.dom.leaderboardContent.innerHTML = ''; this.dom.leaderboardContent.appendChild(list);
  }

  subscribeToLeaderboardChanges() { if (this.leaderboardSubscription) this.leaderboardSubscription.unsubscribe(); this.leaderboardSubscription = this.supabase.channel('public:leaderboard').on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, () => this.displayLeaderboard()).subscribe(); }
  
  getAccuracyBarColor(pct) { return `hsl(${Math.round((Math.max(0, Math.min(100, Number(pct) || 0)) / 100) * 120)} 70% 45%)`; }
  
  showPlayerDetails(player) { this.getEl('#detailsName').textContent = player.name || 'غير معروف'; this.getEl('#detailsPlayerId').textContent = player.player_id || 'N/A'; const avatarEl = this.getEl('#detailsAvatar'); avatarEl.src = player.avatar || ''; avatarEl.style.visibility = player.avatar ? 'visible' : 'hidden'; const card = (t, v) => `<div class="stat-card"><div class="label">${t}</div><div class="value">${v}</div></div>`; const twoRows = (k1, v1, k2, v2) => `<div class="stat-card" style="display:grid;gap:.38rem;"><div style="display:flex;align-items:center;justify-content:space-between;gap:.6rem"><span class="label" style="margin:0">${k1}</span><span class="value" style="font-size:1.06rem">${v1}</span></div><div style="display:flex;align-items:center;justify-content:space-between;gap:.6rem"><span class="label" style="margin:0">${k2}</span><span class="value" style="font-size:1.06rem">${v2}</span></div></div>`; const pos = v => `<span style="color:var(--success-color)">${this.formatNumber(v)}</span>`, neg = v => `<span style="color:var(--error-color)">${this.formatNumber(v)}</span>`; const accNum = Math.round(Number(player.accuracy||0)); this.getEl('#playerDetailsContent').innerHTML = `<div class="stats-grid">${card('👑 المستوى', player.level||'N/A')}${card('⭐ النقاط', `<span class="value score">${this.formatNumber(player.score||0)}</span>`)}${twoRows('✅ الصحيحة',pos(player.correct_answers||0),'❌ الخاطئة',neg(player.wrong_answers||0))}${twoRows('⏱️ الوقت',this.formatTime(player.total_time||0),'⏳ المتوسط',this.formatTime(player.avg_time||0))}${card('🔢 المحاولة',this.formatNumber(player.attempt_number||0))}${card('⏭️ التخطّي',this.formatNumber(player.skips||0))}${card('📊 الأداء',player.performance_rating||'جيد')}<div class="stat-card accuracy"><div class="label" style="margin-bottom:.3rem">🎯 الدقّة</div><div style="display:grid;place-items:center"><div class="circle-progress" style="--val:${accNum};--bar:${this.getAccuracyBarColor(accNum)};"><span>${accNum}%</span></div></div></div></div>`; this.showModal('playerDetails'); }
  
  populateAvatarGrid() { const grid = this.getEl('.avatar-grid'); grid.innerHTML = `<div class="avatar-upload-btn" title="رفع صورة"><span aria-hidden="true">+</span><label for="avatarUploadInput" class="sr-only">رفع صورة</label><input type="file" id="avatarUploadInput" accept="image/*" style="display:none;"></div>`; this.getEl('#avatarUploadInput').addEventListener('change', e => this.handleAvatarUpload(e)); this.getEl('.avatar-upload-btn').addEventListener('click', () => this.getEl('#avatarUploadInput').click()); ["https://em-content.zobj.net/thumbs/120/apple/354/woman_1f469.png", "https://em-content.zobj.net/thumbs/120/apple/354/man_1f468.png", "https://em-content.zobj.net/thumbs/120/apple/354/person-beard_1f9d4.png", "https://em-content.zobj.net/thumbs/120/apple/354/old-man_1f474.png", "https://em-content.zobj.net/thumbs/120/apple/354/student_1f9d1-200d-1f393.png", "https://em-content.zobj.net/thumbs/120/apple/354/teacher_1f9d1-200d-1f3eb.png", "https://em-content.zobj.net/thumbs/120/apple/354/scientist_1f9d1-200d-1f52c.png", "https://em-content.zobj.net/thumbs/120/apple/354/artist_1f9d1-200d-1f3a8.png"].forEach((url, i) => { const img = document.createElement('img'); img.src = url; img.alt = `صورة رمزية ${i + 1}`; img.className = 'avatar-option'; img.loading = 'lazy'; grid.appendChild(img); }); }
  
  selectAvatar(el) { this.getAllEl('.avatar-option.selected, .avatar-upload-btn.selected').forEach(e => e.classList.remove('selected')); el.classList.add('selected'); this.gameState.avatar = el.src; this.dom.confirmAvatarBtn.disabled = false; }
  
  handleAvatarUpload(event) { const file = event.target.files[0]; if (!file || !file.type.startsWith('image/')) return; const reader = new FileReader(); reader.onload = e => { this.dom.imageToCrop.src = e.target.result; this.showModal('avatarEditor'); setTimeout(() => { if (this.cropper) this.cropper.destroy(); this.cropper = new Cropper(this.dom.imageToCrop, { aspectRatio: 1, viewMode: 1, autoCropArea: 1 }); }, 300); }; reader.readAsDataURL(file); }
  
  saveCroppedAvatar() { if (!this.cropper) return; const url = this.cropper.getCroppedCanvas({ width: 256, height: 256 }).toDataURL('image/png'); let custom = this.getEl('#custom-avatar'); if (!custom) { custom = document.createElement('img'); custom.id = 'custom-avatar'; custom.className = 'avatar-option'; this.getEl('.avatar-upload-btn').after(custom); } custom.src = url; this.selectAvatar(custom); this.hideModal('avatarEditor'); this.cleanupAvatarEditor(); }
  
  cleanupAvatarEditor() { try { if (this.cropper) this.cropper.destroy(); } catch (e) {} this.cropper = null; if (this.dom?.imageToCrop) this.dom.imageToCrop.src = ''; const input = this.getEl('#avatarUploadInput'); if (input) input.value = ''; }
  
  getShareTextForX() { return `🏆 النتائج النهائية 🏆\n\nالاسم: ${this.getEl('#finalName').textContent}\nرقم المحاولة: ${this.getEl('#finalAttemptNumber').textContent}\nالإجابات الصحيحة: ${this.getEl('#finalCorrect').textContent}\nمرات التخطي: ${this.getEl('#finalSkips').textContent}\nالمستوى الذي وصلت إليه: ${this.getEl('#finalLevel').textContent}\nنسبة الدقة: ${this.getEl('#finalAccuracy').textContent}\nمتوسط وقت الإجابة: ${this.getEl('#finalAvgTime').textContent}\nأداؤك: ${this.getEl('#performanceText').textContent}\n\n🎉 تهانينا! لقد أكملت المسابقة بنجاح! 🎉\n\n🔗 جرب تحديك أنت أيضًا!\n${window.location.href}`; }
  
  shareOnX() { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(this.getShareTextForX())}`, '_blank'); }
  
  shareOnInstagram() { navigator.clipboard.writeText(this.getShareTextForX()).then(() => this.showToast("تم نسخ النتيجة لمشاركتها!", "success")).catch(() => this.showToast("فشل نسخ النتيجة.", "error")); }
  
  setupGameUI() { this.getEl('#playerAvatar').src = this.gameState.avatar || ''; this.getEl('#playerName').textContent = this.gameState.name || ''; this.getEl('#playerId').textContent = this.gameState.playerId || ''; }
  
  normalize(s) { return String(s || '').trim().toLowerCase(); }
  
  resolveQuestionFields(q) { const text = q.q || q.question || q.text || ''; const options = q.options || q.choices || []; let correctText = ''; if (typeof q.correct === 'number' && options[q.correct] !== undefined) correctText = options[q.correct]; else if (typeof q.answer === 'string') correctText = q.answer; else if (typeof q.correctAnswer === 'string') correctText = q.correctAnswer; else if (typeof q.correct_option === 'string') correctText = q.correct_option; else if (typeof q.correctIndex === 'number' && options[q.correctIndex] !== undefined) correctText = options[q.correctIndex]; return { text, options, correctText }; }
  
  getLevelQuestions(levelName) { if (Array.isArray(this.questions)) { const arr = this.questions.filter(q => (this.normalize(q.level) === this.normalize(levelName)) || (this.normalize(q.difficulty) === this.normalize(levelName))); return arr.length ? arr : [...this.questions]; } const direct = this.questions[levelName] || this.questions[levelName + 'Questions'] || this.questions[levelName + '_questions'] || this.questions[levelName + '_list']; if (Array.isArray(direct)) return [...direct]; if (Array.isArray(this.questions.questions)) return [...this.questions.questions]; return Object.values(this.questions).filter(Array.isArray).flat() || []; }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.dataset.theme = savedTheme;
    const toggleBtn = document.querySelector('.theme-toggle-btn');
    if (toggleBtn) toggleBtn.textContent = (savedTheme === 'dark') ? ICON_SUN : ICON_MOON;
    new QuizGame();
});
