export const STARTING_CASH = 20;
export const ROSTER_SIZE = 5;

function freezeState(state) {
  Object.freeze(state.queue);
  Object.freeze(state.balances);
  state.rosters.forEach(Object.freeze);
  Object.freeze(state.rosters);
  state.history.forEach(Object.freeze);
  Object.freeze(state.history);
  return Object.freeze(state);
}

export function createWager(items, random = Math.random) {
  if (!Array.isArray(items) || items.length < ROSTER_SIZE * 2 ||
      items.some(item => typeof item !== 'string' || !item.trim()) ||
      new Set(items).size !== items.length) {
    throw new TypeError('Choose a category with at least ten distinct entries.');
  }
  if (typeof random !== 'function') throw new TypeError('A random function is required.');
  const pool = [...items];
  for (let index = pool.length - 1; index > 0; index--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Invalid random value.');
    const other = Math.floor(value * (index + 1));
    [pool[index], pool[other]] = [pool[other], pool[index]];
  }
  return freezeState({
    queue: pool.slice(0, ROSTER_SIZE * 2), index: 0,
    phase: 'bidding', starter: 0, turn: 0, leader: null, highBid: 0,
    balances: [STARTING_CASH, STARTING_CASH], rosters: [[], []], history: [],
  });
}

export function maxBid(state, player) {
  if (![0, 1].includes(player)) throw new RangeError('Choose Player 1 or Player 2.');
  const slotsFilled = state.rosters[player].length;
  if (slotsFilled === ROSTER_SIZE) return 0;
  return Math.max(0, state.balances[player] - (ROSTER_SIZE - slotsFilled - 1));
}

export function placeBid(state, amount) {
  if (state.phase !== 'bidding') throw new Error('There is no active auction.');
  const player = state.turn;
  const minimum = state.highBid + 1;
  if (!Number.isInteger(amount) || amount < minimum || amount > maxBid(state, player)) {
    throw new RangeError(`Bid a whole dollar amount from $${minimum} to $${maxBid(state, player)}.`);
  }
  const next = { ...state, leader: player, highBid: amount, turn: 1 - player };
  return maxBid(next, next.turn) <= amount ? award(next) : freezeState(next);
}

function award(state) {
  const winner = state.leader;
  const item = state.queue[state.index];
  const rosters = state.rosters.map((roster, player) => player === winner ? [...roster, item] : [...roster]);
  const balances = state.balances.map((balance, player) => player === winner ? balance - state.highBid : balance);
  const history = [...state.history, { round: state.index + 1, item, starter: state.starter, winner, price: state.highBid }];
  const phase = rosters.every(roster => roster.length === ROSTER_SIZE) ? 'complete' : 'awarded';
  return freezeState({ ...state, rosters, balances, history, phase });
}

export function concede(state) {
  if (state.phase !== 'bidding' || state.leader === null || state.turn === state.leader) {
    throw new Error('Only the non-leading bidder can pass.');
  }
  return award(state);
}

export function nextItem(state) {
  if (state.phase !== 'awarded') throw new Error('Finish the current item first.');
  const index = state.index + 1;
  if (index >= state.queue.length) throw new Error('No more entries remain.');
  const starter = index % 2;
  const eligible = state.rosters.map(roster => roster.length < ROSTER_SIZE);
  const solo = eligible.filter(Boolean).length === 1;
  const turn = eligible[starter] ? starter : 1 - starter;
  return freezeState({ ...state, index, starter, turn,
    phase: solo ? 'solo' : 'bidding', leader: null, highBid: 0 });
}

export function claimSolo(state) {
  if (state.phase !== 'solo' || state.rosters[state.turn].length >= ROSTER_SIZE || maxBid(state, state.turn) < 1) {
    throw new Error('There is no unopposed entry to claim.');
  }
  return award({ ...state, leader: state.turn, highBid: 1 });
}
