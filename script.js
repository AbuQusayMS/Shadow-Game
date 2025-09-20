document.addEventListener('DOMContentLoaded', () => {
    // --- تعريف العناصر (DOM Elements) ---
    const screens = {
        splash: document.getElementById('splash-screen'),
        playerSetup: document.getElementById('player-setup-screen'),
        instructions: document.getElementById('instructions-screen'),
        question: document.getElementById('question-screen'),
        results: document.getElementById('results-screen'),
        leaderboard: document.getElementById('leaderboard-screen'),
    };

    const buttons = {
        start: document.getElementById('start-btn'),
        confirmPlayer: document.getElementById('confirm-player-btn'),
        startQuiz: document.getElementById('start-quiz-btn'),
        endQuiz: document.getElementById('end-quiz-btn'),
        toggleTheme: document.getElementById('toggle-theme-btn'),
        playAgain: document.getElementById('play-again-btn'),
        viewLeaderboard: document.getElementById('view-leaderboard-btn'),
        backToResults: document.getElementById('back-to-results-btn'),
        confirmExit: document.getElementById('confirm-exit-btn'),
        nextLevel: document.getElementById('next-level-btn'),
        withdraw: document.getElementById('withdraw-btn'),
        closeModal: document.querySelectorAll('.close-modal-btn'),
    };
    
    const helpButtons = {
        fiftyFifty: document.getElementById('fifty-fifty-btn'),
        freezeTime: document.getElementById('freeze-time-btn'),
        skipQuestion: document.getElementById('skip-question-btn'),
    };

    const modals = {
        overlay: document.getElementById('modal-overlay'),
        exit: document.getElementById('exit-modal'),
        levelComplete: document.getElementById('level-complete-modal'),
    };

    const hud = {
        points: document.getElementById('hud-points'),
        errors: document.getElementById('hud-errors'),
        skips: document.getElementById('hud-skips'),
        avatar: document.getElementById('hud-avatar'),
        playerName: document.getElementById('hud-player-name'),
        playerId: document.getElementById('hud-player-id'),
    };
    
    // --- بيانات الأسئلة ---
    const QUESTIONS_PER_LEVEL = 5; // تم توحيد عدد الأسئلة لكل مستوى لسهولة المنطق
    const questions = {
        easy: [
            { question: "ما هو لون السماء في يوم صافٍ؟", options: ["أخضر", "أزرق", "أحمر", "أصفر"], correct: 1 },
            { question: "كم عدد أصابع اليد الواحدة؟", options: ["عشرة", "خمسة", "سبعة", "ثلاثة"], correct: 1 },
            { question: "ماذا نستخدم لنرى الأشياء البعيدة؟", options: ["ميكروسكوب", "منظار", "سماعة", "كاميرا"], correct: 1 },
            { question: "ما هو اسم كوكبنا؟", options: ["المريخ", "زحل", "الأرض", "عطارد"], correct: 2 },
            { question: "ما هو عكس كلمة 'نهار'؟", options: ["ظلام", "شمس", "ليل", "فجر"], correct: 2 }
        ],
        medium: [ /* أضف 5 أسئلة متوسطة هنا */ ],
        hard: [ /* أضف 5 أسئلة صعبة هنا */ ],
        impossible: [
            { question: "ما هو السؤال الذي لا يمكن الإجابة عليه بنعم؟", options: ["هل أنت نائم؟", "هل أنت كاذب؟", "هل هذا صحيح؟", "هل هذا خطأ؟"], correct: 0, impossible: true }
        ],
    };

    // --- حالة اللعبة (Game State) ---
    let gameState = {};

    function resetGameState() {
        const playerInfo = { ...gameState.player }; // احتفظ بمعلومات اللاعب
        gameState = {
            player: {
                name: playerInfo.name || '',
                id: playerInfo.id || '',
                avatar: playerInfo.avatar || '',
                points: 100,
                errors: 0,
                skips: 0,
                correctAnswers: 0,
                wrongAnswers: 0,
                startTime: null,
                helpsUsed: { fiftyFifty: false, freezeTime: false },
                answeredImpossible: false,
            },
            currentLevelIndex: 0,
            currentQuestionIndexInLevel: 0,
            timer: null,
            timeLeft: 15, // مدة الإجابة بالثواني
            gameActive: false,
            levels: ['easy', 'medium', 'hard', 'impossible'],
        };
    }

    // --- وظائف اللعبة الأساسية ---

    function showScreen(screenId) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenId].classList.add('active');
    }

    function showModal(modalId) {
        modals.overlay.classList.add('active');
        modals[modalId].classList.add('active');
    }

    function hideModals() {
        modals.overlay.classList.remove('active');
        Object.values(modals).forEach(modal => modal.classList.remove('active'));
    }

    function showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notif = document.createElement('div');
        notif.className = `notification ${type}`;
        notif.textContent = message;
        container.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
    
    function applyLevelTheme() {
        const level = gameState.levels[gameState.currentLevelIndex];
        document.body.className = document.body.classList.contains('dark-mode') ? 'dark-mode' : '';
        document.body.classList.add(`theme-${level}`);
        
        // تحديث شريط تقدم المستويات
        document.querySelectorAll('.level-segment').forEach((seg, index) => {
            seg.classList.toggle('active', index <= gameState.currentLevelIndex);
        });
    }

    function setupPlayer() {
        const selectedAvatar = document.querySelector('.avatar.selected');
        const playerName = document.getElementById('player-name').value.trim();

        if (!selectedAvatar || !playerName) {
            showNotification("الرجاء اختيار صورة رمزية وإدخال اسمك", "error");
            return;
        }

        gameState.player.name = playerName;
        gameState.player.avatar = selectedAvatar.src;
        showScreen('instructions');
    }

    function startGame() {
        gameState.gameActive = true;
        gameState.player.startTime = new Date();
        updateHud();
        loadQuestion();
        showScreen('question');
    }

    function loadQuestion() {
        if (!gameState.gameActive) return;

        applyLevelTheme();
        resetHelpButtons();

        const levelName = gameState.levels[gameState.currentLevelIndex];
        const questionData = questions[levelName][gameState.currentQuestionIndexInLevel];

        if (!questionData) {
            endQuiz("لقد أجبت على جميع الأسئلة المتاحة!");
            return;
        }
        
        document.getElementById('question-text').textContent = questionData.question;
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        questionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.onclick = () => checkAnswer(index);
            optionsContainer.appendChild(button);
        });

        startTimer();
    }
    
    function checkAnswer(selectedIndex) {
        if (!gameState.gameActive) return;
        clearInterval(gameState.timer);
        
        const levelName = gameState.levels[gameState.currentLevelIndex];
        const questionData = questions[levelName][gameState.currentQuestionIndexInLevel];
        const correctIndex = questionData.correct;
        const options = document.querySelectorAll('.option-btn');
        options.forEach(btn => btn.disabled = true);

        if (selectedIndex === correctIndex) {
            options[selectedIndex].classList.add('correct');
            gameState.player.points += 100;
            gameState.player.correctAnswers++;
            if(questionData.impossible) gameState.player.answeredImpossible = true;
            showNotification("إجابة صحيحة! +100 نقطة", "success");
        } else {
            options[selectedIndex].classList.add('wrong');
            options[correctIndex].classList.add('correct');
            gameState.player.points -= 100;
            gameState.player.errors++;
            gameState.player.wrongAnswers++;
            showNotification("إجابة خاطئة! -100 نقطة", "error");
        }

        updateHud();

        if (gameState.player.errors >= 3) {
            setTimeout(() => endQuiz("لقد استنفدت جميع محاولاتك!"), 1500);
        } else {
            setTimeout(nextQuestion, 1500);
        }
    }

    function nextQuestion() {
        gameState.currentQuestionIndexInLevel++;
        const levelName = gameState.levels[gameState.currentLevelIndex];
        
        // التحقق إذا انتهى المستوى الحالي
        if (gameState.currentQuestionIndexInLevel >= questions[levelName].length) {
            gameState.currentLevelIndex++;
            gameState.currentQuestionIndexInLevel = 0;
            
            // التحقق إذا انتهت جميع المستويات
            if (gameState.currentLevelIndex >= gameState.levels.length || !questions[gameState.levels[gameState.currentLevelIndex]]?.length) {
                endQuiz("تهانينا! لقد أكملت جميع المستويات!");
                return;
            }
            
            // إظهار نافذة إتمام المستوى
            const nextLevelName = gameState.levels[gameState.currentLevelIndex];
            document.getElementById('level-complete-text').textContent = `لقد أكملت المستوى بنجاح. هل أنت مستعد لتحدي المستوى التالي (${nextLevelName})؟`;
            showModal('levelComplete');
        } else {
            loadQuestion();
        }
    }
    
    function endQuiz(reason = "انتهت المسابقة") {
    // 1. التأكد من إيقاف كل العمليات النشطة
    gameState.gameActive = false;
    clearInterval(gameState.timer);
    hideModals();
    showNotification(reason, 'info');

    // 2. حساب وعرض البيانات الأساسية
    const endTime = new Date();
    const timeSpent = Math.round((endTime - gameState.player.startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60).toString().padStart(2, '0');
    const seconds = (timeSpent % 60).toString().padStart(2, '0');

    document.getElementById('result-name').textContent = gameState.player.name;
    document.getElementById('result-id').textContent = gameState.player.id;
    document.getElementById('result-correct').textContent = gameState.player.correctAnswers;
    document.getElementById('result-wrong').textContent = gameState.player.wrongAnswers;
    document.getElementById('result-skips').textContent = gameState.player.skips;
    document.getElementById('result-points').textContent = gameState.player.points;
    document.getElementById('result-time').textContent = `${minutes}:${seconds}`;
    
    // التحقق من أن مؤشر المستوى ضمن النطاق الصحيح
    const levelToShow = gameState.levels[gameState.currentLevelIndex] || "غير محدد";
    document.getElementById('result-level').textContent = levelToShow;

    // 3. حساب شريط الأداء مع معالجة الأخطاء
    const performanceFill = document.getElementById('performance-fill');
    const performanceText = document.getElementById('performance-text');
    const totalAnswers = gameState.player.correctAnswers + gameState.player.wrongAnswers;
    let performance = 0; // القيمة الافتراضية هي صفر

    // تجنب القسمة على صفر إذا لم يجب اللاعب على أي سؤال
    if (totalAnswers > 0) {
        // تم تبسيط المعادلة لتكون أكثر دقة
        performance = Math.max(0, (gameState.player.correctAnswers / totalAnswers) * 100);
    }
    
    performanceFill.style.width = `${performance}%`;

    if (performance >= 80) performanceText.textContent = 'ممتاز 🚀';
    else if (performance >= 60) performanceText.textContent = 'جيد جدًا 👍';
    else if (performance >= 40) performanceText.textContent = 'جيد 🙂';
    else performanceText.textContent = 'يمكنك فعل ما هو أفضل 💪';

    // 4. إرسال البيانات إلى Google Sheets
    submitToGoogleSheets(gameState);

    // 5. عرض شاشة النتائج
    showScreen('results');
}

    function updateHud() {
        hud.points.textContent = gameState.player.points;
        hud.errors.textContent = `${gameState.player.errors}/3`;
        hud.skips.textContent = gameState.player.skips;
        hud.avatar.src = gameState.player.avatar;
        hud.playerName.textContent = gameState.player.name;
        hud.playerId.textContent = gameState.player.id;
    }

    // --- المؤقت ---
    function startTimer() {
        clearInterval(gameState.timer);
        gameState.timeLeft = 15;
        const timerBar = document.getElementById('timer-bar');
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';

        setTimeout(() => {
            timerBar.style.transition = `width ${gameState.timeLeft}s linear`;
            timerBar.style.width = '0%';
        }, 100);

        gameState.timer = setInterval(() => {
            gameState.timeLeft--;
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timer);
                timeOut();
            }
        }, 1000);
    }

    function timeOut() {
        showNotification("انتهى الوقت!", "error");
        gameState.player.errors++;
        gameState.player.wrongAnswers++;
        gameState.player.points -= 100;
        updateHud();
        
        document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
        const levelName = gameState.levels[gameState.currentLevelIndex];
        const correctIndex = questions[levelName][gameState.currentQuestionIndexInLevel].correct;
        document.querySelectorAll('.option-btn')[correctIndex].classList.add('correct');
        
        if (gameState.player.errors >= 3) {
            setTimeout(() => endQuiz("لقد استنفدت جميع محاولاتك!"), 1500);
        } else {
            setTimeout(nextQuestion, 1500);
        }
    }

    // --- المساعدات ---
    function resetHelpButtons() {
        Object.values(helpButtons).forEach(btn => btn.classList.remove('disabled'));
        if (gameState.player.helpsUsed.fiftyFifty) helpButtons.fiftyFifty.classList.add('disabled');
        if (gameState.player.helpsUsed.freezeTime) helpButtons.freezeTime.classList.add('disabled');
        
        const skipCost = 100 + (gameState.player.skips * 50);
        document.getElementById('skip-cost').textContent = `${skipCost} نقطة`;
    }

    helpButtons.fiftyFifty.addEventListener('click', () => {
        if (helpButtons.fiftyFifty.classList.contains('disabled') || gameState.player.points < 100) {
            showNotification("لا يمكن استخدام المساعدة", "error"); return;
        }
        gameState.player.points -= 100;
        gameState.player.helpsUsed.fiftyFifty = true;
        updateHud();
        helpButtons.fiftyFifty.classList.add('disabled');

        const levelName = gameState.levels[gameState.currentLevelIndex];
        const correctIndex = questions[levelName][gameState.currentQuestionIndexInLevel].correct;
        const options = document.querySelectorAll('.option-btn');
        let removed = 0;
        while(removed < 2) {
            const randomIndex = Math.floor(Math.random() * options.length);
            if(randomIndex !== correctIndex && !options[randomIndex].style.visibility) {
                options[randomIndex].style.visibility = 'hidden';
                removed++;
            }
        }
    });
    
    // ... (أضف منطق تجميد الوقت وتخطي السؤال هنا بنفس الطريقة) ...
    
    // --- ربط الأحداث (Event Listeners) ---
    function init() {
        resetGameState();
        
        buttons.start.addEventListener('click', () => {
            document.getElementById('player-id').value = `PLYR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            gameState.player.id = document.getElementById('player-id').value;
            showScreen('playerSetup');
        });

        document.querySelectorAll('.avatar').forEach(avatar => {
            avatar.addEventListener('click', (e) => {
                document.querySelectorAll('.avatar').forEach(a => a.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        buttons.confirmPlayer.addEventListener('click', setupPlayer);
        buttons.startQuiz.addEventListener('click', startGame);
        buttons.playAgain.addEventListener('click', () => {
            resetGameState();
            showScreen('instructions');
        });
        
        buttons.toggleTheme.addEventListener('click', () => document.body.classList.toggle('dark-mode'));
        buttons.endQuiz.addEventListener('click', () => showModal('exit'));
        buttons.confirmExit.addEventListener('click', () => endQuiz("لقد اخترت إنهاء المسابقة."));
        buttons.closeModal.forEach(btn => btn.addEventListener('click', hideModals));
        
        buttons.nextLevel.addEventListener('click', () => {
            hideModals();
            loadQuestion();
        });
        buttons.withdraw.addEventListener('click', () => endQuiz("لقد اخترت الانسحاب."));
    }

    init();
});
