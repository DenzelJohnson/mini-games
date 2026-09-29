import { ANIME_IMAGES } from './anime-images.mjs?v=1';
import { ANIME_TITLE_IMAGES } from './anime-title-images.mjs?v=1';
import { FOOD_IMAGES } from './food-images.mjs?v=1';
import { NBA_IMAGES } from './nba-images.mjs?v=1';
import { MUSIC_IMAGES } from './music-images.mjs?v=1';
import { VIDEO_GAME_IMAGES } from './video-game-images.mjs?v=1';
import { MOVIE_IMAGES } from './movie-images.mjs?v=1';

export const IMAGE_CATEGORIES = { anime: ANIME_IMAGES, 'anime-titles': ANIME_TITLE_IMAGES, foods: FOOD_IMAGES, nba: NBA_IMAGES, music: MUSIC_IMAGES, 'video-games': VIDEO_GAME_IMAGES, movies: MOVIE_IMAGES };

export function getEntryImage(categoryId, name) {
  if (!Object.hasOwn(IMAGE_CATEGORIES, categoryId)) return null;
  const images = IMAGE_CATEGORIES[categoryId];
  return Object.hasOwn(images, name) ? images[name] : null;
}

// Images supplement the visible name; network availability never controls game state.
export function createPortrait(document, categoryId, name, variant = 'thumb') {
  const image = getEntryImage(categoryId, name);
  if (!image) return null;
  const portrait = document.createElement('img');
  portrait.className = `entry-portrait portrait-${variant}`;
  portrait.alt = '';
  portrait.width = 320;
  portrait.height = 320;
  portrait.decoding = 'async';
  portrait.loading = variant === 'hero' ? 'eager' : 'lazy';
  portrait.referrerPolicy = 'no-referrer';
  portrait.addEventListener('error', () => { portrait.hidden = true; });
  portrait.src = image.src;
  return portrait;
}
