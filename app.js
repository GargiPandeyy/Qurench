let currentLanguage = 'english';
let currentCategory = 'slang';
let currentMode = 'flashcard';
let flashcards = [];
let currentCardIndex = 0;
let quizQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let hasAnswered = false;
let currentStreak = 0;
let isMuted = false;
let audioCtx;
let clickBuffer, correctBuffer, wrongBuffer, cheerBuffer;

document.addEventListener('DOMContentLoaded', () => {
    showMainApp();
    initAudio();
});

function showMainApp() {
    document.getElementById('apiKeySetup').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
}

function initAudio() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        clickBuffer = createTone(440, 0.04);
        correctBuffer = createTone(880, 0.12);
        wrongBuffer = createTone(220, 0.12);
        cheerBuffer = createTone(1320, 0.18);
    } catch {}
}

function createTone(frequency, duration) {
    if (!audioCtx) return null;
    const sampleRate = audioCtx.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-3 * t);
        data[i] = Math.sin(2 * Math.PI * frequency * t) * env * 0.4;
    }
    return buffer;
}

function play(buffer) {
    if (isMuted || !audioCtx || !buffer) return;
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(audioCtx.destination);
    src.start();
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('muteBtn');
    if (btn) btn.textContent = isMuted ? '🔇 Sound Off' : '🔊 Sound On';
}

function setLanguage(language) {
    currentLanguage = language;
    
    document.getElementById('englishBtn').classList.toggle('active', language === 'english');
    document.getElementById('frenchBtn').classList.toggle('active', language === 'french');
    
    flashcards = [];
    quizQuestions = [];
    updateCardDisplay();
}



function setMode(mode) {
    currentMode = mode;
    
    document.getElementById('flashcardBtn').classList.toggle('active', mode === 'flashcard');
    document.getElementById('quizBtn').classList.toggle('active', mode === 'quiz');
    
    document.getElementById('flashcardMode').style.display = mode === 'flashcard' ? 'block' : 'none';
    document.getElementById('quizMode').style.display = mode === 'quiz' ? 'block' : 'none';
}

async function loadDataset(language, category) {
    // Explicitly use a relative path so GitHub Pages under /Qurench/ resolves correctly
    const path = `./data/${language}/${category}.json`;
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load dataset');
    return await response.json();
}

async function loadNewFlashcards() {
    currentCategory = document.getElementById('categorySelect').value;
    document.getElementById('loadingFlashcard').style.display = 'block';
    document.getElementById('flashcardContainer').style.display = 'none';
    try {
        const languageDir = currentLanguage === 'english' ? 'english' : 'french';
        flashcards = await loadDataset(languageDir, currentCategory);
        currentCardIndex = 0;
        updateCardDisplay();
        document.getElementById('loadingFlashcard').style.display = 'none';
        document.getElementById('flashcardContainer').style.display = 'block';
    } catch (error) {
        console.error('Error loading flashcards:', error);
        document.getElementById('loadingFlashcard').style.display = 'none';
        document.getElementById('flashcardContainer').style.display = 'block';
        alert('Failed to load flashcards. Please try again.');
    }
}


function updateCardDisplay() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.remove('flipped');
    
    if (flashcards.length === 0) {
        document.getElementById('cardTerm').textContent = 'Click "Load New Cards" to start!';
        document.getElementById('cardCounter').textContent = '0 / 0';
        return;
    }
    
    const card = flashcards[currentCardIndex];
    document.getElementById('cardTerm').textContent = card.term;
    document.getElementById('cardMeaning').textContent = card.meaning;
    document.getElementById('cardExample').textContent = `"${card.example}"`;
    document.getElementById('cardFact').textContent = `💡 ${card.funFact}`;
    document.getElementById('cardCounter').textContent = `${currentCardIndex + 1} / ${flashcards.length}`;
}

function flipCard() {
    if (flashcards.length === 0) return;
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');
    play(clickBuffer);
    spawnRandomSprite();
}

function nextCard() {
    if (flashcards.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    updateCardDisplay();
}

function previousCard() {
    if (flashcards.length === 0) return;
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    updateCardDisplay();
}

async function loadNewQuiz() {
    document.getElementById('loadingQuiz').style.display = 'block';
    document.getElementById('quizContainer').style.display = 'none';
    try {
        if (flashcards.length === 0 || currentCategory !== document.getElementById('categorySelect').value) {
            const languageDir = currentLanguage === 'english' ? 'english' : 'french';
            currentCategory = document.getElementById('categorySelect').value;
            flashcards = await loadDataset(languageDir, currentCategory);
        }

        quizQuestions = buildQuizFromFlashcards(flashcards, 5);
        currentQuestionIndex = 0;
        quizScore = 0;
        hasAnswered = false;
        updateQuizScore();
        displayQuestion();
        document.getElementById('loadingQuiz').style.display = 'none';
        document.getElementById('quizContainer').style.display = 'block';
    } catch (error) {
        console.error('Error loading quiz:', error);
        document.getElementById('loadingQuiz').style.display = 'none';
        document.getElementById('quizContainer').style.display = 'block';
        alert('Failed to load quiz. Please try again.');
    }
    
}


function shuffleArray(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildQuizFromFlashcards(cards, numQuestions) {
    const selected = shuffleArray(cards).slice(0, Math.min(numQuestions, cards.length));
    const allMeanings = cards.map(c => c.meaning);
    return selected.map(card => {
        const distractors = shuffleArray(allMeanings.filter(m => m !== card.meaning)).slice(0, 3);
        const options = shuffleArray([card.meaning, ...distractors]);
        const correctIndex = options.indexOf(card.meaning);
        const questionText = currentLanguage === 'english'
            ? `What does "${card.term}" mean?`
            : `Que signifie "${card.term}" ?`;
        return {
            question: questionText,
            options,
            correctIndex,
            explanation: card.example ? `Example: ${card.example}` : ''
        };
    });
}

function displayQuestion() {
    if (quizQuestions.length === 0) {
        document.getElementById('questionText').textContent = 'Click "Start New Quiz" to begin!';
        document.getElementById('quizOptions').innerHTML = '';
        return;
    }
    
    hasAnswered = false;
    const question = quizQuestions[currentQuestionIndex];
    document.getElementById('questionText').textContent = `Question ${currentQuestionIndex + 1}/${quizQuestions.length}: ${question.question}`;
    document.getElementById('quizFeedback').style.display = 'none';
    document.getElementById('nextQuestionBtn').style.display = 'none';
    
    // Create option buttons
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'quiz-option';
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(button);
    });
}

function selectAnswer(selectedIndex) {
    if (hasAnswered) return;
    hasAnswered = true;
    
    const question = quizQuestions[currentQuestionIndex];
    const options = document.querySelectorAll('.quiz-option');
    const isCorrect = selectedIndex === question.correctIndex;
    
    // Update score
    if (isCorrect) {
        quizScore++;
        updateQuizScore();
        currentStreak++;
        companionReact('correct');
        play(correctBuffer);
        spawnRandomSprite();
    }
    else {
        currentStreak = 0;
        companionReact('incorrect');
        play(wrongBuffer);
    }
    
    // Show feedback
    options.forEach((option, index) => {
        option.classList.add('disabled');
        if (index === question.correctIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex) {
            option.classList.add('incorrect');
        }
    });
    
    // Display explanation
    const feedback = document.getElementById('quizFeedback');
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
    feedback.innerHTML = `
        <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong><br>
        ${question.explanation}
    `;
    feedback.style.display = 'block';
    
    // Show next button or completion message
    if (currentQuestionIndex < quizQuestions.length - 1) {
        document.getElementById('nextQuestionBtn').style.display = 'inline-block';
    } else {
        feedback.innerHTML += `<br><br><strong>Quiz Complete! Final Score: ${quizScore}/${quizQuestions.length}</strong>`;
        if (quizScore === quizQuestions.length) {
            companionReact('perfect');
            play(cheerBuffer);
            for (let i = 0; i < 5; i++) setTimeout(spawnRandomSprite, i * 120);
        }
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        displayQuestion();
    }
}

function updateQuizScore() {
    document.getElementById('quizScore').textContent = quizScore;
    document.getElementById('quizTotal').textContent = quizQuestions.length;
}

function spawnRandomSprite() {
    const layer = document.getElementById('animeLayer');
    if (!layer) return;
    const sprites = ['🐱', '😺', '🐾', '✨', '🌟', '🪽', '🦊', '🐰', '🪄', '🎐'];
    const el = document.createElement('div');
    el.className = 'sprite';
    el.textContent = sprites[Math.floor(Math.random() * sprites.length)];
    const top = Math.random() * (window.innerHeight * 0.6) + 40;
    el.style.top = `${top}px`;
    el.style.left = `-40px`;
    el.style.animationDuration = `${2.5 + Math.random() * 2}s`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

// Companion reactions
function companionReact(eventType) {
    const companion = document.getElementById('companion');
    const avatar = document.getElementById('companionAvatar');
    const bubble = document.getElementById('companionBubble');
    if (!companion || !avatar || !bubble) return;
    
    // Reset classes
    companion.classList.remove('happy', 'sad', 'cheer');
    
    const messages = {
        correct: [
            "Nice one!",
            "Beauty, eh!",
            "You’re on fire!",
            "Solid!"
        ],
        incorrect: [
            "Close one!",
            "No worries, try the next!",
            "Almost there!",
            "You'll get it!"
        ],
        streak: [
            "Streak x" + currentStreak + "! Keep it going!",
            "Northern Lights unlocked!",
            "Maple momentum!"
        ],
        perfect: [
            "Perfect score! Guardian of the North!",
            "Flawless victory!",
            "Legendary!"
        ]
    };

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    
    if (eventType === 'correct') {
        companion.classList.add('happy', 'cheer');
        bubble.textContent = currentStreak >= 3 ? pick(messages.streak) : pick(messages.correct);
        avatar.textContent = currentStreak >= 3 ? '🦫✨' : '🦫';
    } else if (eventType === 'incorrect') {
        companion.classList.add('sad');
        bubble.textContent = pick(messages.incorrect);
        avatar.textContent = '🦫💧';
    } else if (eventType === 'perfect') {
        companion.classList.add('cheer');
        bubble.textContent = pick(messages.perfect);
        avatar.textContent = '🦫🏆';
    }

    // Remove transient state after animation
    setTimeout(() => {
        companion.classList.remove('cheer');
        if (eventType === 'incorrect') avatar.textContent = '🦫';
    }, 900);
}

