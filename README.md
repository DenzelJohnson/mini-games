# Mini Games

A minimal homepage linking to Wordle, NYT Crossword, Connections, Wizard, Euchre, Wallz, Family Feud, and Krillion. Games appear in a single vertical list on desktop and mobile.

Live site: [Mini Games](https://denzeljohnson.github.io/mini-games/).

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

The script requires the GitHub CLI authenticated as the repository owner. It exports only `index.html`, `styles.css`, `favicon.svg`, `.nojekyll`, and this README. AI instructions, project memory, and audit history are excluded. It stops if the public repository already tracks files outside that allowlist, leaving them untouched. Check the Pages deployment and live site after each publication.
