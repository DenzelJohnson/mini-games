# Mini Games

A minimal homepage with eight external games and the built-in Rank and Charades games. All ten games appear in a single vertical list on desktop and mobile.

Live site: [Mini Games](https://denzeljohnson.github.io/mini-games/).

## Charades

[Play Charades](https://denzeljohnson.github.io/mini-games/games/charades/). One actor looks at the screen and silently acts while friends guess. Choose a mixed bag or one of eight categories and a60-,90-, or120-second round. Reveal starts the clock; Correct earns a point, Skip moves on. Pause hides the prompt and saves the remaining time. Leaving the tab also pauses; resume when ready. Review correct/skipped prompts after timeout, deck exhaustion or End round, then replay or pass the device.

All300 prompts are hardcoded in `games/charades/prompts.mjs`: Animals40, Everyday actions40, Objects40, Jobs40, Sports35, Movies & TV35, Characters35 and Tricky scenarios35. No repeats within a round. No sensors, accounts, network-generated prompts or saved scores. Reload resets the game. Keep prompt categories, engine/controller/UI tests and the exact publication boundary coordinated.

## Rank

[Play Rank](https://denzeljohnson.github.io/mini-games/games/rank/) in your browser. Blind Ranking lets you choose a category and 5 or 10 items, then place each surprise item into an empty rank. Rank 1 is your favorite; placements are final. Items never repeat within a round. The reveal rapidly cycles through category items before settling, with an immediate reveal for reduced-motion preferences.

Bracket Ranking lets you choose a Round of 16, 32, or 64. Items are randomly assigned seeds; the first round pairs 1 vs last, 2 vs second-last, and so on. Choose each matchup's winner. Winners of adjacent matches meet in the next round, with no reseeding, until you choose a champion. Original seeds and match history are available below the matchup.

From the Rank setup, [play Wager for a Roster](https://denzeljohnson.github.io/mini-games/games/rank/wager/) with two people on one device. Pick a category; each player starts with $20 and auctions ten randomly drawn, non-repeating entries. Player 1 opens the first auction, Player 2 the next, and the scheduled opener alternates thereafter. The opener bids at least $1; the other player raises by at least $1 or concedes. Cash is spent only when an entry is awarded. Bids reserve $1 for each roster slot the bidder would still need to fill. Once someone has five entries, the other player claims remaining entries for $1 each. The game ends with two five-entry rosters; there is no automatic winner.

All three Rank games share eight categories. Superheroes has154 unique DC and Marvel heroes and villains, including all requested X-Men, Justice League, Avengers, Batman, Spider-Man and Fantastic Four groups; the duplicate Green Lantern appears once. Its group counts and names live in `games/rank/superheroes.mjs`. Anime is a separate64-title pool of series and films (including23 screenshot picks); Anime Characters is unchanged. Edit `games/rank/anime-titles.mjs` to update the capped title pool. NBA Players, Foods, Music Artists, and Video Games each have100 distinct entries. Anime Characters has151 entries: the supplied characters plus missing named Akatsuki and on-screen Kage, with Obito/Tobi combined into one identity. User lists can exceed100; entries are not truncated. Movies has108 user-supplied titles, with separate sequels/remakes kept distinct. Edit `games/rank/categories.mjs` and `additional-categories.mjs` to update pools. Games stay in memory and reset on reload; choices cannot be undone. After updating modules or styles, increment their import/script/link query versions to refresh returning visitors' caches.

All877 entries across the eight Rank categories include entry-specific pictures in settled reveals, locked rankings, bracket matchups, seeds, history, champion results and Wager's current/acquired entries. Expand **Image sources** for the source pages of visible/revealed entries. Artwork belongs to its respective rights holders and is loaded from the credited community wikis, AniList, Wikimedia and official sports/game image hosts; no claim of ownership or blanket free license is made. Images supplement the names: if a host is unavailable, gameplay still works. Blind reels animate names without rapidly fetching images or exposing future draws. Free-license photographs retain creator and clickable license attribution; copyrighted artwork is not represented as freely licensed. Curated URLs/credits live in the eight `games/rank/*-images.mjs` modules; `portraits.mjs` supplies the shared display helper. Keep exact category names, source metadata and publication allowlist in sync.

Run engine and publisher regression tests with Node 24 or later:

```sh
node --test tests/*.test.mjs
```

## Preview locally

No installation or build is needed. From the repository root, check that port 8000 is free:

```sh
lsof -nP -iTCP:8000 -sTCP:LISTEN
```

If no listener is reported, start the server:

```sh
python3.11 -m http.server 8000 --bind 127.0.0.1
```

Open [the local homepage](http://127.0.0.1:8000/). If port 8000 is occupied, choose another free port and use it in both the command and URL. Stop the server with Ctrl+C.

## Add a game

Add an anchor with the `game-card` class to the navigation in `index.html`. Include its source, title, description, and play label. External games use an HTTPS URL, `target="_blank"`, `rel="noopener noreferrer"`, and an accessible new-tab hint.

When changing CSS, increment the stylesheet's `v` query parameter in `index.html` so returning visitors load the updated layout.

For a built-in game, place its static page under `games/<game>/index.html` and use a relative link. Local game links can stay in the same tab. Update the publication allowlist to include the new game's files.

## Publishing

GitHub Pages serves the `main` branch of the public `mini-games` repository. The source and project memory are maintained separately in a private repository. The site uses relative asset paths and needs no backend or build step.

From the private working source, commit and review your changes, then publish the committed static files:

```sh
bash scripts/publish-pages.sh
```

The script requires the GitHub CLI authenticated as the repository owner. Its explicit `site_files` allowlist exports five root assets, twenty-two Rank files (including four under `games/rank/wager/`), and six Charades files —33 files total. AI instructions, tests, project memory, and audit history are excluded. It stops if the public repository already tracks files outside that allowlist, leaving them untouched. Check the Pages deployment and live site after each publication.
