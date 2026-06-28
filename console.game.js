const readline = require("readline");

const WIDTH = 20;
const HEIGHT = 10;

let gameOver = false;
let score = 0;

const player = { x: 1, y: 1 };
const monster = { x: WIDTH - 2, y: HEIGHT - 2 };

const treasures = [];

function randomPosition() {
  return {
    x: Math.floor(Math.random() * (WIDTH - 2)) + 1,
    y: Math.floor(Math.random() * (HEIGHT - 2)) + 1,
  };
}

while (treasures.length < 5) {
  const p = randomPosition();

  if (
    (p.x === player.x && p.y === player.y) ||
    (p.x === monster.x && p.y === monster.y)
  ) {
    continue;
  }

  if (!treasures.some((t) => t.x === p.x && t.y === p.y)) {
    treasures.push(p);
  }
}

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", (_, key) => {
  if (key.ctrl && key.name === "c") process.exit();

  switch (key.name) {
    case "w":
      if (player.y > 1) player.y--;
      break;
    case "s":
      if (player.y < HEIGHT - 2) player.y++;
      break;
    case "a":
      if (player.x > 1) player.x--;
      break;
    case "d":
      if (player.x < WIDTH - 2) player.x++;
      break;
    case "q":
      process.exit();
  }

  update();
});

function update() {
  if (monster.x < player.x) monster.x++;
  else if (monster.x > player.x) monster.x--;

  if (monster.y < player.y) monster.y++;
  else if (monster.y > player.y) monster.y--;

  for (let i = treasures.length - 1; i >= 0; i--) {
    if (treasures[i].x === player.x && treasures[i].y === player.y) {
      treasures.splice(i, 1);
      score++;
    }
  }

  if (player.x === monster.x && player.y === monster.y) {
    gameOver = true;
  }

  draw();
}

function draw() {
  console.clear();

  console.log("=== Treasure Hunter ===");
  console.log("Move: WASD | Quit: Q");
  console.log(`Score: ${score}`);
  console.log("");

  for (let y = 0; y < HEIGHT; y++) {
    let row = "";

    for (let x = 0; x < WIDTH; x++) {
      if (y === 0 || y === HEIGHT - 1 || x === 0 || x === WIDTH - 1) {
        row += "#";
        continue;
      }

      if (player.x === x && player.y === y) {
        row += "@";
        continue;
      }

      if (monster.x === x && monster.y === y) {
        row += "M";
        continue;
      }

      const treasure = treasures.find((t) => t.x === x && t.y === y);

      if (treasure) {
        row += "$";
      } else {
        row += ".";
      }
    }

    console.log(row);
  }

  if (gameOver) {
    console.log("\n💀 The monster caught you!");
    process.exit();
  }

  if (treasures.length === 0) {
    console.log("\n🏆 You collected all treasures!");
    process.exit();
  }
}

draw();
