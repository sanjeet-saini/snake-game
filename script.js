const board = document.querySelector('#board');
const scoreBox = document.querySelector('#scoreBox');
const hiscoreBox = document.querySelector('#hiscoreBox');
const gameButton = document.querySelector('#gameButton');

const foodSound = new Audio('audio/food.mp3');
const gameOverSound = new Audio('audio/gameover.mp3');
const moveSound = new Audio('audio/move.mp3');
const musicSound = new Audio('audio/music.mp3');

const BOARD_SIZE = 20;
const speed = 8;

let inputDir = { x: 0, y: 0 };
let score = 0;
let lastPaintTime = 0;
let isPaused = false;
let food = { x: 6, y: 7 };
let snakeArr = createStartingSnake();

function createStartingSnake() {
    return [
        { x: 13, y: 10 }, // head
        { x: 13, y: 11 }, // body
        { x: 13, y: 12 }  // tail
    ];
}

function main(currentTime) {
    window.requestAnimationFrame(main);

    if ((currentTime - lastPaintTime) / 1000 < 1 / speed) {
        return;
    }

    lastPaintTime = currentTime;
    gameEngine();
}

function gameEngine() {
    if (isPaused) {
        drawGame();
        return;
    }

    // Game tab tak move nahi hoga jab tak arrow key press na ho.
    if (inputDir.x !== 0 || inputDir.y !== 0) {
        const previousTailPosition = moveSnake();

        if (isCollide()) {
            resetGame();
            drawGame();
            return;
        }

        if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
            growSnake(previousTailPosition);
            createNewFood();
        }
    }

    drawGame();
}

function moveSnake() {
    const previousTailPosition = { ...snakeArr[snakeArr.length - 1] };

    // Har segment apne aage wale segment ki purani position leta hai.
    for (let i = snakeArr.length - 1; i > 0; i--) {
        snakeArr[i] = { ...snakeArr[i - 1] };
    }

    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    return previousTailPosition;
}

function growSnake(previousTailPosition) {
    foodSound.currentTime = 0;
    foodSound.play().catch(() => {});

    score += 1;
    scoreBox.innerText = `Score: ${score}`;

    // Move se khaali hui purani tail cell mein naya box add hota hai.
    // Purani tail body ban jaati hai aur naya last box tail rehta hai.
    snakeArr.push(previousTailPosition);

    if (score > hiscoreval) {
        hiscoreval = score;
        localStorage.setItem('hiscore', JSON.stringify(hiscoreval));
        hiscoreBox.innerText = `HiScore: ${hiscoreval}`;
    }
}

function createNewFood() {
    do {
        food = {
            x: Math.floor(Math.random() * BOARD_SIZE) + 1,
            y: Math.floor(Math.random() * BOARD_SIZE) + 1
        };
    } while (snakeArr.some(part => part.x === food.x && part.y === food.y));
}

function isCollide() {
    const head = snakeArr[0];

    if (head.x < 1 || head.x > BOARD_SIZE || head.y < 1 || head.y > BOARD_SIZE) {
        return true;
    }

    return snakeArr.slice(1).some(part => part.x === head.x && part.y === head.y);
}

function resetGame() {
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {});
    musicSound.pause();

    alert('Game Over. Arrow key dabakar dobara start karein!');

    inputDir = { x: 0, y: 0 };
    snakeArr = createStartingSnake();
    score = 0;
    scoreBox.innerText = 'Score: 0';
    createNewFood();
}

function drawGame() {
    board.innerHTML = '';

    snakeArr.forEach((part, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = part.y;
        snakeElement.style.gridColumnStart = part.x;

        if (index === 0) {
            snakeElement.classList.add('head');
            snakeElement.style.transform = `rotate(${getHeadRotation()}deg)`;
        } else if (index === snakeArr.length - 1) {
            snakeElement.classList.add('tail');
            snakeElement.style.transform = `rotate(${getTailRotation(index)}deg)`;
        } else {
            snakeElement.classList.add('snake');
            snakeElement.style.transform = `rotate(${getBodyRotation(index)}deg)`;
        }

        board.appendChild(snakeElement);
    });

    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food');
    board.appendChild(foodElement);
}

function getHeadRotation() {
    if (inputDir.x === 1) return 90;
    if (inputDir.x === -1) return -90;
    if (inputDir.y === 1) return 180;
    return 0;
}

function getBodyRotation(index) {
    const previousPart = snakeArr[index - 1];
    const nextPart = snakeArr[index + 1];
    return previousPart.x === nextPart.x ? 0 : 90;
}

function getTailRotation(index) {
    const tail = snakeArr[index];
    const previousPart = snakeArr[index - 1];

    if (previousPart.x > tail.x) return 90;
    if (previousPart.x < tail.x) return -90;
    if (previousPart.y > tail.y) return 180;
    return 0;
}

function changeDirection(newDirection) {
    // Snake ko seedha opposite direction mein mudne se rokta hai.
    const isOpposite =
        inputDir.x + newDirection.x === 0 &&
        inputDir.y + newDirection.y === 0 &&
        (inputDir.x !== 0 || inputDir.y !== 0);

    if (isOpposite) return;

    inputDir = newDirection;
    moveSound.currentTime = 0;
    moveSound.play().catch(() => {});
}

let hiscoreval = Number(localStorage.getItem('hiscore')) || 0;
hiscoreBox.innerText = `HiScore: ${hiscoreval}`;

window.addEventListener('keydown', event => {
    const directions = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
    };

    const newDirection = directions[event.key];
    if (!newDirection) return;

    event.preventDefault();
    changeDirection(newDirection);
});

gameButton.addEventListener('click', () => {
    isPaused = !isPaused;
    gameButton.innerText = isPaused ? 'Resume Game' : 'Pause Game';
});

drawGame();
window.requestAnimationFrame(main);
