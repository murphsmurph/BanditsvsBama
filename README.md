# Alabama vs Bandits — PBP Spot Sheet

Broadcast prep and live-call tool for Alabama Women's Hockey. Open `index.html` — no build step, no server, works from `file://` and from GitHub Pages.

## What's inside

| Tab | Job |
|---|---|
| **Call Sheet** | Two Letter-portrait pages. Page 1: 21 players by sweater number, ID on the left, broadcast bullets on the right. Page 2: team sheet — program facts, staff, history, leadership, phonetics list, lines grid, goalies, roster breakdown, game-day verify, ruled space for notes and scoring. Print this. |
| **Learn the Roster** | Player grid, filters, full study panel, mastery bar. |
| **Flashcards** | Number → name drills. `Space` reveals, `←`/`→` moves. |
| **Quizzes** | Number → name, name → number. Photo ID unlocks once headshots exist. |
| **Broadcast Mode** | Dark, searchable roster for emergency lookup during the call. |

## Printing

1. Click **PRINT CALL SHEET**.
2. Letter, Portrait, margins Default, **Background graphics on**.
3. The badge in the top bar must read `PRINT FIT: PASS`. If it reads FAIL a page will spill — trim a note (page 1) or a section (page 2) before printing.

**TEXT − / +** sets your preferred size (saved). The fit engine starts from your size and steps down only as far as it needs to so every row fits. Default is 120%; the sheet stays clean up to ~140% with the current roster.

## Files

```
index.html            markup only — no player data in here
css/app.css           tokens, top bar, modal, shared chrome
css/call-sheet.css    the printed page (all sizes × --scale)
css/learn-roster.css  study views, quizzes, broadcast mode
js/roster-data.js     ← THE ONLY PLACE PLAYER FACTS LIVE
js/app.js             helpers, storage, view switching
js/call-sheet.js      builds the printed rows (page 1) and the team sheet (page 2)
js/print-fit.js       measures overflow, auto-shrinks, TEXT −/+
js/learn-roster.js    grid, filters, study panel, mastery
js/quiz.js            flashcards + quizzes
js/broadcast.js       broadcast mode
js/main.js            boot order
assets/players/alabama/   drop headshots here
```

## Editing players

Everything is in `js/roster-data.js`. Each player has `notes: [{text, category, priority}]`:

- `priority: 1` — always on the printed sheet
- `priority: 2` — printed if the row has room
- `priority: 3` — Learn the Roster only

Missing facts stay `null`. Never invent. Conflicts between sources go in `dataQuality: {note: "..."}` and surface as a warning in the study panel and on page 2 under Game-Day Verify.

Phonetics are two fields so each one is tied to the right name: `sayLast` (surname, printed in red under the surname) and `sayFirst` (first name, printed in red beside the first name). Both come from the team spreadsheet's Last Phonetic / First Phonetic columns.

## Lines

`TEAM.lines` in `js/roster-data.js` is `null` until the coaches send lines, so the page-2 grid prints blank to fill in at the rink. To fill it, use sweater numbers:

```js
lines:{ forwards:[[lw,c,rw],[lw,c,rw],[lw,c,rw],[lw,c,rw]],
        defense:[[ld,rd],[ld,rd],[ld,rd]],
        goalies:[starter, backup] }
```

## Adding headshots

Save as `assets/players/alabama/claire-carson.jpg`, then set `photo: "assets/players/alabama/claire-carson.jpg"` on that player. The photo quiz turns on by itself once any player has a photo.
