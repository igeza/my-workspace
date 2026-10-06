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
- Hover a mention for Quick Response and Dismiss (Reopen on dismissed ones) icons at its top right; the timestamp sits at the bottom. There is no kebab. Clicking the row opens Details: the task's details over the workspace for a task mention, Note Details for the others.
- The blue record name opens the record's page: the specific task on the Tasks screen, the tenant on Tenant Details, the prospect on Prospect Details (`screens/prospect.html`, from RMX Pages node 3784:54067; name, account and email follow the mention, everything else is the frame's sample data). Owners and issues have no screen yet, so they open their History / Notes overlay.
- Clicking a mention opens its Details over the workspace (same as the kebab's Details).
- At 1024px and below, a row of icon buttons picks which single tile shows (Figma "My Workspace - Mobile").
- The user is Charlie.

## Not in this starter
- The mega menu. The app bar button does nothing yet. `check.mjs --fix` added `megamenu.js/css` to `assets/` but `index.html` doesn't load them.
- Announcements and My Training start hidden, as in the original; the links at bottom right bring them back.
- The tile menu (kebab in the header) is inert; the design doesn't say what it contains.
