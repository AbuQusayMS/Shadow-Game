class QuizGame {
    constructor() {
        this.API_URL = "https://script.google.com/macros/s/AKfycbxswUSDuszaAyDlNBCi3ugsu11NQW6g0vu1BQI0XM58xbTk8G5eE5gV8PNSbSshCmkBDw/exec";
        this.QUESTION_TIME = 60;
        this.TOTAL_AVATARS = 16;
        this.STARTING_POINTS = 100;
        this.QUESTION_POINTS = 100;
        this.WRONG_ANSWER_PENALTY = 100;

        // إعدادات مساعدة السؤال التالي
        this.NEXT_QUESTION_BASE_COST = 100;
        this.NEXT_QUESTION_COST_INCREMENT = 50;

        // الأسئلة - يمكن تعديل العدد بسهولة
        this.QUESTIONS = [
            { q: "ماذا قال آرثر عن ليليا (صديقة إيلي) عندما سأله جارود ريدنر عنها في الحفلة؟", options: ["إنها جميلة جدًا ولكنها ليست من نوعه", "إنها فتاة جيدة، وآمل أن تعاملها بشكل جيد", "إنها تذكره بطفولته", "إنه لا يعرفها جيداً"], correct: 1 },
            { q: "ما هي الصفة التي وصف بها آرثر صديقه إيلايجا؟", options: ["شخص عاطفي ولكنه يملك مبادئ وجديراً بالثقة", "شخص بارد ومنغلق على نفسه", "شخص عاطفي وضعيف وهش من الداخل", "شخص قاسي وعديم الخبرة"], correct: 0 },
            { q: "ما هي المشكلة التي يواجهها إيلايجا في استخدام قواه؟", options: ["لا يستطيع السيطرة على عنصر الأرض", "لا يستطيع السيطرة على كمية المانا في قواه", "يفتقر إلى المهارة في القتال القريب", "لا يمكنه تعلم أي عنصر آخر غير الأرض"], correct: 1 },
            { q: "من هي الشخصية التي أظهرت قدرتها على التلاعب بالمعادن أثناء قتال الدودة العملاقة؟", options: ["آرثر", "لوكاس", "إيلايجا", "كريول"], correct: 2 },
            { q: "ما هو العنصر الذي تتخصص به ياسمين، رفيقة آرثر في المغامرة؟", options: ["النار", "الماء", "الأرض", "الرياح"], correct: 3 },
            { q: "ما هي الصفة التي لاحظتها والدة إيلي على آرثر عندما كان يكذب؟", options: ["يصبح صوته حادًا ويركز نظره في مكان واحد", "يبتسم كثيرًا ويحرك يديه بسرعة", "يفرك أنفه ويتلعثم في الكلام", "يميل إلى تجنب التواصل البصري"], correct: 0 },
            { q: "ما هي المرحلة التي وصل إليها رينولدز ليوين في نواة المانا بعد أن استخدم نواة وحش الفئة S؟", options: ["المرحلة الحمراء الصلبة", "المرحلة البرتقالية الصلبة", "المرحلة الصفراء الصلبة", "المرحلة الصفراء الداكنة"], correct: 1 },
            { q: "ماذا كان اسم المعهد الذي كانت تذهب إليه إيلي لتتعلم الآداب والمهارات؟", options: ["أكاديمية زيروس", "مدرسة السيدات", "مدرسة النبلاء", "مدرسة زيث"], correct: 1 },
            { q: "كم كان عمر آرثر عندما بدأ رحلته كمغامر في الرواية؟", options: ["8 سنوات.", "9 سنوات", "10 سنوات", "11 سنة"], correct: 1 },
            { q: "بماذا وصف آرثر نظرة الملك بلاين غلايدر في المزاد؟", options: ["نظرة مليئة بالقوة والكاريزما", "نظرة حادة ومسيطرة", "نظرة باردة وبعيدة", "نظرة مليئة بالحقد"], correct: 0 }
        ];

        this.TOTAL_QUESTIONS = this.QUESTIONS.length;

        // سؤال مستحيل
        this.challengeQuestion = {
            q: "ما هو الاسم الكامل لوالدة آرثر؟",
            options: ["أليس ليwin", "سيلفيا ليwin", "كاثرين ليwin", "فيكتوريا ليwin"],
            correct: 1
        };

        this.HELPER_COSTS = {
            fiftyFifty: 100,
            nextQuestion: this.NEXT_QUESTION_BASE_COST
        };

        this.isTimeFrozen = false;
        this.gameState = {};
        this.currentScoreValue = this.STARTING_POINTS;
        this.timerInterval = null;
        this.answerSubmitted = false;
        this.domElements = {};
        this.challengeAttempted = false;
        this.challengeResult = null;
        this.nextQuestionUsageCount = 0;

        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.skippedQuestions = 0;

        this.init();
    }

    init() {
        this.cacheDomElements();
        this.bindEventListeners();
        this.populateAvatarGrid();
        this.displayHelperCosts();
        this.loadTheme();
        this.showScreen('start');
        this.hideLoader();
    }

    cacheDomElements() {
        this.domElements = {
            screens: {
                loader: document.getElementById('loader'),
                start: document.getElementById('startScreen'),
                avatar: document.getElementById('avatarScreen'),
                nameEntry: document.getElementById('nameEntry'),
                game: document.getElementById('gameContainer'),
                challenge: document.getElementById('challengeScreen'),
                challengeQuestion: document.getElementById('challengeQuestionScreen'),
                end: document.getElementById('endScreen'),
                stats: document.getElementById('statsScreen')
            },
            questionText: document.getElementById('questionText'),
            optionsGrid: document.querySelector('.options-grid'),
            scoreDisplay: document.getElementById('currentScore'),
            nameInput: document.getElementById('nameInput'),
            nameError: document.getElementById('nameError'),
            confirmAvatarBtn: document.getElementById('confirmAvatarBtn'),
            themeToggleBtn: document.querySelector('.theme-toggle-btn'),
            endQuizBtn: document.getElementById('endQuizBtn'),
            nextQuestionCost: document.getElementById('nextQuestionCost'),
            acceptChallengeBtn: document.getElementById('acceptChallengeBtn'),
            showResultsBtn: document.getElementById('showResultsBtn'),
            challengeQuestionText: document.getElementById('challengeQuestionText'),
            challengeOptionsGrid: document.getElementById('challengeOptionsGrid'),
            challengePlayerAvatar: document.getElementById('challengePlayerAvatar'),
            challengePlayerName: document.getElementById('challengePlayerName'),
            challengeCurrentScore: document.getElementById('challengeCurrentScore'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            correctAnswers: document.getElementById('correctAnswers'),
            skippedQuestions: document.getElementById('skippedQuestions'),
            finalName: document.getElementById('finalName'),
            finalCorrect: document.getElementById('finalCorrect'),
            finalWrong: document.getElementById('finalWrong'),
            finalSkipped: document.getElementById('finalSkipped'),
            finalScore: document.getElementById('finalScore'),
            totalTime: document.getElementById('totalTime'),
            challengeResult: document.getElementById('challengeResult'),
            totalPointsEarned: document.getElementById('totalPointsEarned'),
            correctBar: document.getElementById('correctBar'),
            wrongBar: document.getElementById('wrongBar'),
            skippedBar: document.getElementById('skippedBar'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            backToStartBtn: document.getElementById('backToStartBtn'),
            showStatsBtn: document.getElementById('showStatsBtn'),
            backToStartFromStatsBtn: document.getElementById('backToStartFromStatsBtn'),
            statsContent: document.getElementById('statsContent'),
            dialogOverlay: document.getElementById('confirmDialog'),
            dialogTitle: document.getElementById('dialogTitle'),
            dialogMessage: document.getElementById('dialogMessage'),
            dialogCancel: document.getElementById('dialogCancel'),
            dialogConfirm: document.getElementById('dialogConfirm')
        };

        this.domElements.helperBtns = document.querySelectorAll('.helper-btn');
    }

    bindEventListeners() {
        document.getElementById('startPlayBtn').addEventListener('click', () => this.showScreen('avatar'));
        this.domElements.confirmAvatarBtn.addEventListener('click', () => this.showScreen('nameEntry'));
        document.getElementById('confirmNameBtn').addEventListener('click', () => this.validateAndStartGame());
        this.domElements.endQuizBtn.addEventListener('click', () => this.confirmEndQuiz());
        this.domElements.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        this.domElements.showStatsBtn.addEventListener('click', () => this.showStatsScreen());
        this.domElements.playAgainBtn.addEventListener('click', () => this.startGame());
        this.domElements.backToStartBtn.addEventListener('click', () => this.showScreen('start'));
        this.domElements.backToStartFromStatsBtn.addEventListener('click', () => this.showScreen('start'));
        this.domElements.acceptChallengeBtn.addEventListener('click', () => this.startChallengeQuestion());
        this.domElements.showResultsBtn.addEventListener('click', () => this.showFinalResults());
        this.domElements.nameInput.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') this.validateAndStartGame(); 
        });
        
        this.domElements.helperBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.useHelper(e));
        });

        // مستمعي أحداث الحوار
        this.domElements.dialogCancel.addEventListener('click', () => this.hideDialog());
        this.domElements.dialogConfirm.addEventListener('click', () => this.executeDialogAction());
    }
    
    populateAvatarGrid() {
        const avatarGrid = document.querySelector('.avatar-grid');
        avatarGrid.innerHTML = '';
        for (let i = 1; i <= this.TOTAL_AVATARS; i++) {
            const img = document.createElement('img');
            img.src = `assets/avatars/avatar${i}.png`;
            img.alt = `صورة رمزية ${i}`;
            img.classList.add('avatar-option');
            img.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option.selected').forEach(el => el.classList.remove('selected'));
                img.classList.add('selected');
                this.gameState.avatar = img.src;
                this.domElements.confirmAvatarBtn.disabled = false;
            });
            avatarGrid.appendChild(img);
        }
    }
    
    validateAndStartGame() {
        const name = this.domElements.nameInput.value.trim();
        if (name.length < 2) {
            this.domElements.nameError.textContent = "الرجاء إدخال اسم صحيح (حرفين على الأقل).";
            this.domElements.nameError.classList.add('show');
            return;
        }
        this.domElements.nameError.classList.remove('show');
        this.gameState.name = name;
        this.startGame();
    }

    async startGame() {
        this.showScreen('loader');
        try {
            const response = await this.apiCall({
                action: 'start',
                deviceId: this.getDeviceId(),
                name: this.gameState.name,
            });

            if (response && response.success) {
                this.resetGameState(response.attemptId);
                this.setupGameUI();
                this.showScreen('game');
                this.fetchQuestion();
            } else {
                this.showToast("حدث خطأ عند بدء اللعبة.", 'error');
                this.showScreen('start');
            }
        } catch (error) {
            console.error("Error starting game:", error);
            this.showToast("حدث خطأ في الاتصال بالخادم.", "error");
            this.showScreen('start');
        }
    }

    shuffleQuestions() {
        const shuffled = [...this.QUESTIONS];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    fetchQuestion() {
        if (this.gameState.shuffledQuestions.length === 0) {
            this.gameState.shuffledQuestions = this.shuffleQuestions();
        }
        
        if (this.gameState.currentQuestion >= this.TOTAL_QUESTIONS) {
            this.showChallengeScreen();
            return;
        }
        
        const currentQuestionData = this.gameState.shuffledQuestions[this.gameState.currentQuestion];
        this.displayQuestion(currentQuestionData);
    }

    displayQuestion(questionData) {
        this.answerSubmitted = false;
        this.domElements.questionText.textContent = questionData.q;
        
        // تحديث شريط التقدم
        const progressPercentage = ((this.gameState.currentQuestion + 1) / this.TOTAL_QUESTIONS) * 100;
        this.domElements.progressFill.style.width = `${progressPercentage}%`;
        this.domElements.progressText.textContent = `السؤال ${this.gameState.currentQuestion + 1} من ${this.TOTAL_QUESTIONS}`;
        
        this.domElements.optionsGrid.innerHTML = '';

        let answers = questionData.options.map((optionText, index) => ({
            text: optionText,
            isCorrect: index === questionData.correct
        }));

        for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
        }
        
        answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = answer.text;
            
            if (answer.isCorrect) {
                button.dataset.correct = 'true';
            }
            
            button.addEventListener('click', () => this.checkAnswer(answer.isCorrect, button));
            
            this.domElements.optionsGrid.appendChild(button);
        });

        this.updateUI();
        this.startTimer();
    }

    checkAnswer(isCorrect, selectedButton) {
        if (this.answerSubmitted) return;
        this.answerSubmitted = true;
        
        clearInterval(this.timerInterval);
        document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

        if (isCorrect) {
            selectedButton.classList.add('correct');
            this.updateScore(this.currentScoreValue + this.QUESTION_POINTS);
            this.correctAnswers++;
            this.domElements.correctAnswers.textContent = this.correctAnswers;
            this.showToast("إجابة صحيحة! +100 نقطة", "success");
        } else {
            selectedButton.classList.add('wrong');
            
            const correctButton = this.domElements.optionsGrid.querySelector('[data-correct="true"]');
            if (correctButton) {
                correctButton.classList.add('correct');
            }
            
            this.updateScore(this.currentScoreValue - this.WRONG_ANSWER_PENALTY);
            this.wrongAnswers++;
            this.showToast("إجابة خاطئة! -100 نقطة", "error");
        }

        this.gameState.currentQuestion++;
        this.updateUI();

        setTimeout(() => {
            this.fetchQuestion();
        }, 2000);
    }
    
    showChallengeScreen() {
        clearInterval(this.timerInterval);
        this.showScreen('challenge');
    }
    
    startChallengeQuestion() {
        this.challengeAttempted = true;
        this.showScreen('challengeQuestion');
        
        // إعداد واجهة السؤال المستحيل
        this.domElements.challengePlayerAvatar.src = this.gameState.avatar;
        this.domElements.challengePlayerName.textContent = this.gameState.name;
        this.domElements.challengeCurrentScore.textContent = this.formatNumber(this.currentScoreValue);
        this.domElements.challengeQuestionText.textContent = this.challengeQuestion.q;
        this.domElements.challengeOptionsGrid.innerHTML = '';
        
        // إعداد خيارات الإجابة
        this.challengeQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            
            if (index === this.challengeQuestion.correct) {
                button.dataset.correct = 'true';
            }
            
            button.addEventListener('click', () => this.checkChallengeAnswer(index === this.challengeQuestion.correct, button));
            this.domElements.challengeOptionsGrid.appendChild(button);
        });
        
        // بدء المؤقت للسؤال المستحيل
        this.startChallengeTimer();
    }
    
    checkChallengeAnswer(isCorrect, selectedButton) {
        clearInterval(this.timerInterval);
        document.querySelectorAll('#challengeOptionsGrid .option-btn').forEach(b => b.classList.add('disabled'));
        
        if (isCorrect) {
            selectedButton.classList.add('correct');
            this.challengeResult = true;
            this.updateScore(this.currentScoreValue + 500); // مكافأة السؤال المستحيل
            this.showToast("🎉 إجابة صحيحة! لقد فزت بالتحدي. +500 نقطة", "success");
        } else {
            selectedButton.classList.add('wrong');
            
            const correctButton = this.domElements.challengeOptionsGrid.querySelector('[data-correct="true"]');
            if (correctButton) {
                correctButton.classList.add('correct');
            }
            this.challengeResult = false;
            this.showToast("❌ إجابة خاطئة! لم تنجح في التحدي.", "error");
        }
        
        setTimeout(() => {
            this.showFinalResults();
        }, 2000);
    }
    
    startChallengeTimer() {
        clearInterval(this.timerInterval);
        this.gameState.timeLeft = this.QUESTION_TIME;
        const timerBar = document.querySelector('#challengeQuestionScreen .timer-bar');
        const timerDisplay = document.querySelector('#challengeQuestionScreen .timer-text');

        this.timerInterval = setInterval(() => {
            this.gameState.timeLeft--;
            timerDisplay.textContent = this.gameState.timeLeft;
            timerBar.style.width = `${(this.gameState.timeLeft / this.QUESTION_TIME) * 100}%`;

            if (this.gameState.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.showToast("انتهى الوقت!", "error");
                this.challengeResult = false;
                document.querySelectorAll('#challengeOptionsGrid .option-btn').forEach(b => b.classList.add('disabled'));
                
                const correctButton = this.domElements.challengeOptionsGrid.querySelector('[data-correct="true"]');
                if (correctButton) {
                    correctButton.classList.add('correct');
                }
                
                setTimeout(() => {
                    this.showFinalResults();
                }, 2000);
            }
        }, 1000);
    }
    
    showFinalResults() {
        const totalTimeSeconds = (new Date() - new Date(this.gameState.startTime)) / 1000;

        this.gameState.finalStats = {
            name: this.gameState.name,
            correct: this.correctAnswers,
            wrong: this.wrongAnswers,
            skipped: this.skippedQuestions,
            score: this.currentScoreValue,
            time: this.formatTime(totalTimeSeconds),
            challengeResult: this.challengeResult
        };
        
        // تحديث واجهة النتائج
        this.domElements.finalName.textContent = this.gameState.finalStats.name;
        this.domElements.finalCorrect.textContent = this.gameState.finalStats.correct;
        this.domElements.finalWrong.textContent = this.gameState.finalStats.wrong;
        this.domElements.finalSkipped.textContent = this.gameState.finalStats.skipped;
        this.domElements.finalScore.textContent = this.formatNumber(this.gameState.finalStats.score);
        this.domElements.totalTime.textContent = this.gameState.finalStats.time;
        this.domElements.totalPointsEarned.textContent = this.formatNumber(this.gameState.finalStats.score);
        
        // تحديث نتيجة السؤال المستحيل
        if (this.challengeAttempted) {
            const resultText = this.challengeResult ? "نجح بالإجابة" : "فشل بالإجابة";
            this.domElements.challengeResult.textContent = resultText;
        } else {
            this.domElements.challengeResult.textContent = "لم يُستخدم";
        }
        
        // تحديث الرسم البياني
        this.updateChart();
        
        this.showScreen('end');
        
        // إرسال البيانات إلى الخادم
        this.apiCall({
            action: 'end',
            attemptId: this.gameState.attemptId,
            deviceId: this.gameState.deviceId,
            name: this.gameState.name,
            score: this.currentScoreValue,
            totalTime: totalTimeSeconds,
            correctAnswers: this.correctAnswers,
            wrongAnswers: this.wrongAnswers,
            skippedQuestions: this.skippedQuestions,
            challengeAttempted: this.challengeAttempted,
            challengeResult: this.challengeResult,
            helpersUsed: this.nextQuestionUsageCount
        }).catch(error => console.error("Failed to save score:", error));
    }
    
    updateChart() {
        const total = this.correctAnswers + this.wrongAnswers + this.skippedQuestions;
        
        if (total > 0) {
            const correctPercent = (this.correctAnswers / total) * 100;
            const wrongPercent = (this.wrongAnswers / total) * 100;
            const skippedPercent = (this.skippedQuestions / total) * 100;
            
            this.domElements.correctBar.style.width = `${correctPercent}%`;
            this.domElements.wrongBar.style.width = `${wrongPercent}%`;
            this.domElements.skippedBar.style.width = `${skippedPercent}%`;
            
            this.domElements.correctBar.querySelector('.chart-label').textContent = `${Math.round(correctPercent)}%`;
            this.domElements.wrongBar.querySelector('.chart-label').textContent = `${Math.round(wrongPercent)}%`;
            this.domElements.skippedBar.querySelector('.chart-label').textContent = `${Math.round(skippedPercent)}%`;
        }
    }
    
    useHelper(event) {
        const btn = event.currentTarget;
        const type = btn.dataset.type;
        
        // حساب التكلفة الخاصة بمساعدة السؤال التالي
        let cost = this.HELPER_COSTS[type];
        if (type === 'nextQuestion') {
            cost = this.NEXT_QUESTION_BASE_COST + (this.nextQuestionUsageCount * this.NEXT_QUESTION_COST_INCREMENT);
        }

        if (this.currentScoreValue < cost) {
            this.showToast("نقاطك غير كافية!", "error");
            return;
        }

        this.updateScore(this.currentScoreValue - cost);
        
        if (type === 'nextQuestion') {
            this.nextQuestionUsageCount++;
            this.skippedQuestions++;
            this.domElements.skippedQuestions.textContent = this.skippedQuestions;
            this.updateNextQuestionCost();
            
            this.gameState.currentQuestion++;
            this.showToast(`تم تخطي السؤال! -${cost} نقطة`, "info");
            
            setTimeout(() => {
                this.fetchQuestion();
            }, 1000);
        } else if (type === 'fiftyFifty') {
            const options = Array.from(this.domElements.optionsGrid.querySelectorAll('.option-btn'));
            let wrongOptions = options.filter(btn => btn.dataset.correct !== 'true');
            
            wrongOptions.sort(() => 0.5 - Math.random());
            if(wrongOptions.length > 1) {
                wrongOptions[0].classList.add('hidden');
                wrongOptions[1].classList.add('hidden');
            }
            
            btn.disabled = true;
            this.showToast(`تم استخدام المساعدة! -${cost} نقطة`, "success");
        }
        
        this.updateUI();
    }
    
    updateNextQuestionCost() {
        const nextCost = this.NEXT_QUESTION_BASE_COST + (this.nextQuestionUsageCount * this.NEXT_QUESTION_COST_INCREMENT);
        this.domElements.nextQuestionCost.textContent = `(${nextCost})`;
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.gameState.timeLeft = this.QUESTION_TIME;
        const timerBar = document.querySelector('.timer-bar');
        const timerDisplay = document.querySelector('.timer-text');

        this.timerInterval = setInterval(() => {
            if (this.isTimeFrozen) return;

            this.gameState.timeLeft--;
            timerDisplay.textContent = this.gameState.timeLeft;
            timerBar.style.width = `${(this.gameState.timeLeft / this.QUESTION_TIME) * 100}%`;

            if (this.gameState.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.showToast("انتهى الوقت!", "error");
                this.wrongAnswers++;
                this.updateScore(this.currentScoreValue - this.WRONG_ANSWER_PENALTY);
                document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));
                
                const correctButton = this.domElements.optionsGrid.querySelector('[data-correct="true"]');
                if (correctButton) {
                    correctButton.classList.add('correct');
                }
                
                this.updateUI();
                
                setTimeout(() => {
                    this.gameState.currentQuestion++;
                    this.fetchQuestion();
                }, 2000);
            }
        }, 1000);
    }
    
    updateScore(newScore) {
        this.currentScoreValue = newScore;
        this.domElements.scoreDisplay.textContent = this.formatNumber(this.currentScoreValue);
        this.updateUI();
    }

    updateUI() {
        this.domElements.helperBtns.forEach(btn => {
            const type = btn.dataset.type;
            
            // حساب التكلفة الخاصة بمساعدة السؤال التالي
            let cost = this.HELPER_COSTS[type];
            if (type === 'nextQuestion') {
                cost = this.NEXT_QUESTION_BASE_COST + (this.nextQuestionUsageCount * this.NEXT_QUESTION_COST_INCREMENT);
            }
            
            btn.disabled = this.currentScoreValue < cost;
        });
    }

    confirmEndQuiz() {
        this.showDialog(
            "إنهاء المسابقة",
            "سيتم احتساب النقاط التي جمعتها حتى الآن. هل تريد إنهاء المسابقة؟",
            () => this.showFinalResults()
        );
    }
    
    showStatsScreen() {
        this.showScreen('stats');
        this.loadStats();
    }
    
    async loadStats() {
        try {
            const response = await this.apiCall({ action: 'getLeaderboard' });
            if (response && response.success && response.leaderboard) {
                let statsHTML = '';
                
                if (response.leaderboard.length > 0) {
                    statsHTML = `
                        <div class="stats-section">
                            <h3>أفضل 5 لاعبين</h3>
                            <div class="stats-list">
                                ${response.leaderboard.slice(0, 5).map((row, index) => `
                                    <div class="stats-item">
                                        <span class="stats-rank">${index + 1}</span>
                                        <span class="stats-name">${row[1]}</span>
                                        <span class="stats-score">${this.formatNumber(row[2])} نقطة</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                } else {
                    statsHTML = '<p>لا توجد إحصائيات متاحة حتى الآن.</p>';
                }
                
                this.domElements.statsContent.innerHTML = statsHTML;
            } else {
                this.domElements.statsContent.innerHTML = '<p>حدث خطأ في تحميل الإحصائيات.</p>';
            }
        } catch (error) {
            console.error("Error loading stats:", error);
            this.domElements.statsContent.innerHTML = '<p>حدث خطأ في تحميل الإحصائيات.</p>';
        }
    }
    
    showDialog(title, message, confirmCallback) {
        this.domElements.dialogTitle.textContent = title;
        this.domElements.dialogMessage.textContent = message;
        this.domElements.dialogOverlay.classList.add('active');
        this.dialogConfirmCallback = confirmCallback;
    }
    
    hideDialog() {
        this.domElements.dialogOverlay.classList.remove('active');
        this.dialogConfirmCallback = null;
    }
    
    executeDialogAction() {
        if (this.dialogConfirmCallback) {
            this.dialogConfirmCallback();
        }
        this.hideDialog();
    }

    resetGameState(attemptId) {
        this.gameState = {
            deviceId: this.getDeviceId(),
            attemptId: attemptId,
            name: this.gameState.name,
            avatar: this.gameState.avatar,
            currentQuestion: 0,
            startTime: new Date().toISOString(),
            shuffledQuestions: [],
        };
        
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.skippedQuestions = 0;
        this.nextQuestionUsageCount = 0;
        this.challengeAttempted = false;
        this.challengeResult = null;
        
        this.updateScore(this.STARTING_POINTS);
        this.updateNextQuestionCost();
        
        this.domElements.correctAnswers.textContent = "0";
        this.domElements.skippedQuestions.textContent = "0";
    }

    setupGameUI() {
        document.getElementById('playerAvatar').src = this.gameState.avatar;
        document.getElementById('playerName').textContent = this.gameState.name;
    }

    toggleTheme() {
        const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        document.body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        this.domElements.themeToggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.dataset.theme = savedTheme;
        this.domElements.themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    
    showScreen(screenName) {
        if (document.activeElement) document.activeElement.blur();
        
        Object.values(this.domElements.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
                screen.setAttribute('aria-hidden', 'true');
            }
        });
        
        const activeScreen = this.domElements.screens[screenName];
        if (activeScreen) {
            activeScreen.classList.add('active');
            activeScreen.setAttribute('aria-hidden', 'false');
            const firstFocusable = activeScreen.querySelector('button, [href], input, select, textarea');
            if(firstFocusable) firstFocusable.focus();
        }
    }

    hideLoader() {
        this.domElements.screens.loader.classList.remove('active');
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    async apiCall(payload) {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    getDeviceId() {
        let id = localStorage.getItem('deviceId');
        if (!id) {
            id = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('deviceId', id);
        }
        return id;
    }
    
    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        if (minutes > 0) {
            return `${minutes} دقيقة و ${seconds} ثانية`;
        }
        return `${seconds} ثانية`;
    }

    formatNumber(num) {
        return new Intl.NumberFormat('ar-EG').format(num);
    }

    displayHelperCosts() {
        this.domElements.helperBtns.forEach(btn => {
            const type = btn.dataset.type;
            let cost = this.HELPER_COSTS[type];
            
            if (type === 'nextQuestion') {
                cost = this.NEXT_QUESTION_BASE_COST;
            }
            
            if (cost) {
                const costEl = btn.querySelector('.helper-cost');
                if (costEl) {
                    costEl.textContent = `(${cost})`;
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});
