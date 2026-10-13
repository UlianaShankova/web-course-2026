const state = {
  sequence: [],
  playerIndex: 0,
  round: 0,
  phase: 'idle',
  timers: [],
};

const board      = document.getElementById('board');
const sectors    = document.querySelectorAll('.sector');
const startBtn   = document.getElementById('startBtn');
const roundEl    = document.getElementById('round');
const statusEl   = document.getElementById('status');

function later(fn, delay) {
  const id = setTimeout(() => {
    state.timers = state.timers.filter(t => t !== id);
    fn();
  }, delay);
  state.timers.push(id);
  return id;
}

function clearAllTimers() {
  state.timers.forEach(id => clearTimeout(id));
  state.timers = [];
}

function randomIndex() {
  return Math.floor(Math.random() * 4);
}

function flash(sector, ms) {
  sector.classList.add('active');
  later(() => sector.classList.remove('active'), ms);
}

function updateUI() {
  roundEl.textContent = state.round;
}

function setButtonsEnabled(enabled) {
  sectors.forEach(s => s.disabled = !enabled);
}

const FLASH_ON  = 500;
const FLASH_GAP = 250;

function playSequence() {
  state.phase = 'showing';
  setButtonsEnabled(false);
  statusEl.textContent = 'Смотрите...';

  const stepDelay = FLASH_ON + FLASH_GAP;

  state.sequence.forEach((idx, i) => {
    later(() => {
      flash(sectors[idx], FLASH_ON);
    }, i * stepDelay);
  });

  later(() => {
    state.phase = 'waiting';
    state.playerIndex = 0;
    setButtonsEnabled(true);
    statusEl.textContent = 'Ваш ход';
  }, state.sequence.length * stepDelay);
}

function nextRound() {
  state.sequence.push(randomIndex());
  state.round = state.sequence.length;
  state.playerIndex = 0;
  updateUI();

  later(() => playSequence(), 600);
}

function onSectorClick(event) {
  if (state.phase !== 'waiting') return;

  const sector = event.currentTarget;
  const clickedIndex = Number(sector.dataset.index);

  flash(sector, 200);

  if (clickedIndex === state.sequence[state.playerIndex]) {
    state.playerIndex++;
    if (state.playerIndex === state.sequence.length) {
      state.phase = 'idle';
      setButtonsEnabled(false);
      statusEl.textContent = 'Верно!';
      later(() => nextRound(), 600);
    }
  } else {
    gameOver();
  }
}

function gameOver() {
  clearAllTimers();
  state.phase = 'idle';
  setButtonsEnabled(false);

  const reached = state.round > 0 ? state.round - 1 : 0;
  statusEl.textContent = `Вы дошли до уровня ${reached}. Игра окончена.`;
}

function startGame() {
  clearAllTimers();
  state.sequence = [];
  state.playerIndex = 0;
  state.round = 0;
  state.phase = 'idle';

  sectors.forEach(s => s.classList.remove('active'));
  updateUI();
  statusEl.textContent = 'Приготовьтесь...';

  nextRound();
}

sectors.forEach(sector => {
  sector.addEventListener('click', onSectorClick);
});

startBtn.addEventListener('click', startGame);