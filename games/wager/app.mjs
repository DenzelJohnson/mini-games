import { CATEGORIES } from '../rank/categories.mjs?v=9';
import { createPortrait, getEntryImage } from '../rank/portraits.mjs?v=8';
import { MOVIE_RATINGS, MOVIE_RATING_SOURCE, MOVIE_RATINGS_SNAPSHOT } from '../rank/movie-ratings.mjs?v=1';
import { eligibleMovies, scoreMovieRosters } from './movie-scoring.mjs?v=1';
import { createWager, maxBid, placeBid, concede, claimSolo, nextItem, ROSTER_SIZE } from './engine.mjs?v=1';

const byId = id => document.getElementById(id);
const categorySelect = byId('category');
const setup = byId('setup');
const game = byId('game');
const dialog = byId('reset-dialog');
let category = null;
let state = null;

for (const entry of CATEGORIES) {
  if (entry.pending || entry.items.length < ROSTER_SIZE * 2) continue;
  const option = document.createElement('option');
  option.value = entry.id;
  option.textContent = entry.name;
  categorySelect.append(option);
}
byId('start').disabled = categorySelect.options.length === 0;

function playerLabel(player) { return `Player ${player + 1}`; }

function updateMovieHint() {
  const selected = CATEGORIES.find(entry => entry.id === categorySelect.value);
  const hint = byId('movie-scoring-hint');
  hint.hidden = selected?.id !== 'movies';
  hint.textContent = hint.hidden ? '' : `Higher total rating across five films wins. ${eligibleMovies(selected.items, MOVIE_RATINGS).length} of ${selected.items.length} films have saved scores available for this draft. ${MOVIE_RATING_SOURCE}, snapshot saved ${MOVIE_RATINGS_SNAPSHOT}; these are not live ratings. Films without a saved score are omitted. Scores appear only after both rosters fill. Unspent cash does not affect the result.`;
}

function clearMovieResult() {
  byId('movie-result').hidden = true;
  for (const id of ['movie-result-title', 'movie-result-totals', 'movie-result-method']) byId(id).textContent = '';
  byId('movie-sources').replaceChildren();
  byId('movie-source-details').hidden = true;
  byId('movie-source-details').open = false;
}

function sourceURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}

function renderMovieResult() {
  clearMovieResult();
  if (category.id !== 'movies' || state.phase !== 'complete') return false;
  byId('movie-result').hidden = false;
  try {
    const result = scoreMovieRosters(state.rosters, MOVIE_RATINGS);
    for (const name of state.rosters.flat()) {
      if (!sourceURL(MOVIE_RATINGS[name]?.source)) throw new Error(`Rating source is unavailable for ${name}.`);
    }
    byId('movie-result-title').textContent = result.winner === null ? 'It’s a draw' : `${playerLabel(result.winner)} wins`;
    byId('movie-result-totals').textContent = result.totals.map((total, player) =>
      `${playerLabel(player)}: ${total.toFixed(1)}/50 total · ${result.averages[player].toFixed(2)}/10 average`).join(' · ');
    byId('movie-result-method').textContent = `${MOVIE_RATING_SOURCE}. Snapshot saved ${MOVIE_RATINGS_SNAPSHOT}, not live ratings. The higher sum of five ratings wins; unspent cash does not count.`;
    for (const name of state.rosters.flat()) {
      const record = MOVIE_RATINGS[name];
      const row = document.createElement('li');
      const source = document.createElement('a');
      source.href = sourceURL(record.source);
      source.target = '_blank'; source.rel = 'noopener noreferrer';
      source.textContent = `${name} · ${record.score.toFixed(1)}/10 · Saved source ↗`;
      row.append(source);
      if (record.ratingAsOf) {
        const asOf = document.createElement('span');
        asOf.textContent = ` · Rating dated ${record.ratingAsOf}`;
        row.append(asOf);
      }
      const ratingURL = sourceURL(record.ratingUrl);
      if (ratingURL) {
        const ratingLink = document.createElement('a');
        ratingLink.href = ratingURL; ratingLink.target = '_blank'; ratingLink.rel = 'noopener noreferrer';
        ratingLink.textContent = ' · Rating page ↗'; row.append(ratingLink);
      }
      byId('movie-sources').append(row);
    }
    byId('movie-source-details').hidden = false;
    return true;
  } catch (error) {
    byId('movie-result-title').textContent = 'Unscored result';
    byId('movie-result-method').textContent = `A winner could not be calculated. ${error.message}`;
    return false;
  }
}

function appendPortrait(parent, name, variant = 'thumb') {
  const portrait = createPortrait(document, category.id, name, variant);
  if (portrait) parent.append(portrait);
}

function renderRoster(player, showMovieScores) {
  const list = byId(`roster-${player + 1}`);
  const rosterKey = JSON.stringify([category.id, state.rosters[player], showMovieScores]);
  if (list.dataset.rosterKey === rosterKey) return;
  list.dataset.rosterKey = rosterKey;
  list.replaceChildren();
  for (let index = 0; index < ROSTER_SIZE; index++) {
    const item = state.rosters[player][index];
    const row = document.createElement('li');
    if (item) {
      appendPortrait(row, item);
      const name = document.createElement('span');
      const price = state.history.find(record => record.winner === player && record.item === item)?.price;
      name.textContent = `${item} · $${price}`;
      row.append(name);
      if (showMovieScores) {
        const rating = document.createElement('small');
        rating.className = 'movie-rating';
        rating.textContent = `${MOVIE_RATINGS[item].score.toFixed(1)}/10`;
        row.append(rating);
      }
    } else {
      row.className = 'empty';
      row.textContent = `Open spot ${index + 1}`;
    }
    list.append(row);
  }
}

function renderCredits() {
  const credits = byId('image-credits');
  credits.replaceChildren();
  const names = new Set([...state.rosters.flat(), state.queue[state.index]]);
  for (const name of names) {
    const image = getEntryImage(category.id, name);
    if (!image) continue;
    const row = document.createElement('li');
    const link = document.createElement('a');
    link.href = image.source;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.item = name;
    link.textContent = `${name} — ${image.credit} ↗`;
    row.append(link);
    if (image.license) {
      const license = document.createElement('a');
      license.href = image.license;
      license.target = '_blank';
      license.rel = 'noopener noreferrer';
      license.textContent = ' · License ↗';
      row.append(license);
    }
    credits.append(row);
  }
  byId('image-details').hidden = credits.children.length === 0;
}

function render() {
  setup.hidden = true;
  game.hidden = false;
  byId('game-error').textContent = '';
  byId('round-label').textContent = `${category.name} · Entry ${state.index + 1} of ${state.queue.length}`;
  byId('starter-label').textContent = `Scheduled opener: ${playerLabel(state.starter)}`;
  const item = state.queue[state.index];
  byId('item-name').textContent = item;
  const portraitFrame = byId('item-portrait');
  const entryKey = JSON.stringify([category.id, item]);
  if (portraitFrame.dataset.entryKey !== entryKey) {
    portraitFrame.dataset.entryKey = entryKey;
    portraitFrame.replaceChildren();
    appendPortrait(portraitFrame, item, 'hero');
  }
  portraitFrame.hidden = portraitFrame.children.length === 0;
  const showMovieScores = renderMovieResult();

  for (const player of [0, 1]) {
    byId(`cash-${player + 1}`).textContent = `$${state.balances[player]}`;
    byId(`count-${player + 1}`).textContent = `${state.rosters[player].length} of ${ROSTER_SIZE} entries`;
    byId(`balance-panel-${player + 1}`).classList.toggle('is-turn',
      ['bidding', 'solo'].includes(state.phase) && state.turn === player);
    renderRoster(player, showMovieScores);
  }

  const bidding = state.phase === 'bidding';
  const solo = state.phase === 'solo';
  const awarded = state.phase === 'awarded' || state.phase === 'complete';
  byId('bid-form').hidden = !bidding;
  byId('pass').hidden = !bidding || state.leader === null;
  byId('claim').hidden = !solo;
  byId('award').hidden = !awarded;
  byId('next-item').hidden = state.phase === 'complete';
  byId('result-actions').hidden = state.phase !== 'complete';

  if (bidding) {
    const minimum = state.highBid + 1;
    const maximum = maxBid(state, state.turn);
    byId('game-title').textContent = 'Make your bid';
    byId('turn-label').textContent = `${playerLabel(state.turn)} to bid`;
    byId('high-bid').textContent = state.leader === null ? 'No bids yet.' : `High bid: $${state.highBid} by ${playerLabel(state.leader)}.`;
    byId('bid-label').textContent = `${playerLabel(state.turn)} bid`;
    byId('bid').min = String(minimum);
    byId('bid').max = String(maximum);
    byId('bid').value = String(minimum);
    byId('bid-range').textContent = `Bid $${minimum}–$${maximum}. Keep $1 for each future open spot.`;
    if (state.leader !== null) byId('pass').textContent = `Pass · ${playerLabel(state.leader)} takes it for $${state.highBid}`;
  } else if (solo) {
    byId('game-title').textContent = 'One roster still needs entries';
    byId('turn-label').textContent = `${playerLabel(state.turn)} is the only player with room.`;
    byId('high-bid').textContent = 'Unopposed entry · $1';
    byId('claim').textContent = `${playerLabel(state.turn)} takes it for $1`;
  } else {
    const sale = state.history.at(-1);
    byId('game-title').textContent = state.phase === 'complete' ? 'Both rosters are complete' : 'Entry awarded';
    byId('turn-label').textContent = '';
    byId('high-bid').textContent = '';
    byId('award-text').textContent = `${playerLabel(sale.winner)} added ${sale.item} for $${sale.price}.`;
  }
  renderCredits();
}

function focusAction() {
  if (dialog.open) return;
  if (state.phase === 'complete' && category.id === 'movies') {
    byId('movie-result-title').focus();
    return;
  }
  const id = { bidding: 'bid', solo: 'claim', awarded: 'next-item', complete: 'replay' }[state.phase];
  byId(id)?.focus({ preventScroll: true });
}

function announce(message) { byId('announcement').textContent = message; }

function applyAction(action) {
  try {
    state = action(state);
    render();
    if (state.phase === 'awarded' || state.phase === 'complete') {
      const sale = state.history.at(-1);
      const completion = state.phase === 'complete' ? ` Both rosters are complete.${category.id === 'movies' ? ` ${byId('movie-result-title').textContent}.` : ''}` : '';
      announce(`${playerLabel(sale.winner)} gets ${sale.item} for $${sale.price}.${completion}`);
    } else announce(`${playerLabel(state.turn)} to act on ${state.queue[state.index]}.`);
    focusAction();
  } catch (error) {
    byId('game-error').textContent = error.message;
  }
}

function startMatch() {
  try {
    const items = category.id === 'movies' ? eligibleMovies(category.items, MOVIE_RATINGS) : category.items;
    state = createWager(items);
    render();
    announce(`${category.name}. Entry 1 of 10. Player 1 opens the bidding.`);
    focusAction();
  } catch (error) {
    showSetup();
    byId('setup-error').textContent = error.message;
  }
}

function showSetup() {
  state = null;
  game.hidden = true;
  setup.hidden = false;
  byId('image-credits').replaceChildren();
  byId('image-details').hidden = true;
  clearMovieResult();
  for (const player of [1, 2]) {
    byId(`roster-${player}`).replaceChildren();
    delete byId(`roster-${player}`).dataset.rosterKey;
  }
  updateMovieHint();
  announce('Choose a category to start a new game.');
  categorySelect.focus();
}

byId('setup-form').addEventListener('submit', event => {
  event.preventDefault();
  byId('setup-error').textContent = '';
  category = CATEGORIES.find(entry => entry.id === categorySelect.value && !entry.pending);
  if (!category) {
    byId('setup-error').textContent = 'Choose an available category.';
    return;
  }
  startMatch();
});
categorySelect.addEventListener('change', updateMovieHint);
updateMovieHint();
byId('bid-form').addEventListener('submit', event => {
  event.preventDefault();
  applyAction(current => placeBid(current, Number(byId('bid').value)));
});
byId('pass').addEventListener('click', () => applyAction(concede));
byId('claim').addEventListener('click', () => applyAction(claimSolo));
byId('next-item').addEventListener('click', () => applyAction(nextItem));
byId('replay').addEventListener('click', startMatch);
byId('change-category').addEventListener('click', showSetup);
byId('new-game').addEventListener('click', () => state?.phase === 'complete' ? showSetup() : dialog.showModal());
byId('keep-playing').addEventListener('click', () => dialog.close());
byId('confirm-reset').addEventListener('click', () => { dialog.close(); showSetup(); });
dialog.addEventListener('close', () => { if (state) focusAction(); });
