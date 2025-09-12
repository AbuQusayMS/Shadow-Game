// ADDED: Centralized game configuration for easy editing
const GAME_CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbxswUSDuszaAyDlNBCi3ugsu11NQW6g0vu1BQI0XM58xbTk8G5eE5gV8PNSbSshCmkBDw/exec", // <-- Keep your API URL
    QUESTION_TIME: 80,
    TOTAL_AVATARS: 16,
    LIMIT_PER_DAY: 2,
    MAX_WRONG_ANSWERS: 3,
    POINTS_PER_QUESTION: 100, // Req 2
    STARTING_SCORE: 100,       // Req 4
    IMPOSSIBLE_QUESTION: {      // Req 5
        q: "كم عدد حبات الرمل الموجودة على كوكب الأرض؟",
        options: ["أكثر من عدد النجوم في الكون", "أقل من عدد النجوم في الكون", "يستحيل معرفة ذلك", "عددها لا نهائي"],
        correct: 2 // Index of the correct answer
    },
    HELPER_COSTS: {
        fiftyFifty: 100,
        freezeTime: 100,
        nextQuestion: { // Req 3
            base: 100,
            increment: 50
        }
    }
};


class QuizGame {
    constructor() {
        // Use constants from GAME_CONFIG
        this.API_URL = GAME_CONFIG.API_URL;
        this.QUESTION_TIME = GAME_CONFIG.QUESTION_TIME;
        this.TOTAL_AVATARS = GAME_CONFIG.TOTAL_AVATARS;
        this.LIMIT_PER_DAY = GAME_CONFIG.LIMIT_PER_DAY;
        this.MAX_WRONG_ANSWERS = GAME_CONFIG.MAX_WRONG_ANSWERS;

        // All questions can be increased or decreased here without issues (Req 1)
        const allQuestions = [
            { q: "ماذا قال آرثر عن ليليا (صديقة إيلي) عندما سأله جارود ريدنر عنها في الحفلة؟", options: ["إنها جميلة جدًا ولكنها ليست من نوعه", "إنها فتاة جيدة، وآمل أن تعاملها بشكل جيد", "إنها تذكره بطفولته", "إنه لا يعرفها جيداً"], correct: 1 },
            { q: "ما هي الصفة التي وصف بها آرثر صديقه إيلايجا؟", options: ["شخص عاطفي ولكنه يملك مبادئ وجديراً بالثقة", "شخص بارد ومنغلق على نفسه", "شخص عاطفي وضعيف وهش من الداخل", "شخص قاسي وعديم الخبرة"], correct: 0 },
            // ... Add or remove as many questions as you want here
        ];

        this.backupQuestion = allQuestions.pop();
        this.QUESTIONS = allQuestions;

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
        
        this.HELPER_COSTS = GAME_CONFIG.HELPER_COSTS;
        this.isTimeFrozen = false;
        this.gameState = {};
        this.currentScoreValue = 0;
        this.timerInterval = null;
        this.answerSubmitted = false;
        this.domElements = {};

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
                // ADDED: Pre-end screen for impossible question choice
                preEnd: document.getElementById('preEndScreen'),
                end: document.getElementById('endScreen'),
                leaderboard: document.getElementById('leaderboardScreen'),
            },
            // ... (rest of the cached elements are the same)
        };
    }
    
    bindEventListeners() {
        // ... (most listeners are the same)
        // ADDED: Listeners for the new pre-end screen
        document.getElementById('tryImpossibleBtn').addEventListener('click', () => this.startImpossibleQuestion());
        document.getElementById('showResultsBtn').addEventListener('click', () => this.displayEndScreen());
        // ...
    }

    // ... (populateAvatarGrid and showWelcomeScreen are the same)

    async startGame() {
        this.showLoader(); // Req 7: Show loader during API call
        try {
            const response = await this.apiCall({
                action: 'start',
                deviceId: this.getDeviceId(),
                name: this.gameState.name,
            });
            this.hideLoader(); // Req 7: Hide loader after API call

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
            this.hideLoader(); // Req 7
            this.showToast("حدث خطأ في الاتصال بالخادم.", "error");
            this.showScreen('start');
        }
    }

    // ... (shuffleQuestions is the same)
    
    fetchQuestion() {
        if (this.gameState.currentQuestion >= this.QUESTIONS.length) {
            this.endGame();
            return;
        }
        const currentQuestionData = this.QUESTIONS[this.gameState.currentQuestion];
        this.displayQuestion(currentQuestionData);
    }
    
    // ... (displayQuestion is mostly the same)

    checkAnswer(isCorrect, selectedButton) {
        if (this.answerSubmitted) return;
        this.answerSubmitted = true;
        
        clearInterval(this.timerInterval);
        document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

        if (isCorrect) {
            selectedButton.classList.add('correct');
            // CHANGED: Use fixed points per question (Req 2)
            this.updateScore(this.currentScoreValue + GAME_CONFIG.POINTS_PER_QUESTION);
        } else {
            selectedButton.classList.add('wrong');
            const correctButton = this.domElements.optionsGrid.querySelector('[data-correct="true"]');
            if (correctButton) correctButton.classList.add('correct');
            this.gameState.wrongAnswers++;
        }

        this.gameState.currentQuestion++;
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
    
    // CHANGED: This function now just shows the choice screen (Req 5)
    endGame() {
        clearInterval(this.timerInterval);
        this.showScreen('preEnd');
    }
    
    // ADDED: Logic to start the impossible question (Req 5)
    startImpossibleQuestion() {
        this.showScreen('game'); // Reuse the game screen UI
        this.domElements.helperBtns.forEach(btn => btn.disabled = true); // Disable all helpers
        document.querySelector('.timer-container').style.display = 'none'; // Hide timer
        
        const questionData = GAME_CONFIG.IMPOSSIBLE_QUESTION;
        this.domElements.questionText.textContent = questionData.q;
        document.getElementById('questionCounter').textContent = "السؤال المستحيل";
        this.domElements.optionsGrid.innerHTML = '';

        questionData.options.forEach((optionText, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = optionText;
            const isCorrect = index === questionData.correct;
            button.addEventListener('click', () => this.checkImpossibleAnswer(isCorrect, button));
            this.domElements.optionsGrid.appendChild(button);
        });
    }

    // ADDED: Logic to check the impossible question's answer (Req 5 & 6)
    async checkImpossibleAnswer(isCorrect, selectedButton) {
        this.showLoader();
        document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));

        if (isCorrect) {
            selectedButton.classList.add('correct');
            this.gameState.impossibleStatus = 'نجح بالإجابة';
            try {
                const response = await this.apiCall({
                    action: 'impossibleSuccess',
                    deviceId: this.getDeviceId(),
                    name: this.gameState.name,
                });
                if (response.success) {
                    this.gameState.impossibleRank = response.rank;
                }
            } catch (e) {
                console.error("Failed to record impossible win", e);
            }
        } else {
            selectedButton.classList.add('wrong');
            this.gameState.impossibleStatus = 'فشل بالإجابة';
        }

        setTimeout(() => {
            this.hideLoader();
            this.displayEndScreen();
        }, 2000);
    }

    // ADDED: This new function displays the final results and saves data (Req 6)
    async displayEndScreen() {
        const totalTimeSeconds = (new Date() - new Date(this.gameState.startTime)) / 1000;
        
        // Find title based on score (Req 1)
        const finalTitle = [...this.PRIZES].reverse().find(p => this.currentScoreValue >= p.points)?.title || "لا يوجد";
        
        const helpersUsedCount = Object.values(this.gameState.helpersUsed).filter(Boolean).length + this.gameState.nextQuestionUses;

        // Prepare final stats object
        this.gameState.finalStats = {
            name: this.gameState.name,
            title: finalTitle,
            time: this.formatTime(totalTimeSeconds),
            impossibleStatus: this.gameState.impossibleStatus,
            impossibleRank: this.gameState.impossibleRank || 0
        };

        // Populate the end screen
        document.getElementById('finalName').textContent = this.gameState.finalStats.name;
        document.getElementById('finalTitle').textContent = this.gameState.finalStats.title;
        document.getElementById('totalTime').textContent = this.gameState.finalStats.time;
        document.getElementById('finalImpossibleStatus').textContent = this.gameState.finalStats.impossibleStatus;

        const rankContainer = document.getElementById('finalImpossibleRankContainer');
        if (this.gameState.finalStats.impossibleStatus === 'نجح بالإجابة') {
            document.getElementById('finalImpossibleRank').textContent = `${this.getOrdinal(this.gameState.finalStats.impossibleRank)} 🏅`;
            rankContainer.style.display = 'block';
        } else {
            rankContainer.style.display = 'none';
        }
        
        this.showScreen('end');
        
        // Send all data to the backend for logging (Req 8)
        try {
            await this.apiCall({
                action: 'end',
                attemptId: this.gameState.attemptId,
                deviceId: this.gameState.deviceId,
                name: this.gameState.name,
                score: this.currentScoreValue,
                finalTitle: finalTitle,
                totalTime: this.gameState.finalStats.time,
                helpersUsedCount: helpersUsedCount,
                impossibleStatus: this.gameState.impossibleStatus,
                impossibleRank: this.gameState.impossibleRank
            });
        } catch(error) {
            console.error("Failed to save final score:", error);
            this.showToast("فشل حفظ النتيجة النهائية.", "error");
        }
    }
    
    useHelper(event) {
        const btn = event.currentTarget;
        const type = btn.dataset.type;

        if (type === 'nextQuestion') {
            const costConfig = this.HELPER_COSTS.nextQuestion;
            const cost = costConfig.base + (this.gameState.nextQuestionUses * costConfig.increment);
            if (this.currentScoreValue < cost) {
                this.showToast("نقاطك غير كافية!", "error");
                return;
            }
            this.updateScore(this.currentScoreValue - cost);
            this.gameState.nextQuestionUses++;
            this.showToast(`تم استخدام المساعدة!`, "success");
            this.gameState.currentQuestion++; // Skip to the next question index
            this.fetchQuestion();
            this.updateUI(); // Update UI to reflect new score and next cost
            return;
        }

        const cost = this.HELPER_COSTS[type];
        if (this.currentScoreValue < cost) {
            this.showToast("نقاطك غير كافية!", "error");
            return;
        }

        this.updateScore(this.currentScoreValue - cost);
        this.gameState.helpersUsed[type] = true;
        btn.disabled = true;
        this.showToast(`تم استخدام المساعدة!`, "success");

        // ... (fiftyFifty and freezeTime logic remains the same)
        this.updateUI();
    }
    
    // ... (startTimer is the same)
    
    updateScore(newScore) {
        this.currentScoreValue = newScore;
        this.domElements.scoreDisplay.textContent = this.formatNumber(this.currentScoreValue);
        this.updateUI();
    }

    updateUI() {
        document.getElementById('wrongAnswersCount').textContent = `${this.gameState.wrongAnswers} / ${this.MAX_WRONG_ANSWERS}`;
        const currentTitle = [...this.PRIZES].reverse().find(p => this.currentScoreValue >= p.points)?.title || "لا يوجد";
        document.getElementById('currentTitle').textContent = currentTitle;

        if (this.domElements.attemptsLeft) {
            this.domElements.attemptsLeft.textContent = `${this.gameState.attemptsLeft || this.LIMIT_PER_DAY} / ${this.LIMIT_PER_DAY}`;
        }
        
        this.updatePrizesList();

        this.domElements.helperBtns.forEach(btn => {
            const type = btn.dataset.type;
            if (type === 'nextQuestion') {
                const costConfig = this.HELPER_COSTS.nextQuestion;
                const cost = costConfig.base + (this.gameState.nextQuestionUses * costConfig.increment);
                btn.querySelector('.helper-cost').textContent = `(${cost})`;
                btn.disabled = this.currentScoreValue < cost;
            } else {
                const helperIsUsed = this.gameState.helpersUsed[type];
                btn.disabled = helperIsUsed || this.currentScoreValue < this.HELPER_COSTS[type];
            }
        });
    }

    // ... (generatePrizesList is the same)
    
    updatePrizesList() {
        const items = this.domElements.prizesList.querySelectorAll('li');
        items.forEach((item, index) => {
            item.classList.remove('current', 'past');
            const prizeIndex = this.PRIZES.length - 1 - index;
            const prizePoints = this.PRIZES[prizeIndex].points;
            if (this.currentScoreValue >= prizePoints) {
                item.classList.add('past');
            }
        });
        const nextPrize = this.PRIZES.find(p => p.points > this.currentScoreValue);
        if(nextPrize) {
            const nextPrizeIndex = this.PRIZES.indexOf(nextPrize);
            const itemIndex = this.PRIZES.length - 1 - nextPrizeIndex;
            if(items[itemIndex]) items[itemIndex].classList.add('current');
        }
    }

    async displayLeaderboard() {
        this.showScreen('loader'); // Req 7
        const contentDiv = document.getElementById('leaderboardContent');
        contentDiv.innerHTML = '<div class="spinner"></div>';

        try {
            const response = await this.apiCall({ action: 'getLeaderboard' });
            this.hideLoader(); // Req 7
            if (response && response.success && response.leaderboard) {
                let tableHTML = '<p>لوحة الصدارة فارغة حاليًا!</p>';
                if (response.leaderboard.length > 0) {
                    tableHTML = `<table class="leaderboard-table">
                        <tr><th>الترتيب</th><th>الاسم</th><th>النقاط</th><th>اللقب</th><th>⭐</th></tr>
                        ${response.leaderboard.map(row => `
                            <tr class="${row[5] ? 'impossible-winner' : ''}">
                                <td>${['🥇', '🥈', '🥉'][row[0] - 1] || row[0]}</td>
                                <td>${row[1]}</td>
                                <td>${this.formatNumber(row[2])}</td>
                                <td>${row[3]}</td>
                                <td>${row[5] || ''}</td>
                            </tr>`).join('')}
                    </table>`;
                }
                contentDiv.innerHTML = tableHTML;
            } else {
                contentDiv.innerHTML = '<p>حدث خطأ في تحميل لوحة الصدارة.</p>';
            }
        } catch (error) {
            this.hideLoader(); // Req 7
            console.error("Error loading leaderboard:", error);
            contentDiv.innerHTML = '<p>حدث خطأ في تحميل لوحة الصدارة.</p>';
        }
    }
    
    // CHANGED: Updated share text to include new info (Req 6)
    getShareText() {
        const { name, title, time, impossibleStatus, impossibleRank } = this.gameState.finalStats;
        let shareText = `✨ نتائجي في مسابقة "من سيربح اللقب" ✨\n` +
               `الاسم: ${name}\n` +
               `اللقب: ${title}\n` +
               `المدة: ${time}\n`;
        
        if(impossibleStatus === 'نجح بالإجابة') {
            shareText += `🎖️ السؤال المستحيل: ${this.getOrdinal(impossibleRank)} 🏅\n\n`;
        } else {
            shareText += `🤯 السؤال المستحيل: ${impossibleStatus}\n\n`;
        }
        
        shareText += `🔗 جرب حظك أنت أيضاً: https://abuqusayms.github.io/Tbate-Game/`; // <-- Replace with your link
        return shareText;
    }
    
    // ... (shareOnX and shareOnInstagram are the same)

    resetGameState(attemptId) {
        this.gameState = {
            deviceId: this.getDeviceId(),
            attemptId: attemptId,
            name: this.gameState.name,
            avatar: this.gameState.avatar,
            currentQuestion: 0,
            wrongAnswers: 0,
            startTime: new Date().toISOString(),
            helpersUsed: { fiftyFifty: false, freezeTime: false },
            nextQuestionUses: 0, // ADDED
            impossibleStatus: 'لم يُستخدم', // ADDED
            impossibleRank: 0, // ADDED
        };
        // CHANGED: Start with starting score (Req 4)
        this.updateScore(GAME_CONFIG.STARTING_SCORE);
    }

    // ... (setupGameUI, toggleTheme, loadTheme, toggleSidebar are the same)
    
    // CHANGED: Added showLoader and hideLoader for better UX (Req 7)
    showScreen(screenName) {
        // ... (function logic is the same)
    }

    showLoader() {
        this.domElements.screens.loader.classList.add('active');
    }

    hideLoader() {
        this.domElements.screens.loader.classList.remove('active');
    }

    // ... (showToast, apiCall, getDeviceId, formatTime, formatNumber are the same)

    displayHelperCosts() {
        this.domElements.helperBtns.forEach(btn => {
            const type = btn.dataset.type;
            const costEl = btn.querySelector('.helper-cost');
            if (!costEl) return;
            
            if (type === 'nextQuestion') {
                costEl.textContent = `(${this.HELPER_COSTS.nextQuestion.base})`;
            } else if (this.HELPER_COSTS[type]) {
                costEl.textContent = `(${this.HELPER_COSTS[type]})`;
            }
        });
    }

    // ADDED: Helper to get ordinal numbers like "الأول", "الثاني"
    getOrdinal(n) {
        if (!n || n === 0) return '';
        const ordinals = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
        return ordinals[n - 1] || n;
    }

    // ... (startCooldownTimer is the same)
}

document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});

