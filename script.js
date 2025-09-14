// Global variables and constants
const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbzB9cru35ndWmWYsEqe46NlrvZgj64HhCIZJ0j7SLln3VDSl2S7rAOMDGxLwEzR_ClS/exec";
const QUIZ_QUESTIONS = [
    {
        question: "ما هي عاصمة اليابان؟",
        options: ["بكين", "طوكيو", "سيول", "بانكوك"],
        answer: "طوكيو"
    },
    // ... (جميع الأسئلة الأخرى)
];

const IMPOSSIBLE_QUESTION = {
    question: "من هو أول من سافر إلى الفضاء؟",
    options: ["نيل أرمسترونغ", "يوري غاغارين", "جون غلين", "آلان شيبرد"],
    answer: "يوري غاغارين"
};

// State Management
let gameState = {
    playerName: '',
    avatarId: '',
    score: 100,
    currentQuestionIndex: 0,
    questions: [],
    correctAnswers: 0,
    wrongAnswers: 0,
    skips: 0,
    usedFiftyFifty: false,
    usedFreeze: false,
    usedSwap: false,
    impossibleUsed: false,
    impossibleCorrect: false,
    startTime: null,
    endTime: null,
    duration: 0,
    skipCost: 100,
    timer: null,
    timeLeft: 80,
    isImpossible: false,
};

// DOM Elements
const mainContainer = document.getElementById('main-container');
const splashScreen = document.getElementById('splash-screen');
const avatarScreen = document.getElementById('avatar-screen');
const nameModal = document.getElementById('name-modal');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');

// ... (جميع عناصر DOM الأخرى)

// Avatars - Use a simple collection for demo
const avatars = [
    'https://placehold.co/150x150/4FC3F7/0B2545?text=Av1',
    'https://placehold.co/150x150/FFB74D/0B2545?text=Av2',
    // ... (جميع الصور الرمزية الأخرى)
];

// Functions to manage screen visibility
const showScreen = (screen) => {
    const allScreens = [splashScreen, avatarScreen, quizScreen, resultsScreen, leaderboardScreen];
    allScreens.forEach(s => {
        s.classList.add('hidden', 'scale-90', 'opacity-0');
    });
    screen.classList.remove('hidden', 'scale-90', 'opacity-0');
    screen.classList.add('scale-100', 'opacity-100');
};

const showModal = (modal) => {
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.querySelector('div').classList.remove('scale-90');
    }, 10);
};

const hideModal = (modal) => {
    modal.querySelector('div').classList.add('scale-90');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

// Utility functions
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    let bgColor = '';
    if (type === 'success') bgColor = 'bg-green-500';
    else if (type === 'error') bgColor = 'bg-red-500';
    else if (type === 'warning') bgColor = 'bg-yellow-500';
    else bgColor = 'bg-gray-700';

    toast.className = `toast p-4 rounded-xl shadow-lg text-white font-bold mb-2 ${bgColor} text-sm md:text-base`;
    toast.textContent = message;

    const toastContainer = document.getElementById('toast-container');
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
};

const getPerformanceLevel = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { level: 'ممتاز', color: '#00C853' };
    if (percentage >= 70) return { level: 'جيد جداً', color: '#64DD17' };
    if (percentage >= 50) return { level: 'جيد', color: '#FFD700' };
    if (percentage >= 30) return { level: 'مقبول', color: '#FFB74D' };
    if (percentage >= 10) return { level: 'ضعيف', color: '#FF5722' };
    if (percentage >= 0) return { level: 'سيء', color: '#E53935' };
    return { level: 'سيء جداً', color: '#9E2D2D' };
};

// Quiz Logic
const startGame = () => {
    // Reset game state
    gameState = {
        ...gameState,
        score: 100,
        currentQuestionIndex: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        skips: 0,
        usedFiftyFifty: false,
        usedFreeze: false,
        usedSwap: false,
        impossibleUsed: false,
        impossibleCorrect: false,
        startTime: new Date(),
        endTime: null,
        duration: 0,
        skipCost: 100,
        isImpossible: false,
    };

    // Shuffle questions and prepare for the game
    gameState.questions = shuffleArray([...QUIZ_QUESTIONS]);
    
    // Update UI
    playerAvatar.src = gameState.avatarId;
    playerNameDisplay.textContent = gameState.playerName;
    playerScoreDisplay.textContent = gameState.score;
    skipCostDisplay.textContent = gameState.skipCost;
    skipCountDisplay.textContent = gameState.skips;
    
    helpBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
    impossibleBtn.disabled = false;
    impossibleBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    showScreen(quizScreen);
    loadQuestion();
};

const loadQuestion = () => {
    // Check for game end
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
        // Time for impossible question or game over
        if (!gameState.impossibleUsed && !gameState.isImpossible) {
            showModal(impossibleModal);
            return;
        } else {
            endGame();
            return;
        }
    }
    
    if (gameState.timer) clearInterval(gameState.timer);
    
    const questionData = gameState.questions[gameState.currentQuestionIndex];
    
    questionStatus.textContent = `السؤال ${gameState.currentQuestionIndex + 1} من ${QUIZ_QUESTIONS.length}`;
    
    questionText.textContent = questionData.question;
    answersGrid.innerHTML = '';
    
    // Shuffle answers
    const shuffledOptions = shuffleArray([...questionData.options]);

    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = "answer-btn w-full p-4 bg-[#1E3A8A] text-white rounded-xl shadow-lg transition-colors duration-300 transform hover:scale-105";
        button.onclick = () => handleAnswer(option, questionData.answer);
        answersGrid.appendChild(button);
    });
    
    startTimer();
};

const loadImpossibleQuestion = () => {
     if (gameState.timer) clearInterval(gameState.timer);

    gameState.isImpossible = true;
    gameState.impossibleUsed = true;
    
    questionStatus.textContent = `السؤال المستحيل`;
    questionText.textContent = IMPOSSIBLE_QUESTION.question;
    answersGrid.innerHTML = '';
    
    const shuffledOptions = shuffleArray([...IMPOSSIBLE_QUESTION.options]);

    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.className = "answer-btn w-full p-4 bg-[#1E3A8A] text-white rounded-xl shadow-lg transition-colors duration-300 transform hover:scale-105";
        button.onclick = () => handleAnswer(option, IMPOSSIBLE_QUESTION.answer);
        answersGrid.appendChild(button);
    });
    
    // Disable all help buttons for impossible question
    helpBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });
    impossibleBtn.disabled = true;
    impossibleBtn.classList.add('opacity-50', 'cursor-not-allowed');

    startTimer();
};

const startTimer = () => {
    gameState.timeLeft = 80;
    timerBar.style.width = '100%';
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        timerBar.style.width = `${(gameState.timeLeft / 80) * 100}%`;
        
        if (gameState.timeLeft <= 20) {
            timerBar.classList.remove('bg-[#FFB74D]');
            timerBar.classList.add('bg-[#E53935]');
        } else {
            timerBar.classList.remove('bg-[#E53935]');
            timerBar.classList.add('bg-[#FFB74D]');
        }
        
        if (gameState.timeLeft <= 0) {
            handleAnswer(null, null); // Incorrect answer
        }
    }, 1000);
};

const stopTimer = () => {
    if (gameState.timer) clearInterval(gameState.timer);
};

const handleAnswer = (selectedOption, correctAnswer) => {
    stopTimer();
    const answerBtns = document.querySelectorAll('.answer-btn');
    
    const isCorrect = selectedOption === correctAnswer;

    if (isCorrect) {
        gameState.score += 100;
        if(gameState.isImpossible) {
            gameState.impossibleCorrect = true;
            showToast('إجابة صحيحة - مكافأة خاصة!', 'success');
        } else {
            gameState.correctAnswers++;
            showToast('إجابة صحيحة — +100 نقطة', 'success');
        }
        document.querySelector(`button[onclick*="${selectedOption}"]`).classList.add('bg-green-500');
    } else {
        gameState.score -= 100;
        if(gameState.isImpossible) {
            showToast('إجابة خاطئة - لا توجد مكافأة.', 'error');
        } else {
            gameState.wrongAnswers++;
            showToast('إجابة خاطئة — -100 نقطة', 'error');
        }
        if (selectedOption) {
             document.querySelector(`button[onclick*="${selectedOption}"]`).classList.add('bg-red-500');
        }
        // Show the correct answer
        const correctBtn = document.querySelector(`button[onclick*="${correctAnswer}"]`);
        if(correctBtn) {
             correctBtn.classList.add('bg-green-500', 'ring-2', 'ring-green-300');
        }
    }

    playerScoreDisplay.textContent = gameState.score;
    
    // Wait for 2 seconds before moving to the next question
    setTimeout(() => {
        if (!gameState.isImpossible) {
            gameState.currentQuestionIndex++;
        } else {
            endGame(); // End game after impossible question
            return;
        }
        loadQuestion();
    }, 2000);
};

const handleHelp = (helpType) => {
    if (gameState.score < 100) {
        showToast('لا توجد نقاط كافية لاستخدام هذه المساعدة', 'warning');
        return;
    }

    switch(helpType) {
        case 'fifty-fifty':
            if (gameState.usedFiftyFifty) {
                 showToast('تم استخدام 50:50 بالفعل', 'warning');
                 return;
            }
            gameState.usedFiftyFifty = true;
            gameState.score -= 100;
            showToast('تم استخدام 50:50 -100 نقطة', 'info');
            // Logic to remove two wrong answers
            const questionData = gameState.questions[gameState.currentQuestionIndex];
            const answerBtns = Array.from(document.querySelectorAll('.answer-btn'));
            const wrongAnswers = answerBtns.filter(btn => btn.textContent !== questionData.answer);
            shuffleArray(wrongAnswers);
            wrongAnswers.slice(0, 2).forEach(btn => {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'line-through');
            });
            document.querySelector(`button[data-help="fifty-fifty"]`).disabled = true;
            break;
        case 'freeze':
            if (gameState.usedFreeze) {
                showToast('تم استخدام تجميد الوقت بالفعل', 'warning');
                return;
            }
            gameState.usedFreeze = true;
            gameState.score -= 100;
            showToast('تم استخدام تجميد الوقت -100 نقطة', 'info');
            stopTimer();
            setTimeout(() => startTimer(), 10000);
            document.querySelector(`button[data-help="freeze"]`).disabled = true;
            break;
        case 'swap':
            if (gameState.usedSwap) {
                 showToast('تم استخدام تغيير السؤال بالفعل', 'warning');
                 return;
            }
            gameState.usedSwap = true;
            gameState.score -= 100;
            showToast('تم استخدام تغيير السؤال -100 نقطة', 'info');
            const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
            const nextQuestion = gameState.questions[gameState.currentQuestionIndex + 1];
            // Simple swap, could be more robust
            gameState.questions[gameState.currentQuestionIndex] = nextQuestion;
            gameState.questions[gameState.currentQuestionIndex + 1] = currentQuestion;
            loadQuestion();
            document.querySelector(`button[data-help="swap"]`).disabled = true;
            break;
        case 'skip':
            if (gameState.score < gameState.skipCost) {
                showToast('لا توجد نقاط كافية للتخطي.', 'warning');
                return;
            }
            gameState.score -= gameState.skipCost;
            gameState.skips++;
            gameState.skipCost += 50;
            skipCostDisplay.textContent = gameState.skipCost;
            skipCountDisplay.textContent = gameState.skips;
            showToast(`تم تخطي السؤال -${gameState.skipCost - 50} نقطة`, 'info');
            gameState.wrongAnswers++; // Treat as a wrong answer for summary purposes
            gameState.currentQuestionIndex++;
            loadQuestion();
            break;
    }
    playerScoreDisplay.textContent = gameState.score;
};

const endGame = () => {
    stopTimer();
    gameState.endTime = new Date();
    gameState.duration = Math.floor((gameState.endTime - gameState.startTime) / 1000);
    
    // Update results screen
    finalName.textContent = gameState.playerName;
    finalScore.textContent = gameState.score;
    finalDuration.textContent = `${Math.floor(gameState.duration / 60)} دقيقة و ${gameState.duration % 60} ثواني`;
    finalCorrect.textContent = gameState.correctAnswers;
    finalWrong.textContent = gameState.wrongAnswers;
    finalSkips.textContent = gameState.skips;
    
    if (gameState.impossibleUsed) {
        if (gameState.impossibleCorrect) {
            finalImpossible.textContent = 'إجابة صحيحة';
        } else {
            finalImpossible.textContent = 'إجابة خاطئة';
        }
    } else {
        finalImpossible.textContent = 'لم يُستخدم';
    }
    
    const totalQuestionsAnswered = gameState.correctAnswers + gameState.wrongAnswers;
    const percentage = totalQuestionsAnswered > 0 ? (gameState.correctAnswers / totalQuestionsAnswered) * 100 : 0;
    const performance = getPerformanceLevel(percentage, 100);
    
    performanceText.textContent = performance.level;
    performanceBar.style.width = `${percentage}%`;
    performanceBar.style.backgroundColor = performance.color;
    
    // Prepare share links
    const shareText = `لقد حصلت على ${gameState.score} نقطة في مسابقة المعلومات! مستواي هو ${performance.level}.`;
    shareXBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=http://yourwebsite.com`; // Add your website link
    shareInstagramBtn.href = `https://www.instagram.com/share?text=${encodeURIComponent(shareText)}`; // Note: Instagram sharing is tricky for web

    showScreen(resultsScreen);
    
    // Prepare data for Google Sheets
    const dataToSend = {
        deviceId: localStorage.getItem('deviceId') || `anon-${Date.now()}`,
        playerName: gameState.playerName,
        avatarId: gameState.avatarId,
        startTime: gameState.startTime.toISOString(),
        endTime: gameState.endTime.toISOString(),
        durationSeconds: gameState.duration,
        status: 'finished',
        numQuestions: QUIZ_QUESTIONS.length,
        correctAnswers: gameState.correctAnswers,
        wrongAnswers: gameState.wrongAnswers,
        skips: gameState.skips,
        usedFiftyFifty: gameState.usedFiftyFifty ? 1 : 0,
        usedFreeze: gameState.usedFreeze ? 1 : 0,
        usedSwap: gameState.usedSwap ? 1 : 0,
        impossibleUsed: gameState.impossibleUsed ? 1 : 0,
        impossibleCorrect: gameState.impossibleCorrect ? 1 : 0,
        scoreBeforeImpossible: gameState.score, // Simple for now
        finalScore: gameState.score,
        roundDifficulty: 'normal',
        userAgent: navigator.userAgent,
        // ip: '... (will be handled by server script)',
    };
    
    sendResultToGoogleSheets(dataToSend);
};

// Google Sheets Integration
const sendResultToGoogleSheets = async (data) => {
    try {
        const res = await fetch(API_ENDPOINT, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        console.log("Google Script request sent. Response:", res);
        // The actual response can't be read due to no-cors mode, which is common for Apps Script.
    } catch (err) {
        console.error("Error sending to Apps Script:", err);
        showToast('خطأ في الاتصال بالخادم. سيتم حفظ البيانات محلياً.', 'error');
        // Save locally to resend later
        const localData = JSON.parse(localStorage.getItem('pendingData') || '[]');
        localData.push(data);
        localStorage.setItem('pendingData', JSON.stringify(localData));
    }
};

const fetchLeaderboard = async () => {
    leaderboardBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">جاري تحميل لوحة الصدارة...</td></tr>`;
    try {
        // Using a direct fetch for simplicity, though a dedicated endpoint is better
        const res = await fetch(`${API_ENDPOINT}?action=getLeaderboard`); 
        const data = await res.json();
        
        leaderboardBody.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach((entry, index) => {
                const rank = index + 1;
                const level = getPerformanceLevel(entry.finalScore, 1000).level; // Assuming max score is 1000 for demo
                let rankIcon = '';
                if (rank === 1) rankIcon = `<i class="fas fa-trophy text-[#FFD700]"></i>`;
                if (rank === 2) rankIcon = `<i class="fas fa-trophy text-gray-400"></i>`;
                if (rank === 3) rankIcon = `<i class="fas fa-trophy text-orange-400"></i>`;
                
                let impossibleStatus = '';
                if (entry.impossibleCorrect === 1) {
                    impossibleStatus = `<span class="text-[#FFD700] font-bold">صحيح</span>`;
                } else if (entry.impossibleUsed === 1) {
                    impossibleStatus = `<span class="text-[#E53935]">خاطئ</span>`;
                } else {
                    impossibleStatus = `<span class="text-gray-400">لم يُستخدم</span>`;
                }
                
                const row = `
                    <tr class="border-b border-gray-700">
                        <td class="py-2 px-1 md:px-4 flex items-center gap-2">${rankIcon} ${rank}</td>
                        <td class="py-2 px-1 md:px-4">${entry.playerName}</td>
                        <td class="py-2 px-1 md:px-4 hidden md:table-cell">${level}</td>
                        <td class="py-2 px-1 md:px-4">${entry.finalScore}</td>
                        <td class="py-2 px-1 md:px-4">${impossibleStatus}</td>
                    </tr>
                `;
                leaderboardBody.innerHTML += row;
            });
        } else {
            leaderboardBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-400">لا توجد بيانات متاحة.</td></tr>`;
        }
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        leaderboardBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-[#E53935]">خطأ في تحميل البيانات.</td></tr>`;
    }
};

// Event Listeners
startBtn.addEventListener('click', () => {
    showScreen(avatarScreen);
});

leaderboardBtn.addEventListener('click', () => {
    showScreen(leaderboardScreen);
    fetchLeaderboard();
});

backFromLeaderboard.addEventListener('click', () => {
    showScreen(splashScreen);
});

// Generate avatars
avatars.forEach((src, index) => {
    const container = document.createElement('div');
    container.className = 'w-24 h-24 md:w-32 md:h-32 p-1 rounded-full cursor-pointer transition-transform transform hover:scale-110 relative';
    container.dataset.avatarId = `avatar_${index + 1}`;
    
    const img = document.createElement('img');
    img.src = src;
    img.className = 'w-full h-full rounded-full border-4 border-transparent hover:border-[#4FC3F7] transition-colors duration-300';
    img.alt = `Avatar ${index + 1}`;
    
    container.appendChild(img);
    avatarGrid.appendChild(container);
    
    container.addEventListener('click', () => {
        document.querySelectorAll('#avatar-grid > div').forEach(div => {
            div.classList.remove('ring-4', 'ring-[#FFD700]');
        });
        container.classList.add('ring-4', 'ring-[#FFD700]');
        gameState.avatarId = container.dataset.avatarId;
        nextToNameBtn.disabled = false;
        nextToNameBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
});

nextToNameBtn.addEventListener('click', () => {
    showModal(nameModal);
});

confirmNameBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name.length >= 3 && name.length <= 15) {
        gameState.playerName = name;
        hideModal(nameModal);
        startGame();
    } else {
        nameError.classList.remove('hidden');
    }
});

nameInput.addEventListener('input', () => {
    if (nameInput.value.trim().length >= 3 && nameInput.value.trim().length <= 15) {
        nameError.classList.add('hidden');
    } else {
        nameError.classList.remove('hidden');
    }
});

endQuizBtn.addEventListener('click', () => {
    showModal(endQuizModal);
});

confirmEndBtn.addEventListener('click', () => {
    hideModal(endQuizModal);
    endGame();
});

cancelEndBtn.addEventListener('click', () => {
    hideModal(endQuizModal);
});

impossibleBtn.addEventListener('click', () => {
    showModal(impossibleModal);
});

acceptImpossibleBtn.addEventListener('click', () => {
    hideModal(impossibleModal);
    gameState.scoreBeforeImpossible = gameState.score;
    loadImpossibleQuestion();
});

declineImpossibleBtn.addEventListener('click', () => {
    hideModal(impossibleModal);
    endGame();
});

playAgainBtn.addEventListener('click', () => {
    showScreen(avatarScreen);
});

backToStartBtn.addEventListener('click', () => {
    showScreen(splashScreen);
});

helpBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const helpType = e.currentTarget.dataset.help;
        handleHelp(helpType);
    });
});

themeToggleBtn.addEventListener('click', () => {
    const body = document.body;
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode');
    const icon = themeToggleBtn.querySelector('i');
    if (body.classList.contains('light-mode')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});

// Initial setup on page load
window.onload = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = `anon-${crypto.randomUUID()}`;
        localStorage.setItem('deviceId', deviceId);
    }
    // Check for pending data to send
    const pendingData = JSON.parse(localStorage.getItem('pendingData') || '[]');
    if (pendingData.length > 0) {
        pendingData.forEach(data => {
            sendResultToGoogleSheets(data);
        });
        localStorage.removeItem('pendingData');
    }
};
