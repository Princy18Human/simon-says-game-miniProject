let gameSeq = [];
let userSeq = [];
let btns = ["red", "yellow", "green", "purple"];
let started = false;
let level = 0;
let score = 0;
let highScore = 0;
let strictMode = false;
let canClick = false;

const gameMessage = document.getElementById("game-message");
const levelDisplay = document.getElementById("level-display");
const levelElement = document.getElementById("level");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const startBtn = document.getElementById("start-btn");
const strictBtn = document.getElementById("strict-btn");
const allBtns = document.querySelectorAll(".btn");
const container = document.querySelector(".container");

// Initialize high score from localStorage if available
if (localStorage.getItem("simonHighScore")) {
    highScore = parseInt(localStorage.getItem("simonHighScore"));
    highScoreElement.textContent = highScore;
}

// Start game on keypress or button click
document.addEventListener("keypress", function(event) {
    if (event.code === "Space" && !started) {
        startGame();
    }
});

startBtn.addEventListener("click", function() {
    if (!started) {
        startGame();
    } else {
        resetGame();
        startGame();
    }
});

strictBtn.addEventListener("click", function() {
    strictMode = !strictMode;
    this.textContent = `Strict Mode: ${strictMode ? "ON" : "OFF"}`;
    this.style.background = strictMode ? 
        "linear-gradient(to right, #ff416c, #ff4b2b)" : 
        "linear-gradient(to right, #ff7e5f, #feb47b)";
});

function startGame() {
    started = true;
    level = 0;
    score = 0;
    gameSeq = [];
    userSeq = [];
    startBtn.textContent = "Restart Game";
    startBtn.classList.add("pulse");
    levelUp();
}

function resetGame() {
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
    score = 0;
    levelDisplay.textContent = "0";
    levelElement.textContent = "0";
    scoreElement.textContent = "0";
    gameMessage.textContent = "Press Start or Spacebar to Play";
    gameMessage.style.color = "#f0f0f0";
    startBtn.textContent = "Start Game";
    startBtn.classList.remove("pulse");
    container.classList.remove("game-over");
}

function gameFlash(btn) {
    btn.classList.add("flash");
    createParticles(btn);
    setTimeout(function() {
        btn.classList.remove("flash");
    }, 500);
}

function userFlash(btn) {
    btn.classList.add("userFlash");
    createParticles(btn, true);
    setTimeout(function() {
        btn.classList.remove("userFlash");
    }, 300);
}

function createParticles(btn, isUser = false) {
    const btnRect = btn.getBoundingClientRect();
    const centerX = btnRect.left + btnRect.width / 2;
    const centerY = btnRect.top + btnRect.height / 2;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 10 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        if (isUser) {
            particle.style.background = 'rgba(0, 255, 100, 0.8)';
        } else {
            const color = window.getComputedStyle(btn).backgroundImage;
            particle.style.background = color;
        }
        
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

function levelUp() {
    level++;
    score = level * 10;
    levelDisplay.textContent = level;
    levelElement.textContent = level;
    scoreElement.textContent = score;
    
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem("simonHighScore", highScore);
    }
    
    userSeq = [];
    canClick = false;
    gameMessage.textContent = `Watch carefully! Level ${level}`;
    gameMessage.style.color = "#f0f0f0";
    
    let randIdx = Math.floor(Math.random() * 4);
    let randColor = btns[randIdx];
    gameSeq.push(randColor);
    
    let currentIndex = 0;
    let interval = setInterval(function() {
        if (currentIndex >= gameSeq.length) {
            clearInterval(interval);
            canClick = true;
            gameMessage.textContent = "Your turn! Repeat the sequence";
            gameMessage.style.color = "#a8e063";
            return;
        }
        
        let btnColor = gameSeq[currentIndex];
        let btn = document.getElementById(btnColor);
        gameFlash(btn);
        
        // Play sound for the button
        playSound(btnColor);
        
        currentIndex++;
    }, 800);
}

function playSound(color) {
    const audio = new Audio();
    switch(color) {
        case "red":
            audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3";
            break;
        case "yellow":
            audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-arcade-mechanical-bling-210.mp3";
            break;
        case "green":
            audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-arcade-video-game-bonus-2044.mp3";
            break;
        case "purple":
            audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3";
            break;
    }
    audio.play();
}

function checkAns(idx) {
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length === gameSeq.length) {
            setTimeout(levelUp, 1000);
        }
    } else {
        // Game over
        playSound("wrong");
        gameMessage.innerHTML = `Game Over! Your score was <b>${level}</b>. <br>Press Start to play again.`;
        gameMessage.style.color = "#ff7e5f";
        container.classList.add("game-over");
        
        if (strictMode) {
            resetGame();
        } else {
            setTimeout(function() {
                container.classList.remove("game-over");
                userSeq = [];
                canClick = true;
                gameMessage.textContent = "Try again! Repeat the sequence";
                gameMessage.style.color = "#a8e063";
            }, 1500);
        }
    }
}

function btnPress() {
    if (!canClick || !started) return;
    
    let btn = this;
    let userColor = btn.getAttribute("id");
    userSeq.push(userColor);
    
    userFlash(btn);
    playSound(userColor);
    checkAns(userSeq.length - 1);
}

// Add event listeners to all buttons
for (let btn of allBtns) {
    btn.addEventListener("click", btnPress);
}

// Add touch event listeners for mobile devices
for (let btn of allBtns) {
    btn.addEventListener("touchstart", function(e) {
        e.preventDefault();
        if (!canClick || !started) return;
        
        let userColor = this.getAttribute("id");
        userSeq.push(userColor);
        
        userFlash(this);
        playSound(userColor);
        checkAns(userSeq.length - 1);
    });
}