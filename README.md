# My Workspace, starter

The My Workspace page from [emmalanghammer/my-workspace](https://github.com/emmalanghammer/my-workspace), with all five tiles (My Mentions, My Favorites, My Reports, Announcements, My Training) and the History / Notes overlay that Mentions opens.

Run it: `python3 dev-server.py 3000 .` then open http://localhost:3000

## What's here
- `index.html`: app bar, context bar, welcome text, the five tiles, and the hidden-tile links.
- `assets/workspace.css`: only the rules this page uses.
- `assets/history-notes.{js,css}`: the overlay each mention opens. Records are in `ENTITIES`; a mention points at one with `data-ws-entity`.
- `assets/*` foundation files were refreshed with the RMX skill's `check.mjs --fix` (RMX skill 4.5.2).

## My Mentions redesign
From the Figma file "My Mentions Tile" (section In Zeplin, node 2224:2888):
- Mentions is the third tile. Header has a crossed-eye (hides the tile; an "@ My Mentions" link in the bottom-right bar brings it back) and the tile menu.
- Search, Open (n) / Dismissed tabs, and a menu on each mention: Reopen (dismissed only), Remove From My Mentions, Open in New Tab.
- Clicking a mention opens **Add Response Note** (Add Note, Add & Dismiss, Cancel). Clicking the blue record name opens that record's History / Notes.
- The user is Charlie now (was Riley).

## Not in this starter
- Tasks and Tenants screens. The Favorites links to them are inert (`data-rmx-todo`). The task mention opens as an overlay; set `TASKS_URL` in `index.html` once a Tasks screen exists.
- The mega menu. The app bar button does nothing yet. `check.mjs --fix` added `megamenu.js/css` to `assets/` but `index.html` doesn't load them.
- Announcements and My Training start hidden, as in the original; the links at bottom right bring them back.
- "Open in New Tab" and the tile menu (kebab in the header) are inert; the design doesn't say what they open.
