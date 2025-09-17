/* script.js — كامل ومعدل للربط مع Google Apps Script + تحسينات واجهة */

/* Helpers */
const uuidv4 = () => {
  // بسيط وموثوق لتوليد UUID (v4-like)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/* script.js */

const getEndpoint = () => {
  // تم تثبيت الرابط مباشرة في الكود
  return 'https://script.google.com/macros/s/AKfycbzB9cru35ndWmWYsEqe46NlrvZgj64HhCIZJ0j7SLln3VDSl2S7rAOMDGxLwEzR_ClS/exec';
};

const safeFetch = async (url, opts) => {
  try {
    const res = await fetch(url, opts);
    return res;
  } catch (err) {
    console.warn('Network error:', err);
    throw err;
  }
};

/* DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {
  // --- بنك الأسئلة (افتراضي) ---
  const questions = [
    { question: "ما هي عاصمة المملكة العربية السعودية؟", options: ["الرياض", "جدة", "مكة", "الدمام"], answer: "الرياض" },
    { question: "كم عدد القارات في العالم؟", options: ["5", "6", "7", "8"], answer: "7" },
    { question: "ما هو أكبر كوكب في نظامنا الشمسي؟", options: ["الأرض", "المريخ", "المشتري", "زحل"], answer: "المشتري" },
    { question: "من هو مؤلف رواية '1984'؟", options: ["جورج أورويل", "ألدوس هكسلي", "جي. ك. رولينغ", "ليو تولستوي"], answer: "جورج أورويل" },
    { question: "ما هو العنصر الكيميائي الذي رمزه 'O'؟", options: ["الذهب", "الأكسجين", "الفضة", "الهيدروجين"], answer: "الأكسجين" },
    { question: "في أي بلد تقع ساعة بيغ بن؟", options: ["فرنسا", "إيطاليا", "الولايات المتحدة", "المملكة المتحدة"], answer: "المملكة المتحدة" },
    { question: "ما هي العملة الرسمية لليابان؟", options: ["اليوان", "الوون", "الين", "الدولار"], answer: "الين" },
    { question: "كم عدد أضلاع المثلث؟", options: ["3", "4", "5", "6"], answer: "3" },
    { question: "ما هو أطول نهر في العالم؟", options: ["الأمازون", "النيل", "اليانغتسي", "المسيسيبي"], answer: "النيل" },
    { question: "من رسم لوحة الموناليزا؟", options: ["فينسنت فان جوخ", "بابلو بيكاسو", "ليوناردو دافنشي", "كلود مونيه"], answer: "ليوناردو دافنشي" },
    { question: "ما هو المحيط الأكبر في العالم؟", options: ["الأطلسي", "الهندي", "المتجمد الشمالي", "الهادئ"], answer: "الهادئ" },
    { question: "ما هي الدولة الأكثر سكاناً في العالم؟", options: ["الصين", "الهند", "الولايات المتحدة", "إندونيسيا"], answer: "الهند" },
    { question: "ما هو الغاز الذي يشكل معظم غلاف الأرض الجوي؟", options: ["الأكسجين", "ثاني أكسيد الكربون", "النيتروجين", "الأرجون"], answer: "الالنيتروجين".replace('الال','ال') }, // تصحيح طفيف إن لزم
    { question: "كم عدد اللاعبين في فريق كرة القدم؟", options: ["9", "10", "11", "12"], answer: "11" },
    { question: "ما هي أسرع حيوان بري؟", options: ["الأسد", "الفهد", "الحصان", "الغزال"], answer: "الفهد" },
  ];

  // سؤال مستحيل (خاص)
  const impossibleQuestion = {
    question: "ما هو الرقم التالي في هذه المتسلسلة: 1, 1, 2, 3, 5, 8, ...؟",
    options: ["11", "12", "13", "14"],
    answer: "13"
  };

  // --- حالة اللعبة ---
  let currentQuestionIndex = 0;
  let score = 100;
  let skipCount = 0;
  let skipCost = 100;
  let timer = null;
  let timerValue = 80;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let gameStartTime = null;
  let impossibleQuestionUsed = false;
  let impossibleQuestionCorrect = false;
  let usingImpossibleNow = false;

  // player & device
  const playerData = {
    name: '',
    avatar: ''
  };

  const deviceIdKey = 'quizDeviceId_v1';
  let deviceId = localStorage.getItem(deviceIdKey) || uuidv4();
  localStorage.setItem(deviceIdKey, deviceId);

  const helpersUsed = {
    fiftyFifty: false,
    freezeTime: false,
    changeQuestion: false,
    skipCountTotal: 0
  };

  // --- DOM elements ---
  const screens = document.querySelectorAll('.screen');
  const startScreen = document.getElementById('startScreen');
  const avatarScreen = document.getElementById('avatarScreen');
  const nameEntryScreen = document.getElementById('nameEntry');
  const gameContainer = document.getElementById('gameContainer');
  const resultsScreen = document.getElementById('resultsScreen');
  const leaderboardScreen = document.getElementById('leaderboardScreen');

  const startPlayBtn = document.getElementById('startPlayBtn');
  const showLeaderboardBtn = document.getElementById('showLeaderboardBtn');
  const confirmAvatarBtn = document.getElementById('confirmAvatarBtn');
  const confirmNameBtn = document.getElementById('confirmNameBtn');
  const endGameBtn = document.getElementById('endGameBtn');
  const impossibleQuestionBtn = document.getElementById('impossibleQuestionBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const backToHomeBtn = document.getElementById('backToHomeBtn');
  const backToStartBtn = document.getElementById('backToStartBtn');
  const confirmEndBtn = document.getElementById('confirmEndBtn');
  const cancelEndBtn = document.getElementById('cancelEndBtn');
  const viewResultsBtn = document.getElementById('viewResultsBtn');
  const acceptChallengeBtn = document.getElementById('acceptChallengeBtn');

  const avatarGrid = document.querySelector('.avatar-grid');
  const nameInput = document.getElementById('nameInput');
  const nameError = document.getElementById('nameError');
  const questionCounter = document.getElementById('questionCounter');
  const progressFill = document.querySelector('.progress-fill');
  const playerAvatar = document.getElementById('playerAvatar');
  const playerNameEl = document.getElementById('playerName');
  const currentScoreSpan = document.getElementById('currentScore');
  const skipCountSpan = document.getElementById('skipCount');
  const skipCostSpan = document.getElementById('skipCost');
  const timerFill = document.querySelector('.timer-fill');
  const timerText = document.getElementById('timer');
  const questionText = document.getElementById('questionText');
  const optionsGrid = document.querySelector('.options-grid');
  const endConfirmModal = document.getElementById('endConfirmModal');
  const impossibleQuestionModal = document.getElementById('impossibleQuestionModal');
  const toastContainer = document.getElementById('toast-container');

  const leaderboardBody = document.getElementById('leaderboardBody');

  // --- utilities UI ---
  const showScreen = (target) => {
    screens.forEach(s => s.classList.remove('active'));
    target.classList.add('active');
    // accessibility focus
    target.querySelector('h2, h1, .game-title, [tabindex]')?.focus?.();
  };

  const showToast = (text, type = 'info', timeout = 3000) => {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.setAttribute('role', 'status');
    t.textContent = text;
    toastContainer.appendChild(t);
    // auto remove
    setTimeout(() => {
      t.classList.add('hide');
      t.addEventListener('animationend', () => t.remove(), { once: true });
    }, timeout);
  };

  // --- avatars generation (if grid empty) ---
  const generateAvatars = (count = 12) => {
    // avoid duplicate generation
    if (avatarGrid.querySelectorAll('.avatar-option').length > 0) return;
    for (let i = 1; i <= count; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'avatar-option';
      btn.setAttribute('data-avatar-id', `avatar_${i}`);
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-pressed', 'false');
      btn.tabIndex = 0;

      const img = document.createElement('img');
      img.className = 'avatar-img';
      img.loading = 'lazy';
      img.alt = `رمزية ${i}`;
      img.src = `https://i.pravatar.cc/150?img=${i}`;
      img.style.width = '72px';
      img.style.height = '72px';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';

      btn.appendChild(img);
      avatarGrid.appendChild(btn);
    }
  };

  // select avatar
  avatarGrid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.avatar-option');
    if (!btn) return;
    document.querySelectorAll('.avatar-option').forEach(x => {
      x.setAttribute('aria-pressed', 'false');
      x.classList.remove('selected');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-pressed', 'true');
    const img = btn.querySelector('img');
    playerData.avatar = img?.src || '';
    playerAvatar.src = playerData.avatar;
    confirmAvatarBtn.disabled = false;
    confirmAvatarBtn.removeAttribute('aria-disabled');
  });

  // name validation live
  nameInput.addEventListener('input', () => {
    const value = nameInput.value.trim();
    if (value.length < 3) {
      nameError.textContent = 'الاسم يجب أن يكون 3 أحرف على الأقل.';
      confirmNameBtn.disabled = true;
    } else {
      nameError.textContent = '';
      confirmNameBtn.disabled = false;
    }
  });

  // --- Game lifecycle ---
  const initGameState = () => {
    generateAvatars();
    checkTheme();
    // restore player (if any)
    const saved = JSON.parse(localStorage.getItem('quizPlayer_v1') || '{}');
    if (saved?.name) {
      playerData.name = saved.name;
      playerData.avatar = saved.avatar || '';
      playerAvatar.src = playerData.avatar;
      playerNameEl.textContent = playerData.name;
    }
    loadLeaderboard(); // try server then fallback
    showScreen(startScreen);
  };

  const resetGame = () => {
    currentQuestionIndex = 0;
    score = 100;
    skipCount = 0;
    skipCost = 100;
    correctAnswers = 0;
    wrongAnswers = 0;
    impossibleQuestionUsed = false;
    impossibleQuestionCorrect = false;
    usingImpossibleNow = false;
    helpersUsed.fiftyFifty = false;
    helpersUsed.freezeTime = false;
    helpersUsed.changeQuestion = false;
    helpersUsed.skipCountTotal = 0;
    // enable helpers
    document.querySelectorAll('.helper-btn').forEach(b => {
      b.disabled = false;
      b.classList.remove('disabled');
    });
    document.querySelector('.helpers-container').style.display = '';
    updateGameUI();
  };

  const startTimer = (sec = 80) => {
    clearInterval(timer);
    timerValue = sec;
    timerText.textContent = timerValue;
    timerFill.style.width = '100%';
    timer = setInterval(() => {
      timerValue--;
      timerText.textContent = timerValue;
      timerFill.style.width = `${(timerValue / sec) * 100}%`;
      if (timerValue <= 0) {
        clearInterval(timer);
        // treat as wrong
        wrongAnswers++;
        showToast('انتهى الوقت! -100 نقطة', 'error');
        score -= 100;
        updateGameUI();
        setTimeout(() => {
          nextQuestion();
        }, 1000);
      }
    }, 1000);
  };

  const loadQuestion = (overrideQuestionObj = null) => {
    // if override used (impossible question) set usingImpossibleNow flag
    const questionObj = overrideQuestionObj || questions[currentQuestionIndex];
    if (!questionObj) {
      // end if no more questions
      return endGame();
    }

    usingImpossibleNow = (overrideQuestionObj !== null);
    questionText.textContent = questionObj.question;
    optionsGrid.innerHTML = '';

    // randomize options order
    const opts = [...questionObj.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }

    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(btn, questionObj));
      optionsGrid.appendChild(btn);
    });

    // start timer (shorter for impossible)
    startTimer(usingImpossibleNow ? 20 : 80);
    updateGameUI();
  };

  const handleAnswer = (btn, questionObj) => {
    // prevent double click
    if (btn.classList.contains('disabled')) return;
    // disable options
    Array.from(document.querySelectorAll('.option-btn')).forEach(b => {
      b.classList.add('disabled');
      b.disabled = true;
    });
    clearInterval(timer);

    const selected = btn.textContent;
    const isCorrect = selected === questionObj.answer;

    if (isCorrect) {
      btn.classList.add('correct');
      score += 100;
      correctAnswers++;
      showToast('إجابة صحيحة — +100 نقطة', 'success');
    } else {
      btn.classList.add('wrong');
      wrongAnswers++;
      score -= 100;
      showToast('إجابة خاطئة — -100 نقطة', 'error');
      // mark correct
      Array.from(document.querySelectorAll('.option-btn')).forEach(b => {
        if (b.textContent === questionObj.answer) {
          b.classList.add('correct');
        }
      });
    }
    updateGameUI();

    // if this was impossible question, set flag
    if (usingImpossibleNow) {
      impossibleQuestionUsed = true;
      impossibleQuestionCorrect = isCorrect;
      // after answering impossible, end game after short delay
      setTimeout(() => endGame(), 1400);
      return;
    }

    // else continue normal flow
    setTimeout(() => {
      nextQuestion();
    }, 900);
  };

  const nextQuestion = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      endGame();
    } else {
      loadQuestion();
    }
  };

  const applyFiftyFifty = () => {
    if (helpersUsed.fiftyFifty) return;
    const optionButtons = Array.from(document.querySelectorAll('.option-btn')).filter(b => !b.classList.contains('disabled'));
    const correctText = questions[currentQuestionIndex].answer;
    const wrongOpts = optionButtons.filter(b => b.textContent !== correctText);
    // shuffle wrongOpts
    for (let i = wrongOpts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongOpts[i], wrongOpts[j]] = [wrongOpts[j], wrongOpts[i]];
    }
    // hide two wrong ones (or disable)
    wrongOpts.slice(0, 2).forEach(b => {
      b.style.visibility = 'hidden';
      b.disabled = true;
    });
    helpersUsed.fiftyFifty = true;
  };

  const applyFreezeTime = () => {
    if (helpersUsed.freezeTime) return;
    clearInterval(timer);
    // freeze for 10 seconds visually: pause timer decrement for 10s then resume
    setTimeout(() => {
      startTimer(timerValue);
    }, 10000);
    helpersUsed.freezeTime = true;
  };

  const applyChangeQuestion = () => {
    if (helpersUsed.changeQuestion) return;
    // increment index to jump to question 16-like (here next)
    currentQuestionIndex++;
    helpersUsed.changeQuestion = true;
    loadQuestion();
  };

  const applySkip = () => {
    if (score < skipCost) {
      showToast('لا توجد نقاط كافية لاستخدام التخطي', 'error');
      return;
    }
    score -= skipCost;
    skipCount++;
    helpersUsed.skipCountTotal++;
    skipCost += 50;
    updateGameUI();
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      endGame();
    } else {
      loadQuestion();
    }
  };

  const updateGameUI = () => {
    questionCounter.textContent = `السؤال ${Math.min(currentQuestionIndex + 1, questions.length)} من ${questions.length}`;
    progressFill.style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;
    playerAvatar.src = playerData.avatar || '';
    playerNameEl.textContent = playerData.name || 'اللاعب';
    currentScoreSpan.textContent = score;
    skipCountSpan.textContent = skipCount;
    skipCostSpan.textContent = skipCost;
  };

  // --- Theme toggle ---
  const checkTheme = () => {
    const saved = localStorage.getItem('quizTheme') || 'dark';
    document.body.dataset.theme = saved;
    themeToggleBtn.innerHTML = saved === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  };

  const toggleTheme = () => {
    const cur = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
    const nxt = cur === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = nxt;
    themeToggleBtn.innerHTML = nxt === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    localStorage.setItem('quizTheme', nxt);
  };

  // --- End game: calculate results, send to server (Apps Script) with fallback to localStorage ---
  const calculateResults = () => {
    const endTime = new Date();
    const durationSeconds = Math.max(0, Math.floor((endTime - gameStartTime) / 1000));
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    document.getElementById('resultName').textContent = playerData.name;
    document.getElementById('resultCorrect').textContent = correctAnswers;
    document.getElementById('resultWrong').textContent = wrongAnswers;
    document.getElementById('resultSkips').textContent = skipCount;
    document.getElementById('resultScore').textContent = score;
    document.getElementById('resultTime').textContent = `${minutes} دقائق و ${seconds} ثواني`;
    document.getElementById('resultImpossible').textContent = impossibleQuestionUsed ? (impossibleQuestionCorrect ? 'مستخدم — إجابة صحيحة' : 'مستخدم — إجابة خاطئة') : 'لم يُستخدم';

    // performance chart
    const perfPercent = Math.round((correctAnswers / questions.length) * 100);
    const perfFill = document.getElementById('performanceFill');
    const perfLabel = document.getElementById('performanceLabel');
    perfFill.style.width = `${perfPercent}%`;
    perfLabel.textContent = perfPercent >= 80 ? 'ممتاز' : (perfPercent >= 50 ? 'جيد' : 'بحاجة للتحسين');

    return {
      deviceId,
      playerName: playerData.name,
      avatarId: playerData.avatar || '',
      startTime: gameStartTime ? new Date(gameStartTime).toISOString() : '',
      endTime: endTime.toISOString(),
      durationSeconds,
      status: 'finished',
      numQuestions: questions.length,
      correctAnswers,
      wrongAnswers,
      skips: skipCount,
      usedFiftyFifty: helpersUsed.fiftyFifty ? 1 : 0,
      usedFreeze: helpersUsed.freezeTime ? 1 : 0,
      usedSwap: helpersUsed.changeQuestion ? 1 : 0,
      impossibleUsed: impossibleQuestionUsed ? 1 : 0,
      impossibleCorrect: impossibleQuestionCorrect ? 1 : 0,
      scoreBeforeImpossible: 0, // optional — you can compute if needed
      finalScore: score,
      roundDifficulty: 'normal',
      attemptsSummary: JSON.stringify({ correctAnswers, wrongAnswers, skips, helpersUsed }),
      userAgent: navigator.userAgent,
      ip: '' // IP omitted — server can determine if needed
    };
  };

  const sendResultToServer = async (payload) => {
    const endpoint = getEndpoint();
    if (!endpoint) {
      throw new Error('No Apps Script endpoint configured.');
    }
    // Apps Script expects JSON with action 'submitResult'
    const body = { action: 'submitResult', ...payload };
    const res = await safeFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const json = await res.json();
    return json;
  };

  const saveLocallyFallback = (payload) => {
    // Save into local leaderboard (fallback)
    const key = 'quizLeaderboard_v1';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.push({ name: payload.playerName, finalScore: payload.finalScore, impossible: payload.impossibleUsed ? (payload.impossibleCorrect ? 'used_correct' : 'used_wrong') : 'not_used', lastPlayed: payload.endTime, deviceId: payload.deviceId });
    arr.sort((a, b) => b.finalScore - a.finalScore);
    localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
  };

  const endGame = async () => {
    clearInterval(timer);
    const payload = calculateResults();

    // Save to localStorage of player info
    localStorage.setItem('quizPlayer_v1', JSON.stringify({ name: playerData.name, avatar: playerData.avatar }));

    // Try to send to server; fallback to local
    try {
      await sendResultToServer(payload);
      showToast('تم إرسال النتيجة للسيرفر', 'success', 2000);
    } catch (err) {
      console.warn('Send to server failed, saving locally', err);
      saveLocallyFallback(payload);
      showToast('تعذر إرسال النتيجة — تم الحفظ محلياً', 'info', 3000);
    }

    // update leaderboard UI from server or local
    await loadLeaderboard();
    showScreen(resultsScreen);
  };

  // --- Leaderboard: try server getLeaderboard action, fallback to localStorage ---
  const loadLeaderboard = async () => {
    const endpoint = getEndpoint();
    let rows = [];
    if (endpoint) {
      try {
        const res = await safeFetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getLeaderboard' })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.leaderboard)) {
            // expecting array of rows [rank, playerName, finalScore, level, impossibleStatus, lastPlayed, deviceId]
            rows = json.leaderboard.map(r => ({
              rank: r[0],
              name: r[1],
              score: r[2],
              level: r[3] || '',
              impossible: r[4] || '',
            }));
          }
        } else {
          throw new Error('Server returned ' + res.status);
        }
      } catch (err) {
        console.warn('Could not fetch leaderboard from server', err);
        // fallback to localStorage
      }
    }

    if (!rows.length) {
      // fallback to localStorage format
      const local = JSON.parse(localStorage.getItem('quizLeaderboard_v1') || '[]');
      rows = local.map((e, i) => ({ rank: i + 1, name: e.name, score: e.finalScore, level: '', impossible: e.impossible }));
    }

    // render rows
    if (!leaderboardBody) return;
    leaderboardBody.innerHTML = '';
    if (!rows.length) {
      leaderboardBody.innerHTML = `<tr><td colspan="4">لا توجد بيانات لعرضها.</td></tr>`;
      return;
    }

    rows.slice(0, 50).forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i + 1}</td><td>${r.name}</td><td>${r.score}</td><td>${r.impossible}</td>`;
      leaderboardBody.appendChild(tr);
    });
  };

  // --- Event bindings ---
  startPlayBtn.addEventListener('click', () => {
    // go to avatar selection
    showScreen(avatarScreen);
  });

  showLeaderboardBtn.addEventListener('click', async () => {
    await loadLeaderboard();
    showScreen(leaderboardScreen);
  });

  confirmAvatarBtn.addEventListener('click', () => {
    // proceed to name entry
    showScreen(nameEntryScreen);
    // focus field
    nameInput.focus();
  });

  confirmNameBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name.length < 3) {
      nameError.textContent = 'الاسم يجب أن يكون 3 أحرف على الأقل.';
      return;
    }
    playerData.name = name;
    // save to local quick restore
    localStorage.setItem('quizPlayer_v1', JSON.stringify({ name: playerData.name, avatar: playerData.avatar }));
    // Start game
    resetGame();
    gameStartTime = new Date();
    startGame();
  });

  const startGame = () => {
    // shuffle questions so they appear random each play
    shuffleArray(questions);
    currentQuestionIndex = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    score = 100;
    startTimer(80);
    loadQuestion();
    showScreen(gameContainer);
  };

  // helper-btns handler
  document.querySelector('.helpers-container')?.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.helper-btn');
    if (!btn) return;
    const type = btn.dataset.type;
    if (!type) return;
    if (btn.disabled) {
      showToast('المساعدة غير متاحة', 'info');
      return;
    }
    // check cost
    const cost = 100;
    if (score < cost) {
      showToast('لا توجد نقاط كافية لاستخدام هذه المساعدة', 'error');
      return;
    }
    score -= cost;
    btn.disabled = true;
    btn.classList.add('disabled');
    updateGameUI();
    showToast(`استخدمت ${type} -${cost} نقطة`, 'info');

    switch (type) {
      case 'fiftyFifty':
        applyFiftyFifty();
        helpersUsed.fiftyFifty = true;
        break;
      case 'freezeTime':
        applyFreezeTime();
        helpersUsed.freezeTime = true;
        break;
      case 'changeQuestion':
        applyChangeQuestion();
        helpersUsed.changeQuestion = true;
        break;
      case 'skipQuestion':
        applySkip();
        break;
    }
  });

  // End confirm modal
  endGameBtn.addEventListener('click', () => endConfirmModal.classList.add('active'));
  cancelEndBtn.addEventListener('click', () => endConfirmModal.classList.remove('active'));
  confirmEndBtn.addEventListener('click', () => {
    endConfirmModal.classList.remove('active');
    endGame();
  });

  // impossible question flow
  impossibleQuestionBtn.addEventListener('click', () => {
    if (impossibleQuestionUsed) {
      showToast('لقد استخدمت السؤال المستحيل بالفعل!', 'info');
      return;
    }
    impossibleQuestionModal.classList.add('active');
  });

  viewResultsBtn.addEventListener('click', () => {
    impossibleQuestionModal.classList.remove('active');
    endGame();
  });

  acceptChallengeBtn.addEventListener('click', () => {
    impossibleQuestionModal.classList.remove('active');
    impossibleQuestionUsed = true;
    // hide helpers UI
    document.querySelector('.helpers-container').style.display = 'none';
    // load impossible
    loadQuestion(impossibleQuestion);
  });

  // back navigation
  playAgainBtn.addEventListener('click', () => {
    showScreen(nameEntryScreen);
  });
  backToHomeBtn.addEventListener('click', () => {
    showScreen(startScreen);
  });
  backToStartBtn.addEventListener('click', () => {
    showScreen(startScreen);
  });

  themeToggleBtn.addEventListener('click', toggleTheme);

  // --- small utilities ---
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // init app
  initGameState();

  // expose for debugging (optional)
  window._quiz = {
    startGame,
    endGame,
    loadLeaderboard,
    getDeviceId: () => deviceId
  };
});
