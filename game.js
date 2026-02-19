const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');

const world = {
  width: 2800,
  groundY: 440,
  gravity: 0.8,
};

const player = {
  x: 100,
  y: world.groundY,
  w: 44,
  h: 82,
  speed: 4.2,
  vx: 0,
  vy: 0,
  hp: 8,
  attackCooldown: 0,
  hitCooldown: 0,
  facing: 1,
  score: 0,
};

const enemies = Array.from({ length: 8 }, (_, i) => ({
  x: 480 + i * 260,
  y: world.groundY,
  w: 40,
  h: 78,
  hp: 3,
  speed: 1.2 + Math.random() * 0.8,
  hitCooldown: 0,
}));

const keys = new Set();
let gameOver = false;
let win = false;

window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'Space') {
    e.preventDefault();
    attack();
  }
  if (gameOver && e.code === 'KeyR') {
    window.location.reload();
  }
});

window.addEventListener('keyup', (e) => keys.delete(e.code));

function attack() {
  if (player.attackCooldown > 0 || gameOver) return;
  player.attackCooldown = 22;

  const range = 65;
  const attackX = player.x + player.w / 2 + player.facing * range;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const dx = Math.abs(attackX - (enemy.x + enemy.w / 2));
    const dy = Math.abs((player.y + player.h / 2) - (enemy.y + enemy.h / 2));
    if (dx < 58 && dy < 60) {
      enemy.hp -= 1;
      enemy.hitCooldown = 14;
      if (enemy.hp <= 0) player.score += 1;
    }
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function update() {
  if (gameOver) return;

  player.vx = 0;
  if (keys.has('KeyA')) {
    player.vx = -player.speed;
    player.facing = -1;
  }
  if (keys.has('KeyD')) {
    player.vx = player.speed;
    player.facing = 1;
  }
  if (keys.has('KeyW') && player.y >= world.groundY) {
    player.vy = -13;
  }

  player.x = Math.max(0, Math.min(world.width - player.w, player.x + player.vx));
  player.y += player.vy;
  player.vy += world.gravity;

  if (player.y >= world.groundY) {
    player.y = world.groundY;
    player.vy = 0;
  }

  if (player.attackCooldown > 0) player.attackCooldown -= 1;
  if (player.hitCooldown > 0) player.hitCooldown -= 1;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const dir = Math.sign(player.x - enemy.x);
    enemy.x += dir * enemy.speed;

    if (enemy.hitCooldown > 0) {
      enemy.hitCooldown -= 1;
    }

    if (rectsOverlap(player, enemy) && player.hitCooldown <= 0) {
      player.hp -= 1;
      player.hitCooldown = 35;
      player.x -= dir * 28;
      if (player.hp <= 0) {
        gameOver = true;
        statusText.textContent = 'Porażka! Naciśnij R, aby spróbować jeszcze raz.';
      }
    }
  }

  if (player.x > world.width - 220 && enemies.every((e) => e.hp <= 0)) {
    gameOver = true;
    win = true;
    statusText.textContent = 'Wygrana! Dotarłeś na stadion i mecz zaczyna się za chwilę!';
  }
}

function drawBackground(cameraX) {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#2f4f88');
  sky.addColorStop(1, '#101522');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bloki miasta
  for (let i = 0; i < 30; i += 1) {
    const bx = i * 160 - (cameraX * 0.35) % 160;
    const h = 110 + (i % 4) * 36;
    ctx.fillStyle = i % 2 ? '#1e2a45' : '#223258';
    ctx.fillRect(bx, world.groundY - h - 40, 120, h);
  }

  // Ulica
  ctx.fillStyle = '#2d313a';
  ctx.fillRect(0, world.groundY + 80, canvas.width, 140);

  ctx.fillStyle = '#404650';
  ctx.fillRect(0, world.groundY + 64, canvas.width, 24);

  // Stadion na końcu mapy
  const stadiumX = world.width - 240 - cameraX;
  ctx.fillStyle = '#6885d6';
  ctx.fillRect(stadiumX, 170, 200, 220);
  ctx.fillStyle = '#9eb6ff';
  ctx.fillRect(stadiumX + 20, 200, 160, 30);
  ctx.fillStyle = '#f6f7ff';
  ctx.font = '20px sans-serif';
  ctx.fillText('STADION', stadiumX + 45, 250);
}

function drawEntity(entity, color) {
  ctx.fillStyle = color;
  ctx.fillRect(entity.x, entity.y, entity.w, entity.h);
}

function draw() {
  const cameraX = Math.max(0, Math.min(world.width - canvas.width, player.x - canvas.width / 2));

  drawBackground(cameraX);

  ctx.save();
  ctx.translate(-cameraX, 0);

  drawEntity(player, player.hitCooldown > 0 ? '#ffb3b3' : '#57f2a0');

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    drawEntity(enemy, enemy.hitCooldown > 0 ? '#ffe08a' : '#ff6f6f');
  }

  ctx.restore();

  // HUD
  ctx.fillStyle = '#000a';
  ctx.fillRect(16, 16, 280, 80);
  ctx.fillStyle = '#fff';
  ctx.font = '18px sans-serif';
  ctx.fillText(`Życie: ${'❤'.repeat(Math.max(player.hp, 0))}`, 28, 45);
  ctx.fillText(`Pokonani: ${player.score}/${enemies.length}`, 28, 72);

  if (gameOver) {
    ctx.fillStyle = '#000b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = win ? '#99ffbc' : '#ffb0b0';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(win ? 'WYGRANA!' : 'KONIEC GRY', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('Naciśnij R, aby zagrać ponownie', canvas.width / 2, canvas.height / 2 + 24);
    ctx.textAlign = 'start';
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
