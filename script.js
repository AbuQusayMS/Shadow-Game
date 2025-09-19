document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const CONFIG = {
        totalQuestions: 16,
        timePerQuestion: 20, // seconds
        pointsCorrect: 100,
        pointsIncorrect: 100,
        initialScore: 100,
        maxErrors: 3,
        helpCost5050: 100,
        helpCostFreeze: 100,
        initialSkipCost: 100,
        skipCostIncrement: 50,
        freezeTimeDuration: 10, // seconds
        googleAppScriptUrl: 'https://script.google.com/macros/s/AKfycbw68QqjhU0eqOszPpLBm0tXPtjaSV000kBfOWiorLk2lFm45ud3do-f5PMCy9b0LSez/exec'
    };

    // --- Sample Questions ---
    const QUESTIONS = [
        // المستوى السهل (1-5)
        { level: 'easy', question: 'ما هي عاصمة المملكة العربية السعودية؟', options: ['جدة', 'الرياض', 'الدمام', 'مكة'], answer: 'الرياض' },
        { level: 'easy', question: 'كم عدد ألوان قوس قزح؟', options: ['5', '6', '7', '8'], answer: '7' },
        { level: 'easy', question: 'ما هو أكبر كوكب في نظامنا الشمسي؟', options: ['الأرض', 'المريخ', 'المشتري', 'زحل'], answer: 'المشتري' },
        { level: 'easy', question: 'ما هو الحيوان الذي يُعرف بـ "سفينة الصحراء"؟', options: ['الحصان', 'الجمل', 'الفيل', 'الزرافة'], answer: 'الجمل' },
        { level: 'easy', question: 'ما هو أطول نهر في العالم؟', options: ['نهر الأمازون', 'نهر النيل', 'نهر اليانغتسي', 'نهر المسيسيبي'], answer: 'نهر النيل' },
        // المستوى المتوسط (6-10)
        { level: 'medium', question: 'من هو مؤلف رواية "1984"؟', options: ['جورج أورويل', 'ألدوس هكسلي', 'راي برادبري', 'جي. ك. رولينغ'], answer: 'جورج أورويل' },
        { level: 'medium', question: 'في أي عام انتهت الحرب العالمية الثانية؟', options: ['1943', '1945', '1950', '1939'], answer: '1945' },
        { level: 'medium', question: 'ما هو العنصر الكيميائي الذي رمزه "Au"؟', options: ['الفضة', 'النحاس', 'الذهب', 'الألومنيوم'], answer: 'الذهب' },
        { level: 'medium', question: 'كم عدد قارات العالم؟', options: ['5', '6', '7', '8'], answer: '7' },
        { level: 'medium', question: 'من رسم لوحة الموناليزا؟', options: ['فينسنت فان جوخ', 'بابلو بيكاسو', 'ليوناردو دافنشي', 'مايكل أنجلو'], answer: 'ليوناردو دافنشي' },
        // المستوى الصعب (11-15)
        { level: 'hard', question: 'ما هي سرعة الضوء في الفراغ (تقريبًا)؟', options: ['300,000 كم/ث', '150,000 كم/ث', '500,000 كم/ث', '1,000,000 كم/ث'], answer: '300,000 كم/ث' },
        { level: 'hard', question: 'ما هو أعمق محيط في العالم؟', options: ['المحيط الأطلسي', 'المحيط الهندي', 'المحيط الهادئ', 'المحيط المتجمد الشمالي'], answer: 'المحيط الهادئ' },
        { level: 'hard', question: 'ما هو الاسم العلمي للإنسان؟', options: ['Homo Erectus', 'Homo Habilis', 'Homo Sapiens', 'Neanderthal'], answer: 'Homo Sapiens' },
        { level: 'hard', question: 'ما هي الدولة التي لديها أكبر عدد من الجزر؟', options: ['إندونيسيا', 'الفلبين', 'اليابان', 'السويد'], answer: 'السويد' },
        { level: 'hard', question: 'كم عدد العظام في جسم الإنسان البالغ؟', options: ['206', '212', '300', '198'], answer: '206' },
        // المستوى المستحيل (16)
        { level: 'impossible', question: 'ما هو الرقم الذي يأتي بعد 3.1415926535...؟', options: ['8', '9', '7', 'لا يمكن معرفته'], answer: '9' }
    ];

    // --- STATE MANAGEMENT ---
    let state = {};

    function resetState() {
        state = {
            playerName: '',
            playerAvatar: '',
            playerId: '',
            currentQuestionIndex: 0,
            score: CONFIG.initialScore,
            errors: 0,
            skips: 0,
            startTime: null,
            endTime: null,
            correctAnswers: 0,
            wrongAnswers: 0,
            isFrozen: false,
            used5050: false,
            usedFreeze: false,
            currentTimer: null,
            currentSkipCost: CONFIG.initialSkipCost,
            answeredImpossible: false,
        };
    }
    
    // --- DOM ELEMENTS ---
    const screens = {
        splash: document.getElementById('splash-screen'),
        player: document.getElementById('player-screen'),
        instructions: document.getElementById('instructions-screen'),
        question: document.getElementById('question-screen'),
        results: document.getElementById('results-screen'),
        leaderboard: document.getElementById('leaderboard-screen'),
        exitConfirm: document.getElementById('exit-confirm-screen'),
    };

    const elements = {
        // Player Screen
        avatarOptions: document.getElementById('avatar-options'),
        playerNameInput: document.getElementById('player-name'),
        startSetupBtn: document.getElementById('start-setup-btn'),
        
        // Instructions Screen
        startGameBtn: document.getElementById('start-game-btn'),

        // Question Screen
        progressBar: document.getElementById('progress-bar'),
        levelIndicator: document.getElementById('level-indicator'),
        timerBar: document.getElementById('timer-bar'),
        errorCounter: document.getElementById('error-counter'),
        playerAvatarGame: document.getElementById('player-avatar-game'),
        playerNameGame: document.getElementById('player-name-game'),
        playerIdGame: document.getElementById('player-id-game'),
        playerScore: document.getElementById('player-score'),
        questionText: document.getElementById('question-text'),
        answerOptions: document.getElementById('answer-options'),
        exitQuizBtn: document.getElementById('exit-quiz-btn'),
        themeToggle: document.getElementById('theme-toggle'),

        // Helps
        help5050: document.getElementById('help-5050'),
        helpFreeze: document.getElementById('help-freeze'),
        helpSkip: document.getElementById('help-skip'),
        skipCost: document.getElementById('skip-cost'),

        // Results Screen
        resultName: document.getElementById('result-name'),
        resultId: document.getElementById('result-id'),
        resultLevel: document.getElementById('result-level'),
        resultScore: document.getElementById('result-score'),
        resultCorrect: document.getElementById('result-correct'),
        resultWrong: document.getElementById('result-wrong'),
        resultSkips: document.getElementById('result-skips'),
        resultTime: document.getElementById('result-time'),
        performanceBar: document.getElementById('performance-bar'),
        performanceText: document.getElementById('performance-text'),
        playAgainBtn: document.getElementById('play-again-btn'),
        leaderboardBtn: document.getElementById('leaderboard-btn'),
        leaderboardBtnFromPlayer: document.getElementById('leaderboard-btn-from-player'),

        // Leaderboard Screen
        leaderboardLoading: document.getElementById('leaderboard-loading'),
        leaderboardTable: document.getElementById('leaderboard-table'),
        leaderboardBody: document.getElementById('leaderboard-body'),
        backToStartBtn: document.getElementById('back-to-start-btn'),

        // Modals & Notifications
        confirmExitBtn: document.getElementById('confirm-exit-btn'),
        cancelExitBtn: document.getElementById('cancel-exit-btn'),
        notificationToast: document.getElementById('notification-toast'),
        notificationText: document.getElementById('notification-text'),
    };

    // --- FUNCTIONS ---

    // Screen Navigation
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.add('hidden'));
        if (screens[screenName]) {
            screens[screenName].classList.remove('hidden');
        }
    }

    // Show Notification
    function showNotification(message, isError = false) {
        elements.notificationText.textContent = message;
        elements.notificationToast.classList.remove('bg-gray-900', 'bg-red-600');
        elements.notificationToast.classList.add(isError ? 'bg-red-600' : 'bg-gray-900');
        elements.notificationToast.classList.remove('opacity-0', 'translate-y-10');
        setTimeout(() => {
            elements.notificationToast.classList.add('opacity-0', 'translate-y-10');
        }, 3000);
    }

    // Initialize Player Setup Screen
    function initPlayerScreen() {
        const avatarCount = 8;
        elements.avatarOptions.innerHTML = '';
        for (let i = 0; i < avatarCount; i++) {
            const img = document.createElement('img');
            img.src = `https://avatar.iran.liara.run/public/${i}`;
            img.classList.add('avatar-option');
            img.dataset.avatarUrl = img.src;
            img.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
                img.classList.add('selected');
                state.playerAvatar = img.dataset.avatarUrl;
            });
            elements.avatarOptions.appendChild(img);
        }
    }

    // Start Setup
    function startSetup() {
        const playerName = elements.playerNameInput.value.trim();
        if (!playerName) {
            alert('الرجاء إدخال اسمك.');
            return;
        }
        if (!state.playerAvatar) {
            alert('الرجاء اختيار صورة رمزية.');
            return;
        }
        state.playerName = playerName;
        state.playerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Log player to Google Sheets
        sendDataToSheet({
            action: 'registerPlayer',
            id: state.playerId,
            name: state.playerName,
            startTime: new Date().toLocaleString()
        });
        
        showScreen('instructions');
    }

    // Start Game
    function startGame() {
        resetStateAfterSetup();
        state.startTime = new Date();
        updateUI();
        loadQuestion();
        showScreen('question');
    }
    
    function resetStateAfterSetup(){
        const preservedState = {
            playerName: state.playerName,
            playerAvatar: state.playerAvatar,
            playerId: state.playerId
        };
        resetState();
        Object.assign(state, preservedState);
    }

    // Load a question
    function loadQuestion() {
        if (state.currentQuestionIndex >= CONFIG.totalQuestions || state.errors >= CONFIG.maxErrors) {
            endGame();
            return;
        }

        clearTimeout(state.currentTimer);
        const questionData = QUESTIONS[state.currentQuestionIndex];
        
        // Update Level Notification
        if(state.currentQuestionIndex === 5 || state.currentQuestionIndex === 10 || state.currentQuestionIndex === 15) {
            const level = getLevelInfo(state.currentQuestionIndex + 1).name;
            showNotification(`لقد وصلت إلى المستوى ${level}! 🔥`);
        }

        elements.questionText.textContent = `(${state.currentQuestionIndex + 1}/${CONFIG.totalQuestions}) ${questionData.question}`;
        elements.answerOptions.innerHTML = '';

        questionData.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('answer-btn');
            button.dataset.answer = option;
            button.addEventListener('click', () => selectAnswer(button, questionData.answer));
            elements.answerOptions.appendChild(button);
        });

        resetHelps();
        updateUI();
        startTimer();
    }
    
    function resetHelps() {
        elements.help5050.disabled = state.used5050 || state.score < CONFIG.helpCost5050;
        elements.helpFreeze.disabled = state.usedFreeze || state.score < CONFIG.helpCostFreeze;
        elements.helpSkip.disabled = state.score < state.currentSkipCost;
    }

    // Start Timer
    function startTimer() {
        let timeLeft = CONFIG.timePerQuestion;
        elements.timerBar.style.transition = 'none';
        elements.timerBar.style.width = '100%';

        setTimeout(() => {
            elements.timerBar.style.transition = `width ${timeLeft}s linear`;
            elements.timerBar.style.width = '0%';
        }, 100);

        state.currentTimer = setTimeout(() => {
            if (!state.isFrozen) {
                handleAnswer(false);
            }
        }, timeLeft * 1000);
    }
    
    // Select an answer
    function selectAnswer(button, correctAnswer) {
        clearTimeout(state.currentTimer);
        document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = true);
        
        button.classList.add('selected');
        const isCorrect = button.dataset.answer === correctAnswer;

        setTimeout(() => {
            handleAnswer(isCorrect, correctAnswer);
        }, 1000);
    }
    
    // Handle Answer
    function handleAnswer(isCorrect, correctAnswer) {
        if (isCorrect) {
            state.score += CONFIG.pointsCorrect;
            state.correctAnswers++;
            showNotification('إجابة صحيحة! ✅');
            if (QUESTIONS[state.currentQuestionIndex].level === 'impossible') {
                state.answeredImpossible = true;
            }
        } else {
            state.score -= CONFIG.pointsIncorrect;
            state.errors++;
            state.wrongAnswers++;
            showNotification('إجابة خاطئة! ❌', true);
        }

        // Highlight correct/wrong answers
        document.querySelectorAll('.answer-btn').forEach(btn => {
            if(btn.dataset.answer === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.classList.contains('selected')) {
                btn.classList.add('wrong');
            }
        });

        setTimeout(() => {
            state.currentQuestionIndex++;
            loadQuestion();
        }, 2000);
    }
    
    // --- HELP FUNCTIONS ---
    function use5050() {
        if (state.score < CONFIG.helpCost5050 || state.used5050) return;
        state.score -= CONFIG.helpCost5050;
        state.used5050 = true;
        
        const correctAnswer = QUESTIONS[state.currentQuestionIndex].answer;
        const wrongOptions = QUESTIONS[state.currentQuestionIndex].options.filter(opt => opt !== correctAnswer);
        const optionToKeep = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            if (btn.dataset.answer !== correctAnswer && btn.dataset.answer !== optionToKeep) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }
        });
        showNotification('تم حذف إجابتين!');
        updateUI();
    }
    
    function useFreeze() {
        if (state.score < CONFIG.helpCostFreeze || state.usedFreeze) return;
        state.score -= CONFIG.helpCostFreeze;
        state.usedFreeze = true;
        state.isFrozen = true;
        
        clearTimeout(state.currentTimer);
        const currentWidth = elements.timerBar.offsetWidth / elements.timerBar.parentElement.offsetWidth * 100;
        elements.timerBar.style.width = `${currentWidth}%`;
        elements.timerBar.style.transition = 'none';

        showNotification(`تم تجميد الوقت لـ ${CONFIG.freezeTimeDuration} ثوانٍ!`);
        setTimeout(() => {
            state.isFrozen = false;
            startTimer();
        }, CONFIG.freezeTimeDuration * 1000);
        updateUI();
    }
    
    function useSkip() {
        if (state.score < state.currentSkipCost) {
            showNotification('النقاط غير كافية!', true);
            return;
        };
        state.score -= state.currentSkipCost;
        state.currentSkipCost += CONFIG.skipCostIncrement;
        state.skips++;
        clearTimeout(state.currentTimer);
        showNotification('تم تخطي السؤال!');
        state.currentQuestionIndex++;
        loadQuestion();
    }

    // End Game
    function endGame() {
        clearTimeout(state.currentTimer);
        state.endTime = new Date();
        showResults();
        showScreen('results');
        
        sendDataToSheet({
            action: 'saveResult',
            id: state.playerId,
            name: state.playerName,
            score: state.score,
            level: getLevelInfo(state.currentQuestionIndex).name,
            duration: Math.floor((state.endTime - state.startTime) / 1000),
            status: state.answeredImpossible ? 'فاز (المستحيل)' : 'اكمل',
            correct: state.correctAnswers,
            wrong: state.wrongAnswers,
            skips: state.skips,
            answeredImpossible: state.answeredImpossible,
        });
    }

    // Show Results Screen
    function showResults() {
        const duration = Math.floor((state.endTime - state.startTime) / 1000);
        const levelInfo = getLevelInfo(state.currentQuestionIndex);
        
        elements.resultName.textContent = state.playerName;
        elements.resultId.textContent = state.playerId;
        elements.resultLevel.textContent = levelInfo.name;
        elements.resultScore.textContent = `${state.score} 💰`;
        elements.resultCorrect.textContent = state.correctAnswers;
        elements.resultWrong.textContent = state.wrongAnswers;
        elements.resultSkips.textContent = state.skips;
        elements.resultTime.textContent = `${duration} ثانية`;
        
        // Performance Bar
        const performancePercentage = Math.max(0, Math.min(100, (state.correctAnswers / CONFIG.totalQuestions) * 100));
        elements.performanceBar.style.width = `${performancePercentage}%`;
        let perfText = 'سيئ جداً';
        let perfClass = 'bg-red-600';
        if (performancePercentage > 25) { perfText = 'سيئ'; perfClass = 'bg-red-500'; }
        if (performancePercentage > 50) { perfText = 'جيد'; perfClass = 'bg-yellow-500'; }
        if (performancePercentage > 75) { perfText = 'جيد جداً'; perfClass = 'bg-blue-500'; }
        if (performancePercentage > 90) { perfText = 'ممتاز'; perfClass = 'bg-green-500'; }
        elements.performanceText.textContent = perfText;
        elements.performanceBar.className = `h-6 rounded-full text-center text-white font-bold ${perfClass}`;
        
        // Share links
        const shareText = `حققت ${state.score} نقطة في مسابقة المعلومات ووصلت للمستوى ${levelInfo.name}! هل يمكنك هزيمتي؟`;
        document.getElementById('share-x').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    }

    // Fetch and show Leaderboard
    async function showLeaderboard() {
        showScreen('leaderboard');
        elements.leaderboardLoading.classList.remove('hidden');
        elements.leaderboardTable.classList.add('hidden');
        
        try {
            const data = await sendDataToSheet({ action: 'getLeaderboard' });
            if (data && data.leaderboard) {
                elements.leaderboardBody.innerHTML = '';
                data.leaderboard.forEach((player, index) => {
                    const row = document.createElement('tr');
                    const rank = getRankIcon(index);
                    const impossibleBadge = player.answeredImpossible ? '🎖️' : '';
                    row.innerHTML = `
                        <td class="p-2">${rank}</td>
                        <td class="p-2">${player.name} ${impossibleBadge}</td>
                        <td class="p-2 font-bold">${player.score}</td>
                    `;
                    elements.leaderboardBody.appendChild(row);
                });
            }
        } catch(error) {
            console.error('Failed to load leaderboard', error);
            elements.leaderboardBody.innerHTML = '<tr><td colspan="3">فشل تحميل لوحة الصدارة.</td></tr>';
        } finally {
            elements.leaderboardLoading.classList.add('hidden');
            elements.leaderboardTable.classList.remove('hidden');
        }
    }
    
    function getRankIcon(index) {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return index + 1;
    }

    // Update UI Elements during the game
    function updateUI() {
        elements.playerScore.textContent = `💰 ${state.score}`;
        elements.playerAvatarGame.src = state.playerAvatar;
        elements.playerNameGame.textContent = state.playerName;
        elements.playerIdGame.textContent = state.playerId;
        elements.errorCounter.textContent = `❌ ${state.errors}/${CONFIG.maxErrors}`;
        
        const progressPercentage = (state.currentQuestionIndex / CONFIG.totalQuestions) * 100;
        elements.progressBar.style.width = `${progressPercentage}%`;
        
        const levelInfo = getLevelInfo(state.currentQuestionIndex + 1);
        elements.levelIndicator.textContent = `المستوى: ${levelInfo.name} ${levelInfo.icon}`;
        elements.levelIndicator.className = `text-center font-bold mb-4 ${levelInfo.colorClass}`;
        elements.progressBar.className = `h-4 rounded-full text-center text-white text-xs ${levelInfo.progressClass}`;
        
        elements.skipCost.textContent = `(-${state.currentSkipCost})`;
        resetHelps();
    }
    
    // Get level info
    function getLevelInfo(questionNumber) {
        if (questionNumber <= 5) return { name: 'سهل', icon: '🍀', colorClass: 'level-easy', progressClass: 'progress-bar-easy' };
        if (questionNumber <= 10) return { name: 'متوسط', icon: '🔵', colorClass: 'level-medium', progressClass: 'progress-bar-medium' };
        if (questionNumber <= 15) return { name: 'صعب', icon: '🟠', colorClass: 'level-hard', progressClass: 'progress-bar-hard' };
        return { name: 'المستحيل', icon: '🔴', colorClass: 'level-impossible', progressClass: 'progress-bar-impossible' };
    }
    
    // Theme Toggler
    function toggleTheme() {
        const html = document.documentElement;
        html.classList.toggle('dark');
        if (html.classList.contains('dark')) {
            elements.themeToggle.textContent = '🌙';
        } else {
            elements.themeToggle.textContent = '🌞';
        }
    }
    
    // Send data to Google Sheets
    async function sendDataToSheet(payload) {
        try {
            const response = await fetch(CONFIG.googleAppScriptUrl, {
                method: 'POST',
                mode: 'no-cors', // Important for this type of deployment
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            // Due to 'no-cors' mode, we can't read the response directly.
            // For getting data (like leaderboard), a different setup (GET with JSONP or a proper API) is needed.
            // A common workaround is to have the Apps Script return a redirect, but for this case, let's assume it works for posting.
            // For GETting the leaderboard, we must use a workaround. Let's make another request.
             if (payload.action === 'getLeaderboard') {
                 // The 'no-cors' POST is just a trigger. The real GET is separate.
                 const getResponse = await fetch(CONFIG.googleAppScriptUrl + '?action=getLeaderboard');
                 const data = await getResponse.json();
                 return data;
             }
            
        } catch (error) {
            console.error('Error communicating with Google Sheets:', error);
            showNotification('حدث خطأ في الاتصال بالخادم.', true);
        }
    }


    // --- EVENT LISTENERS ---
    elements.startSetupBtn.addEventListener('click', startSetup);
    elements.startGameBtn.addEventListener('click', startGame);
    elements.playAgainBtn.addEventListener('click', () => {
        resetStateAfterSetup();
        showScreen('instructions');
    });
    elements.leaderboardBtn.addEventListener('click', showLeaderboard);
    elements.leaderboardBtnFromPlayer.addEventListener('click', showLeaderboard);
    elements.backToStartBtn.addEventListener('click', () => showScreen('player'));
    
    elements.exitQuizBtn.addEventListener('click', () => screens.exitConfirm.classList.remove('hidden'));
    elements.cancelExitBtn.addEventListener('click', () => screens.exitConfirm.classList.add('hidden'));
    elements.confirmExitBtn.addEventListener('click', () => {
        screens.exitConfirm.classList.add('hidden');
        endGame();
    });

    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.help5050.addEventListener('click', use5050);
    elements.helpFreeze.addEventListener('click', useFreeze);
    elements.helpSkip.addEventListener('click', useSkip);

    // --- INITIALIZATION ---
    function init() {
        resetState();
        setTimeout(() => {
            showScreen('player');
            initPlayerScreen();
        }, 2000); // Splash screen duration
    }

    init();
});
