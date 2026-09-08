# Alabama vs Bandits — PBP Spot Sheet

Broadcast prep and live-call tool for Alabama Women's Hockey. Open `index.html` — no build step, no server, works from `file://` and from GitHub Pages.

## What's inside

| Tab | Job |
|---|---|
| **Call Sheet** | One Letter-portrait page. 21 players by sweater number, ID on the left, broadcast bullets on the right. Print this. |
| **Learn the Roster** | Player grid, filters, full study panel, mastery bar. |
| **Flashcards** | Number → name drills. `Space` reveals, `←`/`→` moves. |
| **Quizzes** | Number → name, name → number. Photo ID unlocks once headshots exist. |
| **Broadcast Mode** | Dark, searchable roster for emergency lookup during the call. |

## Printing

1. Click **PRINT CALL SHEET**.
2. Letter, Portrait, margins Default, **Background graphics on**.
3. The badge in the top bar must read `PRINT FIT: PASS`. If it reads FAIL the page will spill to two — trim a note before printing.

**TEXT − / +** sets your preferred size (saved). The fit engine starts from your size and steps down only as far as it needs to so every row fits. Default is 120%; the sheet stays clean up to ~140% with the current roster.

## Files

```
index.html            markup only — no player data in here
css/app.css           tokens, top bar, modal, shared chrome
css/call-sheet.css    the printed page (all sizes × --scale)
css/learn-roster.css  study views, quizzes, broadcast mode
js/roster-data.js     ← THE ONLY PLACE PLAYER FACTS LIVE
js/app.js             helpers, storage, view switching
js/call-sheet.js      builds the printed rows
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

Missing facts stay `null`. Never invent. Conflicts between sources go in `dataQuality: {note: "..."}` and surface as a warning in the study panel.

## Adding headshots

Save as `assets/players/alabama/claire-carson.jpg`, then set `photo: "assets/players/alabama/claire-carson.jpg"` on that player. The photo quiz turns on by itself once any player has a photo.
