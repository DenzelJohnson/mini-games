# Mini Games

A minimal homepage with eight external games and the built-in Rank game. Games appear in a single vertical list on desktop and mobile.

Live site: [Mini Games](https://denzeljohnson.github.io/mini-games/).

## Rank

[Play Rank](https://denzeljohnson.github.io/mini-games/games/rank/) in your browser. Blind Ranking lets you choose a category and 5 or 10 items, then place each surprise item into an empty rank. Rank 1 is your favorite; placements are final. Items never repeat within a round. The reveal rapidly cycles through category items before settling, with an immediate reveal for reduced-motion preferences.

Bracket Ranking lets you choose a Round of 16, 32, or 64. Items are randomly assigned seeds; the first round pairs 1 vs last, 2 vs second-last, and so on. Choose each matchup's winner. Winners of adjacent matches meet in the next round, with no reseeding, until you choose a champion. Original seeds and match history are available below the matchup.

Both modes share six categories. NBA Players, Foods, Music Artists, and Video Games each have 100 distinct entries. Anime Characters and Movies are reserved for the user's lists and are not playable yet. Edit `games/rank/categories.mjs` and `additional-categories.mjs` to update pools. Games stay in memory and reset on reload; choices cannot be undone. After updating modules or styles, increment their import/script/link query versions to refresh returning visitors' caches.

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

The script requires the GitHub CLI authenticated as the repository owner. Its explicit `site_files` allowlist exports the five root site files plus Rank's `index.html`, `rank.css`, `app.mjs`, `categories.mjs`, `additional-categories.mjs`, `engine.mjs`, and `bracket.mjs`. AI instructions, tests, project memory, and audit history are excluded. It stops if the public repository already tracks files outside that allowlist, leaving them untouched. Check the Pages deployment and live site after each publication.
