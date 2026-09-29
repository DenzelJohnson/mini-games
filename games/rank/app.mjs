import { CATEGORIES } from './categories.mjs';
import { createRound, settleReveal, placeItem } from './engine.mjs';

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
let revealInterval;
let revealTimeout;
let revealVersion = 0;

for (const entry of CATEGORIES) {
  const option = document.createElement('option');
  option.value = entry.id;
  option.textContent = entry.name;
  categorySelect.append(option);
}
byId('start').disabled = false;

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
    button.append(number, label);
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
  state = createRound(category.items, size);
  announcement.textContent = '';
  revealNext();
}

function showSetup() {
  cancelReveal();
  state = null;
  round.hidden = true;
  setup.hidden = false;
  slots.replaceChildren();
  announcement.textContent = '';
  categorySelect.focus();
}

byId('setup-form').addEventListener('submit', event => {
  event.preventDefault();
  category = CATEGORIES.find(entry => entry.id === categorySelect.value);
  size = Number(new FormData(event.currentTarget).get('size'));
  byId('setup-error').textContent = '';
  try {
    startRound();
  } catch (error) {
    byId('setup-error').textContent = error.message;
    showSetup();
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
});
byId('replay').addEventListener('click', startRound);
byId('change-category').addEventListener('click', showSetup);
window.addEventListener('pagehide', cancelReveal);
window.addEventListener('pageshow', () => {
  if (state?.phase === 'revealing') revealNext();
});
