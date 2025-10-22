document.addEventListener('DOMContentLoaded', () => {

    const mainAppHTML = `
        <header>
            <h1>Cosmic Canadian Rescue</h1>
            <p class="tagline">Master the Linguistic Frequencies!</p>
        </header>

        <div id="companion" class="companion" aria-live="polite">
            <div class="companion-avatar" id="companionAvatar">🤖</div>
            <div class="companion-bubble" id="companionBubble">Awaiting your command, Star-Rider!</div>
        </div>

        <div class="controls">
            <div class="control-group">
                <label>Language:</label>
                <div class="toggle-group">
                    <button id="englishBtn" class="btn btn-toggle active">
                        🇨🇦 English
                    </button>
                    <button id="frenchBtn" class="btn btn-toggle">
                        ⚜️ Québécois
                    </button>
                </div>
            </div>

            <div class="control-group">
                <label>Category:</label>
                <select id="categorySelect">
                    <option value="slang">Slang</option>
                    <option value="food">Food</option>
                    <option value="weather">Weather</option>
                    <option value="everyday">Everyday Phrases</option>
                    <option value="culture">Culture</option>
                </select>
            </div>

            <div class="control-group">
                <label>Mode:</label>
                <div class="toggle-group">
                    <button id="flashcardBtn" class="btn btn-toggle active">
                        📚 Holocrons
                    </button>
                    <button id="quizBtn" class="btn btn-toggle">
                        ⚔️ Gauntlet
                    </button>
                </div>
            </div>
        </div>

        <div id="flashcardMode" class="flashcard-mode">
            <div class="loading" id="loadingFlashcard" style="display: none;">
                <div class="spinner"></div>
                <p>Loading holocron...</p>
            </div>
            <div id="flashcardContainer" class="flashcard-container">
                <div class="flashcard" id="flashcard">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <div class="card-content">
                                <h2 id="cardTerm">Load Holocrons to Start!</h2>
                                <p class="card-hint">Click to flip</p>
                            </div>
                        </div>
                        <div class="flashcard-back">
                            <div class="card-content">
                                <h3 id="cardMeaning">...</h3>
                                <p id="cardExample" class="example">...</p>
                                <p id="cardFact" class="fun-fact">...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flashcard-nav">
                <button id="prevCardBtn" class="btn btn-nav">← Previous</button>
                <span id="cardCounter" class="card-counter">0 / 0</span>
                <button id="nextCardBtn" class="btn btn-nav">Next →</button>
            </div>
            <div class="action-buttons" style="text-align: center; margin-top: 20px;">
                <button id="loadCardsBtn" class="btn btn-primary">Load New Holocrons</button>
            </div>
        </div>

        <div id="quizMode" class="quiz-mode" style="display: none;">
            <div class="loading" id="loadingQuiz" style="display: none;">
                <div class="spinner"></div>
                <p>Building your gauntlet...</p>
            </div>
            <div id="quizContainer" class="quiz-container">
                <div id="blast-container"></div>
                <div class="quiz-header">
                    <h2>The Gauntlet</h2>
                    <p class="score">Score: <span id="quizScore">0</span> / <span id="quizTotal">0</span></p>
                </div>
                <div class="quiz-question">
                    <p class="question-text" id="questionText">Click "Start" to begin!</p>
                    <div class="quiz-options" id="quizOptions"></div>
                </div>
                <div class="quiz-nav">
                    <button id="startQuizBtn" class="btn btn-primary">Start New Gauntlet</button>
                    <button id="blitzBtn" class="btn btn-secondary">Start Blizzard Blitz! ❄️</button>
                    <button id="nextQuestionBtn" class="btn btn-nav" style="display: none;">
                        Next Question →
                    </button>
                </div>
            </div>
        </div>
        <div class="settings-btn" style="text-align: center; margin-top: 20px;">
             <button id="muteBtn" class="btn btn-secondary">🔊 Sound On</button>
        </div>
    `;

    let currentLanguage = 'english';
    let currentCategory = 'slang';
    let currentMode = 'flashcard';
    let flashcards = [];
    let currentCardIndex = 0;
    let quizQuestions = [];
    let currentQuestionIndex = 0;
    let quizScore = 0;
    let currentStreak = 0;
    let timerInterval;
    let userStats = JSON.parse(localStorage.getItem('canadianEhStats')) || {
        perfectQuizzes: 0,
        cardsFlipped: 0,
        badges: []
    };

    let companionBubble, companionAvatar;
    let mainAppContainer = document.getElementById('main-app');
    let story2HasTyped = false; 

    function showScreen(screenId) {
        document.querySelectorAll('.story-screen').forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.classList.add('active');
            activeScreen.classList.remove('hidden');
        }

        if (screenId === 'story-screen-2' && !story2HasTyped) {
            initStory2(); 
            story2HasTyped = true; 
        }
    }

    function choosePath(mode) {
        document.getElementById('story-screen-1').classList.add('hidden');
        document.getElementById('story-screen-2').classList.add('hidden');
        document.getElementById('story-screen-1').style.display = 'none';
        document.getElementById('story-screen-2').style.display = 'none';

        mainAppContainer.innerHTML = mainAppHTML;
        wireUpAppListeners();
        setMode(mode);
        loadNewFlashcards();
        
    }

    function wireUpAppListeners() {
        companionBubble = document.getElementById('companionBubble');
        companionAvatar = document.getElementById('companionAvatar');

        document.getElementById('englishBtn').onclick = () => setLanguage('english');
        document.getElementById('frenchBtn').onclick = () => setLanguage('french');
        document.getElementById('categorySelect').onchange = loadNewFlashcards;
        document.getElementById('flashcardBtn').onclick = () => setMode('flashcard');
        document.getElementById('quizBtn').onclick = () => setMode('quiz');

        document.getElementById('flashcard').onclick = flipCard;
        document.getElementById('prevCardBtn').onclick = previousCard;
        document.getElementById('nextCardBtn').onclick = nextCard;
        document.getElementById('loadCardsBtn').onclick = loadNewFlashcards;

        document.getElementById('startQuizBtn').onclick = loadNewQuiz;
        document.getElementById('blitzBtn').onclick = startBlizzardBlitz;
        document.getElementById('nextQuestionBtn').onclick = nextQuestion;

        document.getElementById('muteBtn').onclick = () => {};
    }

    function spawnFlyingElement() {
        const container = document.getElementById('animation-container');
        if (!container) return;
        const element = document.createElement('div');
        element.className = 'flying-element';

        const icons = ['🍁', '🚀', '🦸', '✨', '🛰️', '💫', '🇨🇦', '🤖', '☄️', '🪐'];
        element.textContent = icons[Math.floor(Math.random() * icons.length)];

        element.style.top = `${Math.random() * 90}vh`;
        element.style.animationDuration = `${5 + Math.random() * 5}s`;
        element.style.animationDelay = `${Math.random() * 3}s`;

        container.appendChild(element);
        setTimeout(() => element.remove(), 10000);
    }

    function spawnOrbitingPlanet() {
        const container = document.getElementById('animation-container');
        if (!container) return;
        const planet = document.createElement('div');
        planet.className = 'orbiting-planet';
        planet.textContent = '🪐';
        container.appendChild(planet);
    }

    function triggerBlastAnimation(x, y) {
        const blastContainer = document.getElementById('blast-container');
        if (!blastContainer) return;

        const containerRect = blastContainer.getBoundingClientRect();
        const localX = x - containerRect.left;
        const localY = y - containerRect.top;

        const ring = document.createElement('div');
        ring.className = 'blast-ring';
        ring.style.left = `${localX}px`;
        ring.style.top = `${localY}px`;
        blastContainer.appendChild(ring);
        setTimeout(() => ring.remove(), 600);

        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'blast-particle';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50 + 50;
            const translateX = Math.cos(angle) * distance;
            const translateY = Math.sin(angle) * distance;

            particle.style.left = `${localX}px`;
            particle.style.top = `${localY}px`;
            
            particle.style.setProperty('--x', `${translateX}px`);
            particle.style.setProperty('--y', `${translateY}px`);

            particle.style.animation = 'none';
            void particle.offsetWidth;
            particle.style.animation = `blast-particle 600ms ease-out forwards`;
            
            particle.style.transform = `translate(${translateX}px, ${translateY}px)`;

            blastContainer.appendChild(particle);
            setTimeout(() => particle.remove(), 600);
        }
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        document.getElementById('englishBtn').classList.toggle('active', lang === 'english');
        document.getElementById('frenchBtn').classList.toggle('active', lang === 'french');
        loadNewFlashcards();
    }

    function setMode(mode) {
        currentMode = mode;
        document.getElementById('flashcardMode').style.display = mode === 'flashcard' ? 'block' : 'none';
        document.getElementById('quizMode').style.display = mode === 'quiz' ? 'block' : 'none';
        document.getElementById('flashcardBtn').classList.toggle('active', mode === 'flashcard');
        document.getElementById('quizBtn').classList.toggle('active', mode === 'quiz');
    }

    async function loadDataset(language, category) {
        let loadingEl;
        if (currentMode === 'flashcard') {
            loadingEl = document.getElementById('loadingFlashcard');
        } else {
            loadingEl = document.getElementById('loadingQuiz');
        }
        if (loadingEl) loadingEl.style.display = 'block';

        try {
            const response = await fetch(`./data/${language}/${category}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Could not load dataset:", error);
            companionReact('error', "Oops! Couldn't load the data. Are you using a local server?");
            return [];
        } finally {
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }

    async function loadNewFlashcards() {
        if (!document.getElementById('categorySelect')) return;
        currentCategory = document.getElementById('categorySelect').value;
        flashcards = await loadDataset(currentLanguage, currentCategory);
        currentCardIndex = 0;
        updateCardDisplay();
        if (flashcards.length > 0) {
           companionReact('load', `Loaded ${flashcards.length} holocrons!`);
        }
    }

    function updateCardDisplay() {
        if (flashcards.length === 0) {
            if (document.getElementById('cardTerm')) {
                document.getElementById('cardTerm').textContent = "No holocrons found!";
            }
            if (document.getElementById('cardCounter')) {
                document.getElementById('cardCounter').textContent = "0 / 0";
            }
            return;
        };
        const card = flashcards[currentCardIndex];
        document.getElementById('cardTerm').textContent = card.term;
        document.getElementById('cardMeaning').textContent = card.meaning;
        document.getElementById('cardExample').textContent = `"${card.example}"`;
        document.getElementById('cardFact').textContent = `Intel: ${card.funFact}`;
        document.getElementById('cardCounter').textContent = `${currentCardIndex + 1} / ${flashcards.length}`;
        document.getElementById('flashcard').classList.remove('flipped');
    }

    function flipCard() {
        if (flashcards.length > 0) {
            document.getElementById('flashcard').classList.toggle('flipped');
            userStats.cardsFlipped++;
            saveStats();
        }
    }

    function nextCard() {
        if (flashcards.length > 0) {
            currentCardIndex = (currentCardIndex + 1) % flashcards.length;
            updateCardDisplay();
        }
    }

    function previousCard() {
        if (flashcards.length > 0) {
            currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
            updateCardDisplay();
        }
    }

    async function loadNewQuiz() {
        clearInterval(timerInterval);
        const timerDisplay = document.querySelector('.timer');
        if(timerDisplay) timerDisplay.remove();

        currentCategory = document.getElementById('categorySelect').value;
        const quizData = await loadDataset(currentLanguage, currentCategory);
        if (quizData.length < 4) {
             companionReact('error', "Not enough data to build a gauntlet!");
             return;
        }
        quizQuestions = buildQuiz(quizData, 5);
        currentQuestionIndex = 0;
        quizScore = 0;
        updateQuizScore();
        displayQuestion();
        companionReact('load', `Gauntlet is ready! Good luck, Star-Rider!`);
    }

    function buildQuiz(cards, numQuestions) {
        const shuffled = [...cards].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numQuestions);
        return selected.map(card => {
            let distractors = shuffled.filter(c => c.term !== card.term).slice(0, 3).map(c => c.meaning);
            const options = [...distractors, card.meaning].sort(() => 0.5 - Math.random());
            return { question: `What is the frequency of "${card.term}"?`, options, correctAnswer: card.meaning };
        });
    }

    function displayQuestion() {
        const q = quizQuestions[currentQuestionIndex];
        document.getElementById('questionText').textContent = q.question;
        const optionsContainer = document.getElementById('quizOptions');
        optionsContainer.innerHTML = '';
        q.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'btn quiz-option';
            button.textContent = option;
            button.onclick = () => selectAnswer(option, button);
            optionsContainer.appendChild(button);
        });
        document.getElementById('nextQuestionBtn').style.display = 'none';
    }

    function selectAnswer(selectedOption, btnElement) {
        document.querySelectorAll('.quiz-option').forEach(btn => btn.disabled = true);

        const q = quizQuestions[currentQuestionIndex];
        const isCorrect = selectedOption === q.correctAnswer;
        
        if (isCorrect) { 
            quizScore++; 
            currentStreak++; 
            companionReact('correct'); 
            btnElement.classList.add('correct');
            
            const rect = btnElement.getBoundingClientRect();
            triggerBlastAnimation(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } 
        else { 
            currentStreak = 0; 
            companionReact('incorrect'); 
            btnElement.classList.add('incorrect');
            document.querySelectorAll('.quiz-option').forEach(btn => {
                if (btn.textContent === q.correctAnswer) btn.classList.add('correct');
            });
        }
        updateQuizScore();
        
        if (currentQuestionIndex < quizQuestions.length - 1) {
             document.getElementById('nextQuestionBtn').style.display = 'inline-block';
        } else {
            if (quizScore === quizQuestions.length) {
                userStats.perfectQuizzes++;
                checkForBadges('perfect');
                saveStats();
            }
            companionReact('perfect', `Gauntlet complete! Score: ${quizScore}/${quizQuestions.length}!`);
        }
    }

    function nextQuestion() { 
        currentQuestionIndex++; 
        displayQuestion(); 
    }
    
    function updateQuizScore(){
        document.getElementById('quizScore').textContent = quizScore;
        document.getElementById('quizTotal').textContent = quizQuestions.length;
    }

    async function startBlizzardBlitz() {
        await loadNewQuiz();
        if(quizQuestions.length === 0) return;

        let timeLeft = 30;
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'timer';
        document.getElementById('quizContainer').prepend(timerDisplay);

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timerDisplay.textContent = `❄️ ${timeLeft}s`;
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                document.getElementById('quizOptions').innerHTML = '<h2>Time\'s up!</h2>';
                companionReact('perfect', `Blitz over! Final score: ${quizScore}`);
                timerDisplay.remove();
            }
        }, 1000);
    }
    
    function saveStats() { localStorage.setItem('canadianEhStats', JSON.stringify(userStats)); }

    function checkForBadges(trigger) {
        const badges = {
            'perfect_1': { name: 'Toque Trick', description: 'Get your first perfect quiz score!' },
            'perfect_5': { name: 'Certified Keener', description: 'Get 5 perfect scores!' }
        };
        if (trigger === 'perfect' && userStats.perfectQuizzes === 1 && !userStats.badges.includes('perfect_1')) {
            userStats.badges.push('perfect_1');
            showBadgePopup(badges.perfect_1);
            saveStats();
        }
         if (trigger === 'perfect' && userStats.perfectQuizzes === 5 && !userStats.badges.includes('perfect_5')) {
            userStats.badges.push('perfect_5');
            showBadgePopup(badges.perfect_5);
            saveStats();
        }
    }

    function showBadgePopup(badge) {
        const popup = document.createElement('div');
        popup.className = 'badge-popup';
        popup.innerHTML = `<h2>🚀 Badge Unlocked!</h2><p>${badge.name}</p>`;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 4000);
    }

    function companionReact(type, message) {
        if (!companionBubble) return;
        companionAvatar.classList.remove('cheer');
        let bubbleText = message;
        if (!bubbleText) {
            const messages = {
                correct: ["Power levels rising!", "Great Scott!", "You got it, eh!", "Correct frequency!"],
                incorrect: ["So close!", "Wrong frequency!", "Recalibrating...", "Don't give up!"],
                load: ["Holocrons loaded!", "Gauntlet ready!"]
            };
            bubbleText = messages[type][Math.floor(Math.random() * messages[type].length)];
        }
        companionBubble.textContent = bubbleText;
        if(type === 'correct') companionAvatar.classList.add('cheer');
    }

    async function typeEffect(element, text, speed) {
        return new Promise((resolve) => {
            let i = 0;
            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    element.style.borderRight = 'none';
                    resolve();
                }
            }
            type();
        });
    }

    async function initStory() {
        const storyTextEl = document.getElementById('story-text');
        const storyButton = document.getElementById('start-mission-btn');
        const story = `Star-Rider, you are our last hope! An entity known as the "Void of Silence" is sweeping across the cosmos, erasing culture... The linguistic constellations of the Canadian Quadrant are fading...`;

        await typeEffect(storyTextEl, story, 30);
        
        storyButton.style.opacity = 1;
        storyButton.style.transition = 'opacity 0.5s ease-in';
    }

    async function initStory2() {
        const storyTextEl = document.getElementById('story-text-2');
        const choiceContainer = document.getElementById('choice-container');
        const story = `To restore the constellations, you must reignite them. Only by mastering the unique frequencies of Canadian English and Québécois French can you push back the Void. How will you begin your training?`;

        await typeEffect(storyTextEl, story, 30);
        
        choiceContainer.style.opacity = 1;
    }

    document.getElementById('start-mission-btn').onclick = () => showScreen('story-screen-2');
    document.querySelectorAll('.choice-buttons button').forEach(button => {
        button.onclick = () => choosePath(button.dataset.mode);
    });
    
    initStory();

    spawnOrbitingPlanet(); 
    setInterval(spawnFlyingElement, 2500);
});

