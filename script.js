class QuizGame {
    constructor() {
        this.API_URL = "https://script.google.com/macros/s/AKfycbySuefLGlL2v1m5OJ2XpAL53sNJbg42JX3WqDIB9kNdS8SJpGlBVG4shZqOUEP31wV3/exec";
        this.QUESTION_TIME = 60;
        this.TOTAL_AVATARS = 16;
        this.LIMIT_PER_DAY = 5;
        this.MAX_WRONG_ANSWERS = 3;

        // (مُعدل) فصل السؤال الاحتياي
        const allQuestions = [
            { q: "ما هو الاسم الذي أطلقه ساني على الظل في إحدى محاولاته الفاشلة للتواصل معه؟", options: ["ظالي", "عديم الحياء", "السيف", "الوغد"], correct: 1 },
            { q: "ما هو الاسم الذي أطلق عليه ساني اسم الوحش الميت الذي تحول إلى مرآة في الليل؟", options: ["وحش البحر", "وحش الديدان", "وحش الحريش", "وحش القواقع"], correct: 0 },
            { q: "ما هو نوع اللحم الذي قدمه ساني لنيفيس وكاسي بعد قتال الزبال؟", options: ["لحم طري", "لحم قاسي", "لحم مشوي", "لحم مجفف"], correct: 3 },
            { q: "ما هو الاسم الحقيقي للشرطي الذي جلد ساني في بداية القصة؟", options: ["المستيقظ أورو", "المستيقظ روك", "لم يُذكر اسمه", "المستيقظ يوليوس"], correct: 2 },
            { q: "ما هو نوع السلاح الذي استخرجه ساني من جثة الزبال الميت؟", options: ["سيف طويل", "نصل أزرق", "خنجر", "سيف عظمي"], correct: 1 },
            { q: "ما هي الصفات التي استخدمها ساني لوصف لحم الشيطان بعد أن وعد كاسي بتحضير شريحة لحم لها؟", options: ["لذيذ وطري", "غني وعصيري", "طازج وساخن", "لذيذ وطري بشكل لا يوصف"], correct: 0 },
            { q: "ما هي اسم السبيكة الغريبة التي تشكلت منها قوقعة شيطان القوقعة؟", options: ["سبيكة الفولاذ", "سبيكة النجم الساقط", "سبيكة المعدن", "لم يذكر اسم السبيكة"], correct: 1 },
            { q: "كم كان طول سيف ساني 'شظية منتصف الليل'؟", options: ["50 إلى 60 سم", "60 إلى 70 سم", "70 إلى 80 سم", "80 إلى 90 سم"], correct: 2 },
            { q: "كم كان طول القارب الذي صنعه ساني ونيفيس؟", options: ["لم يذكر الطول", "كان طوله 12 متر", "كان طوله 20 متر", "كان طوله 30 متر"], correct: 0 },
            { q: "ما هي الطبقة التي ينتمي إليها سيف ساني الجديد 'شظية منتصف الليل'؟", options: ["الطبقة الثالثة", "الطبقة الرابعة", "الطبقة الخامسة", "الطبقة السادسة"], correct: 0 },
            { q: "كم كان يبلغ طول الزعنفة الظهرية للوحش الذي كان يطارد ساني في البحر المظلم؟", options: ["ثلاثة أمتار على الأقل", "أربعة أمتار على الأقل", "خمسة أمتار على الأقل", "ستة أمتار على الأقل"], correct: 2 },
            { q: "ما هو العدد الدقيق لشظايا الظل التي جمعها ساني عند قتله لـ سنتوريون القوقعة الثاني؟", options: ["22 شظية", "24 شظية", "28 شظية", "32 شظية"], correct: 0 },
            { q: "كم عدد شظايا الظل التي حصل عليها ساني بعد قتل طاغوت عظيم، وليد الطائر اللص الخسيس؟", options: ["24 شظية", "48 شظية", "64 شظية", "100 شظية"], correct: 2 },
            { q: "ما هي رتبة ونوع ذكرى 'قطرة الإيكور' التي حصل عليها ساني؟", options: ["رتبة فائقة، نوع سلاح", "رتبة عظيمة، نوع درع", "رتبة مجهولة، نوع مجهول", "رتبة مستيقظة، نوع سيف"], correct: 2 },
            { q: "ما هي الكلمات التي قالها ساني لكاسي بعد أن أنقذها من البحر المظلم؟", options: ["أنا هنا، لا تخافي", "نحن بخير، كل شيء سيكون على ما يرام", "لأنني أريد ذلك", "لقد أنقذتكِ، لا تنسي"], correct: 1 },
            { q: "ما هي الكلمات التي قالها ساني لنيفيس بعد أن أنقذته من البحر المظلم؟", options: ["سأكون مدينا لكِ", "لولاكِ لغرقنا", "شكرا لكِ", "لقد أنقذتِ حياتي مرتين"], correct: 3 }
        ];
        
        this.backupQuestion = allQuestions.pop();
        this.QUESTIONS = allQuestions;

        this.PRIZES = [
            { points: 100, title: "وحش" }, { points: 200, title: "مسخ" },
            { points: 300, title: "شيطان" }, { points: 500, title: "طاغوت" },
            { points: 1000, title: "طاغية" }, { points: 2000, title: "رعب" },
            { points: 4000, title: "عملاق" }, { points: 8000, title: "وحش  نائم" },
            { points: 16000, title: "مسخ مستيقظ" }, { points: 32000, title: "شيطان ساقط" },
            { points: 64000, title: "طاغوت فاسد" }, { points: 125000, title: "طاغية عظيم" },
            { points: 250000, title: "رعب ملعون" }, { points: 500000, title: "عملاق غير مقدس" },
            { points: 1000000, title: "الضائع من النور" }
        ];
        
        this.HELPER_COSTS = {
           fiftyFifty: 100,
           freezeTime: 100,
           changeQuestion: 100
        };

        // --- (هذا هو التصحيح) ---
        // كل هذه الأسطر يجب أن تكون هنا بالداخل
        this.isTimeFrozen = false;
        this.gameState = {};
        this.currentScoreValue = 0;
        this.timerInterval = null;
        this.answerSubmitted = false;
        this.domElements = {};

        // هذا السطر يستدعي الدالة init ويجب أن يكون آخر شيء
        this.init();
    } // <-- نهاية الـ constructor

    init() {
        this.cacheDomElements();
        this.bindEventListeners();
        this.populateAvatarGrid();
        this.generatePrizesList();
        this.displayHelperCosts(); // (جديد) عرض تكاليف المساعدات
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
                end: document.getElementById('endScreen'),
                leaderboard: document.getElementById('leaderboardScreen'),
            },
            // تم حذف كائن الأصوات من هنا
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
        };
    }

    bindEventListeners() {
        document.getElementById('startPlayBtn').addEventListener('click', () => {
            this.showScreen('avatar');
        });

        this.domElements.confirmAvatarBtn.addEventListener('click', () => {
            this.showScreen('nameEntry');
        });

        document.getElementById('confirmNameBtn').addEventListener('click', () => {
            this.showWelcomeScreen();
        });

        document.getElementById('welcomeConfirmBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('showLeaderboardBtn').addEventListener('click', () => {
            this.displayLeaderboard();
        });

        document.getElementById('backToStartBtn').addEventListener('click', () => {
            this.showScreen('start');
        });

        this.domElements.themeToggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            window.location.reload();
        });
        
        document.querySelector('.open-sidebar-btn').addEventListener('click', () => {
            this.toggleSidebar(true);
        });
        
        document.querySelector('.close-sidebar-btn').addEventListener('click', () => {
            this.toggleSidebar(false);
        });

        this.domElements.sidebarOverlay.addEventListener('click', () => this.toggleSidebar(false));
        this.domElements.helperBtns.forEach(btn => btn.addEventListener('click', (e) => this.useHelper(e)));
        document.getElementById('shareXBtn').addEventListener('click', () => this.shareOnX());
        document.getElementById('shareInstagramBtn').addEventListener('click', () => this.shareOnInstagram());
        this.domElements.nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.showWelcomeScreen(); });
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
                // تم حذف سطر الصوت من هنا
                document.querySelectorAll('.avatar-option.selected').forEach(el => el.classList.remove('selected'));
                img.classList.add('selected');
                this.gameState.avatar = img.src;
                this.domElements.confirmAvatarBtn.disabled = false;
            });
            avatarGrid.appendChild(img);
        }
    }
    
    // (جديد) إظهار شاشة الترحيب
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
                const errorMsg = response && response.error === 'limit_reached'
                    ? `لقد استنفدت محاولاتك اليومية (${this.LIMIT_PER_DAY}).`
                    : "حدث خطأ عند بدء اللعبة.";
                this.showToast(errorMsg, 'error');
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
        this.answerSubmitted = false; // (جديد) السماح بإجابة جديدة
        this.domElements.questionText.textContent = questionData.q;
        document.getElementById('questionCounter').textContent = `السؤال ${this.gameState.currentQuestion + 1} / ${this.QUESTIONS.length}`;
        this.domElements.optionsGrid.innerHTML = '';
        questionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.dataset.index = index;
            button.addEventListener('click', () => this.checkAnswer(index, button));
            this.domElements.optionsGrid.appendChild(button);
        });
        this.updateUI();
        this.startTimer();
    }

    checkAnswer(selectedIndex, selectedButton) {
        if (this.answerSubmitted) return;
        this.answerSubmitted = true;
        
        clearInterval(this.timerInterval);
        document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

        const currentQuestion = this.gameState.shuffledQuestions[this.gameState.currentQuestion];
        const isCorrect = (currentQuestion.correct === selectedIndex);

        if (isCorrect) {
            // تم حذف سطر الصوت من هنا
            selectedButton.classList.add('correct');
            const pointsEarned = this.PRIZES[this.gameState.currentQuestion]?.points || 0;
            this.updateScore(this.currentScoreValue + pointsEarned);
            this.gameState.currentQuestion++;
        } else {
            // تم حذف سطر الصوت من هنا
            selectedButton.classList.add('wrong');
            document.querySelector(`.option-btn[data-index='${currentQuestion.correct}']`).classList.add('correct');
            this.gameState.wrongAnswers++;
        }
        this.updateUI();

        const isGameOver = this.gameState.wrongAnswers >= this.MAX_WRONG_ANSWERS || this.gameState.currentQuestion >= this.QUESTIONS.length;
        
        setTimeout(() => {
            if (isGameOver) {
                this.endGame();
            } else {
                this.fetchQuestion();
            }
        }, 2000);
    }
    
    // (مُعدل) endGame لظهور النتائج فوراً
    endGame() {
        clearInterval(this.timerInterval);
        const totalTimeSeconds = (new Date() - new Date(this.gameState.startTime)) / 1000;
        const finalTitle = this.gameState.currentQuestion > 0 ? this.PRIZES[this.gameState.currentQuestion - 1].title : "لا يوجد";

        // حفظ البيانات النهائية للمشاركة
        this.gameState.finalStats = {
            name: this.gameState.name,
            title: finalTitle,
            score: this.currentScoreValue,
            time: this.formatTime(totalTimeSeconds)
        };
        
        // إظهار النتائج فوراً
        document.getElementById('finalName').textContent = this.gameState.finalStats.name;
        document.getElementById('finalTitle').textContent = this.gameState.finalStats.title;
        document.getElementById('finalScore').textContent = this.formatNumber(this.gameState.finalStats.score);
        document.getElementById('totalTime').textContent = this.gameState.finalStats.time;
        this.showScreen('end');
        
        // إرسال البيانات للخادم في الخلفية
        this.apiCall({
            action: 'end',
            attemptId: this.gameState.attemptId,
            name: this.gameState.name,
            score: this.currentScoreValue,
            finalTitle: finalTitle,
            totalTime: totalTimeSeconds
        }).catch(error => console.error("Failed to save score:", error));
    }
    
    // (مُعدل بالكامل) لتفعيل كل الميزات بشكل صحيح
    useHelper(event) {
        const btn = event.currentTarget;
        const type = btn.dataset.type;
        const cost = this.HELPER_COSTS[type];

        if (this.currentScoreValue < cost) {
            this.showToast("نقاطك غير كافية!", "error");
            return;
        }

        this.updateScore(this.currentScoreValue - cost);
        this.gameState.helpersUsed[type] = true;
        btn.disabled = true;
        this.showToast(`تم استخدام المساعدة!`, "success");

        if (type === 'fiftyFifty') {
            const currentQuestion = this.gameState.shuffledQuestions[this.gameState.currentQuestion];
            const correctIndex = currentQuestion.correct;
            const options = Array.from(document.querySelectorAll('.option-btn'));
            let wrongOptions = options.filter(opt => parseInt(opt.dataset.index) !== correctIndex);
            
            wrongOptions.sort(() => 0.5 - Math.random());
            wrongOptions[0].classList.add('hidden');
            wrongOptions[1].classList.add('hidden');

        } else if (type === 'freezeTime') {
            this.isTimeFrozen = true;
            document.querySelector('.timer-bar').classList.add('frozen'); // لإعطاء لون مختلف
            setTimeout(() => {
                this.isTimeFrozen = false;
                document.querySelector('.timer-bar').classList.remove('frozen');
            }, 10000); // 10 ثوان

        } else if (type === 'changeQuestion') {
            // استبدال السؤال الحالي بالاحتياطي
            this.gameState.shuffledQuestions[this.gameState.currentQuestion] = this.backupQuestion;
            this.fetchQuestion(); // إعادة تحميل السؤال
        }
        this.updateUI();
    }

    // (مُعدل) لدعم ميزة تجميد الوقت
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
                // تم حذف سطر الصوت من هنا
                this.showToast("انتهى الوقت!", "error");
                this.gameState.wrongAnswers++;
                document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));
                const correctIndex = this.gameState.shuffledQuestions[this.gameState.currentQuestion].correct;
                document.querySelector(`.option-btn[data-index='${correctIndex}']`).classList.add('correct');
                
                this.updateUI();
                
                setTimeout(() => {
                    if (this.gameState.wrongAnswers >= this.MAX_WRONG_ANSWERS) {
                        this.endGame();
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
        document.getElementById('wrongAnswersCount').textContent = `${this.gameState.wrongAnswers} / ${this.MAX_WRONG_ANSWERS}`;
        const currentTitle = this.gameState.currentQuestion > 0 ? this.PRIZES[this.gameState.currentQuestion - 1].title : "لا يوجد";
        document.getElementById('currentTitle').textContent = currentTitle;

        this.updatePrizesList();

        this.domElements.helperBtns.forEach(btn => {
            const type = btn.dataset.type;
            btn.disabled = this.gameState.helpersUsed[type] || this.currentScoreValue < this.HELPER_COSTS[type];
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
                        <tr><th>الترتيب</th><th>الاسم</th><th>النقاط</th><th>اللقب</th></tr>
                        ${response.leaderboard.map(row => `
                            <tr>
                                <td>${['🥇', '🥈', '🥉'][row[0] - 1] || row[0]}</td>
                                <td>${row[1]}</td>
                                <td>${this.formatNumber(row[2])}</td>
                                <td>${row[3]}</td>
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
    
    // (مُعدل) getShareText لنص المشاركة
    getShareText() {
        const { name, title, score, time } = this.gameState.finalStats;
        return `✨ نتائجي في مسابقة "من سيربح اللقب" ✨\n` +
               `الاسم: ${name}\n` +
               `اللقب: ${title}\n` +
               `النقاط: ${this.formatNumber(score)}\n` +
               `المدة: ${time}\n\n` +
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

    resetGameState(attemptId) {
        this.gameState = {
            deviceId: this.getDeviceId(),
            attemptId: attemptId,
            name: this.gameState.name,
            avatar: this.gameState.avatar,
            currentQuestion: 0,
            wrongAnswers: 0,
            startTime: new Date().toISOString(),
            helpersUsed: { fiftyFifty: false, changeQuestion: false },
            shuffledQuestions: [],
        };
        this.updateScore(0);
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

    // (مُعدل) لإصلاح خطأ aria-hidden عبر إدارة التركيز
    toggleSidebar(open) {
        // Cache the button that opens the sidebar
        const openBtn = document.querySelector('.open-sidebar-btn');

        if (open) {
            this.domElements.sidebar.classList.add('open');
            this.domElements.sidebarOverlay.classList.add('active');
            openBtn.setAttribute('aria-expanded', 'true');
            
            // For better accessibility, move focus to the close button inside the sidebar
            setTimeout(() => {
                const closeBtn = this.domElements.sidebar.querySelector('.close-sidebar-btn');
                if (closeBtn) {
                    closeBtn.focus();
                }
            }, 100); // A small delay ensures the sidebar is visible before focusing

        } else {
            this.domElements.sidebar.classList.remove('open');
            this.domElements.sidebarOverlay.classList.remove('active');
            openBtn.setAttribute('aria-expanded', 'false');
            
            // (The Fix) When closing, return focus to the button that opened it
            if (openBtn) {
                openBtn.focus();
            }
        }
    }
    
    // (مُعدل) showScreen لإصلاح خطأ aria
    showScreen(screenName) {
        if (document.activeElement) document.activeElement.blur(); // (جديد) إزالة التركيز
        
        Object.values(this.domElements.screens).forEach(screen => {
            screen.classList.remove('active');
            screen.setAttribute('aria-hidden', 'true');
        });
        const activeScreen = this.domElements.screens[screenName];
        if (activeScreen) {
            activeScreen.classList.add('active');
            activeScreen.setAttribute('aria-hidden', 'false');
            // نقل التركيز إلى أول عنصر تفاعلي لتحسين الوصولية
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
    
    // (جديد) تنسيق الوقت
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

// (جديد) دالة لعرض تكاليف المساعدات
    displayHelperCosts() {
        this.domElements.helperBtns.forEach(btn => {
            const type = btn.dataset.type;
            const cost = this.HELPER_COSTS[type];
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
