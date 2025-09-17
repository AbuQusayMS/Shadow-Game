document.addEventListener('DOMContentLoaded', () => {
    // --- بنك الأسئلة ---
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
        { question: "ما هو الغاز الذي يشكل معظم غلاف الأرض الجوي؟", options: ["الأكسجين", "ثاني أكسيد الكربون", "النيتروجين", "الأرجون"], answer: "النيتروجين" },
        { question: "كم عدد اللاعبين في فريق كرة القدم؟", options: ["9", "10", "11", "12"], answer: "11" },
        { question: "ما هي أسرع حيوان بري؟", options: ["الأسد", "الفهد", "الحصان", "الغزال"], answer: "الفهد" },
    ];

    const impossibleQuestion = {
        question: "ما هو الرقم التالي في هذه المتسلسلة: 1, 1, 2, 3, 5, 8, ...؟",
        options: ["11", "12", "13", "14"],
        answer: "13"
    };

    // --- متغيرات حالة اللعبة ---
    let currentQuestionIndex = 0;
    let score = 100;
    let skipCount = 0;
    let skipCost = 100;
    let timer;
    let timerValue = 80;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let gameStartTime;
    let impossibleQuestionUsed = false;
    let impossibleQuestionCorrect = false;

    let playerData = {
        name: "",
        avatar: ""
    };

    const helpersUsed = {
        fiftyFifty: false,
        freezeTime: false,
        changeQuestion: false
    };

    // --- عناصر DOM ---
    const screens = document.querySelectorAll('.screen');
    const startScreen = document.getElementById('startScreen');
    const avatarScreen = document.getElementById('avatarScreen');
    const nameEntryScreen = document.getElementById('nameEntry');
    const gameContainer = document.getElementById('gameContainer');
    const resultsScreen = document.getElementById('resultsScreen');
    const leaderboardScreen = document.getElementById('leaderboardScreen');

    // --- الأزرار ---
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

    // --- عناصر أخرى ---
    const avatarGrid = document.querySelector('.avatar-grid');
    const nameInput = document.getElementById('nameInput');
    const nameError = document.getElementById('nameError');
    const questionCounter = document.getElementById('questionCounter');
    const progressFill = document.querySelector('.progress-fill');
    const playerAvatar = document.getElementById('playerAvatar');
    const playerName = document.getElementById('playerName');
    const currentScoreSpan = document.getElementById('currentScore');
    const skipCountSpan = document.getElementById('skipCount');
    const skipCostSpan = document.getElementById('skipCost');
    const timerFill = document.querySelector('.timer-fill');
    const timerText = document.getElementById('timer');
    const questionText = document.getElementById('questionText');
    const optionsGrid = document.querySelector('.options-grid');
    const endConfirmModal = document.getElementById('endConfirmModal');
    const impossibleQuestionModal = document.getElementById('impossibleQuestionModal');
    
    // --- دالة التبديل بين الشاشات ---
    const showScreen = (screenToShow) => {
        screens.forEach(screen => screen.classList.remove('active'));
        screenToShow.classList.add('active');
    };

    // --- توليد الصور الرمزية ---
    const generateAvatars = () => {
        for (let i = 1; i <= 12; i++) {
            const avatarImg = document.createElement('img');
            avatarImg.src = `https://i.pravatar.cc/150?img=${i}`;
            avatarImg.alt = `صورة رمزية ${i}`;
            avatarImg.classList.add('avatar');
            avatarImg.dataset.avatarSrc = avatarImg.src;
            avatarGrid.appendChild(avatarImg);
        }
    };

    avatarGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('avatar')) {
            document.querySelectorAll('.avatar').forEach(a => a.classList.remove('selected'));
            e.target.classList.add('selected');
            playerData.avatar = e.target.dataset.avatarSrc;
            confirmAvatarBtn.disabled = false;
        }
    });

    // --- إعدادات اللعبة الأولية ---
    const init = () => {
        generateAvatars();
        loadLeaderboard();
        checkTheme();
        showScreen(startScreen);
    };

    // --- بدء اللعبة ---
    const startGame = () => {
        resetGameState();
        gameStartTime = new Date();
        loadQuestion();
        showScreen(gameContainer);
    };
    
    const resetGameState = () => {
        currentQuestionIndex = 0;
        score = 100;
        skipCount = 0;
        skipCost = 100;
        correctAnswers = 0;
        wrongAnswers = 0;
        impossibleQuestionUsed = false;
        impossibleQuestionCorrect = false;
        Object.keys(helpersUsed).forEach(key => helpersUsed[key] = false);
        
        // إعادة تفعيل الأزرار
        document.querySelectorAll('.helper-btn').forEach(btn => btn.disabled = false);

        updateGameUI();
    };
    
    // --- تحميل السؤال ---
    const loadQuestion = (questionObj = questions[currentQuestionIndex]) => {
        if (!questionObj) {
            endGame();
            return;
        }

        clearInterval(timer);
        timerValue = 80;
        startTimer();

        questionText.textContent = questionObj.question;
        optionsGrid.innerHTML = '';
        questionObj.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-btn');
            button.textContent = option;
            button.addEventListener('click', () => selectAnswer(button, questionObj));
            optionsGrid.appendChild(button);
        });

        updateGameUI();
    };
    
    // --- اختيار الإجابة ---
    const selectAnswer = (selectedButton, question) => {
        clearInterval(timer);
        const isCorrect = selectedButton.textContent === question.answer;
        document.querySelectorAll('.option-btn').forEach(btn => btn.classList.add('disabled'));

        if (isCorrect) {
            selectedButton.classList.add('correct');
            score += 100;
            correctAnswers++;
            showToast('إجابة صحيحة! +100 نقطة', 'success');
        } else {
            selectedButton.classList.add('wrong');
            wrongAnswers++;
            showToast('إجابة خاطئة!', 'error');
            // إظهار الإجابة الصحيحة
            document.querySelectorAll('.option-btn').forEach(btn => {
                if (btn.textContent === question.answer) {
                    btn.classList.add('correct');
                }
            });
        }

        setTimeout(() => {
            currentQuestionIndex++;
            if(question !== impossibleQuestion) loadQuestion();
            else endGame(); // End game immediately after impossible question
        }, 2000);
    };

    // --- المؤقت ---
    const startTimer = () => {
        timer = setInterval(() => {
            timerValue--;
            timerText.textContent = timerValue;
            timerFill.style.width = `${(timerValue / 80) * 100}%`;

            if (timerValue <= 0) {
                clearInterval(timer);
                wrongAnswers++;
                showToast('انتهى الوقت!', 'error');
                setTimeout(() => {
                    currentQuestionIndex++;
                    loadQuestion();
                }, 2000);
            }
        }, 1000);
    };

    // --- تحديث واجهة اللعبة ---
    const updateGameUI = () => {
        questionCounter.textContent = `السؤال ${currentQuestionIndex + 1} من ${questions.length}`;
        progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
        playerAvatar.src = playerData.avatar;
        playerName.textContent = playerData.name;
        currentScoreSpan.textContent = score;
        skipCountSpan.textContent = skipCount;
        skipCostSpan.textContent = skipCost;
    };
    
    // --- إنهاء اللعبة ---
    const endGame = () => {
        clearInterval(timer);
        calculateResults();
        saveScore();
        loadLeaderboard();
        showScreen(resultsScreen);
    };

    // --- حساب وعرض النتائج ---
    const calculateResults = () => {
        const gameEndTime = new Date();
        const duration = Math.floor((gameEndTime - gameStartTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;

        document.getElementById('resultName').textContent = playerData.name;
        document.getElementById('resultCorrect').textContent = correctAnswers;
        document.getElementById('resultWrong').textContent = wrongAnswers;
        document.getElementById('resultSkips').textContent = skipCount;
        document.getElementById('resultScore').textContent = score;
        document.getElementById('resultTime').textContent = `${minutes} دقائق و ${seconds} ثواني`;
        
        let impossibleStatus = "لم يُستخدم";
        if(impossibleQuestionUsed){
            impossibleStatus = impossibleQuestionCorrect ? "صحيحة (+500)" : "خاطئة";
        }
        document.getElementById('resultImpossible').textContent = impossibleStatus;
        
        // تحديث شريط الأداء
        const performancePercentage = Math.round((correctAnswers / questions.length) * 100);
        const performanceFill = document.getElementById('performanceFill');
        const performanceLabel = document.getElementById('performanceLabel');
        
        performanceFill.style.width = `${performancePercentage}%`;
        if (performancePercentage >= 80) {
            performanceLabel.textContent = "ممتاز";
        } else if (performancePercentage >= 50) {
            performanceLabel.textContent = "جيد";
        } else {
            performanceLabel.textContent = "بحاجة للتحسين";
        }
    };

    // --- أدوات المساعدة ---
    document.querySelector('.helpers-container').addEventListener('click', (e) => {
        const helperBtn = e.target.closest('.helper-btn');
        if (!helperBtn || helperBtn.disabled) return;
        
        const type = helperBtn.dataset.type;
        const cost = 100;

        if (score < cost) {
            showToast('ليس لديك نقاط كافية!', 'error');
            return;
        }

        score -= cost;
        updateGameUI();
        showToast(`تم استخدام المساعدة! -${cost} نقطة`, 'info');

        switch (type) {
            case 'fiftyFifty':
                applyFiftyFifty();
                break;
            case 'freezeTime':
                clearInterval(timer);
                break;
            case 'changeQuestion':
                currentQuestionIndex++;
                loadQuestion();
                break;
            case 'skipQuestion':
                applySkip();
                break;
        }
        helperBtn.disabled = true; // Use only once per game
    });

    const applyFiftyFifty = () => {
        const currentAnswer = questions[currentQuestionIndex].answer;
        const optionButtons = Array.from(document.querySelectorAll('.option-btn'));
        const wrongOptions = optionButtons.filter(btn => btn.textContent !== currentAnswer);
        
        // Hide two wrong options
        wrongOptions.slice(0, 2).forEach(btn => btn.style.visibility = 'hidden');
    };

    const applySkip = () => {
        if (score < skipCost) {
            showToast('نقاطك لا تكفي للتخطي!', 'error');
            return;
        }
        score -= skipCost;
        skipCount++;
        skipCost += 50; // Increase cost for next skip
        
        currentQuestionIndex++;
        loadQuestion();
    };

    // --- الوضع المظلم/الفاتح ---
    const toggleTheme = () => {
        const currentTheme = document.body.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = newTheme;
        themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('quizTheme', newTheme);
    };

    const checkTheme = () => {
        const savedTheme = localStorage.getItem('quizTheme') || 'dark';
        document.body.dataset.theme = savedTheme;
        themeToggleBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    };

    // --- إشعارات Toast ---
    const showToast = (message, type = 'info') => {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

    // --- لوحة الصدارة ---
    const saveScore = () => {
        const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
        const newEntry = {
            name: playerData.name,
            score: score,
            impossible: impossibleQuestionUsed ? (impossibleQuestionCorrect ? 'نعم (صحيحة)' : 'نعم (خاطئة)') : 'لا'
        };
        leaderboard.push(newEntry);
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard.slice(0, 10))); // Save top 10
    };

    const loadLeaderboard = () => {
        const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
        const leaderboardBody = document.getElementById('leaderboardBody');
        leaderboardBody.innerHTML = '';

        if (leaderboard.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4">لا توجد بيانات لعرضها.</td></tr>';
            return;
        }
        
        leaderboard.forEach((entry, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score}</td>
                    <td>${entry.impossible}</td>
                </tr>
            `;
            leaderboardBody.innerHTML += row;
        });
    };

    // --- ربط الأحداث ---
    startPlayBtn.addEventListener('click', () => showScreen(avatarScreen));
    showLeaderboardBtn.addEventListener('click', () => {
        loadLeaderboard();
        showScreen(leaderboardScreen);
    });

    confirmAvatarBtn.addEventListener('click', () => showScreen(nameEntryScreen));
    
    confirmNameBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name.length < 3) {
            nameError.textContent = 'الاسم يجب أن يكون 3 أحرف على الأقل.';
        } else {
            nameError.textContent = '';
            playerData.name = name;
            startGame();
        }
    });

    themeToggleBtn.addEventListener('click', toggleTheme);

    endGameBtn.addEventListener('click', () => endConfirmModal.classList.add('active'));
    cancelEndBtn.addEventListener('click', () => endConfirmModal.classList.remove('active'));
    confirmEndBtn.addEventListener('click', () => {
        endConfirmModal.classList.remove('active');
        endGame();
    });

    impossibleQuestionBtn.addEventListener('click', () => {
        if (!impossibleQuestionUsed) {
            impossibleQuestionModal.classList.add('active');
        } else {
            showToast('لقد استخدمت السؤال المستحيل بالفعل!', 'info');
        }
    });

    viewResultsBtn.addEventListener('click', () => {
        impossibleQuestionModal.classList.remove('active');
        endGame();
    });

    acceptChallengeBtn.addEventListener('click', () => {
        impossibleQuestionModal.classList.remove('active');
        impossibleQuestionUsed = true;
        
        // إخفاء أدوات المساعدة
        document.querySelector('.helpers-container').style.display = 'none';

        loadQuestion(impossibleQuestion);
        
        // تعديل المؤقت للسؤال المستحيل
        clearInterval(timer);
        timerValue = 20; // وقت أقصر
        startTimer();

        // منطق التعامل مع الإجابة للسؤال المستحيل
        const checkImpossibleAnswer = (btn) => {
            const isCorrect = btn.textContent === impossibleQuestion.answer;
            if (isCorrect) {
                score += 500;
                impossibleQuestionCorrect = true;
                showToast('إجابة مستحيلة صحيحة! +500 نقطة', 'success');
            } else {
                 showToast('إجابة خاطئة!', 'error');
            }
            selectAnswer(btn, impossibleQuestion); // Use existing answer logic
        };
        
        // استبدال مستمعي الأحداث
        optionsGrid.querySelectorAll('.option-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => checkImpossibleAnswer(newBtn));
        });
    });

    playAgainBtn.addEventListener('click', () => {
        showScreen(nameEntryScreen); // Go back to name entry to re-confirm player
    });
    
    backToHomeBtn.addEventListener('click', () => showScreen(startScreen));
    backToStartBtn.addEventListener('click', () => showScreen(startScreen));

    // --- بدء التطبيق ---
    init();
});
