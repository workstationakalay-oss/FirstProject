const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const statusEl = document.getElementById("status");
const restartButton = document.getElementById("restartButton");

const gridSize = 20;
const cellSize = canvas.width / gridSize;
const startingLength = 4;
const tickRate = 120;

let snake;
let direction;
let pendingDirection;
let food;
let score;
let highScore;
let gameLoopId;
let isPaused = false;

const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

const loadHighScore = () => {
  const saved = Number(window.localStorage.getItem("snake-high-score"));
  return Number.isFinite(saved) ? saved : 0;
};

const saveHighScore = () => {
  window.localStorage.setItem("snake-high-score", String(highScore));
};

const updateScore = (nextScore) => {
  score = nextScore;
  scoreEl.textContent = score;
  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
    saveHighScore();
  }
};

const resetGame = () => {
  snake = [];
  const startX = Math.floor(gridSize / 2);
  const startY = Math.floor(gridSize / 2);
  for (let i = 0; i < startingLength; i += 1) {
    snake.push({ x: startX - i, y: startY });
  }
  direction = { x: 1, y: 0 };
  pendingDirection = direction;
  food = spawnFood();
  updateScore(0);
  statusEl.textContent = "Ready?";
  isPaused = false;
};

const spawnFood = () => {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some((segment) => segment.x === position.x && segment.y === position.y));
  return position;
};

const setStatus = (message) => {
  statusEl.textContent = message;
};

const togglePause = () => {
  isPaused = !isPaused;
  setStatus(isPaused ? "Paused" : "Running");
};

const isOpposite = (dirA, dirB) => dirA.x + dirB.x === 0 && dirA.y + dirB.y === 0;

const handleKey = (event) => {
  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  if (event.key.toLowerCase() === "r") {
    startGame();
    return;
  }

  const next = directions[event.key] || directions[event.key.toLowerCase()];
  if (!next || isOpposite(next, direction)) {
    return;
  }
  pendingDirection = next;
};

const update = () => {
  if (isPaused) {
    draw();
    return;
  }

  direction = pendingDirection;
  const head = {
    x: (snake[0].x + direction.x + gridSize) % gridSize,
    y: (snake[0].y + direction.y + gridSize) % gridSize,
  };

  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    setStatus("Game over! Press R or Restart.");
    isPaused = true;
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    updateScore(score + 1);
    food = spawnFood();
    setStatus("Nom nom! Keep going.");
  } else {
    snake.pop();
  }

  draw();
};

const drawGrid = () => {
  context.strokeStyle = "rgba(148, 163, 184, 0.1)";
  context.lineWidth = 1;
  for (let i = 0; i <= gridSize; i += 1) {
    const pos = i * cellSize;
    context.beginPath();
    context.moveTo(pos, 0);
    context.lineTo(pos, canvas.height);
    context.stroke();
    context.beginPath();
    context.moveTo(0, pos);
    context.lineTo(canvas.width, pos);
    context.stroke();
  }
};

const drawSnake = () => {
  snake.forEach((segment, index) => {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#5eead4");
    gradient.addColorStop(1, "#14b8a6");
    context.fillStyle = index === 0 ? "#fef3c7" : gradient;
    context.fillRect(
      segment.x * cellSize + 2,
      segment.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4
    );
  });
};

const drawFood = () => {
  context.fillStyle = "#f43f5e";
  context.beginPath();
  context.arc(
    food.x * cellSize + cellSize / 2,
    food.y * cellSize + cellSize / 2,
    cellSize / 2.6,
    0,
    Math.PI * 2
  );
  context.fill();
};

const draw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#0b1020";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
};

const startLoop = () => {
  if (gameLoopId) {
    clearInterval(gameLoopId);
  }
  gameLoopId = setInterval(update, tickRate);
};

const startGame = () => {
  resetGame();
  startLoop();
  draw();
  setStatus("Running");
};

highScore = loadHighScore();
highScoreEl.textContent = highScore;

window.addEventListener("keydown", handleKey);
restartButton.addEventListener("click", startGame);

startGame();
