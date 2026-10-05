const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <title>Neon Arcade Snake</title>
        <style>
          * { box-sizing: border-box; touch-action: manipulation; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #060913;
            color: #f8fafc;
            margin: 0;
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          h1 {
            margin: 0 0 10px 0;
            font-size: 1.5rem;
            color: #38bdf8;
            text-align: center;
          }
          .score-board {
            display: flex;
            gap: 24px;
            margin-bottom: 12px;
            font-size: 1.1rem;
            font-weight: 700;
          }
          .score-board span {
            color: #38bdf8;
          }
          #gameCanvas {
            background-color: #0f172a;
            border: 2px solid #38bdf8;
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
            border-radius: 8px;
            max-width: 100%;
          }
          .btn-container {
            margin-top: 14px;
            display: flex;
            gap: 12px;
          }
          button {
            background-color: #0284c7;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 1rem;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
          }
          button:hover {
            background-color: #0369a1;
          }

          /* Mobile Virtual Controls */
          .dpad {
            margin-top: 16px;
            display: grid;
            grid-template-columns: 60px 60px 60px;
            grid-template-rows: 60px 60px;
            gap: 8px;
            justify-content: center;
          }
          .dpad button {
            background-color: #1e293b;
            border: 1px solid #334155;
            color: #38bdf8;
            font-size: 1.4rem;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border-radius: 8px;
          }
          .dpad button:active {
            background-color: #38bdf8;
            color: #0f172a;
          }
          .up { grid-column: 2; grid-row: 1; }
          .left { grid-column: 1; grid-row: 2; }
          .down { grid-column: 2; grid-row: 2; }
          .right { grid-column: 3; grid-row: 2; }

          @media (min-width: 768px) {
            .dpad { display: none; } /* Hide on desktop keyboards */
          }
        </style>
      </head>
      <body>
        <h1>🐍 Neon Snake</h1>

        <div class="score-board">
          <div>Score: <span id="currentScore">0</span></div>
          <div>Best: <span id="highScore">0</span></div>
        </div>

        <canvas id="gameCanvas" width="320" height="320"></canvas>

        <div class="btn-container">
          <button id="startBtn" onclick="startGame()">Start / Restart</button>
        </div>

        <!-- Touch Controls for Phones -->
        <div class="dpad">
          <button class="up" onclick="changeDirection('UP')">▲</button>
          <button class="left" onclick="changeDirection('LEFT')">◀</button>
          <button class="down" onclick="changeDirection('DOWN')">▼</button>
          <button class="right" onclick="changeDirection('RIGHT')">▶</button>
        </div>

        <script>
          const canvas = document.getElementById('gameCanvas');
          const ctx = canvas.getContext('2d');
          const grid = 16;
          let count = 0;
          let score = 0;
          let highScore = 0;
          let gameInterval = null;
          let isRunning = false;

          let snake = {
            x: 160,
            y: 160,
            dx: grid,
            dy: 0,
            cells: [],
            maxCells: 4
          };

          let apple = { x: 64, y: 64 };

          function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
          }

          function resetApple() {
            apple.x = getRandomInt(0, canvas.width / grid) * grid;
            apple.y = getRandomInt(0, canvas.height / grid) * grid;
          }

          function loop() {
            if (!isRunning) return;
            requestAnimationFrame(loop);

            // Cap game loop speed (12 frames per second)
            if (++count < 6) return;
            count = 0;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            snake.x += snake.dx;
            snake.y += snake.dy;

            // Screen edge collision (Game Over)
            if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
              gameOver();
              return;
            }

            snake.cells.unshift({ x: snake.x, y: snake.y });

            if (snake.cells.length > snake.maxCells) {
              snake.cells.pop();
            }

            // Draw glowing food
            ctx.fillStyle = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ef4444';
            ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

            // Draw snake
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#38bdf8';
            snake.cells.forEach((cell, index) => {
              ctx.fillStyle = index === 0 ? '#38bdf8' : '#0284c7';
              ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

              // Check food collision
              if (cell.x === apple.x && cell.y === apple.y) {
                snake.maxCells++;
                score += 10;
                document.getElementById('currentScore').innerText = score;
                if (score > highScore) {
                  highScore = score;
                  document.getElementById('highScore').innerText = highScore;
                }
                resetApple();
              }

              // Self collision check
              for (let i = index + 1; i < snake.cells.length; i++) {
                if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                  gameOver();
                  return;
                }
              }
            });
          }

          function gameOver() {
            isRunning = false;
            alert('Game Over! Your Score: ' + score);
          }

          function startGame() {
            snake.x = 160;
            snake.y = 160;
            snake.cells = [];
            snake.maxCells = 4;
            snake.dx = grid;
            snake.dy = 0;
            score = 0;
            document.getElementById('currentScore').innerText = score;
            resetApple();
            isRunning = true;
            requestAnimationFrame(loop);
          }

          function changeDirection(dir) {
            if (!isRunning) return;
            if (dir === 'LEFT' && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
            else if (dir === 'UP' && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
            else if (dir === 'RIGHT' && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
            else if (dir === 'DOWN' && snake.dy ===We will build a **Cyber Dash** arcade evasion game. 

### How the Game Works
* You pilot a sleek defender ship along the bottom.
* Falling space obstacles speed up as your score climbs.
* **Controls:** 
  * On a laptop: Use **Left / Right Arrow keys** (or **A / D**).
  * On a phone: Tap the **Left / Right on-screen touch buttons**.
* Collect energy orbs to boost your multiplier while dodging obstacles.
* It tracks your current score and stores your all-time high score right in the browser.

---

### Step 1: Replace `server.js` with the Game Code

1. In VS Code, open **`server.js`** inside your `my-first-vibe` folder.
2. Select all (`Ctrl + A`) and delete everything.
3. Paste this complete, single-file code:

```javascript
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <title>Cyber Dash Arcade</title>
        <style>
          * { box-sizing: border-box; touch-action: manipulation; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #030712;
            color: #f3f4f6;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
          }
          .arcade-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 420px;
            padding: 12px;
          }
          .header-bar {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 8px;
            font-weight: 700;
            font-size: 1.1rem;
          }
          .score-val { color: #38bdf8; }
          .high-val { color: #f59e0b; }
          canvas {
            background: #0f172a;
            border: 2px solid #1e293b;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            display: block;
          }
          .touch-controls {
            display: flex;
            gap: 16px;
            margin-top: 14px;
            width: 100%;
          }
          .touch-btn {
            flex: 1;
            padding: 16px;
            font-size: 1.25rem;
            font-weight: bold;
            background: #1e293b;
            color: #38bdf8;
            border: 1px solid #334155;
            border-radius: 10px;
            user-select: none;
            cursor: pointer;
          }
          .touch-btn:active { background: #38bdf8; color: #0f172a; }
          .hint {
            font-size: 0.8rem;
            color: #64748b;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="arcade-container">
          <div class="header-bar">
            <span>Score: <span id="scoreDisplay" class="score-val">0</span></span>
            <span>Best: <span id="highDisplay" class="high-val">0</span></span>
          </div>

          <canvas id="gameCanvas" width="360" height="480"></canvas>

          <!-- On-screen controls for mobile phones -->
          <div class="touch-controls">
            <button class="touch-btn" id="leftBtn">◀ Left</button>
            <button class="touch-btn" id="rightBtn">Right ▶</button>
          </div>
          <div class="hint">Keyboard: Left/Right Arrows or A/D</div>
        </div>

        <script>
          const canvas = document.getElementById('gameCanvas');
          const ctx = canvas.getContext('2d');
          const scoreEl = document.getElementById('scoreDisplay');
          const highEl = document.getElementById('highDisplay');

          let bestScore = localStorage.getItem('vibe_high_score') || 0;
          highEl.textContent = bestScore;

          let player = { x: 160, y: 430, width: 40, height: 18, speed: 6 };
          let obstacles = [];
          let bonuses = [];
          let score = 0;
          let gameOver = false;
          let frame = 0;
          let leftPressed = false;
          let rightPressed = false;

          function spawnObstacle() {
            const size = Math.random() * 20 + 20;
            const x = Math.random() * (canvas.width - size);
            const speed = 2.5 + Math.min(score * 0.05, 5);
            obstacles.push({ x, y: -size, size, speed });
          }

          function spawnBonus() {
            const x = Math.random() * (canvas.width - 16);
            bonuses.push({ x, y: -16, size: 14, speed: 2 });
          }

          function resetGame() {
            player.x = 160;
            obstacles = [];
            bonuses = [];
            score = 0;
            scoreEl.textContent = score;
            gameOver = false;
            requestAnimationFrame(gameLoop);
          }

          // Keyboard listeners
          window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
            if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
            if (gameOver && (e.key === ' ' || e.key === 'Enter')) resetGame();
          });

          window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
            if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
          });

          // Touch button handlers
          const lBtn = document.getElementById('leftBtn');
          const rBtn = document.getElementById('rightBtn');

          lBtn.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; });
          lBtn.addEventListener('touchend', () => { leftPressed = false; });
          rBtn.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; });
          rBtn.addEventListener('touchend', () => { rightPressed = false; });

          lBtn.addEventListener('mousedown', () => { leftPressed = true; });
          lBtn.addEventListener('mouseup', () => { leftPressed = false; });
          rBtn.addEventListener('mousedown', () => { rightPressed = true; });
          rBtn.addEventListener('mouseup', () => { rightPressed = false; });

          canvas.addEventListener('click', () => {
            if (gameOver) resetGame();
          });

          function update() {
            if (leftPressed && player.x > 0) player.x -= player.speed;
            if (rightPressed && player.x + player.width < canvas.width) player.x += player.speed;

            // Spawners
            frame++;
            if (frame % Math.max(25, 60 - Math.floor(score * 0.4)) === 0) spawnObstacle();
            if (frame % 180 === 0) spawnBonus();

            // Handle obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
              const obs = obstacles[i];
              obs.y += obs.speed;

              // Check collision with player
              if (
                player.x < obs.x + obs.size &&
                player.x + player.width > obs.x &&
                player.y < obs.y + obs.size &&
                player.y + player.height > obs.y
              ) {
                gameOver = true;
                if (score > bestScore) {
                  bestScore = score;
                  localStorage.setItem('vibe_high_score', bestScore);
                  highEl.textContent = bestScore;
                }
              }

              // Passed obstacle bonus
              if (obs.y > canvas.height) {
                obstacles.splice(i, 1);
                score += 1;
                scoreEl.textContent = score;
              }
            }

            // Handle bonus orbs
            for (let j = bonuses.length - 1; j >= 0; j--) {
              const b = bonuses[j];
              b.y += b.speed;

              if (
                player.x < b.x + b.size &&
                player.x + player.width > b.x &&
                player.y < b.y + b.size &&
                player.y + player.height > b.y
              ) {
                bonuses.splice(j, 1);
                score += 5;
                scoreEl.textContent = score;
              } else if (b.y > canvas.height) {
                bonuses.splice(j, 1);
              }
            }
          }

          function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw player ship
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.roundRect(player.x, player.y, player.width, player.height, 6);
            ctx.fill();

            // Draw falling hazards
            ctx.fillStyle = '#ef4444';
            obstacles.forEach((obs) => {
              ctx.beginPath();
              ctx.roundRect(obs.x, obs.y, obs.size, obs.size, 4);
              ctx.fill();
            });

            // Draw bonus orbs
            ctx.fillStyle = '#10b981';
            bonuses.forEach((b) => {
              ctx.beginPath();
              ctx.arc(b.x + b.size/2, b.y + b.size/2, b.size/2, 0, Math.PI * 2);
              ctx.fill();
            });

            // Game over screen
            if (gameOver) {
              ctx.fillStyle = 'rgba(3, 7, 18, 0.82)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              ctx.fillStyle = '#f87171';
              ctx.font = 'bold 26px system-ui';
              ctx.textAlign = 'center';
              ctx.fillText('CRASHED!', canvas.width / 2, 220);

              ctx.fillStyle = '#f3f4f6';
              ctx.font = '16px system-ui';
              ctx.fillText('Score: ' + score, canvas.width / 2, 255);

              ctx.fillStyle = '#38bdf8';
              ctx.font = '14px system-ui';
              ctx.fillText('Tap screen or press Enter to restart', canvas.width / 2, 290);
            }
          }

          function gameLoop() {
            if (!gameOver) {
              update();
              draw();
              requestAnimationFrame(gameLoop);
            } else {
              draw();
            }
          }

          requestAnimationFrame(gameLoop);
        </script>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});