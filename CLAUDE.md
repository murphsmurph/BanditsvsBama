# CLAUDE.md — rules for working in this repo

This is a play-by-play broadcaster's spot sheet for Alabama Women's Hockey. Utility first. Read `README.md` for the file map.

## Non-negotiables

1. **The call sheet prints on exactly one Letter portrait page, and the team sheet (page 2) on exactly one more.** After any change that touches `css/call-sheet.css`, `js/call-sheet.js`, `js/print-fit.js`, or the notes in `js/roster-data.js`, verify with the check below. Do not ship a change with `PRINT FIT: FAIL`.
2. **Never invent player data.** No made-up hometowns, heights, positions, previous teams, class years, pronunciations, or bio facts. Missing stays `null`. If two sources disagree, keep the official roster value and add a `dataQuality` entry: `{field, keep, alternate, alternateSource, note, print}`. `print:true` = game-call-important (position, hometown) and shows on page 2 GAME-DAY VERIFY; `print:false` = metadata (height) and shows only in Learn the Roster. Phonetics come only from the team spreadsheet's Last Phonetic / First Phonetic columns: `sayLast` is the surname, `sayFirst` the first name. Lines come only from the coaches; until then `TEAM.lines` stays `null` and the grid prints blank.
3. **No nicknames anywhere.** The broadcaster does not want them.
4. **No placeholder text for empty notes.** A player with no bio gets `notes: []` and a blank cell. Never write "no bio on file" or similar.
5. **`js/roster-data.js` is the only place player facts live.** Never hardcode a player into HTML or another JS file. That includes stats: `alabamaStats.seasons` holds Alabama season rows only (2024-25 AAU (W), 2025-26 ACDC (W)); career totals are derived by `getAlabamaSkaterTotals()` / `getAlabamaGoalieTotals()` in `js/app.js` and never typed in. Prior-club stats never enter Alabama totals. The page-1 stat bullet comes from `generatedStatNote()`; do not duplicate it in `notes[]`. Team W-L / GF / GA come from `seasonSummary()` over `TEAM.seasons` game rows; a season marked `complete:false` is never presented as a season record. No combined goalie SV% when any season lacks saves.
   Source precedence when values differ: team spreadsheet / official call sheet (number, position, class, hometown, height, phonetics) → site bios → the Elite Prospects snapshot (stats, DOB / shoots / catches / height only where the official sources have none, prior-team names, record book) → null. EP birthplace is never a hometown.
6. **Phonetics only for names that are not obvious.** `sayLast: null` / `sayFirst: null` for names that read as spelled (Scott, Henry, Bradley, Alex stay null even though the spreadsheet spells them out).
7. **CHS is the College Hockey South conference/postseason, not an opponent.** Spell opponents out in `TEAM.seasons` — never store "UT", which the broadcaster's notes use for both Tampa and Tennessee.
9. **Tonight's game is a fundraiser exhibition, not a counting game.** It lives in `TEAM.game`, never in `TEAM.seasons`, so a final score can never leak into season records, CHS history, head-to-head or aggregate numbers. No donation link, method or proceeds language was supplied; do not invent one.
8. **Keep it plain HTML/CSS/JS with `<script src>` tags.** No bundler, no ES modules, no framework. It must open from `file://`.

## Print-fit check (run after layout or notes changes)

```bash
python3 - <<'EOF'
from playwright.sync_api import sync_playwright
import os, re
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1000,"height":1200})
    pg.goto("file://"+os.path.abspath("index.html")); pg.wait_for_timeout(1000)
    print(pg.text_content("#fitBadge"))
    print("team sheet overflow px:", pg.evaluate("teamOverflow()"))
    pg.emulate_media(media="print")
    pg.pdf(path="/tmp/sheet.pdf", format="Letter", print_background=True,
           margin={k:"0.18in" for k in ("top","bottom","left","right")}, prefer_css_page_size=True)
    b.close()
print("pages:", len(re.findall(rb"/Type\s*/Page[^s]", open("/tmp/sheet.pdf","rb").read())))
EOF
```

Expected: `PRINT FIT: PASS · text 120%`, `team sheet overflow px: 0`, and `pages: 2` (page 1 call sheet, page 2 team sheet). If Chromium is not where Playwright expects it, pass `executable_path="/opt/pw-browsers/chromium"` to `launch()`.

## How sizing works

- Every font size on the sheet is `calc(Npx * var(--scale))`.
- Rows are `flex: 1`, so they divide the page evenly. The page cannot overflow; only a row's *content* can.
- `print-fit.js` measures the worst content overflow, then lowers `--scale` in 0.02 steps until it is zero. The user's preferred scale (TEXT −/+) is the starting point, stored in `localStorage` as `bamaTextScale`.
- Surnames additionally shrink per-element in `fitAllNames()` so a long name like CABECEIRAS never wraps.
- The team sheet (page 2) uses fixed sizes, not `--scale`. Its two ruled write-in blocks (`.ts-sec.fill`) are `flex: 1`, so they absorb leftover height and the page cannot overflow unless a fixed section outgrows the column; `teamOverflow()` catches that and the badge reads FAIL.

## Notes style

Short, broadcast shorthand. Lead with what a commentator would actually say on air: hockey achievement → leadership → family/hockey connection → academic/career → fun fact. One idea per bullet. Use `·` as the in-bullet separator. Do not repeat what the ID column already shows (position, class, hometown, previous team, shoots/catches).

Page-1 order is: generated Alabama stat line (priority 0, automatic) → priority 1 best hook → priority 2 if the row has room → priority 3 Learn the Roster only. A returning player usually shows the stat line plus one hook; a freshman with no Alabama games shows hockey background plus the strongest human/academic hook. Goalies show "Catches" in the quick ID, never "Shoots".
