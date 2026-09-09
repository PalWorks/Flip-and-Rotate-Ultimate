# Store listing assets

Chrome Web Store listing artwork: screenshots and promotional tiles.

**These are deliberately outside `public/`.** Vite copies `public/` verbatim into `dist/`, so
anything left here would be packaged into the extension and downloaded by every user. Roughly
952 KB of artwork was shipping this way until EXT-11 moved it out.

Only files the extension actually loads belong in `public/`: `manifest.json` and `icons/`.
