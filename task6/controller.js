'use strict';

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