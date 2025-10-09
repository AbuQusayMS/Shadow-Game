const ICON_SUN  = '\u2600\uFE0F';
const ICON_MOON = '\uD83C\uDF19';

class QuizGame {
  constructor() {
    this.config = {
      SUPABASE_URL: 'https://qffcnljopolajeufkrah.supabase.co',
      SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZmNubGpvcG9sYWpldWZrcmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNzkzNjMsImV4cCI6MjA3NDY1NTM2M30.0vst_km_pweyF2IslQ24JzMF281oYeaaeIEQM0aKkUg',
      APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx0cVV4vnwhYtB1__nYjKRvIpBC9lILEgyfgYomlb7pJh266i7QAItNo5BVPUvFCyLq4A/exec',
      QUESTIONS_URL: 'https://abuqusayms.github.io/Shadow-Game/questions.json',

      QUESTION_TIME: 30,
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
    this.audioCache = new Map();
    this.currentSessionId = this.generateSessionId();
    this.cleanupQueue = [];

    window.addEventListener('error', (ev) => {
      this.recentErrors.push({
        type: 'error',
        message: String(ev.message || ''),
        source: ev.filename || '',
        line: ev.lineno || 0,
        col: ev.colno || 0,
        time: new Date().toISOString()
      });
      this.recentErrors = this.recentErrors.slice(-10);
    });

    window.addEventListener('unhandledrejection', (ev) => {
      this.recentErrors.push({
        type: 'unhandledrejection',
        reason: String(ev.reason || ''),
        time: new Date().toISOString()
      });
      this.recentErrors = this.recentErrors.slice(-10);
    });

    this.init();
  }

  // ===================================================
  // Init
  // ===================================================
  async init() {
    this.cacheDomElements();
    this.bindEventListeners();
    this.populateAvatarGrid();
    await this.preloadAudio();

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

  // ===================================================
  // Audio System
  // ===================================================
  async preloadAudio() {
    const audioFiles = {
      correct: '/Shadow-Game/audio/correct.mp3',
      wrong: '/Shadow-Game/audio/wrong.mp3',
      levelup: '/Shadow-Game/audio/levelup.mp3',
      win: '/Shadow-Game/audio/win.mp3',
      loss: '/Shadow-Game/audio/loss.mp3',
      start: '/Shadow-Game/audio/start.mp3',
      click: '/Shadow-Game/audio/ui-click.mp3',
      notify: '/Shadow-Game/audio/notify.mp3',
      coin: '/Shadow-Game/audio/coin.mp3'
    };

    for (const [key, path] of Object.entries(audioFiles)) {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = path;
        this.audioCache.set(key, audio);
      } catch (error) {
        console.warn(`Failed to preload audio: ${key}`, error);
      }
    }
  }

  playSound(soundName) {
    try {
      const audio = this.audioCache.get(soundName);
      if (audio) {
        const clone = audio.cloneNode();
        clone.volume = 0.7;
        clone.play().catch(e => console.warn(`Audio play failed for ${soundName}:`, e));
      }
    } catch (error) {
      console.warn(`Error playing sound ${soundName}:`, error);
    }
  }

  // ===================================================
  // Session Management & Cleanup
  // ===================================================
  generateSessionId() {
    return `S${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  async cleanupSession() {
    console.log(`[Cleanup] Starting cleanup for session ${this.currentSessionId}`);
    
    // 1. Stop all timers
    this.clearAllTimers();
    
    // 2. Abort pending requests
    this.abortPendingRequests();
    
    // 3. Remove event listeners
    this.removeTemporaryListeners();
    
    // 4. Clear session storage
    this.clearSessionStorage();
    
    // 5. Reset game state
    this.resetGameState();
    
    // 6. Reset UI
    this.resetUI();
    
    // 7. Process cleanup queue
    await this.processCleanupQueue();
    
    console.log(`[Cleanup] Completed for session ${this.currentSessionId}`);
  }

  clearAllTimers() {
    if (this.timer.interval) {
      clearInterval(this.timer.interval);
      this.timer.interval = null;
    }
    
    this.cleanupQueue.forEach(item => {
      if (item.type === 'timeout') {
        clearTimeout(item.id);
      } else if (item.type === 'interval') {
        clearInterval(item.id);
      }
    });
    this.cleanupQueue = [];
  }

  abortPendingRequests() {
    // يمكن إضافة AbortController هنا إذا كان هناك طلبات fetch
    this.cleanupQueue.forEach(item => {
      if (item.type === 'request' && item.controller) {
        item.controller.abort();
      }
    });
  }

  removeTemporaryListeners() {
    this.cleanupQueue.forEach(item => {
      if (item.type === 'listener' && item.element && item.handler) {
        item.element.removeEventListener(item.event, item.handler);
      }
    });
  }

  clearSessionStorage() {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('quiz_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // تنظيف localStorage للمفاتيح المؤقتة فقط
    const tempLocalKeys = [
      'currentLevel', 'currentIndex', 'shuffledQuestions', 
      'activeLifelines', 'tempScore', 'tempTime', 'attemptDraft'
    ];
    tempLocalKeys.forEach(key => localStorage.removeItem(key));
  }

  resetGameState() {
    this.gameState = {
      name: this.gameState.name || '',
      avatar: this.gameState.avatar || '',
      playerId: this.gameState.playerId || '',
      deviceId: this.getOrSetDeviceId(),
      sessionId: this.generateSessionId()
    };
    
    this.timer = { interval: null, isFrozen: false, total: 0 };
    this.answerSubmitted = false;
  }

  resetUI() {
    // إعادة تعيين واجهة المستخدم
    this.getAllEl('.level-indicator').forEach(indicator => {
      indicator.classList.remove('active', 'completed');
    });
    
    this.getEl('#currentScore').textContent = '100';
    this.getEl('#wrongAnswersCount').textContent = '0 / 3';
    this.getEl('#skipCount').textContent = '0';
    
    // إخفاء الشاشات النشطة
    this.getAllEl('.screen.active').forEach(screen => {
      if (screen.id !== 'startScreen') {
        screen.classList.remove('active');
      }
    });
  }

  async processCleanupQueue() {
    const promises = this.cleanupQueue
      .filter(item => item.promise)
      .map(item => item.promise.catch(() => {})); // تجاهل الأخطاء أثناء التنظيف
    
    await Promise.allSettled(promises);
    this.cleanupQueue = [];
  }

  // ===================================================
  // DOM Helpers
  // ===================================================
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
      nameInput: byId('nameInput'),
      nameError: byId('nameError'),
      confirmNameBtn: byId('confirmNameBtn'),
      confirmAvatarBtn: byId('confirmAvatarBtn'),
      reportProblemForm: byId('reportProblemForm'),
      imageToCrop: byId('image-to-crop'),
      leaderboardContent: byId('leaderboardContent'),
      questionText: byId('questionText'),
      optionsGrid: this.getEl('.options-grid'),
      scoreDisplay: byId('currentScore'),
      reportFab: byId('reportErrorFab'),
      problemScreenshot: byId('problemScreenshot'),
      reportImagePreview: byId('reportImagePreview'),
      includeAutoDiagnostics: byId('includeAutoDiagnostics'),
      lbMode: byId('lbMode'),
      lbAttempt: byId('lbAttempt')
    };
  }

  getEl(selector, parent = document) { return parent.querySelector(selector); }
  getAllEl(selector, parent = document) { return parent.querySelectorAll(selector); }

  // ===================================================
  // Events
  // ===================================================
  bindEventListeners() {
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const actionHandlers = {
        showAvatarScreen: () => this.showScreen('avatar'),
        showNameEntryScreen: () => this.showScreen('nameEntry'),
        confirmName: () => this.handleNameConfirmation(),
        postInstructionsStart: () => this.postInstructionsStart(),
        showLeaderboard: () => this.displayLeaderboard(),
        showStartScreen: () => this.showScreen('start'),
        toggleTheme: () => this.toggleTheme(),
        showConfirmExitModal: () => this.showModal('confirmExit'),
        closeModal: () => {
          const id = target.dataset.modalId || target.dataset.modalKey;
          if (id === 'avatarEditor' || id === 'avatarEditorModal') this.cleanupAvatarEditor();
          this.hideModal(id);
        },
        endGame: () => this.endGame(),
        nextLevel: () => this.nextLevel(),
        playAgain: () => this.playAgain(),
        shareOnX: () => this.shareOnX(),
        shareOnInstagram: () => this.shareOnInstagram(),
        saveCroppedAvatar: () => this.saveCroppedAvatar()
      };
      
      if (actionHandlers[action]) {
        this.playSound('click');
        actionHandlers[action]();
      }
    });

    this.dom.nameInput.addEventListener('input', () => this.validateNameInput());
    this.dom.nameInput.addEventListener('keypress', (e) => { 
      if (e.key === 'Enter') this.handleNameConfirmation(); 
    });
    
    this.dom.reportProblemForm.addEventListener('submit', (e) => this.handleReportSubmit(e));
    this.dom.optionsGrid.addEventListener('click', e => {
      const btn = e.target.closest('.option-btn');
      if (btn) this.checkAnswer(btn);
    });

    this.getEl('.helpers').addEventListener('click', e => {
      const btn = e.target.closest('.helper-btn');
      if (btn) this.useHelper(btn);
    });

    this.getEl('.avatar-grid').addEventListener('click', (e) => {
      if (e.target.matches('.avatar-option')) this.selectAvatar(e.target);
    });

    this.dom.reportFab.addEventListener('click', () => this.showModal('advancedReport'));

    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
          modal.classList.remove('active');
        }
      });
    });

    this.dom.problemScreenshot.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      const prev = this.dom.reportImagePreview;
      if (!file) { prev.style.display = 'none'; prev.querySelector('img').src = ''; return; }
      const url = URL.createObjectURL(file);
      prev.style.display = 'block';
      prev.querySelector('img').src = url;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const open = document.querySelector('.modal.active');
        if (open) open.classList.remove('active');
      }
    });

    this.dom.lbMode?.addEventListener('change', () => {
      const m = this.dom.lbMode.value;
      if (this.dom.lbAttempt) this.dom.lbAttempt.disabled = (m !== 'attempt');
      this.displayLeaderboard();
    });
    
    this.dom.lbAttempt?.addEventListener('change', () => this.displayLeaderboard());
  }

  // ===================================================
  // Game Flow
  // ===================================================
  async postInstructionsStart() {
    await this.cleanupSession(); // تنظيف الجلسة السابقة قبل البدء
    this.setupInitialGameState();
    this.startGameFlow(0);
  }

  setupInitialGameState() {
    this.gameState = {
      name: (this.dom.nameInput.value || '').trim(),
      avatar: this.gameState.avatar,
      playerId: `PL${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      deviceId: this.getOrSetDeviceId(),
      sessionId: this.generateSessionId(),
      level: 0,
      questionIndex: 0,
      wrongAnswers: 0,
      correctAnswers: 0,
      skips: 0,
      startTime: new Date(),
      helpersUsed: { fiftyFifty: false, freezeTime: false },
      currentScore: this.config.STARTING_SCORE,
      shuffledQuestions: {},
      attemptNumber: null
    };
  }

  async startGameFlow(levelIndex = 0) {
    this.gameState.level = levelIndex;
    this.updateScore(this.config.STARTING_SCORE, true);
    this.setupGameUI();
    this.showScreen('game');
    this.playSound('start');
    this.startLevel();
  }

  startLevel() {
    const currentLevel = this.config.LEVELS[this.gameState.level];
    this.gameState.helpersUsed = { fiftyFifty: false, freezeTime: false };
    document.body.dataset.level = currentLevel.name;
    this.getEl('#currentLevelBadge').textContent = currentLevel.label;

    const levelQuestions = this.getLevelQuestions(currentLevel.name);
    
    // عشوائية الأسئلة لكل مستوى
    if (levelQuestions.length > 0) {
      this.shuffleArray(levelQuestions);
      this.gameState.shuffledQuestions = levelQuestions;
    } else {
      console.warn(`No questions found for level: ${currentLevel.name}`);
      this.gameState.shuffledQuestions = [];
    }

    this.updateLevelProgressUI();
    this.gameState.questionIndex = 0;
    this.fetchQuestion();
  }

  fetchQuestion() {
    const questions = this.gameState.shuffledQuestions || [];
    
    if (this.gameState.questionIndex >= questions.length) {
      this.levelComplete();
      return;
    }
    
    const questionData = questions[this.gameState.questionIndex];
    this.displayQuestion(questionData);
  }

  displayQuestion(questionData) {
    this.answerSubmitted = false;

    const { text, options, correctText } = this.resolveQuestionFields(questionData);

    const totalQuestions = (this.gameState.shuffledQuestions || []).length;
    this.getEl('#questionCounter').textContent = `السؤال ${this.gameState.questionIndex + 1} من ${totalQuestions}`;
    this.dom.questionText.textContent = text;
    this.dom.optionsGrid.innerHTML = '';

    let displayOptions = [...options];
    
    // عشوائية ترتيب الإجابات
    if (displayOptions.length > 0) {
      this.shuffleArray(displayOptions);
    }

    const frag = document.createDocumentFragment();
    displayOptions.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.dataset.correct = (this.normalize(opt) === this.normalize(correctText));
      frag.appendChild(btn);
    });
    this.dom.optionsGrid.appendChild(frag);

    this.updateGameStatsUI();
    this.startTimer();
  }

  async checkAnswer(selectedButton = null) {
    if (this.answerSubmitted) return;
    this.answerSubmitted = true;
    clearInterval(this.timer.interval);

    this.getAllEl('.option-btn').forEach(b => b.classList.add('disabled'));

    let isCorrect = false;
    if (selectedButton && selectedButton.dataset) {
      isCorrect = selectedButton.dataset.correct === 'true';
    }

    if (isCorrect) {
      selectedButton.classList.add('correct');
      this.updateScore(this.gameState.currentScore + 100);
      this.gameState.correctAnswers++;
      this.playSound('correct');
      this.showToast("إجابة صحيحة! +100 نقطة", "success");
    } else {
      if (selectedButton) selectedButton.classList.add('wrong');
      const correctButton = this.dom.optionsGrid.querySelector('[data-correct="true"]');
      if (correctButton) correctButton.classList.add('correct');
      this.gameState.wrongAnswers++;
      this.updateScore(this.gameState.currentScore - 100);
      this.playSound('wrong');
      this.showToast("إجابة خاطئة! -100 نقطة", "error");
    }

    this.gameState.questionIndex++;
    this.updateGameStatsUI();

    const isGameOver = this.gameState.wrongAnswers >= this.config.MAX_WRONG_ANSWERS;

    // استخدام setTimeout مع إضافة إلى قائمة التنظيف
    const timeoutId = setTimeout(() => {
      if (isGameOver) {
        this.endGame(false);
      } else {
        this.fetchQuestion();
      }
    }, 2000);

    this.cleanupQueue.push({ type: 'timeout', id: timeoutId });
  }

  levelComplete() {
    const isLastLevel = this.gameState.level >= this.config.LEVELS.length - 1;
    
    if (isLastLevel) {
      this.endGame(true);
      return;
    }

    this.getEl('#levelCompleteTitle').textContent = `🎉 أكملت المستوى ${this.config.LEVELS[this.gameState.level].label}!`;
    this.getEl('#levelScore').textContent = this.formatNumber(this.gameState.currentScore);
    this.getEl('#levelErrors').textContent = this.gameState.wrongAnswers;
    this.getEl('#levelCorrect').textContent = this.gameState.correctAnswers;
    this.playSound('levelup');
    this.showScreen('levelComplete');
  }

  nextLevel() {
    this.gameState.level++;
    if (this.gameState.level >= this.config.LEVELS.length) {
      this.endGame(true);
    } else {
      this.showScreen('game');
      this.startLevel();
    }
  }

  async endGame(completedAllLevels = false) {
    // إيقاف جميع المؤقتات أولاً
    this.clearAllTimers();
    this.hideModal('confirmExit');

    const baseStats = this._calculateFinalStats(completedAllLevels);

    try {
      const perf = await this.ratePerformance(baseStats);
      baseStats.performance_rating = perf.label;
      baseStats.performance_score = perf.score;
    } catch (_) {
      const acc = Number(baseStats.accuracy || 0);
      baseStats.performance_rating = (acc >= 90) ? "ممتاز 🏆" :
                                    (acc >= 75) ? "جيد جدًا ⭐" :
                                    (acc >= 60) ? "جيد 👍" :
                                    (acc >= 40) ? "مقبول 👌" : "يحتاج إلى تحسين 📈";
    }

    // حفظ النتائج مع إدارة المحاولات
    const saveResult = await this.saveResultsToSupabase(baseStats);
    
    if (saveResult.error) {
      this.showToast("فشل إرسال النتائج إلى السيرفر", "error");
    } else {
      baseStats.attempt_number = saveResult.attemptNumber;
      this.gameState.attemptNumber = saveResult.attemptNumber;
    }

    this._displayFinalStats(baseStats);
    
    if (completedAllLevels) {
      this.playSound('win');
    } else {
      this.playSound(completedAllLevels ? 'win' : 'loss');
    }

    this.showScreen('end');
    
    // تنظيف الجلسة بعد عرض النتائج
    setTimeout(() => this.cleanupSession(), 1000);
  }

  async playAgain() {
    await this.cleanupSession();
    this.currentSessionId = this.generateSessionId();
    window.location.reload();
  }

  _calculateFinalStats(completedAll) {
    const totalTimeSeconds = (new Date() - this.gameState.startTime) / 1000;
    const currentLevelLabel = this.config.LEVELS[Math.min(this.gameState.level, this.config.LEVELS.length - 1)].label;

    const corr = this.gameState.correctAnswers;
    const wrong = this.gameState.wrongAnswers;
    const skips = this.gameState.skips;

    const denom = corr + wrong + (this.config.SKIP_WEIGHT * skips);
    const accuracy = denom > 0 ? parseFloat(((corr / denom) * 100).toFixed(1)) : 0.0;

    const answeredCount = (corr + wrong) || 1;
    const avgTime = parseFloat((totalTimeSeconds / answeredCount).toFixed(1));

    return {
      name: this.gameState.name,
      player_id: this.gameState.playerId,
      device_id: this.gameState.deviceId,
      session_id: this.gameState.sessionId,
      avatar: this.gameState.avatar,
      correct_answers: corr,
      wrong_answers: wrong,
      skips: skips,
      score: this.gameState.currentScore,
      total_time: totalTimeSeconds,
      level: currentLevelLabel,
      accuracy, 
      avg_time: avgTime,
      performance_rating: this.getPerformanceRating(accuracy),
      completed_all: completedAll,
      used_fifty_fifty: this.gameState.helpersUsed.fiftyFifty,
      used_freeze_time: this.gameState.helpersUsed.freezeTime
    };
  }

  // ===================================================
  // Data & API
  // ===================================================
  async loadQuestions() {
    try {
      const response = await fetch(this.config.QUESTIONS_URL, { 
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const questionsData = await response.json();
      
      // التحقق من صحة هيكل البيانات
      if (typeof questionsData === 'object' && questionsData !== null) {
        this.questions = questionsData;
        console.log('Questions loaded successfully:', Object.keys(this.questions));
        return true;
      } else {
        throw new Error('Invalid questions data structure');
      }
    } catch (error) {
      console.error("Failed to load questions file:", error);
      this.showToast("خطأ في تحميل الأسئلة", "error");
      return false;
    }
  }

  async saveResultsToSupabase(resultsData) {
    try {
      // الحصول على رقم المحاولة التالي لهذا الجهاز
      const { count, error: countError } = await this.supabase
        .from('log')
        .select('id', { count: 'exact', head: true })
        .eq('device_id', resultsData.device_id);

      if (countError) throw countError;
      const attemptNumber = (count || 0) + 1;

      // إدخال في جدول السجل
      const { error: logError } = await this.supabase.from('log')
        .insert({ 
          ...resultsData, 
          attempt_number: attemptNumber, 
          performance_score: resultsData.performance_score ?? null 
        });

      if (logError) throw logError;

      // تحديث لوحة الصدارة
      const leaderboardData = {
        device_id: resultsData.device_id,
        player_id: resultsData.player_id,
        name: resultsData.name, 
        avatar: resultsData.avatar, 
        score: resultsData.score,
        level: resultsData.level, 
        accuracy: resultsData.accuracy, 
        total_time: resultsData.total_time,
        avg_time: resultsData.avg_time, 
        correct_answers: resultsData.correct_answers,
        wrong_answers: resultsData.wrong_answers, 
        skips: resultsData.skips,
        attempt_number: attemptNumber, 
        performance_rating: resultsData.performance_rating,
        performance_score: resultsData.performance_score ?? null,
        is_impossible_finisher: resultsData.completed_all && resultsData.level === 'مستحيل',
        last_updated: new Date().toISOString()
      };
      
      const { error: leaderboardError } = await this.supabase.from('leaderboard')
        .upsert(leaderboardData, { 
          onConflict: 'device_id',
          ignoreDuplicates: false 
        });
        
      if (leaderboardError) throw leaderboardError;

      this.showToast("تم حفظ نتيجتك بنجاح!", "success");
      this.playSound('coin');
      
      // إرسال إشعار
      this.sendTelegramNotification('gameResult', { ...resultsData, attempt_number: attemptNumber });
      
      return { attemptNumber, error: null };

    } catch (error) {
      console.error("Failed to send results to Supabase:", error);
      return { attemptNumber: null, error: error.message };
    }
  }

  // ===================================================
  // Leaderboard with Dynamic Attempts Filter
  // ===================================================
  async displayLeaderboard() {
    this.showScreen('leaderboard');
    this.dom.leaderboardContent.innerHTML = '<div class="spinner"></div>';

    const mode = this.dom.lbMode?.value || 'best';
    const attemptN = Number(this.dom.lbAttempt?.value || 1);

    try {
      // تحديث قيم المحاولات المتاحة ديناميكياً
      await this.updateAttemptsFilter();

      let rows = [];
      
      if (mode === 'attempt') {
        // جلب المحاولات المحددة
        const { data, error } = await this.supabase
          .from('log')
          .select('*')
          .eq('attempt_number', attemptN)
          .order('score', { ascending: false })
          .order('accuracy', { ascending: false })
          .order('total_time', { ascending: true })
          .limit(100);

        if (error) throw error;
        rows = data || [];
      } else {
        // جلب أفضل النتائج
        let query = this.supabase.from('leaderboard').select('*');
        
        if (mode === 'accuracy') {
          query = query.order('accuracy', { ascending: false })
                       .order('score', { ascending: false })
                       .order('total_time', { ascending: true });
        } else if (mode === 'time') {
          query = query.order('total_time', { ascending: true })
                       .order('accuracy', { ascending: false })
                       .order('score', { ascending: false });
        } else { // best
          query = query.order('is_impossible_finisher', { ascending: false })
                       .order('score', { ascending: false })
                       .order('accuracy', { ascending: false })
                       .order('total_time', { ascending: true });
        }
        
        const { data, error } = await query.limit(100);
        if (error) throw error;
        rows = data || [];

        // منع التكرار في وضع best
        if (mode === 'best') {
          const seen = new Map();
          for (const r of rows) if (!seen.has(r.device_id)) seen.set(r.device_id, r);
          rows = [...seen.values()];
        }
      }

      this.renderLeaderboard(rows.slice(0, 50));
      
      if (mode !== 'attempt') {
        this.subscribeToLeaderboardChanges();
      }

    } catch (error) {
      console.error("Error loading leaderboard:", error);
      this.dom.leaderboardContent.innerHTML = '<p>حدث خطأ في تحميل لوحة الصدارة.</p>';
    }
  }

  async updateAttemptsFilter() {
    try {
      // جلب أكبر رقم محاولة موجود في قاعدة البيانات
      const { data, error } = await this.supabase
        .from('log')
        .select('attempt_number')
        .order('attempt_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      const maxAttempt = data && data.length > 0 ? data[0].attempt_number : 1;
      
      // تحديث خيارات المحاولات
      if (this.dom.lbAttempt) {
        this.dom.lbAttempt.innerHTML = '';
        
        for (let i = 1; i <= maxAttempt; i++) {
          const option = document.createElement('option');
          option.value = i;
          option.textContent = `المحاولة ${i}`;
          this.dom.lbAttempt.appendChild(option);
        }
        
        // إذا كانت القيمة الحالية غير متاحة، تعيين إلى المحاولة 1
        if (this.dom.lbAttempt.value > maxAttempt) {
          this.dom.lbAttempt.value = 1;
        }
      }
    } catch (error) {
      console.error("Error updating attempts filter:", error);
    }
  }

  // ... (بقية الدوال تبقى كما هي مع إزالة أي إشارة لوضع المطور)

  // إزالة جميع الدوال والإشارات المتعلقة بوضع المطور مثل:
  // checkDevPassword, activateDevSession, updateDevFab, isDeveloper, etc.

  // الحفاظ على الدوال الأساسية الأخرى كما هي مع التأكد من دمج التعديلات المطلوبة

}

// Boot
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.dataset.theme = savedTheme;
    const toggleBtn = document.querySelector('.theme-toggle-btn');
    if (toggleBtn) {
        toggleBtn.textContent = (savedTheme === 'dark') ? ICON_SUN : ICON_MOON;
    }

    new QuizGame();
});
