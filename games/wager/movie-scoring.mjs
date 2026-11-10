function validScore(score) {
  return typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 10 &&
    Number.isInteger(score * 10);
}

export function eligibleMovies(items, ratings) {
  return items.filter(name => validScore(ratings?.[name]?.score));
}

export function scoreMovieRosters(rosters, ratings) {
  if (!Array.isArray(rosters) || rosters.length !== 2 ||
      rosters.some(roster => !Array.isArray(roster) || roster.length !== 5)) {
    throw new TypeError('Movie scoring requires two complete rosters of five films.');
  }
  const names = rosters.flat();
  if (names.some(name => typeof name !== 'string' || !name.trim()) || new Set(names).size !== 10) {
    throw new TypeError('Movie scoring requires ten distinct film names.');
  }
  const sums = rosters.map(roster => roster.reduce((total, name) => {
    const score = ratings?.[name]?.score;
    if (!validScore(score)) throw new TypeError(`A verified rating is unavailable for ${name}.`);
    return total + Math.round(score * 10);
  }, 0));
  return { totals: sums.map(sum => sum / 10), averages: sums.map(sum => sum / 50),
    winner: sums[0] === sums[1] ? null : sums[0] > sums[1] ? 0 : 1 };
}
