function freeze(state) {
  state.queue.forEach(Object.freeze);
  state.history.forEach(Object.freeze);
  Object.freeze(state.queue);
  Object.freeze(state.history);
  return Object.freeze(state);
}

function checkTime(now) {
  if (!Number.isFinite(now) || now < 0) throw new RangeError('Invalid clock time.');
}

export function createRound(items, duration, random = Math.random) {
  if (![60, 90, 120].includes(duration)) throw new RangeError('Choose 60, 90 or 120 seconds.');
  if (!Array.isArray(items) || !items.length || !items.every(item =>
    typeof item?.text === 'string' && item.text.trim() && typeof item.category === 'string' && item.category.trim()) ||
    new Set(items.map(item => item.text.toLowerCase())).size !== items.length) {
    throw new TypeError('A round needs distinct prompts with categories.');
  }
  const queue = items.map(({text, category}) => ({text, category}));
  for (let i = queue.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Invalid random value.');
    const j = Math.floor(value * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  return freeze({queue, duration, cursor: 0, history: [], phase: 'ready',
    remainingMs: duration * 1000, deadline: null, reason: null});
}

export function startRound(state, now) {
  checkTime(now);
  if (state.phase !== 'ready') throw new Error('The round has already started.');
  return freeze({...state, phase: 'running', deadline: now + state.remainingMs});
}

export function secondsLeft(state, now) {
  checkTime(now);
  if (state.phase === 'finished') return 0;
  return Math.ceil(Math.max(0, state.phase === 'running' ? state.deadline - now : state.remainingMs) / 1000);
}

function finish(state, reason) {
  return freeze({...state, phase: 'finished', deadline: null, remainingMs: 0, reason});
}

export function tick(state, now) {
  checkTime(now);
  return state.phase === 'running' && now >= state.deadline ? finish(state, 'time') : state;
}

export function advanceRound(state, outcome, now) {
  checkTime(now);
  if (state.phase !== 'running') throw new Error('Reveal or resume the prompt first.');
  if (!['correct', 'skipped'].includes(outcome)) throw new RangeError('Choose correct or skipped.');
  const timed = tick(state, now);
  if (timed.phase === 'finished') return timed;
  const history = [...state.history, {...state.queue[state.cursor], outcome}];
  const next = freeze({...state, history, cursor: state.cursor + 1});
  return next.cursor === state.queue.length ? finish(next, 'deck') : next;
}

export function pauseRound(state, now) {
  checkTime(now);
  if (state.phase !== 'running') throw new Error('Only a running round can pause.');
  const timed = tick(state, now);
  return timed.phase === 'finished' ? timed :
    freeze({...state, phase: 'paused', remainingMs: state.deadline - now, deadline: null});
}

export function resumeRound(state, now) {
  checkTime(now);
  if (state.phase !== 'paused') throw new Error('The round is not paused.');
  return freeze({...state, phase: 'running', deadline: now + state.remainingMs});
}

export function endRound(state) {
  return state.phase === 'finished' ? state : finish(state, 'ended');
}
