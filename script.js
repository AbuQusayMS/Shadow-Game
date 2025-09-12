class QuizGame {
    constructor() {
        this.API_URL = "https://script.google.com/macros/s/AKfycbzB9cru35ndWmWYsEqe46NlrvZgj64HhCIZJ0j7SLln3VDSl2S7rAOMDGxLwEzR_ClS/exec";
        this.QUESTION_TIME = 60;
        this.TOTAL_AVATARS = 16;
        
        // إزالة الحد اليومي للمحاولات
        this.MAX_WRONG_ANSWERS = 3;
        this.STARTING_POINTS = 100;
        this.QUESTION_POINTS = 100;

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
        this.TOTAL_QUESTIONS = this.QUESTIONS.length;

        // إزالة نظام الألقاب
        this.HELPER_COSTS = {
            fiftyFifty: 50,
            freezeTime: 75,
            changeQuestion: 100,
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
        
        // إحصائيات جديدة
        this.correctAnswersCount = 0;
        this.wrongAnswersCount = 0;
        this.skippedCount = 0;
        this.totalTimeSpent = 0;
        this.questionStartTime = 0;

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
                welcome: document.getElementById('welcomeScreen'),
                game: document.getElementById('gameContainer'),
                challengeQuestion: document.getElementById('challengeQuestionScreen'),
                end: document.getElementById('endScreen'),
                leaderboard: document.getElementById('leaderboardScreen'),
            },
            questionText: document.getElementById('questionText'),
            optionsGrid: document.querySelector('.options-grid'),
            scoreDisplay: document.getElementById('currentScore'),
            helperBtns: document.querySelectorAll('.helper-btn'),
            nameInput: document.getElementById('nameInput'),
            nameError: document.getElementById('nameError'),
            confirmAvatarBtn: document.getElementById('confirmAvatarBtn'),
            themeToggleBtn: document.querySelector('.theme-toggle-btn'),
            welcomeMessage: document.getElementById('welcomeMessage'),
            nextQuestionCost: document.getElementById('nextQuestionCost'),
            challengeQuestionText: document.getElementById('challengeQuestionText'),
            challengeOptionsGrid: document.getElementById('challengeOptionsGrid'),
            challengePlayerAvatar: document.getElementById('challengePlayerAvatar'),
            challengePlayerName: document.getElementById('challengePlayerName'),
            challengeCurrentScore: document.getElementById('challengeCurrentScore'),
            correctAnswersCount: document.getElementById('correctAnswersCount'),
            wrongAnswersCount: document.getElementById('wrongAnswersCount'),
            skippedCount: document.getElementById('skippedCount'),
            finalScore: document.getElementById('finalScore'),
            challengeResult: document.getElementById('challengeResult'),
            endGameBtn: document.getElementById('endGameBtn'),
            confirmEndBtn: document.getElementById('confirmEndBtn'),
            cancelEndBtn: document.getElementById('cancelEndBtn'),
            confirmEndGame: document.getElementById('confirmEndGame'),
            progressText: document.getElementById('progressText'),
            progressFill: document.querySelector('.progress-fill'),
            performanceChart: document.getElementById('performanceChart')
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
        this.domElements.nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.showWelcomeScreen(); });
        
        // مستمعي الأحداث للزر الجديد "إنهاء المسابقة"
        this.domElements.endGameBtn.addEventListener('click', () => this.showEndGameConfirmation());
        this.domElements.confirmEndBtn.addEventListener('click', () => this.endGame());
        this.domElements.cancelEndBtn.addEventListener('click', () => this.hideEndGameConfirmation());
        
        // مستمعي الأحداث للمساعدات
        this.domElements.helperBtns.forEach(btn => btn.addEventListener('click', (e) => this.useHelper(e)));
        
        // مستمعي الأحداث للمشاركة
        document.getElementById('shareXBtn').addEventListener('click', () => this.shareOnX());
        document.getElementById('shareInstagramBtn').addEventListener('click', () => this.shareOnInstagram());
        document.getElementById('copyResultsBtn').addEventListener('click', () => this.copyResults());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.showScreen('start'));
        
        // مستمعي أحداث التصفية
        document.querySelectorAll('.filter-btn').forEach(btn => {
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

        this.showScreen('welcome');
    }

    async startGame() {
        this.showScreen('loader');
        try {
            // إزالة التحقق من الحد اليومي
            this.resetGameState();
            this.setupGameUI();
            this.showScreen('game');
            this.fetchQuestion();
        } catch (error) {
            console.error("Error starting game:", error);
            this.showToast("حدث خطأ في بدء اللعبة.", "error");
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
        this.questionStartTime = Date.now();
        const currentQuestionData = this.gameState.shuffledQuestions[this.gameState.currentQuestion];
        this.displayQuestion(currentQuestionData);
    }

    displayQuestion(questionData) {
        this.answerSubmitted = false;
        this.domElements.questionText.textContent = questionData.q;
        document.getElementById('questionCounter').textContent = `السؤال ${this.gameState.currentQuestion + 1} / ${this.TOTAL_QUESTIONS}`;
        
        // تحديث شريط التقدم
        const progress = ((this.gameState.currentQuestion) / this.TOTAL_QUESTIONS) * 100;
        this.domElements.progressFill.style.width = `${progress}%`;
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
        
        // حساب الوقت المستغرق للإجابة
        const timeSpent = Math.floor((Date.now() - this.questionStartTime) / 1000);
        this.totalTimeSpent += timeSpent;
        
        clearInterval(this.timerInterval);
        document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

        if (isCorrect) {
            selectedButton.classList.add('correct');
            this.updateScore(this.currentScoreValue + this.QUESTION_POINTS);
            this.correctAnswersCount++;
        } else {
            selectedButton.classList.add('wrong');
            this.updateScore(this.currentScoreValue - this.QUESTION_POINTS);
            this.wrongAnswersCount++;
            
            const correctButton = this.domElements.optionsGrid.querySelector('[data-correct="true"]');
            if (correctButton) {
                correctButton.classList.add('correct');
            }
        }

        this.gameState.currentQuestion++;
        this.updateUI();

        const isGameOver = this.gameState.currentQuestion >= this.TOTAL_QUESTIONS;
        
        setTimeout(() => {
            if (isGameOver) {
                this.showFinalResults();
            } else {
                this.fetchQuestion();
            }
        }, 2000);
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
        // تحديث واجهة النتائج
        this.domElements.correctAnswersCount.textContent = this.correctAnswersCount;
        this.domElements.wrongAnswersCount.textContent = this.wrongAnswersCount;
        this.domElements.skippedCount.textContent = this.skippedCount;
        this.domElements.finalScore.textContent = this.formatNumber(this.currentScoreValue);
        
        // تحديث نتيجة السؤال المستحيل
        if (this.challengeAttempted) {
            const resultText = this.challengeResult ? "نجح بالإجابة" : "فشل بالإجابة";
            this.domElements.challengeResult.textContent = resultText;
            document.getElementById('challengeResultRow').style.display = 'flex';
        } else {
            document.getElementById('challengeResultRow').style.display = 'none';
        }
        
        // تحديث الرسم البياني للأداء
        this.updatePerformanceChart();
        
        this.showScreen('end');
    }
    
    updatePerformanceChart() {
        // إنشاء رسم بياني مبسط للأداء
        const ctx = this.domElements.performanceChart.getContext('2d');
        const data = {
            labels: ['صحيح', 'خاطئ', 'مُتخطى'],
            datasets: [{
                data: [this.correctAnswersCount, this.wrongAnswersCount, this.skippedCount],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                borderWidth: 0
            }]
        };
        
        // رسم مخطط دائري بسيط (بدون استخدام مكتبات خارجية)
        const total = this.correctAnswersCount + this.wrongAnswersCount + this.skippedCount;
        let startAngle = 0;
        
        // مسح الرسم الحالي
        ctx.clearRect(0, 0, this.domElements.performanceChart.width, this.domElements.performanceChart.height);
        
        // رسم القطاعات
        [this.correctAnswersCount, this.wrongAnswersCount, this.skippedCount].forEach((value, i) => {
            if (value === 0) return;
            
            const sliceAngle = 2 * Math.PI * value / total;
            const colors = ['#10b981', '#ef4444', '#f59e0b'];
            
            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.arc(100, 100, 80, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();
            
            startAngle += sliceAngle;
        });
        
        // إضافة نص في المركز
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 16px Cairo';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('أداؤك', 100, 100);
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
        
        // زيادة عداد استخدام مساعدة السؤال التالي
        if (type === 'nextQuestion') {
            this.nextQuestionUsageCount++;
            this.skippedCount++;
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
                this.showFinalResults();
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
                this.updateScore(this.currentScoreValue - this.QUESTION_POINTS);
                this.wrongAnswersCount++;
                document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));
                
                const correctButton = this.domElements.optionsGrid.querySelector('[data-correct="true"]');
                if (correctButton) {
                    correctButton.classList.add('correct');
                }
                
                this.updateUI();
                
                setTimeout(() => {
                    this.gameState.currentQuestion++;
                    if (this.gameState.currentQuestion >= this.TOTAL_QUESTIONS) {
                        this.showFinalResults();
                    } else {
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
        // تحديث عدد المحاولات إلى "غير محدود"
        if (this.domElements.attemptsLeft) {
            this.domElements.attemptsLeft.textContent = "غير محدود";
        }

        // تحديث تكلفة السؤال التالي
        this.updateNextQuestionCost();

        // تحديث حالة أزرار المساعدة
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
                        <tr><th>الترتيب</th><th>الاسم</th><th>النقاط</th><th>الإجابات الصحيحة</th></tr>
                        ${response.leaderboard.map(row => `
                            <tr>
                                <td>${['🥇', '🥈', '🥉'][row[0] - 1] || row[0]}</td>
                                <td>${row[1]}</td>
                                <td>${this.formatNumber(row[2])}</td>
                                <td>${row[3] || 0}</td>
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
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        // إضافة النشط للزر المحدد
        event.target.classList.add('active');
        
        // تطبيق التصفية
        this.displayLeaderboardWithFilter(filter);
    }
    
    async displayLeaderboardWithFilter(filter) {
        // في التطبيق الحقيقي، سيتم إرسال طلب إلى الخادم مع معامل التصفية
        console.log(`Filtering leaderboard by: ${filter}`);
        this.displayLeaderboard();
    }
    
    getShareText() {
        let challengeText = "";
        
        if (this.challengeAttempted) {
            challengeText = this.challengeResult ? 
                `🎯 السؤال المستحيل: نجح بالإجابة` : 
                `🎯 السؤال المستحيل: فشل بالإجابة`;
        } else {
            challengeText = "🎯 السؤال المستحيل: لم يُستخدم";
        }
        
        return `✨ نتائجي في مسابقة المعرفة ✨\n` +
               `الإجابات الصحيحة: ${this.correctAnswersCount}\n` +
               `الإجابات الخاطئة: ${this.wrongAnswersCount}\n` +
               `مرات التخطي: ${this.skippedCount}\n` +
               `النقاط الكلية: ${this.formatNumber(this.currentScoreValue)}\n` +
               `${challengeText}\n` +
               `🔗 جرب حظك أنت أيضاً: ${window.location.href}`;
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

    resetGameState() {
        this.gameState = {
            name: this.gameState.name,
            avatar: this.gameState.avatar,
            currentQuestion: 0,
            startTime: new Date().toISOString(),
            shuffledQuestions: [],
        };
        this.nextQuestionUsageCount = 0;
        this.challengeAttempted = false;
        this.challengeResult = null;
        this.correctAnswersCount = 0;
        this.wrongAnswersCount = 0;
        this.skippedCount = 0;
        this.totalTimeSpent = 0;
        this.updateScore(this.STARTING_POINTS);
        this.updateNextQuestionCost();
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
    
    showEndGameConfirmation() {
        this.domElements.confirmEndGame.classList.add('active');
    }
    
    hideEndGameConfirmation() {
        this.domElements.confirmEndGame.classList.remove('active');
    }
    
    endGame() {
        this.hideEndGameConfirmation();
        this.showFinalResults();
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
        
        // إخفاء نافذة التأكيد عند تغيير الشاشة
        this.hideEndGameConfirmation();
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
                    costEl.textContent = cost;
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});
