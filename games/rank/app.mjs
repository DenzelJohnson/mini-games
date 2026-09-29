import { CATEGORIES } from './categories.mjs?v=3';
import { createRound, settleReveal, placeItem } from './engine.mjs';
import { createBracket, chooseWinner } from './bracket.mjs?v=1';
import { getEntryImage, createPortrait } from './portraits.mjs?v=2';

const byId = id => document.getElementById(id);
const setup = byId('setup');
const round = byId('round');
const categorySelect = byId('category');
const slots = byId('slots');
const itemPanel = byId('item-panel');
const revealWindow = byId('reveal-window');
const itemName = byId('item-name');
const dialog = byId('reset-dialog');
const announcement = byId('announcement');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let state = null;
let category = null;
let size = 5;
let mode = 'blind';
let revealInterval;
let revealTimeout;
let revealVersion = 0;

for (const entry of CATEGORIES) {
  const option = document.createElement('option');
  option.value = entry.id;
  option.textContent = entry.pending ? `${entry.name} — ${entry.id === 'movies' ? 'paused' : 'awaiting your list'}` : entry.name;
  option.disabled = Boolean(entry.pending);
  categorySelect.append(option);
}
byId('start').disabled = false;

function renderSetupMode() {
  const bracket = byId('mode-bracket').checked;
  byId('blind-size').hidden = bracket;
  byId('blind-size').disabled = bracket;
  byId('bracket-size').hidden = !bracket;
  byId('bracket-size').disabled = !bracket;
  byId('start').textContent = bracket ? 'Start bracket' : 'Start ranking';
  byId('setup-hint').textContent = bracket
    ? 'Random seeds. Head-to-head choices. Pick winners until one champion remains.'
    : '1 is your favorite. You won’t know what’s coming next, and filled ranks can’t be changed.';
}
byId('mode-options').addEventListener('change', renderSetupMode);
renderSetupMode();

function roundName(roundSize) {
  return ({ 2: 'Final', 4: 'Semifinals', 8: 'Quarterfinals' })[roundSize] ?? `Round of ${roundSize}`;
}

function appendPortrait(parent, name, variant = 'thumb') {
  const portrait = createPortrait(document, category.id, name, variant);
  if (portrait) parent.append(portrait);
}

function setPortrait(id, name) {
  const container = byId(id);
  container.replaceChildren();
  const portrait = name ? createPortrait(document, category.id, name, 'hero') : null;
  container.hidden = !portrait;
  if (portrait) container.append(portrait);
}

function renderImageCredits() {
  const names = mode === 'bracket' ? state.entrants.map(e => e.name) : [
    ...state.slots.filter(Boolean),
    ...(state.phase === 'placing' ? [state.queue[state.cursor]] : []),
  ];
  const credits = byId('image-credits');
  credits.replaceChildren();
  for (const name of new Set(names)) {
    const image = getEntryImage(category.id, name);
    if (!image) continue;
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = image.source;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.item = name;
    link.textContent = `${name} — ${image.credit} ↗`;
    link.setAttribute('aria-label', `${name} image source (opens in a new tab)`);
    li.append(link);
    if (image.license) {
      const license = document.createElement('a');
      license.href = image.license;
      license.target = '_blank';
      license.rel = 'noopener noreferrer';
      license.dataset.forItem = name;
      license.textContent = ' · License ↗';
      license.setAttribute('aria-label', `${name} image license (opens in a new tab)`);
      li.append(license);
    }
    credits.append(li);
  }
  byId('image-details').hidden = credits.children.length === 0;
}

function renderBracket() {
  const complete = state.phase === 'complete';
  byId('round-title').textContent = complete ? 'Your champion' : roundName(state.roundSize);
  byId('progress').max = state.size - 1;
  byId('progress').value = state.picks;
  byId('progress').setAttribute('aria-label', 'Matches decided');
  byId('progress-count').textContent = `${state.picks} / ${state.size - 1}`;
  byId('progress-text').textContent = complete ? 'One champion. Every choice, yours.' : 'Matches decided';
  byId('match-panel').hidden = complete;
  byId('champion-panel').hidden = !complete;
  const choices = byId('match-choices');
  choices.replaceChildren();
  setPortrait('champion-portrait', complete ? state.champion.name : null);
  if (complete) {
    byId('champion-name').textContent = state.champion.name;
    byId('champion-seed').textContent = `Original seed ${state.champion.seed} · ${category.name}`;
  } else {
    byId('match-number').textContent = `Match ${state.cursor + 1} of ${state.matches.length}`;
    const current = state.matches[state.cursor];
    for (const entrant of [current.left, current.right]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'match-choice';
      button.dataset.seed = String(entrant.seed);
      button.setAttribute('aria-label', `Choose ${entrant.name}, seed ${entrant.seed}`);
      const seed = document.createElement('span');
      seed.className = 'eyebrow';
      seed.textContent = `Seed ${entrant.seed}`;
      const name = document.createElement('span');
      name.className = 'contender-name';
      name.textContent = entrant.name;
      const action = document.createElement('span');
      action.className = 'hint';
      action.textContent = 'Pick winner →';
      button.append(seed);
      appendPortrait(button, entrant.name, 'hero');
      button.append(name, action);
      choices.append(button);
    }
  }
  byId('history-details').hidden = state.history.length === 0;
  byId('history-summary').textContent = `Match history (${state.history.length})`;
  byId('match-history').replaceChildren();
  for (const result of state.history) {
    const li = document.createElement('li');
    const row = document.createElement('span');
    row.className = 'history-row';
    appendPortrait(row, result.winner.name);
    const label = document.createElement('span');
    label.textContent = `${roundName(result.roundSize)} · Match ${result.matchNumber}: ${result.left.name} (${result.left.seed}) vs ${result.right.name} (${result.right.seed}) → ${result.winner.name}`;
    row.append(label);
    li.append(row);
    byId('match-history').append(li);
  }
}

function renderSeeds() {
  byId('seed-list').replaceChildren();
  for (const entrant of state.entrants) {
    const li = document.createElement('li');
    const row = document.createElement('span');
    row.className = 'seed-row';
    appendPortrait(row, entrant.name);
    const label = document.createElement('span');
    label.textContent = entrant.name;
    row.append(label);
    li.append(row);
    byId('seed-list').append(li);
  }
  byId('seed-summary').textContent = `Starting seeds (${state.size})`;
  byId('seed-details').open = false;
  byId('history-details').open = false;
}

function focusMatch() {
  if (!dialog.open) byId('match-choices').querySelector('button')?.focus({ preventScroll: true });
}

function cancelReveal() {
  clearInterval(revealInterval);
  clearTimeout(revealTimeout);
  revealVersion++;
  revealWindow.classList.remove('spinning', 'settled');
}

function renderSlots() {
  slots.replaceChildren();
  state.slots.forEach((item, index) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.rank = String(index + 1);
    button.className = `rank-slot ${item === null ? 'empty' : 'locked'}`;
    button.disabled = item !== null || state.phase !== 'placing';
    button.setAttribute('aria-label', item === null ? `Rank ${index + 1}: empty` : `Rank ${index + 1}: ${item}, locked`);
    const number = document.createElement('span');
    number.className = 'rank-number';
    number.textContent = String(index + 1);
    const label = document.createElement('span');
    label.className = 'slot-name';
    label.textContent = item ?? 'Place here';
    button.append(number);
    if (item !== null) appendPortrait(button, item);
    button.append(label);
    if (item !== null) {
      const locked = document.createElement('span');
      locked.className = 'lock-label';
      locked.textContent = 'Locked';
      button.append(locked);
    }
    li.append(button);
    slots.append(li);
  });
}

function renderRound() {
  setup.hidden = true;
  round.hidden = false;
  byId('round-category').textContent = `${category.name} · ${state.size} items`;
  byId('blind-board').hidden = mode !== 'blind';
  byId('bracket-board').hidden = mode !== 'bracket';
  byId('result-actions').hidden = state.phase !== 'complete';
  renderImageCredits();
  if (mode === 'bracket') {
    renderBracket();
    return;
  }
  byId('progress').setAttribute('aria-label', 'Items ranked');
  setPortrait('item-portrait', state.phase === 'placing' ? state.queue[state.cursor] : null);
  byId('progress').max = state.size;
  byId('progress').value = state.cursor;
  byId('progress-count').textContent = `${state.cursor} / ${state.size}`;
  byId('result-actions').hidden = state.phase !== 'complete';
  byId('round-title').textContent = state.phase === 'complete' ? 'Your final ranking' : 'Blind Ranking';
  byId('progress-text').textContent = state.phase === 'complete' ? 'Every choice, locked in.' : 'Items ranked';
  if (state.phase === 'complete') {
    byId('item-label').textContent = 'That’s a wrap';
    itemName.textContent = 'All ranked.';
    byId('item-instruction').textContent = 'No edits. No regrets. Ready for another round?';
  } else {
    byId('item-label').textContent = `Item ${state.cursor + 1} of ${state.size}`;
    byId('item-instruction').textContent = state.phase === 'revealing' ? 'Revealing your next item…' : 'Choose an empty rank. This choice is final.';
  }
  renderSlots();
}

function focusEmptySlot() {
  if (!dialog.open) slots.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
}

function revealNext() {
  cancelReveal();
  const version = revealVersion;
  const finish = () => {
    if (version !== revealVersion || !state || state.phase !== 'revealing') return;
    clearInterval(revealInterval);
    clearTimeout(revealTimeout);
    state = settleReveal(state);
    revealWindow.classList.remove('spinning');
    revealWindow.classList.add('settled');
    itemName.textContent = state.queue[state.cursor];
    renderRound();
    announcement.textContent = `Item ${state.cursor + 1} of ${state.size}: ${itemName.textContent}. Choose an empty rank.`;
    focusEmptySlot();
  };
  renderRound();
  itemPanel.focus({ preventScroll: true });
  if (reducedMotion.matches) {
    finish();
    return;
  }
  const pool = category.items;
  let index = Math.floor(Math.random() * pool.length);
  itemName.textContent = pool[index];
  revealWindow.classList.add('spinning');
  revealInterval = setInterval(() => {
    if (version !== revealVersion || state?.phase !== 'revealing') return;
    index = (index + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
    itemName.textContent = pool[index];
  }, 80);
  revealTimeout = setTimeout(finish, 1100);
}

function startRound() {
  cancelReveal();
  if (!category || category.pending) throw new Error('This category is not available. Choose an available category.');
  announcement.textContent = '';
  if (mode === 'bracket') {
    state = createBracket(category.items, size);
    renderSeeds();
    renderRound();
    announcement.textContent = `${roundName(state.roundSize)}. Match 1 of ${state.matches.length}. Pick a winner.`;
    focusMatch();
  } else {
    state = createRound(category.items, size);
    revealNext();
  }
}

function showSetup() {
  cancelReveal();
  state = null;
  round.hidden = true;
  setup.hidden = false;
  slots.replaceChildren();
  byId('item-portrait').replaceChildren();
  byId('champion-portrait').replaceChildren();
  byId('match-choices').replaceChildren();
  byId('seed-list').replaceChildren();
  byId('match-history').replaceChildren();
  byId('image-credits').replaceChildren();
  byId('image-details').hidden = true;
  byId('image-details').open = false;
  announcement.textContent = '';
  categorySelect.focus();
}

byId('setup-form').addEventListener('submit', event => {
  event.preventDefault();
  category = CATEGORIES.find(entry => entry.id === categorySelect.value);
  const data = new FormData(event.currentTarget);
  mode = data.get('mode') === 'bracket' ? 'bracket' : 'blind';
  size = Number(data.get(mode === 'bracket' ? 'bracket-size' : 'size'));
  byId('setup-error').textContent = '';
  try {
    startRound();
  } catch (error) {
    byId('setup-error').textContent = error.message;
    showSetup();
  }
});

byId('match-choices').addEventListener('click', event => {
  const button = event.target.closest('button[data-seed]');
  if (!button || button.disabled || mode !== 'bracket' || state?.phase !== 'choosing') return;
  const winner = state.matches[state.cursor];
  const seed = Number(button.dataset.seed);
  const name = [winner.left, winner.right].find(entrant => entrant.seed === seed)?.name;
  if (!name) return;
  state = chooseWinner(state, seed);
  renderRound();
  if (state.phase === 'complete') {
    announcement.textContent = `${name} is your champion!`;
    byId('replay').focus({ preventScroll: true });
  } else {
    announcement.textContent = `${name} advances. ${roundName(state.roundSize)}, match ${state.cursor + 1} of ${state.matches.length}. Pick a winner.`;
    focusMatch();
  }
});

slots.addEventListener('click', event => {
  const button = event.target.closest('button[data-rank]');
  if (!button || button.disabled || !state || state.phase !== 'placing') return;
  const rank = Number(button.dataset.rank);
  const item = state.queue[state.cursor];
  state = placeItem(state, rank);
  announcement.textContent = `${item} locked at rank ${rank}.`;
  if (state.phase === 'complete') {
    cancelReveal();
    renderRound();
    announcement.textContent = `${item} locked at rank ${rank}. Your ${state.size}-item ranking is complete.`;
    byId('replay').focus({ preventScroll: true });
  } else {
    revealNext();
  }
});

byId('new-game').addEventListener('click', () => {
  if (state?.phase === 'complete') showSetup();
  else dialog.showModal();
});
byId('keep-playing').addEventListener('click', () => dialog.close());
byId('confirm-reset').addEventListener('click', () => {
  dialog.close();
  showSetup();
});
dialog.addEventListener('close', () => {
  if (state?.phase === 'placing') focusEmptySlot();
  if (state?.phase === 'choosing') focusMatch();
});
byId('replay').addEventListener('click', startRound);
byId('change-category').addEventListener('click', showSetup);
window.addEventListener('pagehide', cancelReveal);
window.addEventListener('pageshow', () => {
  if (state?.phase === 'revealing') revealNext();
});
