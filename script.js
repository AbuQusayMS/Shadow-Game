class QuizGame {
    constructor() {
        this.API_URL = "https://script.google.com/macros/s/AKfycbzB9cru35ndWmWYsEqe46NlrvZgj64HhCIZJ0j7SLln3VDSl2S7rAOMDGxLwEzR_ClS/exec";
        this.QUESTION_TIME = 80;
        this.TOTAL_AVATARS = 12;
        this.SKIP_BASE_COST = 100;
        this.SKIP_COST_INCREMENT = 50;
        
        this.gameState = {
            player: {
                name: "",
                avatar: "",
                score: 100,
                skipCount: 0,
                skipCost: 100
            },
            questions: [],
            currentQuestion: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            startTime: null,
            helpersUsed: {
                fiftyFifty: false,
                freezeTime: false,
                changeQuestion: false,
                skipQuestion: false
            },
            impossibleQuestion: {
                used: false,
                correct: false
            }
        };
        
        this.timerInterval = null;
        this.isTimeFrozen = false;
        
        this.init();
    }
    
    init() {
        this.cacheDomElements();
        this.bindEventListeners();
        this.populateAvatarGrid();
        this.loadQuestions();
        this.showScreen('start');
    }
    
    cacheDomElements() {
        this.elements = {
            screens: {
                start: document.getElementById('startScreen'),
                avatar: document.getElementById('avatarScreen'),
                nameEntry: document.getElementById('nameEntry'),
                game: document.getElementById('gameContainer'),
                results: document.getElementById('resultsScreen'),
                leaderboard: document.getElementById('leaderboardScreen')
            },
            modals: {
                endConfirm: document.getElementById('endConfirmModal'),
                impossible: document.getElementById('impossibleQuestionModal')
            },
            buttons: {
                startPlay: document.getElementById('startPlayBtn'),
                showLeaderboard: document.getElementById('showLeaderboardBtn'),
                confirmAvatar: document.getElementById('confirmAvatarBtn'),
                confirmName: document.getElementById('confirmNameBtn'),
                themeToggle: document.getElementById('themeToggleBtn'),
                endGame: document.getElementById('endGameBtn'),
                impossibleQuestion: document.getElementById('impossibleQuestionBtn'),
                confirmEnd: document.getElementById('confirmEndBtn'),
                cancelEnd: document.getElementById('cancelEndBtn'),
                viewResults: document.getElementById('viewResultsBtn'),
                acceptChallenge: document.getElementById('acceptChallengeBtn'),
                playAgain: document.getElementById('playAgainBtn'),
                backToHome: document.getElementById('backToHomeBtn'),
                backToStart: document.getElementById('backToStartBtn')
            },
            inputs: {
                name: document.getElementById('nameInput')
            },
            displays: {
                questionCounter: document.getElementById('questionCounter'),
                questionText: document.getElementById('questionText'),
                optionsGrid: document.querySelector('.options-grid'),
                playerAvatar: document.getElementById('playerAvatar'),
                playerName: document.getElementById('playerName'),
                currentScore: document.getElementById('currentScore'),
                skipCount: document.getElementById('skipCount'),
                skipCost: document.getElementById('skipCost'),
                timer: document.getElementById('timer'),
                resultName: document.getElementById('resultName'),
                resultCorrect: document.getElementById('resultCorrect'),
                resultWrong: document.getElementById('resultWrong'),
                resultSkips: document.getElementById('resultSkips'),
                resultScore: document.getElementById('resultScore'),
                resultTime: document.getElementById('resultTime'),
                resultImpossible: document.getElementById('resultImpossible')
            },
            helpers: document.querySelectorAll('.helper-btn')
        };
    }
    
    bindEventListeners() {
        // شاشة البداية
        this.elements.buttons.startPlay.addEventListener('click', () => this.showScreen('avatar'));
        this.elements.buttons.showLeaderboard.addEventListener('click', () => this.showLeaderboard());
        
        // شاشة اختيار الصورة الرمزية
        this.elements.buttons.confirmAvatar.addEventListener('click', () => this.showScreen('nameEntry'));
        
        // شاشة إدخال الاسم
        this.elements.buttons.confirmName.addEventListener('click', () => this.validateName());
        this.elements.inputs.name.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.validateName();
        });
        
        // شاشة اللعبة
        this.elements.buttons.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.buttons.endGame.addEventListener('click', () => this.showModal('endConfirm'));
        this.elements.buttons.impossibleQuestion.addEventListener('click', () => this.showModal('impossible'));
        
        // النوافذ المنبثقة
        this.elements.buttons.confirmEnd.addEventListener('click', () => this.endGame());
        this.elements.buttons.cancelEnd.addEventListener('click', () => this.hideModal('endConfirm'));
        this.elements.buttons.viewResults.addEventListener('click', () => {
            this.hideModal('impossible');
            this.endGame();
        });
        this.elements.buttons.acceptChallenge.addEventListener('click', () => this.startImpossibleQuestion());
        
        // شاشة النتائج
        this.elements.buttons.playAgain.addEventListener('click', () => this.restartGame());
        this.elements.buttons.backToHome.addEventListener('click', () => this.showScreen('start'));
        
        // شاشة لوحة الصدارة
        this.elements.buttons.backToStart.addEventListener('click', () => this.showScreen('start'));
        
        // أدوات المساعدة
        this.elements.helpers.forEach(helper => {
            helper.addEventListener('click', (e) => this.useHelper(e.currentTarget.dataset.type));
        });
        
        // مشاركة النتائج
        document.querySelector('.x-share').addEventListener('click', () => this.shareOnX());
        document.querySelector('.instagram-share').addEventListener('click', () => this.shareOnInstagram());
    }
    
    showScreen(screenName) {
        // إخفاء جميع الشاشات
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إخفاء جميع النوافذ المنبثقة
        Object.values(this.elements.modals).forEach(modal => {
            modal.classList.remove('active');
        });
        
        // إظهار الشاشة المطلوبة
        this.elements.screens[screenName].classList.add('active');
    }
    
    showModal(modalName) {
        this.elements.modals[modalName].classList.add('active');
    }
    
    hideModal(modalName) {
        this.elements.modals[modalName].classList.remove('active');
    }
    
    populateAvatarGrid() {
        const avatarGrid = document.querySelector('.avatar-grid');
        avatarGrid.innerHTML = '';
        
        for (let i = 1; i <= this.TOTAL_AVATARS; i++) {
            const avatarOption = document.createElement('div');
            avatarOption.classList.add('avatar-option');
            avatarOption.innerHTML = `<img src="assets/avatars/avatar${i}.png" alt="صورة رمزية ${i}">`;
            
            avatarOption.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(avatar => {
                    avatar.classList.remove('selected');
                });
                avatarOption.classList.add('selected');
                this.gameState.player.avatar = `assets/avatars/avatar${i}.png`;
                this.elements.buttons.confirmAvatar.disabled = false;
            });
            
            avatarGrid.appendChild(avatarOption);
        }
    }
    
    validateName() {
        const name = this.elements.inputs.name.value.trim();
        
        if (name.length < 3) {
            this.showToast('الاسم يجب أن يكون على الأقل 3 أحرف', 'error');
            return;
        }
        
        if (name.length > 15) {
            this.showToast('الاسم يجب أن لا يتجاوز 15 حرف', 'error');
            return;
        }
        
        this.gameState.player.name = name;
        this.startGame();
    }
    
    loadQuestions() {
        // في التطبيق الحقيقي، يمكن جلب الأسئلة من API أو قاعدة بيانات
        // هنا سنقوم بإنشاء بعض الأسئلة التجريبية
        this.gameState.questions = [
            {
                question: "ما هي عاصمة فرنسا؟",
                options: ["لندن", "باريس", "برلين", "مدريد"],
                correct: 1
            },
            {
                question: "ما هو الكوكب المعروف بالكوكب الأحمر؟",
                options: ["الزهرة", "المريخ", "المشتري", "زحل"],
                correct: 1
            },
            {
                question: "من هو مؤلف رواية 'البؤساء'؟",
                options: ["تولستوي", "فيكتور هوجو", "ديستوفسكي", "شكسبير"],
                correct: 1
            },
            {
                question: "ما هو العنصر الكيميائي الذي رمزه 'O'؟",
                options: ["ذهب", "فضة", "أكسجين", "حديد"],
                correct: 2
            },
            {
                question: "ما هي أكبر محيطات العالم؟",
                options: ["المحيط الأطلسي", "المحيط الهادئ", "المحيط الهندي", "المحيط المتجمد الشمالي"],
                correct: 1
            },
            {
                question: "في أي عام هبط الإنسان على سطح القمر لأول مرة؟",
                options: ["1965", "1969", "1972", "1975"],
                correct: 1
            },
            {
                question: "ما هي اللغة الرسمية في البرازيل؟",
                options: ["الإسبانية", "البرتغالية", "الإنجليزية", "الفرنسية"],
                correct: 1
            },
            {
                question: "كم عدد عناصر الجدول الدوري القياسي؟",
                options: ["92", "108", "118", "126"],
                correct: 2
            },
            {
                question: "ما هو أطول نهر في العالم؟",
                options: ["نهر الأمازون", "نهر النيل", "نهر المسيسيبي", "نهر اليانغتسي"],
                correct: 1
            },
            {
                question: "من رسم لوحة 'ليلة النجوم'؟",
                options: ["بيكاسو", "فان جوخ", "دافنشي", "مونيه"],
                correct: 1
            },
            {
                question: "ما هي عاصمة اليابان؟",
                options: ["سيول", "بكين", "طوكيو", "بانكوك"],
                correct: 2
            },
            {
                question: "ما هو أصغر كوكب في المجموعة الشمسية؟",
                options: ["الزهرة", "المريخ", "عطارد", "بلوتو"],
                correct: 2
            },
            {
                question: "من هو مكتشف الجاذبية الأرضية؟",
                options: ["أينشتاين", "نيوتن", "جاليليو", "كبلر"],
                correct: 1
            },
            {
                question: "ما هي أكبر قارة في العالم من حيث المساحة؟",
                options: ["أفريقيا", "أمريكا الشمالية", "آسيا", "أوروبا"],
                correct: 2
            },
            {
                question: "ما هو العنصر الأكثر وفرة في الغلاف الجوي للأرض؟",
                options: ["الأكسجين", "الهيدروجين", "النيتروجين", "ثاني أكسيد الكربون"],
                correct: 2
            }
        ];
    }
    
    startGame() {
        this.showScreen('game');
        this.gameState.startTime = new Date();
        this.updatePlayerInfo();
        this.displayQuestion();
    }
    
    updatePlayerInfo() {
        this.elements.displays.playerAvatar.src = this.gameState.player.avatar;
        this.elements.displays.playerName.textContent = this.gameState.player.name;
        this.elements.displays.currentScore.textContent = this.gameState.player.score;
        this.elements.displays.skipCount.textContent = this.gameState.player.skipCount;
        this.elements.displays.skipCost.textContent = this.gameState.player.skipCost;
    }
    
    displayQuestion() {
        if (this.gameState.currentQuestion >= this.gameState.questions.length) {
            this.endGame();
            return;
        }
        
        const question = this.gameState.questions[this.gameState.currentQuestion];
        this.elements.displays.questionCounter.textContent = `السؤال ${this.gameState.currentQuestion + 1} من ${this.gameState.questions.length}`;
        this.elements.displays.questionText.textContent = question.question;
        
        // تحديث شريط التقدم
        const progressPercent = ((this.gameState.currentQuestion + 1) / this.gameState.questions.length) * 100;
        document.querySelector('.progress-fill').style.width = `${progressPercent}%`;
        
        // تفريغ وعرض الخيارات
        this.elements.displays.optionsGrid.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.classList.add('option-btn');
            optionButton.textContent = option;
            optionButton.addEventListener('click', () => this.checkAnswer(index === question.correct, optionButton));
            this.elements.displays.optionsGrid.appendChild(optionButton);
        });
        
        // بدء المؤقت
        this.startTimer();
    }
    
    startTimer() {
        clearInterval(this.timerInterval);
        let timeLeft = this.QUESTION_TIME;
        this.elements.displays.timer.textContent = timeLeft;
        document.querySelector('.timer-fill').style.width = '100%';
        
        this.timerInterval = setInterval(() => {
            if (this.isTimeFrozen) return;
            
            timeLeft--;
            this.elements.displays.timer.textContent = timeLeft;
            document.querySelector('.timer-fill').style.width = `${(timeLeft / this.QUESTION_TIME) * 100}%`;
            
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.handleTimeOut();
            }
        }, 1000);
    }
    
    checkAnswer(isCorrect, selectedButton) {
        clearInterval(this.timerInterval);
        
        // تعطيل جميع الأزرار
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.add('disabled');
            btn.disabled = true;
        });
        
        if (isCorrect) {
            // الإجابة الصحيحة
            selectedButton.classList.add('correct');
            this.gameState.player.score += 100;
            this.gameState.correctAnswers++;
            this.showToast('إجابة صحيحة — +100 نقطة', 'success');
        } else {
            // الإجابة الخاطئة
            selectedButton.classList.add('wrong');
            this.gameState.player.score -= 100;
            this.gameState.wrongAnswers++;
            
            // إظهار الإجابة الصحيحة
            const correctIndex = this.gameState.questions[this.gameState.currentQuestion].correct;
            document.querySelectorAll('.option-btn')[correctIndex].classList.add('correct');
            
            this.showToast('إجابة خاطئة — -100 نقطة', 'error');
        }
        
        this.updatePlayerInfo();
        
        // الانتقال للسؤال التالي بعد تأخير
        setTimeout(() => {
            this.gameState.currentQuestion++;
            this.displayQuestion();
        }, 2000);
    }
    
    handleTimeOut() {
        this.showToast('انتهى الوقت! -100 نقطة', 'error');
        this.gameState.player.score -= 100;
        this.gameState.wrongAnswers++;
        this.updatePlayerInfo();
        
        // الانتقال للسؤال التالي بعد تأخير
        setTimeout(() => {
            this.gameState.currentQuestion++;
            this.displayQuestion();
        }, 2000);
    }
    
    useHelper(helperType) {
        if (this.gameState.player.score < this.getHelperCost(helperType)) {
            this.showToast('لا توجد نقاط كافية لاستخدام هذه المساعدة', 'error');
            return;
        }
        
        switch (helperType) {
            case 'fiftyFifty':
                this.useFiftyFifty();
                break;
            case 'freezeTime':
                this.useFreezeTime();
                break;
            case 'changeQuestion':
                this.useChangeQuestion();
                break;
            case 'skipQuestion':
                this.useSkipQuestion();
                break;
        }
        
        // خصم تكلفة المساعدة
        this.gameState.player.score -= this.getHelperCost(helperType);
        this.gameState.helpersUsed[helperType] = true;
        this.updatePlayerInfo();
    }
    
    getHelperCost(helperType) {
        if (helperType === 'skipQuestion') {
            return this.gameState.player.skipCost;
        }
        return 100;
    }
    
    useFiftyFifty() {
        const question = this.gameState.questions[this.gameState.currentQuestion];
        const options = document.querySelectorAll('.option-btn');
        let wrongOptions = [];
        
        // جمع الخيارات الخاطئة
        options.forEach((option, index) => {
            if (index !== question.correct) {
                wrongOptions.push(option);
            }
        });
        
        // اختيار خيارين خاطئين عشوائيًا لإخفائهما
        wrongOptions.sort(() => Math.random() - 0.5);
        wrongOptions.slice(0, 2).forEach(option => {
            option.style.visibility = 'hidden';
        });
        
        this.showToast('تم حذف خيارين خاطئين', 'success');
    }
    
    useFreezeTime() {
        this.isTimeFrozen = true;
        this.showToast('تم تجميد الوقت لمدة 10 ثوان', 'success');
        
        setTimeout(() => {
            this.isTimeFrozen = false;
            this.showToast('انتهى تجميد الوقت', 'info');
        }, 10000);
    }
    
    useChangeQuestion() {
        // استبدال السؤال الحالي بسؤال احتياطي
        // في التطبيق الحقيقي، يمكن جلب سؤال بديل من مجموعة الأسئلة
        this.showToast('تم تغيير السؤال', 'success');
        this.gameState.currentQuestion++;
        this.displayQuestion();
    }
    
    useSkipQuestion() {
        this.gameState.player.skipCount++;
        this.gameState.player.skipCost += this.SKIP_COST_INCREMENT;
        this.showToast(`تم تخطي السؤال -${this.gameState.player.skipCost} نقطة`, 'info');
        
        this.gameState.currentQuestion++;
        this.displayQuestion();
    }
    
    startImpossibleQuestion() {
        this.hideModal('impossible');
        this.gameState.impossibleQuestion.used = true;
        
        // عرض سؤال صعب خاص
        // في التطبيق الحقيقي، يمكن جلب سؤال صعب من مجموعة خاصة
        this.showToast('بدأ تحدي السؤال المستحيل!', 'info');
    }
    
    endGame() {
        clearInterval(this.timerInterval);
        this.hideModal('endConfirm');
        
        // حساب المدة
        const endTime = new Date();
        const duration = endTime - this.gameState.startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        // تحديث شاشة النتائج
        this.elements.displays.resultName.textContent = this.gameState.player.name;
        this.elements.displays.resultCorrect.textContent = this.gameState.correctAnswers;
        this.elements.displays.resultWrong.textContent = this.gameState.wrongAnswers;
        this.elements.displays.resultSkips.textContent = this.gameState.player.skipCount;
        this.elements.displays.resultScore.textContent = this.gameState.player.score;
        this.elements.displays.resultTime.textContent = `${minutes} دقائق و ${seconds} ثواني`;
        
        if (this.gameState.impossibleQuestion.used) {
            this.elements.displays.resultImpossible.textContent = this.gameState.impossibleQuestion.correct ? 
                'إجابة صحيحة' : 'إجابة خاطئة';
        } else {
            this.elements.displays.resultImpossible.textContent = 'لم يُستخدم';
        }
        
        // تحديث مخطط الأداء
        const performancePercent = (this.gameState.correctAnswers / this.gameState.questions.length) * 100;
        document.querySelector('.chart-fill').style.width = `${performancePercent}%`;
        
        let performanceLabel = '';
        if (performancePercent >= 90) performanceLabel = 'ممتاز';
        else if (performancePercent >= 80) performanceLabel = 'جيد جداً';
        else if (performancePercent >= 70) performanceLabel = 'جيد';
        else if (performancePercent >= 60) performanceLabel = 'مقبول';
        else if (performancePercent >= 50) performanceLabel = 'ضعيف';
        else if (performancePercent >= 30) performanceLabel = 'سيئ';
        else performanceLabel = 'سيئ جداً';
        
        document.querySelector('.chart-label').textContent = performanceLabel;
        
        // إرسال النتائج إلى الخادم
        this.sendResultsToServer(duration);
        
        // عرض شاشة النتائج
        this.showScreen('results');
    }
    
    async sendResultsToServer(duration) {
        const data = {
            deviceId: this.getDeviceId(),
            playerName: this.gameState.player.name,
            avatarId: this.gameState.player.avatar,
            startTime: this.gameState.startTime.toISOString(),
            endTime: new Date().toISOString(),
            durationSeconds: Math.floor(duration / 1000),
            status: "finished",
            numQuestions: this.gameState.questions.length,
            correctAnswers: this.gameState.correctAnswers,
            wrongAnswers: this.gameState.wrongAnswers,
            skips: this.gameState.player.skipCount,
            usedFiftyFifty: this.gameState.helpersUsed.fiftyFifty ? 1 : 0,
            usedFreeze: this.gameState.helpersUsed.freezeTime ? 1 : 0,
            usedSwap: this.gameState.helpersUsed.changeQuestion ? 1 : 0,
            impossibleUsed: this.gameState.impossibleQuestion.used ? 1 : 0,
            impossibleCorrect: this.gameState.impossibleQuestion.correct ? 1 : 0,
            scoreBeforeImpossible: this.gameState.player.score,
            finalScore: this.gameState.player.score,
            roundDifficulty: "normal",
            attemptsSummary: JSON.stringify({}),
            userAgent: navigator.userAgent
        };
        
        try {
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log("Results sent to server:", result);
        } catch (error) {
            console.error("Error sending results to server:", error);
            // حفظ البيانات محلياً لإعادة إرسالها لاحقاً
            this.saveResultsLocally(data);
        }
    }
    
    saveResultsLocally(data) {
        let pendingResults = JSON.parse(localStorage.getItem('pendingResults') || '[]');
        pendingResults.push(data);
        localStorage.setItem('pendingResults', JSON.stringify(pendingResults));
    }
    
    getDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }
    
    async showLeaderboard() {
        this.showScreen('leaderboard');
        
        try {
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ action: "getLeaderboard" })
            });
            const result = await response.json();
            
            if (result.success && result.leaderboard) {
                this.displayLeaderboard(result.leaderboard);
            } else {
                this.displayLeaderboard([]);
            }
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            this.displayLeaderboard([]);
        }
    }
    
    displayLeaderboard(leaderboardData) {
        const tbody = document.querySelector('.leaderboard-table tbody');
        tbody.innerHTML = '';
        
        if (leaderboardData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">لا توجد بيانات متاحة</td></tr>';
            return;
        }
        
        leaderboardData.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            // إضافة أيقونة للثلاثة الأوائل
            let rankDisplay = row[0];
            if (row[0] === 1) rankDisplay = '🥇 ' + rankDisplay;
            else if (row[0] === 2) rankDisplay = '🥈 ' + rankDisplay;
            else if (row[0] === 3) rankDisplay = '🥉 ' + rankDisplay;
            
            tr.innerHTML = `
                <td>${rankDisplay}</td>
                <td>${row[1]}</td>
                <td>${row[3]}</td>
                <td>${row[4]}</td>
            `;
            
            tbody.appendChild(tr);
        });
    }
    
    restartGame() {
        // إعادة تعيين حالة اللعبة
        this.gameState.player.score = 100;
        this.gameState.player.skipCount = 0;
        this.gameState.player.skipCost = this.SKIP_BASE_COST;
        this.gameState.currentQuestion = 0;
        this.gameState.correctAnswers = 0;
        this.gameState.wrongAnswers = 0;
        this.gameState.helpersUsed = {
            fiftyFifty: false,
            freezeTime: false,
            changeQuestion: false,
            skipQuestion: false
        };
        this.gameState.impossibleQuestion = {
            used: false,
            correct: false
        };
        
        this.updatePlayerInfo();
        this.startGame();
    }
    
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // تغيير الأيقونة
        const icon = this.elements.buttons.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // إزالة الإشعار بعد 3 ثوان
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    shareOnX() {
        const shareText = `شاركني نتائجي في مسابقة المعلومات! حصلت على ${this.gameState.player.score} نقطة. جربها بنفسك!`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(shareUrl, '_blank');
    }
    
    shareOnInstagram() {
        this.showToast('انسخ النتائج والصقها في إنستغرام', 'info');
        
        const shareText = `نتائجي في مسابقة المعلومات:
الاسم: ${this.gameState.player.name}
النقاط: ${this.gameState.player.score}
الإجابات الصحيحة: ${this.gameState.correctAnswers}
        
جرب المسابقة بنفسك!`;
        
        // نسخ النص إلى الحافظة
        navigator.clipboard.writeText(shareText).then(() => {
            console.log('Results copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy results: ', err);
        });
    }
}

// تهيئة اللعبة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
    
    // تحميل سمة الواجهة المحفوظة
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
});
