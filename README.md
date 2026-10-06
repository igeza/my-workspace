# My Workspace, starter

The My Workspace page from [emmalanghammer/my-workspace](https://github.com/emmalanghammer/my-workspace), with all five tiles (My Mentions, My Favorites, My Reports, Announcements, My Training) and the History / Notes overlay that Mentions opens.

Run it: `python3 dev-server.py 3000 .` then open http://localhost:3000, or see the live copy at https://igeza.github.io/my-workspace/

## What's here
- `index.html`: app bar, context bar, welcome text, the five tiles, and the hidden-tile links.
- `assets/workspace.css`: only the rules this page uses.
- `assets/history-notes.{js,css}`: the overlay each mention opens. Records are in `ENTITIES`; a mention points at one with `data-ws-entity`.
- `assets/*` foundation files were refreshed with the RMX skill's `check.mjs --fix` (RMX skill 4.5.2).

## My Mentions (from the Figma file "My Mentions Tile", section In Zeplin)
- Mentions is the third tile. Its crossed-eye hides it; Favorites and Reports then grow to half the row each and an "@ My Mentions" link joins Announcements and My Training at the bottom right.
- Open (n) and Dismissed tabs. Dismissed has a search field and a "6 of 27 Mentions" footer.
- The kebab on each mention: Quick Response (opens Add Response Note), Dismiss (open mentions) or Reopen (dismissed ones), and Details. Details opens the task's details over the workspace for a task mention, and Note Details for the others.
- The blue record name opens the record's page: the specific task on the Tasks screen, the tenant on Tenant Details. Prospects, owners and issues have no screen yet, so they open their History / Notes overlay.
- Clicking elsewhere on a mention also opens Add Response Note.
- At 1024px and below, a row of icon buttons picks which single tile shows (Figma "My Workspace - Mobile").
- The user is Charlie.

## Not in this starter
- The mega menu. The app bar button does nothing yet. `check.mjs --fix` added `megamenu.js/css` to `assets/` but `index.html` doesn't load them.
- Announcements and My Training start hidden, as in the original; the links at bottom right bring them back.
- The tile menu (kebab in the header) is inert; the design doesn't say what it contains.
