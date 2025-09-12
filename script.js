class QuizGame {
    constructor() {
        this.API_URL = "https://script.google.com/macros/s/AKfycbzB9cru35ndWmWYsEqe46NlrvZgj64HhCIZJ0j7SLln3VDSl2S7rAOMDGxLwEzR_ClS/exec";
        this.QUESTION_TIME = 80;
        this.TOTAL_AVATARS = 16;
        this.LIMIT_PER_DAY = 2; // Set the number of daily attempts here
        this.MAX_WRONG_ANSWERS = 3;
        this.STARTING_POINTS = 100; // رصيد البداية 100 نقطة
        this.QUESTION_POINTS = 100; // 100 نقطة لكل سؤال

        // إعدادات مساعدة السؤال التالي
        this.NEXT_QUESTION_BASE_COST = 100;
        this.NEXT_QUESTION_COST_INCREMENT = 50;
        this.nextQuestionUsageCount = 0;

        const allQuestions = [
            { q: "ماذا قال آرثر عن ليليا (صديقة إيلي) عندما سأله جارود ريدنر عنها في الحفلة؟", options: ["إنها جميلة جدًا ولكنها ليست من نوعه", "إنها فتاة جيدة، وآمل أن تعاملها بشكل جيد", "إنها تذكره بطفولته", "إنه لا يعرفها جيداً"], correct: 1 },
            { q: "ما هي الصفة التي وصف بها آرثر صديقه إيلايجا؟", options: ["شخص عاطفي ولكنه يملك مبادئ وجديراً بالثقة", "شخص بارد ومنغلق على نفسه", "شخص عاطفي وضعيف وهش من الداخل", "شخص قاسي وعديم الخبرة"], correct: 0 },
            { q: "ما هي المشكلة التي يواجهها إيلايجا في استخدام قواه؟", options: ["لا يستطيع السيطرة على عنصر الأرض", "لا يستطيع السيطرة على كمية المانا في قواه", "يفتقر إلى المهارة في القتال القريب", "لا يمكنه تعلم أي عنصر آخر غير الأرض"], correct: 1 },
            { q: "من هي الشخصية التي أظهرت قدرتها على التلاعب بالمعادن أثناء قتال الدودة العملاقة؟", options: ["آرثر", "لوكاس", "إيلايجا", "كريول"], correct: 2 },
            { q: "ما هو العنصر الذي تتخصص به ياسمين، رفيقة آرثر في المغامرة؟", options: ["النار", "الماء", "الأرض", "الرياح"], correct: 3 },
            { q: "ما هي الصفة التي لاحظتها والدة إيلي على آرثر عندما كان يكذب؟", options: ["يصبح صوته حادًا ويركز نظره في مكان واحد", "يبتسم كثيرًا ويحرك يديه بسرعة", "يفرك أنفه ويتلعثم في الكلام", "يميل إلى تجنب التواصل البصري"], correct: 0 },
            { q: "ما هي المرحلة التي وصل إليها رينولدز ليوين في نواة المانا بعد أن استخدم نواة وحش الفئة S؟", options: ["المرحلة الحمراء الصلبة", "المرحلة البرتقالية الصلبة", "المرحلة الصفراء الصلبة", "المرحلة الصفراء الداكنة"], correct: 1 },
            { q: "ماذا كان اسم المعهد الذي كانت تذهب إليه إيلي لتتعلم الآداب والمهارات؟", options: ["أكاديمية زيروس", "مدرسة السيدات", "مدرسة النبلاء", "مدرسة زيث"], correct: 1 },
            { q: "كم كان عمر آرثر عندما بدأ رحلته كمغامر في الرواية؟", options: ["8 سنوات.", "9 سنوات", "10 سنوات", "11 سنة"], correct: 1 },
            { q: "بماذا وصف آرثر نظرة الملك بلاين غلايدر في المزاد؟", options: ["نظرة مليئة بالقوة والكاريزما", "نظرة حادة ومسيطرة", "نظرة باردة وبعيدة", "نظرة مليئة بالحقد"], correct: 0 },
            { q: "ما هو الشيء الذي صدم آرثر عندما رآه في المزاد، وجعله يشعر بالاشمئزاز؟", options: ["بيع الوحوش المتعاقدة", "بيع العبيد", "بيع السيوف القديمة", "وجود السحرة المغرورين"], correct: 1 },
            { q: "لماذا كان فينسنت هيلستيا ضد توظيف السحرة في مزاد هيلستيا؟", options: ["لأن السحرة مغرورون وقد يؤثر ذلك على معنويات الفريق", "لأنهم مكلفون جدًا", "لأنهم ضعفاء في القتال المباشر", "لأنه لديه عدد كافٍ من المعززين بالفعل"], correct: 0 },
            { q: "ما هي الصفة التي تميز المحرك البخاري الذي صممه آرثر، والذي جعله قادراً على الإبحار لمسافات طويلة؟", options: ["يستخدم البخار الناتج عن المانا لإنتاج الطاقة", "يعتمد على الرياح لتشغيله", "يتم التحكم به عن طريق السحرة", "يستعمل حجر نواة الوحش كوقود"], correct: 0 },
            { q: "ما هو اسم الوحش العملاق الذي قاتله آرثر وفريقه في 'المقابر الملوثة'؟", options: ["حارس الخشب الحكيم", "وحش الكرومات", "ملك الرعب والأوهام", "وحش الخشب"], correct: 0 },
            { q: "ما هو اسم الطائر الذي صنعت منه قلادة العنقاء التي قدمها آرثر لأخته؟", options: ["طائر الفينيق", "طائر الرعد", "طائر العنقاء", "طائر الفجر"], correct: 2 },
            { q: "ما هي قدرة قلادة طائر العنقاء التي اشتراها آرثر كهدية لوالدته وأخته؟", options: ["إعطاء القوة الجسدية", "حماية المستخدم ونقله إلى مكان آمن", "زيادة قوة السحر", "زيادة الحظ"], correct: 1 }
        ];

        // سؤال إضافي للاحتياط
        this.backupQuestion = allQuestions.pop();
        
        // سؤال مستحيل
        this.challengeQuestion = {
            q: "ما هو الاسم الكامل لوالدة آرثر؟",
            options: ["أليس ليwin", "سيلفيا ليwin", "كاثرين ليwin", "فيكتوريا ليwin"],
            correct: 1
        };

        // جعل الأسئلة قابلة للتعديل بسهولة
        this.QUESTIONS = allQuestions;
        this.TOTAL_QUESTIONS = this.QUESTIONS.length; // عدد الأسئلة قابل للتعديل

        this.PRIZES = [
            { points: 100, title: "كاديل" }, { points: 200, title: "سيريس" },
            { points: 300, title: "اوتو" }, { points: 500, title: "ميكا" },
            { points: 1000, title: "غراي" }, { points: 2000, title: "بايرون" },
            { points: 4000, title: "سيلفي" }, { points: 8000, title: "فاراي" },
            { points: 16000, title: "شول" }, { points: 32000, title: "الدير" },
            { points: 64000, title: "ويندسوم" }, { points: 125000, title: "مورداين" },
            { points: 250000, title: "كيزيس" }, { points: 500000, title: "أغرونا" },
            { points: 1000000, title: "أرثر" }
        ];
        
        this.HELPER_COSTS = {
            fiftyFifty: 100,
            freezeTime: 100,
            changeQuestion: 100,
            nextQuestion: this.NEXT_QUESTION_BASE_COST
        };

        this.isTimeFrozen = false;
        this.gameState = {};
        this.currentScoreValue = this.STARTING_POINTS; // بدء اللاعب بـ 100 نقطة
        this.timerInterval = null;
        this.answerSubmitted = false;
        this.domElements = {};
        this.challengeAttempted = false;
        this.challengeResult = null;
        this.challengeRank = null;

        this.init();
    }

    init() {
        this.cacheDomElements();
        this.bindEventListeners();
        this.populateAvatarGrid();
        this.generatePrizesList();
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
                welcome: document.getElementById('welcomeScreen'),
                game: document.getElementById('gameContainer'),
                challenge: document.getElementById('challengeScreen'),
                challengeQuestion: document.getElementById('challengeQuestionScreen'),
                end: document.getElementById('endScreen'),
                leaderboard: document.getElementById('leaderboardScreen'),
            },
            sidebar: document.querySelector('.sidebar'),
            sidebarOverlay: document.querySelector('.sidebar-overlay'),
            questionText: document.getElementById('questionText'),
            optionsGrid: document.querySelector('.options-grid'),
            scoreDisplay: document.getElementById('currentScore'),
            prizesList: document.querySelector('.prizes-list'),
            helperBtns: document.querySelectorAll('.helper-btn'),
            nameInput: document.getElementById('nameInput'),
            nameError: document.getElementById('nameError'),
            confirmAvatarBtn: document.getElementById('confirmAvatarBtn'),
            themeToggleBtn: document.querySelector('.theme-toggle-btn'),
            welcomeMessage: document.getElementById('welcomeMessage'),
            cooldownContainer: document.getElementById('cooldownContainer'),
            cooldownTimer: document.getElementById('cooldownTimer'),
            attemptsCount: document.getElementById('attemptsCount'),
            attemptsLeft: document.getElementById('attemptsLeft'),
            nextQuestionCost: document.getElementById('nextQuestionCost'),
            acceptChallengeBtn: document.getElementById('acceptChallengeBtn'),
            showResultsBtn: document.getElementById('showResultsBtn'),
            challengeQuestionText: document.getElementById('challengeQuestionText'),
            challengeOptionsGrid: document.getElementById('challengeOptionsGrid'),
            challengePlayerAvatar: document.getElementById('challengePlayerAvatar'),
            challengePlayerName: document.getElementById('challengePlayerName'),
            challengeCurrentScore: document.getElementById('challengeCurrentScore'),
            challengeResult: document.getElementById('challengeResult'),
            finalRank: document.getElementById('finalRank'),
            performanceFill: document.getElementById('performanceFill'),
            challengeBadge: document.getElementById('challengeBadge'),
            copyResultsBtn: document.getElementById('copyResultsBtn'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            filterBtns: document.querySelectorAll('.filter-btn')
        };
    }

    bindEventListeners() {
        document.getElementById('startPlayBtn').addEventListener('click', () => this.showScreen('avatar'));
        this.domElements.confirmAvatarBtn.addEventListener('click', () => this.showScreen('nameEntry'));
        document.getElementById('confirmNameBtn').addEventListener('click', () => this.showWelcomeScreen());
        document.getElementById('welcomeConfirmBtn').addEventListener('click', () => this.startGame());
        document.getElementById('showLeaderboardBtn').addEventListener('click', () => this.displayLeaderboard());
        document.getElementById('backToStartBtn').addEventListener('click', () => this.showScreen('start'));
        this.domElements.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        document.getElementById('statsBtn').addEventListener('click', () => this.displayLeaderboard());
        document.querySelector('.open-sidebar-btn').addEventListener('click', () => this.toggleSidebar(true));
        document.querySelector('.close-sidebar-btn').addEventListener('click', () => this.toggleSidebar(false));
        this.domElements.sidebarOverlay.addEventListener('click', () => this.toggleSidebar(false));
        this.domElements.helperBtns.forEach(btn => btn.addEventListener('click', (e) => this.useHelper(e)));
        document.getElementById('shareXBtn').addEventListener('click', () => this.shareOnX());
        document.getElementById('shareInstagramBtn').addEventListener('click', () => this.shareOnInstagram());
        this.domElements.nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.showWelcomeScreen(); });
        
        // إضافة مستمعي الأحداث الجديدة
        this.domElements.acceptChallengeBtn.addEventListener('click', () => this.startChallengeQuestion());
        this.domElements.showResultsBtn.addEventListener('click', () => this.showFinalResults());
        this.domElements.copyResultsBtn.addEventListener('click', () => this.copyResults());
        this.domElements.playAgainBtn.addEventListener('click', () => this.showScreen('start'));
        
        // مستمعي أحداث التصفية
        this.domElements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterLeaderboard(e));
        });
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
    
    showWelcomeScreen() {
        const name = this.domElements.nameInput.value.trim();
        if (name.length < 2) {
            this.domElements.nameError.textContent = "الرجاء إدخال اسم صحيح (حرفين على الأقل).";
            this.domElements.nameError.classList.add('show');
            return;
        }
        this.domElements.nameError.classList.remove('show');
        this.gameState.name = name;
        this.domElements.welcomeMessage.innerHTML = `🌟 مرحبا بك يا ${name}! 🌟`;
        
        if (this.domElements.attemptsCount) {
            this.domElements.attemptsCount.textContent = this.LIMIT_PER_DAY;
        }

        this.showScreen('welcome');
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
                document.getElementById('startPlayBtn').disabled = false;
                this.domElements.cooldownContainer.style.display = 'none';

                this.resetGameState(response.attemptId);
                this.gameState.attemptsLeft = response.attemptsLeft;
                this.setupGameUI();
                this.showScreen('game');
                this.fetchQuestion();
            } else if (response && response.error === 'limit_reached') {
                this.showScreen('start');
                this.startCooldownTimer(response.cooldownEnd);
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
        const currentQuestionData = this.gameState.shuffledQuestions[this.gameState.currentQuestion];
        this.displayQuestion(currentQuestionData);
    }

    displayQuestion(questionData) {
        this.answerSubmitted = false;
        this.domElements.questionText.textContent = questionData.q;
        document.getElementById('questionCounter').textContent = `السؤال ${this.gameState.currentQuestion + 1} / ${this.TOTAL_QUESTIONS}`;
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
            const pointsEarned = this.QUESTION_POINTS; // 100 نقطة لكل سؤال
            this.updateScore(this.currentScoreValue + pointsEarned);
        } else {
            selectedButton.classList.add('wrong');
            
            const correctButton = this.domElements.optionsGrid.querySelector('[data-correct="true"]');
            if (correctButton) {
                correctButton.classList.add('correct');
            }
            this.gameState.wrongAnswers++;
        }

        this.gameState.currentQuestion++;
        this.updateUI();

        const isGameOver = this.gameState.wrongAnswers >= this.MAX_WRONG_ANSWERS || this.gameState.currentQuestion >= this.TOTAL_QUESTIONS;
        
        setTimeout(() => {
            if (isGameOver) {
                this.showChallengeScreen();
            } else {
                this.fetchQuestion();
            }
        }, 2000);
    }
    
    showChallengeScreen() {
        clearInterval(this.timerInterval);
        this.showScreen('challenge');
    }
    
    startChallengeQuestion() {
        this.challengeAttempted = true;
        this.showScreen('challengeQuestion');
        
        // تعطيل جميع المساعدات في السؤال المستحيل
        document.querySelectorAll('.helper-btn').forEach(btn => {
            btn.disabled = true;
        });
        
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
            this.showToast("🎉 إجابة صحيحة! لقد فزت بالتحدي.", "success");
            
            // تحديث الترتيب بناءً على وقت الإجابة
            this.determineChallengeRank();
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
    
    determineChallengeRank() {
        // في الواقع، يجب أن يتم هذا على الخادم لتحديد من أجاب أولاً
        // هنا سنقوم بمحاكاة بسيطة
        const randomRank = Math.floor(Math.random() * 3) + 1; // محاكاة للحصول على ترتيب
        this.challengeRank = randomRank;
    }
    
    startChallengeTimer() {
        clearInterval(this.timerInterval);
        this.gameState.timeLeft = this.QUESTION_TIME;
        const timerBar = document.querySelector('#challengeQuestionScreen .timer-bar');
        const timerDisplay = document.querySelector('#challengeQuestionScreen .timer-text');

        if (timerBar && timerDisplay) {
            timerBar.style.display = 'block';
            timerDisplay.style.display = 'block';
            
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
    }
    
    showFinalResults() {
        const totalTimeSeconds = (new Date() - new Date(this.gameState.startTime)) / 1000;
        const finalTitle = this.gameState.currentQuestion > 0 ? this.PRIZES[this.gameState.currentQuestion - 1].title : "لا يوجد";

        this.gameState.finalStats = {
            name: this.gameState.name,
            title: finalTitle,
            score: this.currentScoreValue,
            time: this.formatTime(totalTimeSeconds),
            challengeResult: this.challengeResult,
            challengeRank: this.challengeRank
        };
        
        // تحديث واجهة النتائج
        document.getElementById('finalName').textContent = this.gameState.finalStats.name;
        document.getElementById('finalTitle').textContent = this.gameState.finalStats.title;
        document.getElementById('finalScore').textContent = this.formatNumber(this.gameState.finalStats.score);
        document.getElementById('totalTime').textContent = this.gameState.finalStats.time;
        
        // تحديث نتيجة السؤال المستحيل
        if (this.challengeAttempted) {
            const resultText = this.challengeResult ? 
                `نجح بالإجابة (الترتيب: ${this.getRankText(this.challengeRank)})` : 
                "فشل بالإجابة";
            this.domElements.challengeResult.textContent = resultText;
            
            // عرض شارة التمييز إذا نجح
            if (this.challengeResult) {
                this.domElements.challengeBadge.style.display = 'block';
            }
        } else {
            this.domElements.challengeResult.textContent = "لم يُستخدم";
        }
        
        // تحديث الترتيب النهائي
        this.domElements.finalRank.textContent = this.calculateFinalRank();
        
        // تحديث مؤشر الأداء
        this.updatePerformanceIndicator();
        
        this.showScreen('end');
        
        // إرسال البيانات إلى الخادم
        this.apiCall({
            action: 'end',
            attemptId: this.gameState.attemptId,
            deviceId: this.gameState.deviceId,
            name: this.gameState.name,
            score: this.currentScoreValue,
            finalTitle: finalTitle,
            totalTime: totalTimeSeconds,
            challengeAttempted: this.challengeAttempted,
            challengeResult: this.challengeResult,
            challengeRank: this.challengeRank,
            helpersUsed: Object.keys(this.gameState.helpersUsed).filter(key => this.gameState.helpersUsed[key]).length
        }).catch(error => console.error("Failed to save score:", error));
    }
    
    getRankText(rank) {
        const ranks = {
            1: "الأول 🏅",
            2: "الثاني 🏅", 
            3: "الثالث 🏅"
        };
        return ranks[rank] || `المركز ${rank}`;
    }
    
    calculateFinalRank() {
        // محاكاة بسيطة لحساب الترتيب
        // في التطبيق الحقيقي، يجب أن يستند هذا إلى بيانات الخادم
        const randomRank = Math.floor(Math.random() * 10) + 1;
        return this.getRankText(randomRank);
    }
    
    updatePerformanceIndicator() {
        // حساب مؤشر الأداء بناءً على النقاط
        const maxPossibleScore = this.TOTAL_QUESTIONS * this.QUESTION_POINTS;
        const performancePercentage = (this.currentScoreValue / maxPossibleScore) * 100;
        this.domElements.performanceFill.style.width = `${performancePercentage}%`;
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
        this.gameState.helpersUsed[type] = true;
        
        // زيادة عداد استخدام مساعدة السؤال التالي
        if (type === 'nextQuestion') {
            this.nextQuestionUsageCount++;
            this.updateNextQuestionCost();
        }
        
        btn.disabled = true;
        this.showToast(`تم استخدام المساعدة!`, "success");

        if (type === 'fiftyFifty') {
            const options = Array.from(this.domElements.optionsGrid.querySelectorAll('.option-btn'));
            let wrongOptions = options.filter(btn => btn.dataset.correct !== 'true');
            
            wrongOptions.sort(() => 0.5 - Math.random());
            if(wrongOptions.length > 1) {
                wrongOptions[0].classList.add('hidden');
                wrongOptions[1].classList.add('hidden');
            }
        } else if (type === 'freezeTime') {
            this.isTimeFrozen = true;
            document.querySelector('.timer-bar').classList.add('frozen');
            setTimeout(() => {
                this.isTimeFrozen = false;
                document.querySelector('.timer-bar').classList.remove('frozen');
            }, 10000);
        } else if (type === 'changeQuestion') {
            this.gameState.shuffledQuestions[this.gameState.currentQuestion] = this.backupQuestion;
            this.fetchQuestion();
        } else if (type === 'nextQuestion') {
            // التخطي إلى السؤال التالي
            this.gameState.currentQuestion++;
            if (this.gameState.currentQuestion >= this.TOTAL_QUESTIONS) {
                this.showChallengeScreen();
            } else {
                this.fetchQuestion();
            }
        }
        this.updateUI();
    }
    
    updateNextQuestionCost() {
        const nextCost = this.NEXT_QUESTION_BASE_COST + (this.nextQuestionUsageCount * this.NEXT_QUESTION_COST_INCREMENT);
        this.domElements.nextQuestionCost.textContent = nextCost;
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
                this.gameState.wrongAnswers++;
                document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));
                
                const correctButton = this.domElements.optionsGrid.querySelector('[data-correct="true"]');
                if (correctButton) {
                    correctButton.classList.add('correct');
                }
                
                this.updateUI();
                
                setTimeout(() => {
                    if (this.gameState.wrongAnswers >= this.MAX_WRONG_ANSWERS) {
                        this.showChallengeScreen();
                    } else {
                        this.gameState.currentQuestion++;
                        this.fetchQuestion();
                    }
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
        document.getElementById('wrongAnswersCount').textContent = `${this.gameState.wrongAnswers} / ${this.MAX_WRONG_ANSWERS}`;
        const currentTitle = this.gameState.currentQuestion > 0 ? this.PRIZES[this.gameState.currentQuestion - 1].title : "لا يوجد";
        document.getElementById('currentTitle').textContent = currentTitle;

        if (this.domElements.attemptsLeft) {
            this.domElements.attemptsLeft.textContent = `${this.gameState.attemptsLeft || this.LIMIT_PER_DAY} / ${this.LIMIT_PER_DAY}`;
        }

        this.updatePrizesList();

        this.domElements.helperBtns.forEach(btn => {
            const type = btn.dataset.type;
            const helperIsUsed = this.gameState.helpersUsed && this.gameState.helpersUsed[type];
            
            // حساب التكلفة الخاصة بمساعدة السؤال التالي
            let cost = this.HELPER_COSTS[type];
            if (type === 'nextQuestion') {
                cost = this.NEXT_QUESTION_BASE_COST + (this.nextQuestionUsageCount * this.NEXT_QUESTION_COST_INCREMENT);
            }
            
            btn.disabled = helperIsUsed || this.currentScoreValue < cost;
        });
    }

    generatePrizesList() {
        this.domElements.prizesList.innerHTML = '';
        [...this.PRIZES].reverse().forEach((prize, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${this.PRIZES.length - index}. ${prize.title}</span> <strong>${this.formatNumber(prize.points)}</strong>`;
            this.domElements.prizesList.appendChild(li);
        });
    }

    updatePrizesList() {
        const items = this.domElements.prizesList.querySelectorAll('li');
        items.forEach((item, index) => {
            item.classList.remove('current', 'past');
            const prizeIndex = this.PRIZES.length - 1 - index;
            if (prizeIndex === this.gameState.currentQuestion) {
                item.classList.add('current');
            } else if (prizeIndex < this.gameState.currentQuestion) {
                item.classList.add('past');
            }
        });
    }

    async displayLeaderboard() {
        this.showScreen('leaderboard');
        const contentDiv = document.getElementById('leaderboardContent');
        contentDiv.innerHTML = '<div class="spinner"></div>';

        try {
            const response = await this.apiCall({ action: 'getLeaderboard' });
            if (response && response.success && response.leaderboard) {
                let tableHTML = '<p>لوحة الصدارة فارغة حاليًا!</p>';
                if (response.leaderboard.length > 0) {
                    tableHTML = `<table class="leaderboard-table">
                        <tr><th>الترتيب</th><th>الاسم</th><th>النقاط</th><th>اللقب</th><th>التحدي</th></tr>
                        ${response.leaderboard.map(row => `
                            <tr>
                                <td>${['🥇', '🥈', '🥉'][row[0] - 1] || row[0]}</td>
                                <td>${row[1]}</td>
                                <td>${this.formatNumber(row[2])}</td>
                                <td>${row[3]}</td>
                                <td>${row[4] || 'لم يُستخدم'}</td>
                            </tr>`).join('')}
                    </table>`;
                }
                contentDiv.innerHTML = tableHTML;
            } else {
                contentDiv.innerHTML = '<p>حدث خطأ في تحميل لوحة الصدارة.</p>';
            }
        } catch (error) {
            console.error("Error loading leaderboard:", error);
            contentDiv.innerHTML = '<p>حدث خطأ في تحميل لوحة الصدارة.</p>';
        }
    }
    
    filterLeaderboard(event) {
        const filter = event.target.dataset.filter;
        
        // إزالة النشط من جميع الأزرار
        this.domElements.filterBtns.forEach(btn => btn.classList.remove('active'));
        
        // إضافة النشط للزر المحدد
        event.target.classList.add('active');
        
        // تطبيق التصفية (سيتم تنفيذها على الخادم في التطبيق الحقيقي)
        this.displayLeaderboardWithFilter(filter);
    }
    
    async displayLeaderboardWithFilter(filter) {
        // في التطبيق الحقيقي، سيتم إرسال طلب إلى الخادم مع معامل التصفية
        console.log(`Filtering leaderboard by: ${filter}`);
        this.displayLeaderboard(); // حالياً نعرض كل البيانات
    }
    
    getShareText() {
        const { name, title, score, time } = this.gameState.finalStats;
        let challengeText = "";
        
        if (this.challengeAttempted) {
            challengeText = this.challengeResult ? 
                `🎯 السؤال المستحيل: نجح بالإجابة (${this.getRankText(this.challengeRank)})` : 
                `🎯 السؤال المستحيل: فشل بالإجابة`;
        } else {
            challengeText = "🎯 السؤال المستحيل: لم يُستخدم";
        }
        
        return `✨ نتائجي في مسابقة "من سيربح اللقب" ✨\n` +
               `الاسم: ${name}\n` +
               `اللقب: ${title}\n` +
               `النقاط: ${this.formatNumber(score)}\n` +
               `المدة: ${time}\n` +
               `${challengeText}\n` +
               `🔗 جرب حظك أنت أيضاً: https://abuqusayms.github.io/Tbate-Game/`;
    }
    
    shareOnX() {
        const text = encodeURIComponent(this.getShareText());
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }

    shareOnInstagram() {
        navigator.clipboard.writeText(this.getShareText())
            .then(() => this.showToast("تم نسخ النتيجة! الصقها في قصتك أو رسائلك على إنستغرام.", "success"))
            .catch(() => this.showToast("فشل نسخ النتيجة.", "error"));
    }
    
    copyResults() {
        navigator.clipboard.writeText(this.getShareText())
            .then(() => this.showToast("تم نسخ النتيجة إلى الحافظة!", "success"))
            .catch(() => this.showToast("فشل نسخ النتيجة.", "error"));
    }

    resetGameState(attemptId) {
        this.gameState = {
            deviceId: this.getDeviceId(),
            attemptId: attemptId,
            name: this.gameState.name,
            avatar: this.gameState.avatar,
            currentQuestion: 0,
            wrongAnswers: 0,
            startTime: new Date().toISOString(),
            helpersUsed: { 
                fiftyFifty: false, 
                freezeTime: false, 
                changeQuestion: false,
                nextQuestion: false 
            },
            shuffledQuestions: [],
        };
        this.nextQuestionUsageCount = 0;
        this.challengeAttempted = false;
        this.challengeResult = null;
        this.challengeRank = null;
        this.updateScore(this.STARTING_POINTS);
        this.updateNextQuestionCost();
        
        // إخفاء شارة التحدي
        if (this.domElements.challengeBadge) {
            this.domElements.challengeBadge.style.display = 'none';
        }
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

    toggleSidebar(open) {
        const openBtn = document.querySelector('.open-sidebar-btn');
        if (open) {
            this.domElements.sidebar.classList.add('open');
            this.domElements.sidebarOverlay.classList.add('active');
            openBtn.setAttribute('aria-expanded', 'true');
            setTimeout(() => {
                const closeBtn = this.domElements.sidebar.querySelector('.close-sidebar-btn');
                if (closeBtn) {
                    closeBtn.focus();
                }
            }, 100);
        } else {
            this.domElements.sidebar.classList.remove('open');
            this.domElements.sidebarOverlay.classList.remove('active');
            openBtn.setAttribute('aria-expanded', 'false');
            if (openBtn) {
                openBtn.focus();
            }
        }
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

    startCooldownTimer(cooldownEndTimeISO) {
        const cooldownEndTime = new Date(cooldownEndTimeISO);
        
        this.domElements.cooldownContainer.style.display = 'block';
        document.getElementById('startPlayBtn').disabled = true;

        const timerInterval = setInterval(() => {
            const now = new Date();
            const remainingTime = cooldownEndTime - now;

            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                this.domElements.cooldownContainer.style.display = 'none';
                document.getElementById('startPlayBtn').disabled = false;
                return;
            }

            const hours = Math.floor((remainingTime / (1000 * 60 * 60)));
            const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
            const seconds = Math.floor((remainingTime / 1000) % 60);

            this.domElements.cooldownTimer.textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});
