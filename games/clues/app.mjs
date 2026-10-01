import {THINGS} from './things.mjs?v=1';
import {createRound, revealRound, useClue, markGuessed, skipWord, endRound} from './engine.mjs?v=2';

export function mountClues({document, random = Math.random}) {
  const el = id => document.getElementById(id);
  let round = null;
  let roundNumber = 0;

  function render(focus = null) {
    const phase = round?.phase;
    el('setup').hidden = !!round;
    el('ready').hidden = phase !== 'ready';
    el('playing').hidden = phase !== 'playing';
    el('results').hidden = phase !== 'finished';
    el('answer').textContent = phase === 'playing' ? round.answers[round.index] : '';
    el('review').replaceChildren();
    if (round) {
      const roles = `Player ${round.explainer} explains · Player ${round.guesser} guesses`;
      el('ready-roles').textContent = roles;
      el('roles').textContent = roles;
      el('word-progress').textContent = `${Math.min(round.history.length + 1, 10)} of 10`;
      el('clues-left').textContent = String(15 - round.clues);
      el('clues-used').textContent = String(round.currentClues);
      el('skips-left').textContent = String(2 - round.skipped.length);
      el('use-clue').disabled = phase !== 'playing' || round.clues === 15;
      el('guessed').disabled = phase !== 'playing' || round.currentClues === 0;
      el('skip-word').disabled = phase !== 'playing' || round.skipped.length === 2 || round.clues === 15;
      el('budget-note').textContent = round.clues === 15 ?
        'No clues left. If this word was guessed, tap Guessed it; otherwise end the round.' :
        'Say one word at a time. Count each clue you give.';
      if (phase === 'finished') {
        el('result-title').textContent = round.reason === 'won' ? 'All 10 words guessed!' : 'Round over';
        el('result-summary').textContent = round.reason === 'won' ?
          `You did it in ${round.clues} of 15 clues.` :
          `${round.history.length} of 10 words guessed using ${round.clues} of 15 clues.`;
        const guessed = new Map(round.history.map(entry => [entry.answer, entry.clues]));
        const skipped = new Set(round.skipped);
        const presentedCount = round.index + (round.reason === 'ended' && round.phase === 'finished' ? 1 : 0);
        el('review').replaceChildren(...round.answers.slice(0, presentedCount).map(answer => {
          const li = document.createElement('li');
          const count = guessed.get(answer);
          li.textContent = `${answer}${skipped.has(answer) ? ' · skipped' : count ?
            ` · ${count} clue${count === 1 ? '' : 's'}` : ' · not guessed'}`;
          return li;
        }));
      }
    }
    el('announcement').textContent = phase === 'finished' ? el('result-summary').textContent :
      phase === 'playing' ? `Word ${round.history.length + 1} of 10. ${15 - round.clues} clues and ${2 - round.skipped.length} skip${round.skipped.length === 1 ? '' : 's'} left.` :
      phase === 'ready' ? el('ready-roles').textContent : '';
    if (focus) el(focus).focus();
  }

  function prepare() {
    roundNumber++;
    round = createRound(THINGS, random, roundNumber);
    render('reveal');
  }

  el('start').addEventListener('click', prepare);
  el('reveal').addEventListener('click', () => {
    if (round?.phase !== 'ready') return;
    round = revealRound(round);
    render('use-clue');
  });
  el('use-clue').addEventListener('click', () => {
    if (!round) return;
    round = useClue(round);
    render('use-clue');
  });
  el('guessed').addEventListener('click', () => {
    if (!round) return;
    round = markGuessed(round);
    render(round.phase === 'finished' ? 'play-again' : 'use-clue');
  });
  el('skip-word').addEventListener('click', () => {
    if (!round) return;
    round = skipWord(round);
    render(round.phase === 'finished' ? 'play-again' : 'use-clue');
  });
  el('end-round').addEventListener('click', () => {
    if (round?.phase !== 'playing') return;
    round = endRound(round);
    render('play-again');
  });
  el('play-again').addEventListener('click', prepare);
  render();
}

if (typeof document !== 'undefined') mountClues({document});
