function freezeRound(state) {
  Object.freeze(state.queue);
  Object.freeze(state.slots);
  return Object.freeze(state);
}

export function createRound(items, size, random = Math.random) {
  if (![5, 10].includes(size)) throw new RangeError('Choose 5 or 10 ranks.');
  if (!Array.isArray(items) || items.length < size ||
      !items.every(item => typeof item === 'string' && item.trim()) ||
      new Set(items).size !== items.length) {
    throw new TypeError('A category needs enough distinct, non-empty items.');
  }
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('Invalid random value.');
    const j = Math.floor(value * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return freezeRound({ size, queue: pool.slice(0, size), slots: Array(size).fill(null), cursor: 0, phase: 'revealing' });
}

export function settleReveal(state) {
  if (state.phase !== 'revealing') throw new Error('No reveal is in progress.');
  return freezeRound({ ...state, phase: 'placing' });
}

export function placeItem(state, rank) {
  if (state.phase !== 'placing') throw new Error('Wait for an item to be revealed.');
  if (!Number.isInteger(rank) || rank < 1 || rank > state.size) throw new RangeError('Choose a valid rank.');
  if (state.slots[rank - 1] !== null) throw new Error('That rank is already locked.');
  const slots = [...state.slots];
  slots[rank - 1] = state.queue[state.cursor];
  const cursor = state.cursor + 1;
  return freezeRound({ ...state, slots, cursor, phase: cursor === state.size ? 'complete' : 'revealing' });
}
