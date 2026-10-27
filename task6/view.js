'use strict';
const COLORS = {
    snakeHead: '#7CFC00',
    snakeBody: '#4CAF50',
    apple: '#FF4136',
    grid: '#e2e8f0'
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

    updateOverlays(model) {
        const showStart = !model.running && !model.gameOver
                          && model.score === 0
                          && model.snake.length === START_LENGTH;
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