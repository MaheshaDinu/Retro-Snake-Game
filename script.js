// Fix for snake game to ensure head direction aligns with movement
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const stopButton = document.getElementById("stopButton");
const tryAgainButton = document.getElementById("tryAgainButton");
const arrowControls = document.querySelector(".arrow-controls");
const scoreDisplay = document.getElementById("scoreDisplay");

const headImage = document.getElementById("headImage");
const specialFoodMouse = document.getElementById("specialFoodMouse");
const normalFoodApple = document.getElementById("normalFoodApple")

let snake = [{ x: 150, y: 150 }];
let direction = "RIGHT";
let food = { x: 0, y: 0 };
let score = 0;
let level = 1;
let speed = 500; // Initial speed
let isRunning = false;
let gameInterval;
let isSpecialFood = true;
let specialFoodTimer;
let gridSize = 15;

let foodIcons = {
  normal: normalFoodApple.src, // Default food icon
  special: specialFoodMouse.src, // Special food icon
};

// Initialize game
function initGame() {
  score = 0;
  level = 1;
  speed = 300; // Reset speed
  snake = [{ x: 150, y: 150 }];
  direction = "RIGHT"; // Default initial direction
  spawnFood();
  updateScore();
  clearCanvas();
}
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Start game
function startGame() {
  initGame();
  toggleButtons("start");
  arrowControls.classList.remove("hidden");
  isRunning = true;
  resetSpecialFoodTimer();
  gameInterval = setInterval(updateGame, speed);
}

// Pause game
function pauseGame() {
  clearInterval(gameInterval);
  toggleButtons("pause");
  isRunning = false;
}

// Resume game
function resumeGame() {
  toggleButtons("resume");
  isRunning = true;
  gameInterval = setInterval(updateGame, speed);
}
const shareLink = document.createElement("a");
// Stop game
function stopGame() {
  clearInterval(gameInterval);
  clearTimeout(specialFoodTimer);
  isRunning = false;

  // Display final score on canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 30px monospace";
  ctx.fillStyle = "#0f380f";
  ctx.textAlign = "center";
  ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);

  // Generate shareable URL
  const baseURL = "https://theretrosnakegame.netlify.app/";
  const shareText = `I scored ${score} in Retro Snake Game! Can you beat my score?`;
  const shareURL = `${baseURL}?score=${encodeURIComponent(score)}&text=${encodeURIComponent(shareText)}`;

  // Create share link
  
  shareLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}`;
  shareLink.target = "_blank";
  shareLink.textContent = "Share Your Score!";
  shareLink.className = "share-button";
  shareLink.style.display = "block";
  shareLink.style.marginTop = "20px";
  shareLink.style.textAlign = "center";

  // Add share link to the game container
  const gameContainer = document.querySelector(".gameboy");
  gameContainer.appendChild(shareLink);

  toggleButtons("stop");
}


// Try again
function tryAgain() {
  toggleButtons("tryAgain");
  //arrowControls.classList.add("hidden");
  shareLink.style.display = "none";
  initGame();
}

// Update game
function updateGame() {
  moveSnake();
  if (checkCollision()) {
    stopGame();
    return;
  }
  draw();
}

// Move snake
function moveSnake() {
  const head = { ...snake[0] };
  if (direction === "UP") head.y -= gridSize;
  if (direction === "DOWN") head.y += gridSize;
  if (direction === "LEFT") head.x -= gridSize;
  if (direction === "RIGHT") head.x += gridSize;

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += isSpecialFood ? 10 : 1;
    level++;
    updateScore();
    spawnFood();
    resetSpecialFoodTimer();
    increaseSpeed();
  } else {
    snake.pop();
  }
}

// Increase speed every level
function increaseSpeed() {
  speed = Math.max(50, speed * 0.95); // Gradual speed increase
  clearInterval(gameInterval);
  gameInterval = setInterval(updateGame, speed);
}

// Check collisions
function checkCollision() {
  const head = snake[0];
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return true;
  return snake.slice(1).some((part) => part.x === head.x && part.y === head.y);
}

// Spawn food
function spawnFood() {
  let validPosition = false;
  while (!validPosition) {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
    validPosition = !snake.some((part) => part.x === food.x && part.y === food.y);
  }
}

// Reset special food timer
function resetSpecialFoodTimer() {
  clearTimeout(specialFoodTimer);
  isSpecialFood = true;
  specialFoodTimer = setTimeout(() => (isSpecialFood = false), 7000);
}

// Draw game elements
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "green";

// Draw snake
snake.forEach((part, index) => {
  ctx.save(); // Save the current canvas state

  if (index === 0) {
    // Draw head as a simple triangle
    ctx.translate(part.x + gridSize / 2, part.y + gridSize / 2); // Move origin to head center

    // Correctly align the rotation with the direction
    if (direction === "UP") ctx.rotate(0); // Rotate for UP
    else if (direction === "DOWN") ctx.rotate(Math.PI); // Rotate for DOWN
    else if (direction === "LEFT") ctx.rotate(-Math.PI / 2); // Rotate for LEFT
    else if (direction === "RIGHT") ctx.rotate(Math.PI / 2); // Rotate for RIGHT

    // Begin path for the triangle
    ctx.beginPath();
    
    // Define the three corners of the triangle
    ctx.moveTo(0, -gridSize / 2); // Top point of the triangle (pointy side)

    // Bottom-right and bottom-left points
    ctx.lineTo(gridSize / 2, gridSize / 2); // Bottom-right point
    ctx.lineTo(-gridSize / 2, gridSize / 2); // Bottom-left point

    // Close the path to complete the triangle
    ctx.closePath();

    // Fill the triangle with a color
    ctx.fillStyle = "#0f380f"; // Customize the color
    ctx.fill(); // Fill the triangle shape

  } else {
    // Draw body
    ctx.fillStyle = "#0f380f"; // Dark green for the body
    ctx.fillRect(part.x, part.y, gridSize, gridSize); // Draw body square
  }

  ctx.restore(); // Restore the canvas state
});

  // Draw food
  if (isSpecialFood) {
    ctx.drawImage(specialFoodMouse, food.x, food.y, gridSize, gridSize);
  } else {
    ctx.drawImage(normalFoodApple, food.x, food.y, gridSize, gridSize);
  }
}

// Update score display
function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

// Toggle button visibility
function toggleButtons(state) {
  startButton.classList.add("hidden");
  pauseButton.classList.add("hidden");
  resumeButton.classList.add("hidden");
  stopButton.classList.add("hidden");
  tryAgainButton.classList.add("hidden");

  if (state === "start") {
    pauseButton.classList.remove("hidden");
    stopButton.classList.remove("hidden");
  } else if (state === "pause") {
    resumeButton.classList.remove("hidden");
    stopButton.classList.remove("hidden");
  } else if (state === "resume") {
    pauseButton.classList.remove("hidden");
    stopButton.classList.remove("hidden");
  } else if (state === "stop") {
    tryAgainButton.classList.remove("hidden");
  } else if (state === "tryAgain") {
    startButton.classList.remove("hidden");
  }
}

// Handle keyboard input
document.addEventListener("keydown", (e) => {
  if (!isRunning) return;
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Handle touch controls
function changeDirection(newDirection) {
  if (!isRunning) return;
  if (newDirection === "UP" && direction !== "DOWN") direction = "UP";
  if (newDirection === "DOWN" && direction !== "UP") direction = "DOWN";
  if (newDirection === "LEFT" && direction !== "RIGHT") direction = "LEFT";
  if (newDirection === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
}
// Code to update metadata dynamically based on the URL's query parameters
window.addEventListener('load', function() {
  // Get score from query parameters
  const params = new URLSearchParams(window.location.search);
  const score = params.get("score");

  if (score) {
    // Update the page title
    document.title = `I scored ${score} points in Snake Game!`;

    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (ogTitle) ogTitle.content = `I scored ${score} points in Snake Game!`;
    if (ogDescription) ogDescription.content = `Think you can beat my score of ${score} points? Try it now!`;
    if (ogImage) ogImage.content = "Assets/snake game.png"; // Optional: Set an image based on the score
  }
});
