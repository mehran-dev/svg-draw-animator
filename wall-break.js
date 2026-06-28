const readline = require("readline");

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const WIDTH = 25;
const HEIGHT = 28;

const LANES = [6, 12, 18];

let score = 0;
let lives = 3;
let speed = 180;

let gameOver = false;
let paused = false;

const player = { lane: 1, y: HEIGHT - 3 };
const bullets = [];
const enemies = [];

let spawnCounter = 0;

// ---------------- INPUT ----------------
process.stdin.on("keypress", (_, key) => {
  if (!key) return;

  if (key.ctrl && key.name === "c") process.exit();

  if (gameOver && key.name === "r") restart();

  if (gameOver) return;

  switch (key.name) {
    case "a":
    case "left":
      if (player.lane > 0) player.lane--;
      break;

    case "d":
    case "right":
      if (player.lane < 2) player.lane++;
      break;

    case "space":
      bullets.push({ x: LANES[player.lane], y: player.y - 1 });
      break;

    case "p":
      paused = !paused;
      break;
  }
});

// ---------------- GAME LOGIC ----------------
function spawnEnemy() {
  enemies.push({
    lane: Math.floor(Math.random() * 3),
    y: 1,
  });
}

function update() {
  if (paused || gameOver) return;

  spawnCounter++;
  if (spawnCounter > Math.max(3, 8 - Math.floor(score / 50))) {
    spawnEnemy();
    spawnCounter = 0;
  }

  // bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y--;
    if (bullets[i].y < 1) bullets.splice(i, 1);
  }

  // enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y++;

    if (enemies[i].y >= HEIGHT - 2) {
      if (enemies[i].lane === player.lane) {
        lives--;
        if (lives <= 0) gameOver = true;
      }
      enemies.splice(i, 1);
    }
  }

  // collisions
  for (let b = bullets.length - 1; b >= 0; b--) {
    for (let e = enemies.length - 1; e >= 0; e--) {
      if (
        bullets[b] &&
        enemies[e] &&
        bullets[b].y === enemies[e].y &&
        bullets[b].x === LANES[enemies[e].lane]
      ) {
        bullets.splice(b, 1);
        enemies.splice(e, 1);
        score += 10;
      }
    }
  }

  if (score > 0 && score % 100 === 0) {
    speed = Math.max(60, 180 - Math.floor(score / 50) * 10);
  }
}

// ---------------- RENDER ----------------
function clear() {
  process.stdout.write("\x1b[2J\x1b[0f");
}

function draw() {
  clear();

  console.log("=== TERMINAL CAR SHOOTER ===");
  console.log(`Score: ${score}  Lives: ${lives}  Speed: ${speed}`);
  console.log(paused ? "PAUSED" : "");
  console.log("");

  for (let y = 0; y < HEIGHT; y++) {
    let row = "";

    for (let x = 0; x < WIDTH; x++) {
      // borders
      if (x === 2 || x === WIDTH - 3) {
        row += "|";
        continue;
      }

      // player
      if (x === LANES[player.lane] && y === player.y) {
        row += "A";
        continue;
      }

      // bullets
      let drawn = false;
      for (const b of bullets) {
        if (b.x === x && b.y === y) {
          row += "^";
          drawn = true;
          break;
        }
      }
      if (drawn) continue;

      // enemies
      for (const e of enemies) {
        if (LANES[e.lane] === x && e.y === y) {
          row += "V";
          drawn = true;
          break;
        }
      }
      if (drawn) continue;

      row += " ";
    }

    console.log(row);
  }

  if (gameOver) {
    console.log("\nGAME OVER");
    console.log("Press R to restart");
  }
}

// ---------------- LOOP ----------------
function loop() {
  update();
  draw();
  setTimeout(loop, speed);
}

// ---------------- RESTART ----------------
function restart() {
  score = 0;
  lives = 3;
  speed = 180;

  bullets.length = 0;
  enemies.length = 0;

  player.lane = 1;

  gameOver = false;
  paused = false;

  spawnCounter = 0;
}

// ---------------- START ----------------
console.log("Starting...");
setTimeout(loop, 1000);
