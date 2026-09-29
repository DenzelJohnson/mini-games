// Original seeds survive every round. Adjacent match winners advance without reseeding.
function freezeBracket(state) {
  Object.freeze(state.entrants);
  Object.freeze(state.matches);
  Object.freeze(state.winners);
  Object.freeze(state.history);
  return Object.freeze(state);
}

const match = (left, right) => Object.freeze({ left, right });

export function createBracket(items, size, random = Math.random) {
  if (![16, 32, 64].includes(size)) throw new RangeError('Choose a bracket of 16, 32, or 64.');
  if (!Array.isArray(items) || items.length < size) throw new RangeError('This category needs more entries for that bracket.');
  if (items.some(item => typeof item !== 'string' || !item.trim()) || new Set(items).size !== items.length) {
    throw new TypeError('Category entries must be distinct, nonempty names.');
  }
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Random values must be between 0 and 1.');
    const j = Math.floor(value * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const entrants = pool.slice(0, size).map((name, i) => Object.freeze({ seed: i + 1, name }));
  const matches = Array.from({ length: size / 2 }, (_, i) => match(entrants[i], entrants[size - 1 - i]));
  return freezeBracket({ size, entrants, matches, winners: [], history: [], roundSize: size, cursor: 0, picks: 0, phase: 'choosing', champion: null });
}

export function chooseWinner(state, seed) {
  if (state.phase !== 'choosing') throw new Error('This bracket is already complete.');
  const current = state.matches[state.cursor];
  const winner = [current.left, current.right].find(entrant => entrant.seed === seed);
  if (!winner) throw new RangeError('Choose one of the two current contenders.');
  const winners = [...state.winners, winner];
  const history = [...state.history, Object.freeze({ ...current, winner, roundSize: state.roundSize, matchNumber: state.cursor + 1 })];
  const next = { ...state, winners, history, cursor: state.cursor + 1, picks: state.picks + 1 };
  if (next.cursor !== state.matches.length) return freezeBracket(next);
  if (winners.length === 1) return freezeBracket({ ...next, phase: 'complete', champion: winner });
  const matches = Array.from({ length: winners.length / 2 }, (_, i) => match(winners[i * 2], winners[i * 2 + 1]));
  return freezeBracket({ ...next, matches, winners: [], cursor: 0, roundSize: state.roundSize / 2 });
}
