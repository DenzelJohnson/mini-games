import {PROMPT_CATEGORIES} from './prompts.mjs?v=1';
import {createRound, startRound, advanceRound, pauseRound, resumeRound, tick, endRound, secondsLeft} from './engine.mjs?v=1';

export function mountCharades({document, window, now = () => performance.now(),
  schedule = setInterval, cancel = clearInterval, random = Math.random}) {
  const el = id => document.getElementById(id);
  let round = null, timer = null, generation = 0, resumeAfterDialog = false;
  let settings = {category: 'mixed', duration: 60, reverse: false};

  function renderInstructions(reverse) {
    el('instructions-title').textContent = reverse ? 'One director. One actor. Everyone else guesses.' : 'One actor. Everyone else guesses.';
    el('instructions-text').textContent = reverse ?
      'Only the director looks at the screen. Describe to your partner how to act out the action; your partner performs it while everyone else guesses. Tap Correct or Skip to move on.' :
      'Only the actor looks at the screen. Use gestures, not words or sounds. Tap Correct for a right guess, or Skip to move on. Pass the device to the next actor after the round.';
    el('ready-eyebrow').textContent = reverse ? 'For the director’s eyes only' : 'For the actor’s eyes only';
    el('ready-title').textContent = reverse ? 'Ready to direct?' : 'Ready to act?';
    el('ready-instructions').textContent = reverse ?
      'Only you look at the screen. Describe to your partner how to act out the action. Your timer starts when you reveal the first prompt.' :
      'Face the screen toward you. Your timer starts when you reveal the first prompt.';
    el('playing-instructions').textContent = reverse ?
      'Tell your partner how to act this out while the others guess.' : 'No talking. Make your moves.';
  }

  function stopClock() {
    generation++;
    if (timer !== null) cancel(timer);
    timer = null;
  }

  function startClock() {
    stopClock();
    const token = generation;
    timer = schedule(() => {
      if (token !== generation || round?.phase !== 'running') return;
      const previous = round;
      round = tick(round, now());
      if (round.phase === 'finished') stopClock();
      render(round !== previous ? 'play-again' : null, round !== previous);
    }, 200);
  }

  function render(focus = null, announce = false) {
    renderInstructions(round ? settings.reverse : el('reverse-mode').checked);
    const phase = round?.phase;
    el('setup').hidden = !!round;
    el('round').hidden = !round || phase === 'finished';
    el('results').hidden = phase !== 'finished';
    el('ready').hidden = phase !== 'ready';
    el('playing').hidden = phase !== 'running';
    el('paused').hidden = phase !== 'paused';
    el('end-round').hidden = phase === 'ready';
    el('correct').disabled = phase !== 'running';
    el('skip').disabled = phase !== 'running';
    el('pause').disabled = phase !== 'running';
    el('prompt').textContent = phase === 'running' ? round.queue[round.cursor].text : '';
    el('prompt-category').textContent = phase === 'running' ? round.queue[round.cursor].category : '';
    if (!round) {
      el('history').replaceChildren();
      el('announcement').textContent = '';
    } else {
      const score = round.history.filter(item => item.outcome === 'correct').length;
      const skips = round.history.length - score;
      const seconds = secondsLeft(round, now());
      el('time-left').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      el('time-progress').max = round.duration;
      el('time-progress').value = seconds;
      el('score').textContent = String(score);
      el('skips').textContent = String(skips);
      el('round-label').textContent = `${settings.category === 'mixed' ? 'Mixed bag' : PROMPT_CATEGORIES.find(c => c.id === settings.category).name} · ${round.duration} seconds`;
      if (phase === 'finished') {
        el('result-score').textContent = String(score);
        el('result-skips').textContent = String(skips);
        el('result-reason').textContent = round.reason === 'time' ? 'Time’s up!' :
          round.reason === 'deck' ? `All ${round.queue.length} prompts played. Nice work!` : 'Round ended early.';
        el('history').replaceChildren(...round.history.map(item => {
          const li = document.createElement('li');
          const text = document.createElement('span');
          text.textContent = item.text;
          const badge = document.createElement('span');
          badge.className = `outcome ${item.outcome}`;
          badge.textContent = item.outcome === 'correct' ? 'Correct' : 'Skipped';
          li.append(text, badge);
          return li;
        }));
      }
      if (announce) el('announcement').textContent = phase === 'running' ?
        `${round.queue[round.cursor].text}. ${round.queue[round.cursor].category}. ${score} correct.` :
        phase === 'finished' ? `${el('result-reason').textContent} ${score} correct, ${skips} skipped.` :
        phase === 'paused' ? 'Round paused. Prompt hidden.' : `${settings.reverse ? 'Director' : 'Actor'} ready. Reveal when you are ready to start.`;
    }
    if (focus) el(focus).focus();
  }

  function reset() {
    stopClock();
    round = null;
    resumeAfterDialog = false;
    render('category');
  }

  function prepare() {
    stopClock();
    const categories = settings.category === 'mixed' ? PROMPT_CATEGORIES :
      PROMPT_CATEGORIES.filter(c => c.id === settings.category);
    if (!categories.length) throw new Error('Choose an available category.');
    const pool = categories.flatMap(c => c.items.map(text => ({text, category: c.name})));
    round = createRound(pool, settings.duration, random);
    el('history').replaceChildren();
    render('reveal', true);
  }

  function pause() {
    if (round?.phase !== 'running') return;
    round = pauseRound(round, now());
    stopClock();
    render(round.phase === 'finished' ? 'play-again' : 'resume', true);
  }

  function resume() {
    if (round?.phase !== 'paused') return;
    round = resumeRound(round, now());
    startClock();
    render('correct', true);
  }

  function interrupt() {
    // A background interruption takes precedence over a dialog's pending resume.
    resumeAfterDialog = false;
    pause();
  }

  function advance(outcome) {
    if (round?.phase !== 'running') return;
    round = advanceRound(round, outcome, now());
    if (round.phase === 'finished') stopClock();
    render(round.phase === 'finished' ? 'play-again' : 'correct', true);
  }

  const mixed = document.createElement('option');
  mixed.value = 'mixed';
  mixed.textContent = 'Mixed bag · all 300 prompts';
  el('category').append(mixed);
  for (const category of PROMPT_CATEGORIES) {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = `${category.name} · ${category.items.length}`;
    el('category').append(option);
  }
  el('category').value = 'mixed';
  el('reverse-mode').addEventListener('change', () => { if (!round) render(); });
  el('setup-form').addEventListener('submit', event => {
    event.preventDefault();
    settings = {category: el('category').value, duration: Number(el('duration').value), reverse: el('reverse-mode').checked};
    el('setup-error').textContent = '';
    try { prepare(); } catch (error) {
      round = null;
      render();
      el('setup-error').textContent = error.message;
    }
  });
  el('reveal').addEventListener('click', () => {
    if (round?.phase !== 'ready') return;
    round = startRound(round, now());
    startClock();
    render('correct', true);
  });
  el('correct').addEventListener('click', () => advance('correct'));
  el('skip').addEventListener('click', () => advance('skipped'));
  el('pause').addEventListener('click', pause);
  el('resume').addEventListener('click', resume);
  el('end-round').addEventListener('click', () => {
    if (!round || round.phase === 'finished') return;
    round = endRound(tick(round, now()));
    stopClock();
    render('play-again', true);
  });
  el('new-game').addEventListener('click', () => {
    if (!round || ['ready', 'finished'].includes(round.phase)) { reset(); return; }
    resumeAfterDialog = round.phase === 'running';
    pause();
    if (round.phase === 'finished') { resumeAfterDialog = false; return; }
    el('reset-dialog').showModal();
    el('keep-playing').focus();
  });
  el('keep-playing').addEventListener('click', () => el('reset-dialog').close());
  el('confirm-reset').addEventListener('click', () => {
    resumeAfterDialog = false;
    el('reset-dialog').close();
    reset();
  });
  el('reset-dialog').addEventListener('close', () => {
    if (!round) return;
    if (resumeAfterDialog) resume();
    else render(round.phase === 'paused' ? 'resume' : 'reveal');
    resumeAfterDialog = false;
  });
  el('play-again').addEventListener('click', prepare);
  el('change-settings').addEventListener('click', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) interrupt(); });
  window.addEventListener('pagehide', interrupt);
  el('start').disabled = false;
  render();
}
