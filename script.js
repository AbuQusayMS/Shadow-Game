class QuizGame {
    constructor() {
        this.API_URL = "https://script.google.com/macros/s/AKfycbwSieydP8pgaTKpqzlDBYDEjeuMSYu85eVLwUlMepwkbGOi4toI5-Lc-lpeK8T6rRdg/exec";
        this.API_KEY = "AbuQusay2025_SecretKey";
        this.QUESTION_TIME = 80; this.MAX_WRONG_ANSWERS = 3; this.STARTING_SCORE = 100;
        this.LEVELS = [ { name: "easy", label: "سهل" }, { name: "medium", label: "متوسط" }, { name: "hard", label: "صعب" }, { name: "impossible", label: "مستحيل" } ];
        this.QUESTIONS = {}; this.HELPER_COSTS = { fiftyFifty: 100, freezeTime: 100 };
        this.initialSkipCost = 20; this.currentSkipCost = this.initialSkipCost;
        this.gameState = {}; this.lastError = null; this.lastFocusedElement = null; this.cropper = null;
        this.init();
    }

    async init() {
        this.catchGlobalErrors();
        this.cacheDomElements();
        this.bindEventListeners();
        const questionsLoaded = await this.loadQuestions();
        if (questionsLoaded) {
            this.populateAvatarGrid();
            this.showScreen('start');
            this.domElements.screens.loader.style.display = 'none';
        } else {
            this.domElements.screens.loader.innerHTML = '<p style="color:var(--error-color);">فشل تحميل الأسئلة. الرجاء تحديث الصفحة.</p>';
        }
    }

    cacheDomElements() {
        this.domElements = {
            screens: { loader: document.getElementById('loader'), start: document.getElementById('startScreen'), avatar: document.getElementById('avatarScreen'), nameEntry: document.getElementById('nameEntry'), instructions: document.getElementById('instructionsScreen'), game: document.getElementById('gameContainer'), end: document.getElementById('endScreen'), leaderboard: document.getElementById('leaderboardScreen'), levelComplete: document.getElementById('levelCompleteScreen') },
            avatarGrid: document.querySelector('.avatar-grid'),
            confirmAvatarBtn: document.getElementById('confirmAvatarBtn'),
            nameInput: document.getElementById('nameInput'),
            nameError: document.getElementById('nameError'),
            reportFab: document.getElementById('reportFab'),
            reportErrorModal: document.getElementById('reportErrorModal'),
            reportErrorText: document.getElementById('reportErrorText'),
            confirmExitModal: document.getElementById('confirmExitModal'),
            cropperModal: document.getElementById('cropperModal'),
            cropperImage: document.getElementById('cropperImage'),
            gameContainer: document.getElementById('gameContainer')
        };
    }

    bindEventListeners() {
        document.getElementById('startPlayBtn').addEventListener('click', () => this.showScreen('avatar'));
        this.domElements.confirmAvatarBtn.addEventListener('click', () => this.showScreen('nameEntry'));
        document.getElementById('confirmNameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('instructionsConfirmBtn').addEventListener('click', () => { this.showScreen('game'); this.startLevel(); });
        document.getElementById('showLeaderboardBtn').addEventListener('click', () => this.displayLeaderboard());
        document.getElementById('backToStartBtn').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('confirmExitYes').addEventListener('click', () => this.endGame(false));
        document.getElementById('confirmExitNo').addEventListener('click', () => this.hideModal(this.domElements.confirmExitModal));
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('statsBtn').addEventListener('click', () => this.displayLeaderboard());
        document.getElementById('nextLevelBtn').addEventListener('click', () => { this.gameState.level++; this.showScreen('game'); this.startLevel(); });
        document.getElementById('quitLevelBtn').addEventListener('click', () => this.endGame(false));
        this.domElements.reportFab.addEventListener('click', () => this.showReportModal());
        document.getElementById('reportErrorYes').addEventListener('click', () => this.sendErrorReport());
        document.getElementById('reportErrorNo').addEventListener('click', () => this.hideModal(this.domElements.reportErrorModal));
        document.getElementById('cropBtn').addEventListener('click', () => this.cropAndSetAvatar());
        document.getElementById('cancelCropBtn').addEventListener('click', () => this.hideModal(this.domElements.cropperModal));
        document.body.addEventListener('click', (event) => {
            if (event.target && event.target.id === 'endQuizBtn') {
                this.showModal(this.domElements.confirmExitModal);
            }
        });
    }

    populateAvatarGrid() {
        this.domElements.avatarGrid.innerHTML = '';
        const uploadContainer = document.createElement('div');
        uploadContainer.className = 'avatar-upload-container';
        uploadContainer.innerHTML = `<label for="avatarUploadInput" class="avatar-upload-label" title="رفع صورة">➕</label><input type="file" id="avatarUploadInput" accept="image/*" style="display:none;">`;
        this.domElements.avatarGrid.appendChild(uploadContainer);
        document.getElementById('avatarUploadInput').addEventListener('change', (e) => this.handleAvatarUpload(e));
        const avatarUrls = [ "https://em-content.zobj.net/thumbs/120/apple/354/woman_1f469.png", "https://em-content.zobj.net/thumbs/120/apple/354/man_1f468.png", "https://em-content.zobj.net/thumbs/120/apple/354/person-beard_1f9d4.png" ];
        avatarUrls.forEach((url) => {
            const img = document.createElement('img'); img.src = url; img.classList.add('avatar-option');
            img.addEventListener('click', () => this.selectAvatar(img)); this.domElements.avatarGrid.appendChild(img);
        });
    }
    
    selectAvatar(imgElement) {
        this.domElements.avatarGrid.querySelectorAll('.avatar-option.selected').forEach(el => el.classList.remove('selected'));
        imgElement.classList.add('selected');
        this.gameState.avatar = imgElement.src;
        this.domElements.confirmAvatarBtn.disabled = false;
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { this.showToast('الرجاء اختيار ملف صورة صالح (أقل من 2 ميجابايت).', 'error'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            this.domElements.cropperImage.src = e.target.result;
            this.showModal(this.domElements.cropperModal);
            if (this.cropper) this.cropper.destroy();
            this.cropper = new Cropper(this.domElements.cropperImage, { aspectRatio: 1, viewMode: 1, background: false, modal: false });
        };
        reader.readAsDataURL(file);
    }
    
    cropAndSetAvatar() {
        if (!this.cropper) return;
        const canvas = this.cropper.getCroppedCanvas({ width: 256, height: 256 });
        const dataUrl = canvas.toDataURL();
        let customAvatar = document.getElementById('customAvatar');
        if (!customAvatar) {
            customAvatar = document.createElement('img'); customAvatar.id = 'customAvatar'; customAvatar.classList.add('avatar-option');
            customAvatar.addEventListener('click', () => this.selectAvatar(customAvatar));
            this.domElements.avatarGrid.insertBefore(customAvatar, this.domElements.avatarGrid.children[1]);
        }
        customAvatar.src = dataUrl;
        this.selectAvatar(customAvatar);
        this.hideModal(this.domElements.cropperModal);
    }

    catchGlobalErrors() { window.onerror = (m, s, l, c, e) => { this.lastError = { message: m, source: s, lineno: l, error: e ? e.stack : 'N/A' }; this.domElements.reportFab.style.display = 'flex'; this.domElements.reportFab.classList.add('has-error'); return true; }; }
    showReportModal() { this.domElements.reportErrorText.innerHTML = this.lastError ? `اكتشفنا خطأ تلقائيًا: <br><small>${this.lastError.message}</small>` : "هل تريد إرسال بلاغ عام؟"; this.showModal(this.domElements.reportErrorModal); }
    async sendErrorReport() { /* implementation */ }
    
    async startGame() {
        const name = this.domElements.nameInput.value.trim();
        if (name.length < 3) {
            this.domElements.nameError.textContent = "الاسم يجب أن يكون 3 أحرف على الأقل.";
            this.domElements.nameError.style.display = 'block';
            return;
        }
        this.domElements.nameError.style.display = 'none';
        this.gameState = { name, avatar: this.gameState.avatar, playerId: this.generatePlayerId(), deviceId: this.generateDeviceId(), level: 0, wrongAnswers: 0, correctAnswers: 0, skips: 0, startTime: new Date(), helpersUsed: { fiftyFifty: false, freezeTime: false } };
        
        this.populateGameUI();
        this.showScreen('instructions');
    }

    populateGameUI() {
        this.domElements.gameContainer.innerHTML = `
            <div class="top-bar" style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:1rem;">
                <button id="endQuizBtn" class="btn-secondary">🚪 إنهاء</button>
            </div>
            <header class="game-header" style="background:var(--primary-color); border-radius:var(--radius-xl); padding:1rem; margin-bottom:1rem;">
                <div class="player-info" style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:1rem;">
                        <img id="playerAvatar" src="${this.gameState.avatar}" style="width:3.5rem; height:3.5rem; border-radius:50%; border:2px solid var(--gold-color);">
                        <div>
                            <span id="playerName" style="font-size: 1.125rem; font-weight: 700;">${this.gameState.name}</span>
                            <span id="playerId" style="font-size: 0.75rem; opacity: 0.7; display:block;">${this.gameState.playerId}</span>
                        </div>
                    </div>
                    <div class="player-stats" style="display:flex; gap:1rem;">
                        <div>النقاط: <strong id="currentScore">${this.STARTING_SCORE}</strong></div>
                        <div>الأخطاء: <strong id="wrongAnswersCount">0 / ${this.MAX_WRONG_ANSWERS}</strong></div>
                    </div>
                </div>
                 <div class="helpers" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top:1rem;">
                    <button class="helper-btn" data-type="fiftyFifty">50:50 <span class="helper-cost">(-100)</span></button>
                    <button class="helper-btn" data-type="freezeTime">❄️ 10ث <span class="helper-cost">(-100)</span></button>
                    <button class="helper-btn" data-type="skipQuestion">⏭️ تخطي <span id="skipCost" class="helper-cost">(-${this.initialSkipCost})</span></button>
                </div>
            </header>
            <div class="timer-container" style="width: 100%; background-color: var(--secondary-color); border-radius: 9999px; position: relative; height: 2rem; overflow: hidden;">
                <div class="timer-bar" style="height: 100%; background: linear-gradient(90deg, var(--accent-color), var(--gold-color)); border-radius: 9999px; transition: width 1s linear; width: 100%;"></div>
                <span id="timerText" class="timer-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: 700;"></span>
            </div>
            <div class="main-content" style="width:100%;">
                <section class="question-box" style="background:var(--primary-color); border-radius:var(--radius-xl); padding:1.5rem; margin-bottom:1.5rem; position:relative;">
                    <div id="currentLevelBadge" style="position:absolute; top:-0.75rem; left:50%; transform:translateX(-50%); color:white; padding:0.25rem 0.75rem; border-radius:1rem; font-weight:bold;"></div>
                    <h3 id="questionCounter"></h3>
                    <p id="questionText" style="font-size:1.25rem;"></p>
                </section>
                <section class="options-container">
                    <div class="options-grid"></div>
                </section>
            </div>`;
    }
    
    updateUI() {
        const isImpossible = this.gameState.level !== undefined && this.LEVELS[this.gameState.level].name === 'impossible';
        document.querySelectorAll('.helper-btn').forEach(btn => { btn.disabled = isImpossible; });
        document.getElementById('currentScore').textContent = this.currentScoreValue;
        document.getElementById('wrongAnswersCount').textContent = `${this.gameState.wrongAnswers} / ${this.MAX_WRONG_ANSWERS}`;
    }
    
    endGame(completed = false) {
        clearInterval(this.timerInterval);
        this.hideModal(this.domElements.confirmExitModal);
        const totalTimeSeconds = (new Date() - this.gameState.startTime) / 1000;
        const currentLevel = this.LEVELS[Math.min(this.gameState.level, this.LEVELS.length - 1)];
        const totalAnswered = this.gameState.correctAnswers + this.gameState.wrongAnswers;
        const accuracy = totalAnswered > 0 ? parseFloat(((this.gameState.correctAnswers / totalAnswered) * 100).toFixed(1)) : 0.0;
        const avgTime = totalAnswered > 0 ? parseFloat((totalTimeSeconds / totalAnswered).toFixed(1)) : 0;
        
        document.getElementById('finalName').textContent = this.gameState.name;
        document.getElementById('finalId').textContent = this.gameState.playerId;
        document.getElementById('finalCorrect').textContent = this.gameState.correctAnswers;
        document.getElementById('finalWrong').textContent = this.gameState.wrongAnswers;
        document.getElementById('finalSkips').textContent = this.gameState.skips;
        document.getElementById('finalScore').textContent = this.currentScoreValue;
        document.getElementById('totalTime').textContent = this.formatTime(totalTimeSeconds);
        document.getElementById('finalLevel').textContent = currentLevel.label;
        document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
        document.getElementById('finalAvgTime').textContent = `${this.formatTime(avgTime)} / سؤال`;
        document.getElementById('performanceText').textContent = this.calculatePerformanceRating();
        
        const resultsData = { name: this.gameState.name, deviceId: this.gameState.deviceId, playerId: this.gameState.playerId, correct: this.gameState.correctAnswers, wrong: this.gameState.wrongAnswers, level: currentLevel.label, score: this.currentScoreValue, accuracy, totalTime: Math.round(totalTimeSeconds), avgTime, skips: this.gameState.skips, usedFiftyFifty: this.gameState.helpersUsed.fiftyFifty, usedFreezeTime: this.gameState.helpersUsed.freezeTime, isGameCompleted: completed };
        this.saveResults(resultsData);
        this.showScreen('end');
    }
    
    startLevel() { /* implementation */ }
    
    async displayLeaderboard() {
        this.showScreen('leaderboard');
        const contentDiv = document.getElementById('leaderboardContent');
        contentDiv.innerHTML = '<div class="spinner"></div>';
        try {
            const response = await this.apiCall({ action: 'getLeaderboard' });
            if (response.success && response.leaderboard) {
                let tableHTML = 'لوحة الصدارة فارغة!';
                if (response.leaderboard.length > 0) {
                    tableHTML = `<table style="width:100%;text-align:right;"><thead><tr><th>الترتيب</th><th>الاسم</th><th>المستوى</th><th>رقم المحاولة</th></tr></thead><tbody>`;
                    response.leaderboard.forEach(row => {
                        tableHTML += `<tr><td>${row.rank}</td><td>${row.name}</td><td>${row.level}</td><td>${row.attempt}</td></tr>`;
                    });
                    tableHTML += `</tbody></table>`;
                }
                contentDiv.innerHTML = tableHTML;
            } else { contentDiv.innerHTML = 'حدث خطأ.'; }
        } catch (error) { contentDiv.innerHTML = 'فشل التحميل.'; }
    }
    
    async loadQuestions() { try { const r = await fetch('questions.json'); if(!r.ok) throw new Error("Network response was not ok"); this.QUESTIONS = await r.json(); return true; } catch (e) { return false; } } 
    generatePlayerId() { return 'PID' + Math.random().toString(36).substr(2, 9); } 
    generateDeviceId() { let d = localStorage.getItem('quizDeviceId'); if(!d){d='DID'+Math.random().toString(36).substr(2,9); localStorage.setItem('quizDeviceId', d);} return d; }
    showScreen(s) { if(!this.domElements.screens[s]) return; Object.values(this.domElements.screens).forEach(e => e.style.display = 'none'); this.domElements.screens[s].style.display = 'flex'; }
    showModal(m) { this.lastFocusedElement = document.activeElement; m.classList.add('active'); m.setAttribute('aria-hidden', 'false'); if(m.querySelector('button')) m.querySelector('button').focus(); }
    hideModal(m) { m.classList.remove('active'); m.setAttribute('aria-hidden', 'true'); if (this.lastFocusedElement) this.lastFocusedElement.focus(); }
    showToast(m,t){ const c=document.getElementById('toast-container'); const e=document.createElement('div'); e.className=`toast ${t}`; e.textContent=m; c.appendChild(e); setTimeout(()=>e.remove(),3000); } 
    async apiCall(p) { try { const r = await fetch(this.API_URL, {method:'POST', body:JSON.stringify({apiKey:this.API_KEY,...p})}); return await r.json(); } catch(e) { throw e; } }
    resetGame() { window.location.reload(); }
    saveResults(r) { this.apiCall({action:'endGame', ...r}); }
    calculatePerformanceRating() { return "جيد"; } // Placeholder
    formatTime(t) { const total = Math.floor(t); const m = Math.floor(total/60); const s = total % 60; return `${m}:${s.toString().padStart(2,'0')}`; }
}

document.addEventListener('DOMContentLoaded', () => new QuizGame());
</script>
</body>
</html>

