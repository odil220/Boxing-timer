/* ============================================
   BOXING TIMER — Vanilla JS MVP
   ============================================ */

// ── State ──────────────────────────────────
const state = {
  rounds: 6,
  roundDuration: 180,
  restDuration: 60,
  startCountdown: true,
  soundEnabled: true,
  theme: 'system',

  currentRound: 0,
  phase: 'setup',
  remaining: 0,
  isPaused: false,
};

const ROUND_DURATIONS = [30, 60, 90, 120, 150, 180, 240, 300];
const REST_DURATIONS = [15, 30, 45, 60, 90, 120, 180, 300];

// ── DOM refs ────────────────────────────────
const $ = (id) => document.getElementById(id);

const dom = {
  screenSetup: $('screen-setup'),
  screenTimer: $('screen-timer'),
  screenComplete: $('screen-complete'),
  phaseLabel: $('phase-label'),
  timerDisplay: $('timer-display'),
  roundIndicator: $('round-indicator'),
  countdownNumber: $('countdown-number'),
  overlayCountdown: $('overlay-countdown'),
  overlayPaused: $('overlay-paused'),
  progressCircle: document.querySelector('.progress-ring-progress'),
  completeSummary: $('complete-summary'),
  announcer: $('a11y-announcer'),
};

// ── Timer engine ────────────────────────────
let timerId = null;
let phaseStart = 0;
let phaseDuration = 0;
let audioCtx = null;

const CIRCUMFERENCE = 2 * Math.PI * 90;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function initProgressRing() {
  const circle = dom.progressCircle;
  circle.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
  circle.style.strokeDashoffset = CIRCUMFERENCE;
}

function updateProgressRing(progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = CIRCUMFERENCE * (1 - clamped);
  dom.progressCircle.style.strokeDashoffset = offset;
}

function startTimer(durationSec) {
  phaseDuration = durationSec * 1000;
  phaseStart = Date.now();

  if (timerId) clearInterval(timerId);
  timerId = setInterval(tick, 80);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function tick() {
  if (state.isPaused) return;

  const elapsed = Date.now() - phaseStart;
  let remaining = (phaseDuration - elapsed) / 1000;

  if (remaining <= 0) {
    state.remaining = 0;
    renderTimer();
    onPhaseEnd();
    return;
  }

  state.remaining = remaining;

  if (state.phase === 'countdown') {
    renderCountdown();
  } else {
    renderTimer();
  }
}

function onPhaseEnd() {
  stopTimer();
  playBeep();

  switch (state.phase) {
    case 'countdown':
      hideOverlays();
      state.currentRound = 1;
      state.phase = 'round';
      state.remaining = state.roundDuration;
      updatePhaseDisplay();
      startTimer(state.roundDuration);
      playSound(880, 200);
      announce('Round 1 started');
      break;

    case 'round':
      if (state.currentRound >= state.rounds) {
        completeWorkout();
      } else {
        state.phase = 'rest';
        state.remaining = state.restDuration;
        updatePhaseDisplay();
        startTimer(state.restDuration);
        playSound(440, 200);
        announce(`Rest. Round ${state.currentRound + 1} next`);
      }
      break;

    case 'rest':
      state.currentRound++;
      state.phase = 'round';
      state.remaining = state.roundDuration;
      updatePhaseDisplay();
      startTimer(state.roundDuration);
      playSound(880, 200);
      announce(`Round ${state.currentRound} started`);
      break;
  }
}

// ── Render ──────────────────────────────────
function showScreen(name) {
  [dom.screenSetup, dom.screenTimer, dom.screenComplete].forEach((s) => {
    s.classList.remove('is-active');
  });
  const map = { setup: dom.screenSetup, timer: dom.screenTimer, complete: dom.screenComplete };
  const target = map[name];
  if (target) target.classList.add('is-active');
}

function renderTimer() {
  const secs = Math.max(0, Math.floor(state.remaining));
  dom.timerDisplay.textContent = formatTime(secs);

  const duration = state.phase === 'round' ? state.roundDuration : state.restDuration;
  const progress = duration > 0 ? 1 - state.remaining / duration : 0;
  updateProgressRing(progress);

  updateRoundIndicator();
}

function renderCountdown() {
  const num = Math.max(1, Math.ceil(state.remaining));
  dom.countdownNumber.textContent = num;
}

function updatePhaseDisplay() {
  if (state.phase === 'round') {
    dom.phaseLabel.textContent = state.currentRound === state.rounds ? 'FINAL ROUND' : 'ROUND';
    dom.phaseLabel.className = 'phase-label';
  } else if (state.phase === 'rest') {
    dom.phaseLabel.textContent = 'REST';
    dom.phaseLabel.className = 'phase-label phase-rest';
  }
}

function updateRoundIndicator() {
  if (state.phase === 'round' && state.currentRound >= state.rounds) {
    dom.roundIndicator.textContent = 'Final Round';
  } else if (state.phase === 'round' || state.phase === 'rest') {
    dom.roundIndicator.textContent = `Round ${state.currentRound} of ${state.rounds}`;
  }
}

function updatePauseButton() {
  const btn = $('btn-pause');
  if (state.isPaused) {
    btn.setAttribute('aria-label', 'Resume workout');
    btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  } else {
    btn.setAttribute('aria-label', 'Pause workout');
    btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  }
}

function showOverlay(name) {
  if (name === 'countdown') {
    dom.overlayCountdown.classList.add('is-active');
    dom.overlayCountdown.setAttribute('aria-hidden', 'false');
  } else if (name === 'paused') {
    dom.overlayPaused.classList.add('is-active');
    dom.overlayPaused.setAttribute('aria-hidden', 'false');
  }
}

function hideOverlays() {
  [dom.overlayCountdown, dom.overlayPaused].forEach((o) => {
    o.classList.remove('is-active');
    o.setAttribute('aria-hidden', 'true');
  });
}

// ── Actions ─────────────────────────────────
function startWorkout() {
  saveSettings();
  state.currentRound = 0;
  state.phase = 'countdown';
  state.isPaused = false;
  showScreen('timer');

  if (state.startCountdown) {
    state.remaining = 3;
    startTimer(3);
    showOverlay('countdown');
    renderCountdown();
    updatePhaseDisplay();
    updatePauseButton();
    updateRoundIndicator();
    dom.phaseLabel.textContent = 'GET READY';
    playSound(880, 150);
  } else {
    state.currentRound = 1;
    state.remaining = state.roundDuration;
    updatePhaseDisplay();
    startTimer(state.roundDuration);
    playSound(880, 200);
    announce('Round 1 started');
  }

  initAudio();
}

function togglePause() {
  if (state.phase === 'countdown') return;

  if (state.isPaused) {
    resume();
  } else {
    pause();
  }
}

function pause() {
  if (state.phase === 'setup' || state.phase === 'complete') return;
  if (state.isPaused) return;

  state.isPaused = true;
  const elapsed = Date.now() - phaseStart;
  phaseDuration = phaseDuration - elapsed;
  phaseStart = Date.now();

  stopTimer();
  showOverlay('paused');
  updatePauseButton();
  announce('Paused');
}

function resume() {
  if (!state.isPaused) return;

  state.isPaused = false;
  hideOverlays();
  startTimer(phaseDuration / 1000);
  updatePauseButton();
  announce('Resumed');
  initAudio();
}

function endWorkflow() {
  const el = $('dialog-end-workout');
  el.hidden = false;
  el.offsetHeight;
  el.classList.add('is-open');
  $('btn-cancel-end').focus();
}

function closeEndDialog() {
  const el = $('dialog-end-workout');
  el.classList.remove('is-open');
  setTimeout(() => { el.hidden = true; }, 400);
  $('btn-end-workout').focus();
}

function confirmEndWorkout() {
  closeEndDialog();
  stopTimer();
  state.phase = 'setup';
  state.isPaused = false;
  state.currentRound = 0;
  state.remaining = 0;
  hideOverlays();
  updateProgressRing(0);
  showScreen('setup');
  announce('Workout ended');
}

function completeWorkout() {
  state.phase = 'complete';
  state.remaining = 0;
  stopTimer();
  updateProgressRing(1);
  updatePauseButton();

  dom.completeSummary.textContent = `${state.rounds} rounds completed`;
  showScreen('complete');
  playSound(660, 150);
  setTimeout(() => playSound(880, 150), 180);
  setTimeout(() => playSound(1100, 300), 360);
  announce('Workout complete');
}

function startAgain() {
  hideOverlays();
  updateProgressRing(0);
  startWorkout();
}

function done() {
  state.phase = 'setup';
  state.currentRound = 0;
  state.remaining = 0;
  hideOverlays();
  updateProgressRing(0);
  showScreen('setup');
}

// ── Settings steppers ───────────────────────
function changeSetting(type, direction) {
  switch (type) {
    case 'rounds': {
      const newVal = state.rounds + direction;
      if (newVal >= 1 && newVal <= 20) {
        state.rounds = newVal;
        $('rounds-value').textContent = state.rounds;
        updateStepperButtons();
      }
      break;
    }
    case 'roundDuration': {
      const idx = ROUND_DURATIONS.indexOf(state.roundDuration);
      const newIdx = idx + direction;
      if (newIdx >= 0 && newIdx < ROUND_DURATIONS.length) {
        state.roundDuration = ROUND_DURATIONS[newIdx];
        $('round-duration-value').textContent = formatTime(state.roundDuration);
        updateStepperButtons();
      }
      break;
    }
    case 'restDuration': {
      const idx = REST_DURATIONS.indexOf(state.restDuration);
      const newIdx = idx + direction;
      if (newIdx >= 0 && newIdx < REST_DURATIONS.length) {
        state.restDuration = REST_DURATIONS[newIdx];
        $('rest-duration-value').textContent = formatTime(state.restDuration);
        updateStepperButtons();
      }
      break;
    }
  }
  saveSettings();
}

function updateStepperButtons() {
  const roundsMinus = $('rounds-decrease');
  const roundsPlus = $('rounds-increase');
  const roundMinus = $('round-duration-decrease');
  const roundPlus = $('round-duration-increase');
  const restMinus = $('rest-duration-decrease');
  const restPlus = $('rest-duration-increase');

  if (roundsMinus) roundsMinus.disabled = state.rounds <= 1;
  if (roundsPlus) roundsPlus.disabled = state.rounds >= 20;

  const roundIdx = ROUND_DURATIONS.indexOf(state.roundDuration);
  if (roundMinus) roundMinus.disabled = roundIdx <= 0;
  if (roundPlus) roundPlus.disabled = roundIdx >= ROUND_DURATIONS.length - 1;

  const restIdx = REST_DURATIONS.indexOf(state.restDuration);
  if (restMinus) restMinus.disabled = restIdx <= 0;
  if (restPlus) restPlus.disabled = restIdx >= REST_DURATIONS.length - 1;
}

// ── Settings sheet ──────────────────────────
function openSettings() {
  $('sheet-settings').hidden = false;
  $('sheet-settings').classList.add('is-open');
  updateThemeSegmented();
  $('setting-sound').checked = state.soundEnabled;
  $('btn-close-settings').focus();
}

function closeSettings() {
  state.soundEnabled = $('setting-sound').checked;
  saveSettings();
  $('sheet-settings').classList.remove('is-open');
  setTimeout(() => {
    $('sheet-settings').hidden = true;
  }, 320);
  $('btn-settings').focus();
}

function updateThemeSegmented() {
  const buttons = document.querySelectorAll('#theme-control .segmented-btn');
  buttons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === state.theme);
  });
}

function setTheme(theme) {
  state.theme = theme;
  applyTheme();
  updateThemeSegmented();
  saveSettings();
}

function applyTheme() {
  const html = document.documentElement;
  html.removeAttribute('data-theme');

  if (state.theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else if (state.theme === 'light') {
    html.setAttribute('data-theme', 'light');
  }
  // 'system' — no data-theme attribute, let media query handle it

  document.querySelector('meta[name="theme-color"]').setAttribute('content',
    state.theme === 'light' ? '#f5f5f7' : '#000000'
  );
}

// ── Sound ───────────────────────────────────
function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    state.soundEnabled = false;
  }
}

function playSound(freq, duration) {
  if (!state.soundEnabled) return;
  initAudio();
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
    osc.start();
    osc.stop(audioCtx.currentTime + duration / 1000);
  } catch (e) {
    // silent fail
  }
}

function playBeep() {
  playSound(880, 80);
}

// ── Screen reader announcements ─────────────
function announce(message) {
  dom.announcer.textContent = '';
  requestAnimationFrame(() => {
    dom.announcer.textContent = message;
  });
}

// ── Persistence ─────────────────────────────
function saveSettings() {
  try {
    localStorage.setItem('boxing-timer-settings', JSON.stringify({
      rounds: state.rounds,
      roundDuration: state.roundDuration,
      restDuration: state.restDuration,
      startCountdown: state.startCountdown,
      soundEnabled: state.soundEnabled,
      theme: state.theme,
    }));
  } catch (e) {
    // localStorage not available
  }
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('boxing-timer-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.rounds === 'number') state.rounds = parsed.rounds;
      if (typeof parsed.roundDuration === 'number') state.roundDuration = parsed.roundDuration;
      if (typeof parsed.restDuration === 'number') state.restDuration = parsed.restDuration;
      if (typeof parsed.startCountdown === 'boolean') state.startCountdown = parsed.startCountdown;
      if (typeof parsed.soundEnabled === 'boolean') state.soundEnabled = parsed.soundEnabled;
      if (['dark', 'light', 'system'].includes(parsed.theme)) state.theme = parsed.theme;
    }
  } catch (e) {
    // ignore
  }
}

// ── Event wiring ────────────────────────────
function wireEvents() {
  $('btn-start-workout').addEventListener('click', startWorkout);
  $('btn-pause').addEventListener('click', togglePause);
  $('btn-end-workout').addEventListener('click', endWorkflow);
  $('btn-start-again').addEventListener('click', startAgain);
  $('btn-done').addEventListener('click', done);
  $('btn-settings').addEventListener('click', openSettings);
  $('btn-close-settings').addEventListener('click', closeSettings);
  $('btn-cancel-end').addEventListener('click', closeEndDialog);
  $('btn-confirm-end').addEventListener('click', confirmEndWorkout);

  $('start-countdown').addEventListener('change', (e) => {
    state.startCountdown = e.target.checked;
    saveSettings();
  });

  // Steppers
  $('rounds-decrease').addEventListener('click', () => changeSetting('rounds', -1));
  $('rounds-increase').addEventListener('click', () => changeSetting('rounds', 1));
  $('round-duration-decrease').addEventListener('click', () => changeSetting('roundDuration', -1));
  $('round-duration-increase').addEventListener('click', () => changeSetting('roundDuration', 1));
  $('rest-duration-decrease').addEventListener('click', () => changeSetting('restDuration', -1));
  $('rest-duration-increase').addEventListener('click', () => changeSetting('restDuration', 1));

  // Theme segmented buttons
  document.querySelectorAll('#theme-control .segmented-btn').forEach((btn) => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });

  // Close settings on backdrop click
  $('sheet-settings').addEventListener('click', (e) => {
    if (e.target === $('sheet-settings')) closeSettings();
  });

  // Keyboard: Escape closes dialog/sheet
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if ($('dialog-end-workout').classList.contains('is-open')) {
        closeEndDialog();
      }
      if ($('sheet-settings').classList.contains('is-open')) {
        closeSettings();
      }
    }
  });
}

// ── Init ────────────────────────────────────
window.setTestSettings = function(rounds, roundDuration, restDuration) {
  state.rounds = rounds;
  state.roundDuration = roundDuration;
  state.restDuration = restDuration;
  $('rounds-value').textContent = rounds;
  $('round-duration-value').textContent = formatTime(roundDuration);
  $('rest-duration-value').textContent = formatTime(restDuration);
  updateStepperButtons();
  saveSettings();
};

window.completeTest = function() {
  if (state.phase === 'round' || state.phase === 'rest' || state.phase === 'countdown') {
    stopTimer();
    state.phase = 'complete';
    state.remaining = 0;
    state.currentRound = state.rounds;
    hideOverlays();
    updateProgressRing(1);
    updatePauseButton();
    dom.completeSummary.textContent = `${state.rounds} rounds completed`;
    showScreen('complete');
    announce('Workout complete');
  }
};

function init() {
  loadSettings();
  applyTheme();

  $('rounds-value').textContent = state.rounds;
  $('round-duration-value').textContent = formatTime(state.roundDuration);
  $('rest-duration-value').textContent = formatTime(state.restDuration);
  $('start-countdown').checked = state.startCountdown;

  initProgressRing();
  updateStepperButtons();
  wireEvents();
  showScreen('setup');
}

init();
