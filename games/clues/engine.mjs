const WORD_COUNT = 10;
const CLUE_LIMIT = 15;

function freezeRound(round) {
  return Object.freeze({...round, answers: Object.freeze([...round.answers]),
    history: Object.freeze(round.history.map(entry => Object.freeze({...entry})))});
}

export function createRound(things, random = Math.random, roundNumber = 1) {
  if (!Array.isArray(things) || new Set(things).size < WORD_COUNT) {
    throw new Error('At least ten different things are needed.');
  }
  if (!Number.isSafeInteger(roundNumber) || roundNumber < 1) throw new Error('Invalid round number.');
  const deck = [...new Set(things)];
  for (let index = 0; index < WORD_COUNT; index++) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Invalid random value.');
    const pick = index + Math.floor(value * (deck.length - index));
    [deck[index], deck[pick]] = [deck[pick], deck[index]];
  }
  const explainer = roundNumber % 2 ? 1 : 2;
  return freezeRound({phase: 'ready', reason: null, answers: deck.slice(0, WORD_COUNT),
    index: 0, clues: 0, currentClues: 0, history: [], explainer, guesser: 3 - explainer,
    roundNumber});
}

export function revealRound(round) {
  return round.phase === 'ready' ? freezeRound({...round, phase: 'playing'}) : round;
}

export function useClue(round) {
  if (round.phase !== 'playing' || round.clues >= CLUE_LIMIT) return round;
  return freezeRound({...round, clues: round.clues + 1, currentClues: round.currentClues + 1});
}

export function markGuessed(round) {
  if (round.phase !== 'playing' || round.currentClues === 0) return round;
  const index = round.index + 1;
  const history = [...round.history, {answer: round.answers[round.index], clues: round.currentClues}];
  const reason = index === WORD_COUNT ? 'won' : round.clues === CLUE_LIMIT ? 'budget' : null;
  return freezeRound({...round, index, currentClues: 0, history,
    phase: reason ? 'finished' : 'playing', reason});
}

export function endRound(round) {
  return round.phase === 'finished' ? round : freezeRound({...round, phase: 'finished', reason: 'ended'});
}
