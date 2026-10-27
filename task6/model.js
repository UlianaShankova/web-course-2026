'use strict';
const CELL_SIZE = 20;
const COLS = 20;
const ROWS = 20;
const MOVE_INTERVAL = 150;
const START_LENGTH = 3;

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