/* =========================================
   BREAK THE MOLE
   ========================================= */

const arena = document.getElementById("arena");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");

const startButton =
    document.getElementById("startButton");

const modalButton =
    document.getElementById("modalButton");

const overlay =
    document.getElementById("overlay");

const modalTitle =
    document.getElementById("modalTitle");

const modalText =
    document.getElementById("modalText");

const statusText =
    document.getElementById("statusText");

const statusDot =
    document.getElementById("statusDot");

const difficultyEl =
    document.getElementById("difficulty");


/* =========================================
   GAME VARIABLES
   ========================================= */

let score = 0;

let time = 30;

let best =
    Number(
        localStorage.getItem("moleBest")
    ) || 0;

let gameRunning = false;

let timer;

let moleTimer;

let activeMole = null;

let combo = 0;

let level = 1;

let lastHit = 0;


/* Show best score */

bestEl.textContent = best;


/* =========================================
   CREATE HOLES
   ========================================= */

const HOLE_COUNT = 12;

for (let i = 0; i < HOLE_COUNT; i++) {

    const hole =
        document.createElement("div");

    hole.className = "hole";

    hole.dataset.index = i;

    arena.appendChild(hole);
}


/* =========================================
   CREATE MOLE
   ========================================= */

function createMole(hole) {

    const mole =
        document.createElement("div");

    mole.className = "mole";


    mole.innerHTML = `

        <div class="mole-body"></div>

        <div class="mole-face">

            <div class="eye left"></div>

            <div class="eye right"></div>

            <div class="nose"></div>

            <div class="teeth"></div>

        </div>

    `;


    mole.addEventListener(
        "pointerdown",
        hitMole
    );


    hole.appendChild(mole);


    requestAnimationFrame(() => {

        mole.classList.add("show");

    });


    return mole;
}


/* =========================================
   SHOW RANDOM MOLE
   ========================================= */

function showMole() {

    if (!gameRunning) return;


    if (activeMole) {

        activeMole.remove();

        activeMole = null;

    }


    const holes =
        [...document.querySelectorAll(".hole")];


    const selectedHole =
        holes[
            Math.floor(
                Math.random() * holes.length
            )
        ];


    activeMole =
        createMole(selectedHole);


    const speed =
        Math.max(
            450,
            1150 - level * 70
        );


    moleTimer =
        setTimeout(
            showMole,
            speed
        );
}


/* =========================================
   HIT MOLE
   ========================================= */

function hitMole(event) {

    event.preventDefault();


    if (!gameRunning) return;


    const mole =
        event.currentTarget;


    if (
        mole.classList.contains("hit")
    ) {
        return;
    }


    const now =
        Date.now();


    /* Combo */

    if (
        now - lastHit < 1500
    ) {

        combo++;

    } else {

        combo = 1;

    }


    lastHit = now;


    /* Points */

    const comboBonus =
        Math.min(
            combo * 2,
            20
        );


    const points =
        10 + comboBonus;


    score += points;


    scoreEl.textContent =
        score;


    /* Animation */

    mole.classList.add("hit");


    createHitText(
        mole,
        "+" + points
    );


    /* Sound */

    playHitSound();


    /* Level */

    const newLevel =
        Math.min(
            10,
            Math.floor(score / 100) + 1
        );


    if (
        newLevel !== level
    ) {

        level = newLevel;

        difficultyEl.textContent =
            "Level " + level;

    }


    setTimeout(() => {

        if (
            mole === activeMole
        ) {

            activeMole = null;

        }

    }, 180);
}


/* =========================================
   SCORE POPUP
   ========================================= */

function createHitText(
    element,
    text
) {

    const rect =
        element.getBoundingClientRect();

    const arenaRect =
        arena.getBoundingClientRect();


    const popup =
        document.createElement("div");


    popup.className =
        "hit-text";


    popup.textContent =
        text;


    popup.style.left =
        (
            rect.left -
            arenaRect.left +
            rect.width / 2 -
            15
        ) + "px";


    popup.style.top =
        (
            rect.top -
            arenaRect.top +
            10
        ) + "px";


    arena.appendChild(popup);


    setTimeout(() => {

        popup.remove();

    }, 700);
}


/* =========================================
   START GAME
   ========================================= */

function startGame() {

    clearInterval(timer);

    clearTimeout(moleTimer);


    score = 0;

    time = 30;

    combo = 0;

    level = 1;

    lastHit = 0;


    scoreEl.textContent =
        score;

    timeEl.textContent =
        time;

    difficultyEl.textContent =
        "Level 1";


    gameRunning = true;


    statusText.textContent =
        "Game in progress";


    statusDot.classList.add(
        "live"
    );


    startButton.disabled =
        true;


    startButton.textContent =
        "GAME RUNNING...";


    modalButton.textContent =
        "PLAY AGAIN";


    overlay.classList.add(
        "hidden"
    );


    showMole();


    timer =
        setInterval(() => {

            time--;

            timeEl.textContent =
                time;


            if (time <= 0) {

                endGame();

            }

        }, 1000);
}


/* =========================================
   END GAME
   ========================================= */

function endGame() {

    gameRunning = false;


    clearInterval(timer);

    clearTimeout(moleTimer);


    if (activeMole) {

        activeMole.remove();

        activeMole = null;

    }


    statusText.textContent =
        "Game over";


    statusDot.classList.remove(
        "live"
    );


    startButton.disabled =
        false;


    startButton.textContent =
        "PLAY AGAIN";


    /* New high score */

    if (score > best) {

        best = score;


        localStorage.setItem(
            "moleBest",
            best
        );


        bestEl.textContent =
            best;


        modalTitle.textContent =
            "🏆 NEW RECORD!";

    } else {

        modalTitle.textContent =
            "TIME'S UP!";

    }


    modalText.innerHTML = `

        You scored
        <strong>${score}</strong>
        points.

        <br>

        ${
            score >= best && score > 0
            ? "Amazing performance!"
            : "Can you beat your best score?"
        }

    `;


    modalButton.textContent =
        "PLAY AGAIN";


    overlay.classList.remove(
        "hidden"
    );
}


/* =========================================
   BUTTONS
   ========================================= */

startButton.addEventListener(
    "click",
    startGame
);


modalButton.addEventListener(
    "click",
    startGame
);


/* =========================================
   SOUND
   ========================================= */

let audioContext;


function playHitSound() {

    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.type =
            "square";


        oscillator.frequency.setValueAtTime(
            520,
            audioContext.currentTime
        );


        oscillator.frequency
            .exponentialRampToValueAtTime(
                850,
                audioContext.currentTime + .08
            );


        gain.gain.setValueAtTime(
            .09,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            .001,
            audioContext.currentTime + .12
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();


        oscillator.stop(
            audioContext.currentTime + .12
        );

    } catch (error) {

        // Audio is optional.

    }
}


/* =========================================
   KEYBOARD SUPPORT
   ========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" &&
            !gameRunning
        ) {

            event.preventDefault();

            startGame();

        }

    }
);


/* =========================================
   PREVENT DRAGGING
   ========================================= */

document.addEventListener(
    "dragstart",
    event => {

        event.preventDefault();

    }
);


/* =========================================
   INITIAL STATE
   ========================================= */

timeEl.textContent =
    "30";

scoreEl.textContent =
    "0";

bestEl.textContent =
    best;
