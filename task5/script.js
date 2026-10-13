const GameModel = {
  state: {
    sequence: [],
    playerIndex: 0,
    round: 0,
    phase: 'idle',
    timers: [],
  },

  FLASH_ON: 500,
  FLASH_GAP: 250,
  PAUSE_BEFORE_ROUND: 600,

  reset() {
    this.clearAllTimers();
    this.state.sequence = [];
    this.state.playerIndex = 0;
    this.state.round = 0;
    this.state.phase = 'idle';
  },

  addStep() {
    this.state.sequence.push(Math.floor(Math.random() * 4));
    this.state.round = this.state.sequence.length;
    this.state.playerIndex = 0;
  },

  checkPlayerInput(clickedIndex) {
    if (this.state.phase !== 'waiting') return 'ignored';

    if (clickedIndex === this.state.sequence[this.state.playerIndex]) {
      this.state.playerIndex++;
      if (this.state.playerIndex === this.state.sequence.length) {
        return 'correct';
      }
      return 'next';
    }
    return 'wrong';
  },

  setPhase(newPhase) {
    this.state.phase = newPhase;
  },

  later(fn, delay) {
    const id = setTimeout(() => {
      this.state.timers = this.state.timers.filter(t => t !== id);
      fn();
    }, delay);
    this.state.timers.push(id);
    return id;
  },

  clearAllTimers() {
    this.state.timers.forEach(id => clearTimeout(id));
    this.state.timers = [];
  }
};

const GameView = {
  els: {
    sectors: document.querySelectorAll('.sector'),
    startBtn: document.getElementById('startBtn'),
    roundEl: document.getElementById('round'),
    statusEl: document.getElementById('status'),
  },

  flashSector(index, duration) {
    const sector = this.els.sectors[index];
    if (!sector) return;
    sector.classList.add('active');
    setTimeout(() => sector.classList.remove('active'), duration);
  },

  updateLevel(round) {
    this.els.roundEl.textContent = round;
  },

  updateStatus(text) {
    this.els.statusEl.textContent = text;
  },

  setButtonsEnabled(enabled) {
    this.els.sectors.forEach(s => s.disabled = !enabled);
  },

  clearAllActive() {
    this.els.sectors.forEach(s => s.classList.remove('active'));
  },

  bindSectorClick(handler) {
    this.els.sectors.forEach(sector => {
      sector.addEventListener('click', (e) => {
        handler(Number(e.currentTarget.dataset.index));
      });
    });
  },

  bindStartClick(handler) {
    this.els.startBtn.addEventListener('click', handler);
  }
};

const GameController = {
  init() {
    GameView.bindStartClick(() => this.startGame());
    GameView.bindSectorClick((index) => this.handleSectorClick(index));
  },

  startGame() {
    GameModel.reset();
    GameView.clearAllActive();
    GameView.updateLevel(0);
    GameView.updateStatus('Приготовьтесь...');
    this.nextRound();
  },

  nextRound() {
    GameModel.addStep();
    GameView.updateLevel(GameModel.state.round);

    GameModel.later(() => this.playSequence(), GameModel.PAUSE_BEFORE_ROUND);
  },

  playSequence() {
    GameModel.setPhase('showing');
    GameView.setButtonsEnabled(false);
    GameView.updateStatus('Смотрите...');

    const stepDelay = GameModel.FLASH_ON + GameModel.FLASH_GAP;

    GameModel.state.sequence.forEach((sectorIndex, i) => {
      GameModel.later(() => {
        GameView.flashSector(sectorIndex, GameModel.FLASH_ON);
      }, i * stepDelay);
    });

    GameModel.later(() => {
      GameModel.setPhase('waiting');
      GameView.setButtonsEnabled(true);
      GameView.updateStatus('Ваш ход');
    }, GameModel.state.sequence.length * stepDelay);
  },

  handleSectorClick(index) {
    if (GameModel.state.phase !== 'waiting') return;

    GameView.flashSector(index, 200);

    const result = GameModel.checkPlayerInput(index);

    if (result === 'correct') {
      GameModel.setPhase('idle');
      GameView.setButtonsEnabled(false);
      GameView.updateStatus('Верно!');
      GameModel.later(() => this.nextRound(), 600);
    } else if (result === 'wrong') {
      this.gameOver();
    }
  },

  gameOver() {
    GameModel.clearAllTimers();
    GameModel.setPhase('idle');
    GameView.setButtonsEnabled(false);

    const reached = GameModel.state.round > 0 ? GameModel.state.round - 1 : 0;
    GameView.updateStatus(`Вы дошли до уровня ${reached}. Игра окончена.`);
  }
};

GameController.init();