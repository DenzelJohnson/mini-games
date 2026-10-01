import {THINGS} from './things.mjs?v=1';
import {createRound, revealRound, useClue, markGuessed, endRound} from './engine.mjs?v=1';

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
      el('word-progress').textContent = `${Math.min(round.index + 1, 10)} of 10`;
      el('clues-left').textContent = String(15 - round.clues);
      el('clues-used').textContent = String(round.currentClues);
      el('use-clue').disabled = phase !== 'playing' || round.clues === 15;
      el('guessed').disabled = phase !== 'playing' || round.currentClues === 0;
      el('budget-note').textContent = round.clues === 15 ?
        'No clues left. If this word was guessed, tap Guessed it; otherwise end the round.' :
        'Say one word at a time. Count each clue you give.';
      if (phase === 'finished') {
        el('result-title').textContent = round.reason === 'won' ? 'All 10 words guessed!' : 'Round over';
        el('result-summary').textContent = round.reason === 'won' ?
          `You did it in ${round.clues} of 15 clues.` :
          `${round.history.length} of 10 words guessed using ${round.clues} of 15 clues.`;
        el('review').replaceChildren(...round.answers.map((answer, index) => {
          const li = document.createElement('li');
          li.textContent = `${answer}${index < round.history.length ? ` · ${round.history[index].clues} clue${round.history[index].clues === 1 ? '' : 's'}` : ' · not guessed'}`;
          return li;
        }));
      }
    }
    el('announcement').textContent = phase === 'finished' ? el('result-summary').textContent :
      phase === 'playing' ? `Word ${round.index + 1} of 10. ${15 - round.clues} clues left.` :
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
  el('end-round').addEventListener('click', () => {
    if (round?.phase !== 'playing') return;
    round = endRound(round);
    render('play-again');
  });
  el('play-again').addEventListener('click', prepare);
  render();
}

if (typeof document !== 'undefined') mountClues({document});
