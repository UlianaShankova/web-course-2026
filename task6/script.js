'use strict';
const CELL_SIZE = 20;
const COLS = 20;
const ROWS = 20;
const MOVE_INTERVAL = 150;
const START_LENGTH = 3;

const COLORS = {
    snakeHead: '#7CFC00',
    snakeBody: '#4CAF50',
    apple: '#FF4136',
    grid: '#e2e8f0'
};

const Model = {
    snake: [],
    direction: null,
    nextDirection: null,
    apple: null,
    score: 0,
    gameOver: false,
    running: false,
    cols: COLS,
    rows: ROWS,

    reset() {
        const startX = Math.floor(this.cols / 2);
        const startY = Math.floor(this.rows / 2);

        this.snake = [];
        for (let i = 0; i < START_LENGTH; i++) {
            this.snake.push({ x: startX - i, y: startY });
        }

        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameOver = false;
        this.apple = null;
        this.spawnApple();
    },

    setDirection(dir) {
        if (this.gameOver || !this.running) return;
        if (this.direction.x === -dir.x && this.direction.y === -dir.y) return;
        if (this.nextDirection.x === -dir.x && this.nextDirection.y === -dir.y) return;
        this.nextDirection = dir;
    },

    spawnApple() {
        const free = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (!this.snake.some(s => s.x === x && s.y === y)) {
                    free.push({ x, y });
                }
            }
        }
        if (free.length === 0) {
            this.apple = null;
            return;
        }
        this.apple = free[Math.floor(Math.random() * free.length)];
    },

    checkCollision(head) {
        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            return true;
        }
        for (let i = 0; i < this.snake.length - 1; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                return true;
            }
        }
        return false;
    },

    moveSnake() {
        if (this.gameOver || !this.running) return;

        this.direction = { ...this.nextDirection };

        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        if (this.checkCollision(head)) {
            this.gameOver = true;
            this.running = false;
            return;
        }

        this.snake.unshift(head);

        if (this.apple && head.x === this.apple.x && head.y === this.apple.y) {
            this.score++;
            this.spawnApple();
        } else {
            this.snake.pop();
        }
    }
};

const View = {
    canvas: null,
    ctx: null,
    scoreEl: null,
    startPanel: null,
    gameOverPanel: null,
    finalScoreEl: null,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('score');
        this.startPanel = document.getElementById('startPanel');
        this.gameOverPanel = document.getElementById('gameOverPanel');
        this.finalScoreEl = document.getElementById('finalScore');
    },

    render(model) {
        this.clear();
        this.drawGrid();
        this.drawApple(model.apple);
        this.drawSnake(model.snake);
        if (!model.gameOver) {
            this.updateScore(model.score);
        }

        this.updateOverlays(model);
    },

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawGrid() {
        this.ctx.strokeStyle = COLORS.grid;
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= COLS; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CELL_SIZE, 0);
            this.ctx.lineTo(x * CELL_SIZE, ROWS * CELL_SIZE);
            this.ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CELL_SIZE);
            this.ctx.lineTo(COLS * CELL_SIZE, y * CELL_SIZE);
            this.ctx.stroke();
        }
    },

    drawSnake(snake) {
        snake.forEach((seg, i) => {
            this.ctx.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snakeBody;
            this.ctx.fillRect(
                seg.x * CELL_SIZE + 1,
                seg.y * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
            );
        });
    },

    drawApple(apple) {
        if (!apple) return;
        this.ctx.fillStyle = COLORS.apple;
        const cx = apple.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = apple.y * CELL_SIZE + CELL_SIZE / 2;
        const r = CELL_SIZE / 2 - 2;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();
    },

    updateScore(score) {
        this.scoreEl.textContent = score;
    },

    updateOverlays(model){
        const showStart = !model.running && !model.gameOver && model.score === 0 && model.snake.length === START_LENGTH;
        this.startPanel.classList.toggle('hidden', !showStart);
        if (model.gameOver) {
            this.finalScoreEl.textContent = model.score;
            this.gameOverPanel.classList.remove('hidden');
            this.updateScore(model.score);
        } else {
            this.gameOverPanel.classList.add('hidden');
        }
    }
};

const Controller = {
    lastMoveTime: 0,
    rafId: null,

    init() {
        View.init();
        Model.reset();

        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKey(e));

        this.startLoop();
    },

    startGame() {
        Model.reset();
        Model.running = true;
        this.lastMoveTime = performance.now();
    },

    handleKey(e) {
        const keyMap = {
            ArrowUp:    { x: 0,  y: -1 },
            ArrowDown:  { x: 0,  y: 1  },
            ArrowLeft:  { x: -1, y: 0  },
            ArrowRight: { x: 1,  y: 0  }
        };
        const dir = keyMap[e.key];
        if (dir) {
            e.preventDefault();
            Model.setDirection(dir);
        }
    },

    startLoop() {
        const loop = (timestamp) => {
            this.update(timestamp);
            View.render(Model);
            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    },

    update(timestamp) {
        if (!Model.running || Model.gameOver) return;

        if (timestamp - this.lastMoveTime >= MOVE_INTERVAL) {
            Model.moveSnake();
            this.lastMoveTime = timestamp;
        }
    }
};

window.addEventListener('DOMContentLoaded', () => Controller.init());