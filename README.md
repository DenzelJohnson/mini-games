# Mini Games

A minimal homepage with five expandable folders in one column: Multiplayer (Charades, Guess 10 words with 15 Clues, Wager for a Roster, Wallz), Rank (Blind Ranking, Bracket Ranking), Card Games (Wizard, Euchre), Game Shows (Family Feud), and Word Games (Wordle, Crossword, Connections, Krillion). Its thirteen direct links retain all eight external destinations and four built-in games. External links open in a new tab; built-in games open here.

Live site: [Mini Games](https://denzeljohnson.github.io/mini-games/).

## Charades

[Play Charades](https://denzeljohnson.github.io/mini-games/games/charades/). In classic mode, one actor looks at the screen and silently acts while friends guess. Switch on Reverse Charades to describe to a partner how to act out the action while everyone else guesses. The same prompts, timer, Correct/Skip scoring and pause rules apply. Choose a mixed bag or one of eight categories and a60-,90-, or120-second round. Reveal starts the clock. Pause hides the prompt and saves the remaining time. Leaving the tab also pauses; resume when ready. Review correct/skipped prompts after timeout, deck exhaustion or End round, then replay or pass the device.

All300 prompts are hardcoded in `games/charades/prompts.mjs`: Animals40, Everyday actions40, Objects40, Jobs40, Sports35, Movies & TV35, Characters35 and Tricky scenarios35. No repeats within a round. No sensors, accounts, network-generated prompts or saved scores. Reload resets the game. Keep prompt categories, engine/controller/UI tests and the exact publication boundary coordinated.

## Guess 10 words with 15 Clues

[Play Guess 10 words with 15 Clues](https://denzeljohnson.github.io/mini-games/games/clues/) with a partner. Player 1 explains while Player 2 guesses in the first round; they switch roles each replay. Only the explainer looks at the screen. Say a one-word clue aloud, tap **Use a clue** to count it, and repeat until the guesser gets the word. Tap **Guessed it** to move on. At least one clue must be counted for each word. Guess all ten words using no more than fifteen clues total. You can use **Skip word · free** twice per round. Each skip discards that word and reveals a unique replacement; it does not count as a guess or add a clue, but any clues already given for the skipped word remain spent. The fifteenth clue can still lead to a correct guess; if any words remain afterward, the round ends.

The 2,000 unique prompt things are hardcoded in `games/clues/things.mjs`; each round randomly reserves twelve without repeats, enough for ten guesses and two replacements. The app does not listen to speech or store scores. **End round** stops early; **Switch roles & play again** creates a fresh round. Presented answers appear only in results.

## Rank

[Play Rank](https://denzeljohnson.github.io/mini-games/games/rank/) in your browser. The homepage's Blind Ranking and Bracket Ranking links open the same Rank setup with that mode selected; you still choose a category and start the game yourself. An absent or unknown `mode` query defaults to Blind. Blind Ranking lets you choose a category and 5 or 10 items, then place each surprise item into an empty rank. Rank 1 is your favorite; placements are final. Items never repeat within a round. The reveal rapidly cycles through category items before settling, with an immediate reveal for reduced-motion preferences.

Bracket Ranking lets you choose a Round of 16, 32, or 64, limited to sizes supported by the selected category. Items are randomly assigned seeds; the first round pairs 1 vs last, 2 vs second-last, and so on. Choose each matchup's winner. Winners of adjacent matches meet in the next round, with no reseeding, until you choose a champion. Original seeds and match history are available below the matchup.

Ontario Universities contains all23 publicly assisted universities in Ontario's current official directory, with credited university logos. It supports Blind5/10, Bracket16 and Wager;32/64 brackets are disabled for this smaller pool. Federal Royal Military College is not included. Edit `games/rank/ontario-universities.mjs` for names/logo metadata.

Rank's two modes and the standalone Wager game share nine categories. Superheroes has154 unique DC and Marvel heroes and villains, including all requested X-Men, Justice League, Avengers, Batman, Spider-Man and Fantastic Four groups; the duplicate Green Lantern appears once. Its group counts and names live in `games/rank/superheroes.mjs`. Anime is a separate64-title pool of series and films (including23 screenshot picks); Anime Characters is unchanged. Edit `games/rank/anime-titles.mjs` to update the capped title pool. NBA Players, Foods, Music Artists, and Video Games each have100 distinct entries. Anime Characters has151 entries: the supplied characters plus missing named Akatsuki and on-screen Kage, with Obito/Tobi combined into one identity. User lists can exceed100; entries are not truncated. Movies has108 user-supplied titles, with separate sequels/remakes kept distinct. Edit `games/rank/categories.mjs` and `additional-categories.mjs` to update pools. Games stay in memory and reset on reload; choices cannot be undone. After updating modules or styles, increment their import/script/link query versions to refresh returning visitors' caches.

All900 entries across the nine Rank categories include entry-specific pictures in settled reveals, locked rankings, bracket matchups, seeds, history, champion results and Wager's current/acquired entries. Expand **Image sources** for the source pages of visible/revealed entries. Artwork belongs to its respective rights holders and is loaded from the credited community wikis, AniList, Wikimedia and official sports/game image hosts; no claim of ownership or blanket free license is made. Images supplement the names: if a host is unavailable, gameplay still works. Blind reels animate names without rapidly fetching images or exposing future draws. Free-license photographs retain creator and clickable license attribution; copyrighted artwork is not represented as freely licensed. Curated URLs/credits live in the eight `games/rank/*-images.mjs` modules; `portraits.mjs` supplies the shared display helper. Keep exact category names, source metadata and publication allowlist in sync.

## Wager for a Roster

[Play Wager for a Roster](https://denzeljohnson.github.io/mini-games/games/wager/) with two people on one device, directly from the homepage. Pick any of the nine shared categories; each player starts with $20 and auctions ten randomly drawn, non-repeating entries. Player 1 opens the first auction, Player 2 the next, and the scheduled opener alternates thereafter. The opener bids at least $1; the other player raises by at least $1 or concedes. Cash is spent only when an entry is awarded. Bids reserve $1 for each roster slot the bidder would still need to fill. Once someone has five entries, the other player claims remaining entries for $1 each. The game ends with two five-entry rosters; there is no automatic winner. The old `/games/rank/wager/` URL redirects here for existing bookmarks.

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

Add an anchor with the `game-link` class under the matching `game-folder` in `index.html`, then update the folder count. Include a visible `game-name` and arrow. External games use an HTTPS URL, `target="_blank"`, `rel="noopener noreferrer"`, and an accessible new-tab hint. Keep the five folder summaries and link order aligned with the homepage tests.

When changing shared CSS, increment the stylesheet's `v` query parameter in `index.html` and the four built-in pages so returning visitors load the updated layout.

For a built-in game, place its static page under `games/<game>/index.html` and use a relative link. Local game links can stay in the same tab. Update the publication allowlist to include the new game's files.

## Publishing

GitHub Pages serves the `main` branch of the public `mini-games` repository. The source and project memory are maintained separately in a private repository. The site uses relative asset paths and needs no backend or build step.

From the private working source, commit and review your changes, then publish the committed static files:

```sh
bash scripts/publish-pages.sh
```

The script requires the GitHub CLI authenticated as the repository owner. Its explicit `site_files` allowlist exports five root assets, twenty Rank files (including the old-route redirect), four standalone Wager files, six Charades files, and five clue-game files —40 files total. AI instructions, tests, project memory, and audit history are excluded. It retires only the three named old Wager assets and refuses any other unexpected tracked public file. Check the Pages deployment and live site after each publication.
