function generateSecretNumber() {
  const digits = [];
  while (digits.length < 4) {
    const d = Math.floor(Math.random() * 10);
    if (!digits.includes(d)) digits.push(d);
  }
  return digits;
}

function validateInput(value) {
  if (!/^\d+$/.test(value)) return { ok: false, message: 'Только цифры.' };
  if (value.length !== 4) return { ok: false, message: 'Ровно 4 цифры.' };
  if (new Set(value).size !== 4) return { ok: false, message: 'Цифры не должны повторяться.' };
  return { ok: true, digits: value.split('').map(Number) };
}

function countBullsAndCows(secret, guess) {
  let bulls = 0, cows = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) bulls++;
    else if (secret.includes(guess[i])) cows++;
  }
  return { bulls, cows };
}

let gamesHistory = [];

const historyGamesEl = document.getElementById('historyGames');
const historyEmptyEl = document.getElementById('historyEmpty');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

function renderGamesHistory() {
  historyGamesEl.innerHTML = '';

  if (gamesHistory.length === 0) {
    historyEmptyEl.classList.remove('hidden');
    return;
  }
  historyEmptyEl.classList.add('hidden');

  gamesHistory.slice(-10).reverse().forEach((game) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="num">${game.number}</div>
      <div class="meta">${game.attempts} попыток · ${game.mode === 'solo' ? 'один игрок' : 'два игрока'}</div>
    `;
    historyGamesEl.appendChild(li);
  });
}

function addGameToHistory(number, attempts, mode) {
  gamesHistory.push({ number, attempts, mode });
  renderGamesHistory();
}

clearHistoryBtn.addEventListener('click', () => {
  gamesHistory = [];
  renderGamesHistory();
});

const modeSoloBtn = document.getElementById('modeSolo');
const modeDuoBtn = document.getElementById('modeDuo');
const soloModeEl = document.getElementById('soloMode');
const duoModeEl = document.getElementById('duoMode');

modeSoloBtn.addEventListener('click', () => {
  modeSoloBtn.classList.add('active');
  modeDuoBtn.classList.remove('active');
  soloModeEl.classList.remove('hidden');
  duoModeEl.classList.add('hidden');
});

modeDuoBtn.addEventListener('click', () => {
  modeDuoBtn.classList.add('active');
  modeSoloBtn.classList.remove('active');
  soloModeEl.classList.add('hidden');
  duoModeEl.classList.remove('hidden');
});

let secretNumber = [];
let attempts = 0;
let history = [];
let gameOver = false;

const guessInput = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const newGameBtn = document.getElementById('newGameBtn');
const errorMsg = document.getElementById('errorMsg');
const attemptsCount = document.getElementById('attemptsCount');
const historyList = document.getElementById('historyList');

function renderHistory() {
  historyList.innerHTML = '';
  history.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.guess}</span><span>${item.result}</span>`;
    historyList.appendChild(li);
  });
}

function renderAttempts() {
  attemptsCount.textContent = attempts;
}

function startNewGame() {
  secretNumber = generateSecretNumber();
  attempts = 0;
  history = [];
  gameOver = false;

  guessInput.value = '';
  guessInput.disabled = false;
  checkBtn.disabled = false;
  errorMsg.textContent = '';

  renderAttempts();
  renderHistory();
}

function handleCheck() {
  if (gameOver) return;

  const value = guessInput.value.trim();
  const validation = validateInput(value);

  if (!validation.ok) {
    errorMsg.textContent = validation.message;
    return;
  }

  errorMsg.textContent = '';
  attempts++;

  const { bulls, cows } = countBullsAndCows(secretNumber, validation.digits);
  const resultText = `${bulls} бык(ов), ${cows} корова(ы)`;
  history.push({ guess: value, result: resultText });

  renderAttempts();
  renderHistory();

  guessInput.value = '';
  guessInput.focus();

  if (bulls === 4) {
    gameOver = true;
    guessInput.disabled = true;
    checkBtn.disabled = true;
    errorMsg.textContent = `Победа! Угадано за ${attempts} попыток.`;

    addGameToHistory(secretNumber.join(''), attempts, 'solo');
  }
}

checkBtn.addEventListener('click', handleCheck);
guessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleCheck();
});
newGameBtn.addEventListener('click', startNewGame);

let p1Secret = null, p2Secret = null;
let currentPlayer = 1;
let p1Attempts = 0, p2Attempts = 0;
let duoHistory = [];
let duoGameOver = false;

const duoSetup = document.getElementById('duoSetup');
const duoGame = document.getElementById('duoGame');
const setupP1 = document.getElementById('setupP1');
const setupP2 = document.getElementById('setupP2');
const p1SecretInput = document.getElementById('p1Secret');
const p2SecretInput = document.getElementById('p2Secret');
const p1SecretBtn = document.getElementById('p1SecretBtn');
const p2SecretBtn = document.getElementById('p2SecretBtn');
const p1Error = document.getElementById('p1Error');
const p2Error = document.getElementById('p2Error');

const currentPlayerEl = document.getElementById('currentPlayer');
const duoGuessInput = document.getElementById('duoGuessInput');
const duoCheckBtn = document.getElementById('duoCheckBtn');
const duoErrorMsg = document.getElementById('duoErrorMsg');
const p1AttemptsEl = document.getElementById('p1Attempts');
const p2AttemptsEl = document.getElementById('p2Attempts');
const duoHistoryList = document.getElementById('duoHistoryList');
const duoNewGameBtn = document.getElementById('duoNewGameBtn');

function renderDuoHistory() {
  duoHistoryList.innerHTML = '';
  duoHistory.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>И${item.player}: ${item.guess}</span><span>${item.result}</span>`;
    duoHistoryList.appendChild(li);
  });
}

function renderDuoStats() {
  p1AttemptsEl.textContent = p1Attempts;
  p2AttemptsEl.textContent = p2Attempts;
}

function startDuoSetup() {
  p1Secret = null;
  p2Secret = null;
  currentPlayer = 1;
  p1Attempts = 0;
  p2Attempts = 0;
  duoHistory = [];
  duoGameOver = false;

  duoSetup.classList.remove('hidden');
  duoGame.classList.add('hidden');
  setupP1.classList.remove('hidden');
  setupP2.classList.add('hidden');

  p1SecretInput.value = '';
  p2SecretInput.value = '';
  p1Error.textContent = '';
  p2Error.textContent = '';
}

function startDuoGame() {
  duoSetup.classList.add('hidden');
  duoGame.classList.remove('hidden');
  currentPlayerEl.textContent = 'Игрок 1';
  duoGuessInput.value = '';
  duoErrorMsg.textContent = '';
  renderDuoStats();
  renderDuoHistory();
  duoGuessInput.focus();
}

p1SecretBtn.addEventListener('click', () => {
  const v = p1SecretInput.value.trim();
  const val = validateInput(v);
  if (!val.ok) {
    p1Error.textContent = val.message;
    return;
  }
  p1Error.textContent = '';
  p1Secret = val.digits;

  setupP1.classList.add('hidden');
  setupP2.classList.remove('hidden');
  p2SecretInput.focus();
});

p2SecretBtn.addEventListener('click', () => {
  const v = p2SecretInput.value.trim();
  const val = validateInput(v);
  if (!val.ok) {
    p2Error.textContent = val.message;
    return;
  }
  p2Error.textContent = '';
  p2Secret = val.digits;

  startDuoGame();
});

duoCheckBtn.addEventListener('click', () => {
  if (duoGameOver) return;

  const v = duoGuessInput.value.trim();
  const val = validateInput(v);
  if (!val.ok) {
    duoErrorMsg.textContent = val.message;
    return;
  }
  duoErrorMsg.textContent = '';

  const enemySecret = currentPlayer === 1 ? p2Secret : p1Secret;
  const { bulls, cows } = countBullsAndCows(enemySecret, val.digits);
  const resultText = `${bulls} бык(ов), ${cows} корова(ы)`;

  if (currentPlayer === 1) p1Attempts++;
  else p2Attempts++;

  duoHistory.push({
    player: currentPlayer,
    guess: v,
    result: resultText,
  });

  renderDuoStats();
  renderDuoHistory();
  duoGuessInput.value = '';

  if (bulls === 4) {
    duoGameOver = true;
    duoGuessInput.disabled = true;
    duoCheckBtn.disabled = true;
    duoErrorMsg.textContent = `Победа! Игрок ${currentPlayer} угадал за ${
      currentPlayer === 1 ? p1Attempts : p2Attempts
    } попыток.`;

    addGameToHistory(
      enemySecret.join(''),
      currentPlayer === 1 ? p1Attempts : p2Attempts,
      'duo'
    );
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  currentPlayerEl.textContent = `Игрок ${currentPlayer}`;
  duoGuessInput.focus();
});

duoGuessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') duoCheckBtn.click();
});

duoNewGameBtn.addEventListener('click', () => {
  duoGuessInput.disabled = false;
  duoCheckBtn.disabled = false;
  startDuoSetup();
});

startNewGame();
startDuoSetup();
renderGamesHistory();