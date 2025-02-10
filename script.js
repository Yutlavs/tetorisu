const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const colors = [
    null,
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan'
];

const arena = createMatrix(10, 20);
const player = {
    pos: {x: 5, y: 0},
    matrix: createPiece(),
    score: 0
};

let dropCounter = 0;
let lastTime = 0;
const dropInterval = 1000;

function createMatrix(w, h) {
    return Array.from({length: h}, () => Array(w).fill(0));
}

function createPiece() {
    const pieces = [
        [[1, 1, 1], [0, 1, 0]],
        [[2, 2, 2, 2]],
        [[3, 3], [3, 3]],
        [[0, 4, 4], [4, 4, 0]],
        [[5, 5, 0], [0, 5, 5]],
        [[6, 0, 0], [6, 6, 6]],
        [[0, 0, 7], [7, 7, 7]]
    ];
    return pieces[Math.floor(Math.random() * pieces.length)];
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
    clearLines();
}

function clearLines() {
    let rowCount = 0;
    for (let y = arena.length - 1; y >= 0; y--) {
        if (arena[y].every(value => value !== 0)) {
            arena.splice(y, 1);
            arena.unshift(new Array(arena[0].length).fill(0));
            rowCount++;
        }
    }
    if (rowCount > 0) {
        player.score += rowCount;
        updateScore();
    }
}

function collide(arena, player) {
    return player.matrix.some((row, y) => {
        return row.some((value, x) => {
            return value !== 0 && (arena[y + player.pos.y]?.[x + player.pos.x] !== 0);
        });
    });
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate() {
    const transposed = player.matrix[0].map((_, i) => player.matrix.map(row => row[i])).reverse();
    const prevMatrix = player.matrix;
    player.matrix = transposed;
    if (collide(arena, player)) {
        player.matrix = prevMatrix;
    }
}

function playerReset() {
    player.matrix = createPiece();
    player.pos.y = 0;
    player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function updateScore() {
    document.getElementById('score').innerText = `Score: ${player.score}`;
    if (localStorage.getItem('highscore') < player.score) {
        localStorage.setItem('highscore', player.score);
    }
    document.getElementById('highscore').innerText = `Best: ${localStorage.getItem('highscore') || 0}`;
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate();
    }
});

playerReset();
update();
