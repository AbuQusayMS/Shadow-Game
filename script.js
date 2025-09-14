// --- Google Apps Script Configuration ---
const GOOGLE_APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB9cru35ndWmWYsEqe46NlrvZgj64HhCIZJ0j7SLln3VDSl2S7rAOMDGxLwEzR_ClS/exec";

// --- DOM Element Selectors ---
const appScreens = document.querySelectorAll('.app-screen');
const startButton = document.getElementById('startButton');
const leaderboardButton = document.getElementById('leaderboardButton');
const nextToNameButton = document.getElementById('nextToNameButton');
const confirmNameButton = document.getElementById('confirmNameButton');
const playerNameInput = document.getElementById('playerNameInput');
const nameModal = document.getElementById('name-modal');
const nameErrorMessage = document.getElementById('name-error-message');
const avatarGrid = document.getElementById('avatar-grid');
const quitGameButton = document.getElementById('quitGameButton');
const confirmQuitButton = document.getElementById('confirmQuitButton');
const cancelQuitButton = document.getElementById('cancelQuitButton');
const quitModal = document.getElementById('quit-modal');
const playAgainButton = document.getElementById('playAgainButton');
const backToHomeButton = document.getElementById('backToHomeButton');
const backFromLeaderboard = document.getElementById('backFromLeaderboard');

// --- Game State Variables ---
let player = {};
let gameData = {};
let questions = [];
let currentQuestionIndex = 0;
let timer = null;
let timerSeconds = 80;
let avatarPath = './avatars/'; // Assuming avatars are in a subfolder

// --- Game Assets (can be loaded from a JSON file) ---
const sampleQuestions = [
    { question: "ما هي عاصمة اليابان؟", answers: ["بكين", "طوكيو", "سول", "بانكوك"], correctAnswer: "طوكيو" },
    { question: "ما هو أكبر محيط في العالم؟", answers: ["المحيط الأطلسي", "المحيط الهندي", "المحيط الهادئ", "المحيط المتجمد الجنوبي"], correctAnswer: "المحيط الهادئ" },
    { question: "كم عدد الكواكب في المجموعة الشمسية؟", answers: ["ثمانية", "تسعة", "عشرة", "سبعة"], correctAnswer: "ثمانية" },
    { question: "من هو مؤسس شركة مايكروسوفت؟", answers: ["ستيف جوبز", "بيل جيتس", "مارك زوكربيرج", "إيلون ماسك"], correctAnswer: "بيل جيتس" },
    { question: "ما هو أسرع حيوان على وجه الأرض؟", answers: ["الأسد", "الفهد", "النعامة", "الغزال"], correctAnswer: "الفهد" },
    { question: "ما هي الدولة التي تقع فيها مدينة البندقية؟", answers: ["فرنسا", "ألمانيا", "إيطاليا", "إسبانيا"], correctAnswer: "إيطاليا" },
    { question: "من هو صاحب لوحة الموناليزا؟", answers: ["فان جوخ", "ليوناردو دا فينشي", "بابلو بيكاسو", "كلود مونيه"], correctAnswer: "ليوناردو دا فينشي" },
    { question: "ما هو العنصر الكيميائي الذي رمزه 'Au'؟", answers: ["الفضة", "الذهب", "النحاس", "الحديد"], correctAnswer: "الذهب" },
    { question: "ما هو الرمز الوطني للولايات المتحدة الأمريكية؟", answers: ["النسر الأصلع", "الدب البني", "الأسد", "الكانجارو"], correctAnswer: "النسر الأصلع" },
    { question: "في أي عام بدأت الحرب العالمية الثانية؟", answers: ["1914", "1939", "1945", "1918"], correctAnswer: "1939" },
    { question: "ما هو النهر الأطول في العالم؟", answers: ["نهر النيل", "نهر الأمازون", "نهر اليانغتسي", "نهر المسيسيبي"], correctAnswer: "نهر النيل" },
    { question: "ما هو الكوكب الأكثر سخونة في المجموعة الشمسية؟", answers: ["عطارد", "المريخ", "الزهرة", "المشتري"], correctAnswer: "الزهرة" },
    { question: "من هو بطل فيلم 'The Godfather'؟", answers: ["آل باتشينو", "توم هانكس", "روبرت دي نيرو", "مارلون براندو"], correctAnswer: "مارلون براندو" },
    { question: "ما هي أكبر صحراء في العالم؟", answers: ["الصحراء الكبرى", "الصحراء العربية", "صحراء أنتاركتيكا", "صحراء جوبي"], correctAnswer: "صحراء أنتاركتيكا" },
    { question: "ما هو الحيوان الذي يُعرف باسم 'سفينة الصحراء'؟", answers: ["الحصان", "الجمل", "الفيل", "الزرافة"], correctAnswer: "الجمل" }
];

const avatars = [
    { id: 'avatar-01', src: `${avatarPath}avatar-01.png` },
    { id: 'avatar-02', src: `${avatarPath}avatar-02.png` },
    { id: 'avatar-03', src: `${avatarPath}avatar-03.png` },
    { id: 'avatar-04', src: `${avatarPath}avatar-04.png` },
    { id: 'avatar-05', src: `${avatarPath}avatar-05.png` },
    { id: 'avatar-06', src: `${avatarPath}avatar-06.png` },
    { id: 'avatar-07', src: `${avatarPath}avatar-07.png` },
    { id: 'avatar-08', src: `${avatarPath}avatar-08.png` }
];

// --- UI Navigation and Management ---
function showScreen(screenId) {
    appScreens.forEach(screen => {
        screen.classList.remove('active');
        if (screen.id === screenId) {
            screen.classList.add('active');
        }
    });
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, duration);
}

// --- Game Logic ---
function startGame() {
    // Reset game state
    gameData = {
        score: 100,
        correctAnswers: 0,
        wrongAnswers: 0,
        skips: 0,
        usedFiftyFifty: false,
        usedFreeze: false,
        usedSwap: false,
        impossibleUsed: false,
        impossibleCorrect: false,
        startTime: new Date().toISOString(),
        attemptsSummary: {}
    };
    currentQuestionIndex = 0;

    // Shuffle questions and answers
    questions = [...sampleQuestions];
    shuffleArray(questions);
    questions.forEach(q => shuffleArray(q.answers));

    showScreen('game-screen');
    renderGameUI();
    renderQuestion();
}

function renderGameUI() {
    document.getElementById('player-avatar').src = avatars.find(a => a.id === player.avatarId)?.src || '';
    document.getElementById('player-name').textContent = player.name;
    document.getElementById('current-score').textContent = gameData.score;
    document.getElementById('skip-count').textContent = gameData.skips;
    // Enable/disable helpers based on game state
    document.getElementById('fiftyFiftyButton').disabled = gameData.usedFiftyFifty;
    document.getElementById('freezeButton').disabled = gameData.usedFreeze;
    document.getElementById('swapQuestionButton').disabled = gameData.usedSwap;
}

function renderQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    const question = questions[currentQuestionIndex];
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-status').textContent = `السؤال ${currentQuestionIndex + 1} من ${questions.length}`;
    document.getElementById('progress-bar').style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;

    const answersContainer = document.getElementById('answers-grid');
    answersContainer.innerHTML = '';
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.onclick = () => handleAnswer(answer, question.correctAnswer);
        answersContainer.appendChild(button);
    });

    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timerSeconds = 80;
    document.getElementById('timer-text').textContent = timerSeconds;
    document.getElementById('timer-bar').style.width = '100%';
    timer = setInterval(() => {
        timerSeconds--;
        document.getElementById('timer-text').textContent = timerSeconds;
        document.getElementById('timer-bar').style.width = `${(timerSeconds / 80) * 100}%`;
        if (timerSeconds <= 0) {
            clearInterval(timer);
            handleWrongAnswer();
            showToast('انتهى الوقت! -100 نقطة', 'error');
            setTimeout(nextQuestion, 2000);
        }
    }, 1000);
}

function handleAnswer(selectedAnswer, correctAnswer) {
    clearInterval(timer);
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => btn.disabled = true);

    if (selectedAnswer === correctAnswer) {
        showToast('إجابة صحيحة — +100 نقطة', 'success');
        gameData.score += 100;
        gameData.correctAnswers++;
        document.querySelector(`.answer-btn[textContent="${selectedAnswer}"]`).classList.add('correct');
    } else {
        showToast('إجابة خاطئة — -100 نقطة', 'error');
        gameData.score -= 100;
        gameData.wrongAnswers++;
        const correctBtn = document.querySelector(`.answer-btn[textContent="${correctAnswer}"]`);
        if (correctBtn) correctBtn.classList.add('correct');
        document.querySelector(`.answer-btn[textContent="${selectedAnswer}"]`).classList.add('wrong');
    }

    document.getElementById('current-score').textContent = gameData.score;
    setTimeout(nextQuestion, 2000);
}

function nextQuestion() {
    currentQuestionIndex++;
    renderQuestion();
}

function endGame() {
    clearInterval(timer);
    gameData.endTime = new Date().toISOString();
    gameData.durationSeconds = Math.floor((new Date(gameData.endTime) - new Date(gameData.startTime)) / 1000);
    gameData.finalScore = gameData.score;
    gameData.status = 'finished';

    showScreen('results-screen');
    renderResults();
    sendResult(gameData);
}

function renderResults() {
    document.getElementById('results-name').textContent = player.name;
    document.getElementById('results-correct').textContent = gameData.correctAnswers;
    document.getElementById('results-wrong').textContent = gameData.wrongAnswers;
    document.getElementById('results-skips').textContent = gameData.skips;
    document.getElementById('results-score').textContent = gameData.finalScore;
    document.getElementById('results-duration').textContent = `${Math.floor(gameData.durationSeconds / 60)} دقيقة و ${gameData.durationSeconds % 60} ثواني`;
    document.getElementById('results-impossible').textContent = gameData.impossibleUsed ? (gameData.impossibleCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة') : 'لم يُستخدم';

    const performance = getPerformanceLevel(gameData.correctAnswers, questions.length);
    document.getElementById('performance-text').textContent = `التقييم العام: ${performance.level}`;
    document.getElementById('performance-bar').style.width = `${performance.percentage}%`;
    document.getElementById('performance-bar').style.backgroundColor = performance.color;
}

function getPerformanceLevel(correct, total) {
    const percentage = (correct / total) * 100;
    if (percentage >= 90) return { level: 'ممتاز', color: '#FFD700', percentage: 100 };
    if (percentage >= 70) return { level: 'جيد جداً', color: '#4CAF50', percentage: percentage };
    if (percentage >= 50) return { level: 'جيد', color: '#8BC34A', percentage: percentage };
    if (percentage >= 30) return { level: 'مقبول', color: '#FFB74D', percentage: percentage };
    if (percentage >= 10) return { level: 'ضعيف', color: '#F44336', percentage: percentage };
    return { level: 'سيئ جداً', color: '#B71C1C', percentage: percentage };
}

// --- Helper Utilities ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

// --- Google Apps Script Integration ---
async function sendResult(data) {
    const payload = {
        deviceId: getDeviceId(),
        playerName: player.name,
        avatarId: player.avatarId,
        startTime: data.startTime,
        endTime: data.endTime,
        durationSeconds: data.durationSeconds,
        status: data.status,
        numQuestions: questions.length,
        correctAnswers: data.correctAnswers,
        wrongAnswers: data.wrongAnswers,
        skips: data.skips,
        usedFiftyFifty: data.usedFiftyFifty ? 1 : 0,
        usedFreeze: data.usedFreeze ? 1 : 0,
        usedSwap: data.usedSwap ? 1 : 0,
        impossibleUsed: data.impossibleUsed ? 1 : 0,
        impossibleCorrect: data.impossibleCorrect ? 1 : 0,
        finalScore: data.finalScore,
    };

    try {
        const res = await fetch(GOOGLE_APP_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        console.log("Google Script response:", json);
        showToast('تم حفظ نتائجك بنجاح!', 'success');
        return json;
    } catch (err) {
        console.error("Error sending to Apps Script:", err);
        showToast('فشل حفظ النتائج. تحقق من اتصالك.', 'error');
    }
}

// --- Event Listeners and Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved player data
    const savedPlayer = localStorage.getItem('player');
    if (savedPlayer) {
        player = JSON.parse(savedPlayer);
    }

    // Set up start button listener
    startButton.addEventListener('click', () => {
        if (!player.name) {
            showScreen('avatar-screen');
            renderAvatars();
        } else {
            startGame();
        }
    });

    leaderboardButton.addEventListener('click', () => {
        showScreen('leaderboard-screen');
        // TODO: Fetch and render leaderboard data here
        showToast('جارٍ تحميل لوحة الصدارة...', 'info');
    });

    nextToNameButton.addEventListener('click', () => {
        if (!player.avatarId) {
            showToast('من فضلك، اختر صورة رمزية أولاً.', 'warning');
            return;
        }
        showModal('name-modal');
        playerNameInput.focus();
    });

    confirmNameButton.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (name.length < 3 || name.length > 15) {
            nameErrorMessage.textContent = 'الاسم يجب أن يكون بين 3 و 15 حرفاً.';
            nameErrorMessage.classList.add('show');
            return;
        }
        nameErrorMessage.classList.remove('show');
        player.name = name;
        localStorage.setItem('player', JSON.stringify(player));
        hideModal('name-modal');
        startGame();
    });
    
    // Add other event listeners for quit game, play again, etc.
    quitGameButton.addEventListener('click', () => showModal('quit-modal'));
    cancelQuitButton.addEventListener('click', () => hideModal('quit-modal'));
    confirmQuitButton.addEventListener('click', () => {
        hideModal('quit-modal');
        endGame();
    });

    playAgainButton.addEventListener('click', () => startGame());
    backToHomeButton.addEventListener('click', () => showScreen('home-screen'));
    backFromLeaderboard.addEventListener('click', () => showScreen('home-screen'));
});

// --- Avatar Selection Logic ---
function renderAvatars() {
    avatarGrid.innerHTML = '';
    avatars.forEach(avatar => {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar-item';
        avatarDiv.dataset.id = avatar.id;
        const img = document.createElement('img');
        img.src = avatar.src;
        img.alt = `صورة رمزية ${avatar.id}`;
        avatarDiv.appendChild(img);
        
        avatarDiv.addEventListener('click', () => {
            document.querySelectorAll('.avatar-item').forEach(item => item.classList.remove('selected'));
            avatarDiv.classList.add('selected');
            player.avatarId = avatar.id;
        });
        avatarGrid.appendChild(avatarDiv);
    });
}
