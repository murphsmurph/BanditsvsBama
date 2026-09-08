# CLAUDE.md — rules for working in this repo

This is a play-by-play broadcaster's spot sheet for Alabama Women's Hockey. Utility first. Read `README.md` for the file map.

## Non-negotiables

1. **The call sheet prints on exactly one Letter portrait page, and the team sheet (page 2) on exactly one more.** After any change that touches `css/call-sheet.css`, `js/call-sheet.js`, `js/print-fit.js`, or the notes in `js/roster-data.js`, verify with the check below. Do not ship a change with `PRINT FIT: FAIL`.
2. **Never invent player data.** No made-up hometowns, heights, positions, previous teams, class years, pronunciations, or bio facts. Missing stays `null`. If two sources disagree, keep the official roster value and add `dataQuality: {note: "..."}`. Phonetics come only from the team spreadsheet's Last Phonetic / First Phonetic columns: `sayLast` is the surname, `sayFirst` the first name. Lines come only from the coaches; until then `TEAM.lines` stays `null` and the grid prints blank.
3. **No nicknames anywhere.** The broadcaster does not want them.
4. **No placeholder text for empty notes.** A player with no bio gets `notes: []` and a blank cell. Never write "no bio on file" or similar.
5. **`js/roster-data.js` is the only place player facts live.** Never hardcode a player into HTML or another JS file.
6. **Phonetics only for names that are not obvious.** `sayLast: null` / `sayFirst: null` for names that read as spelled (Scott, Henry, Bradley, Alex stay null even though the spreadsheet spells them out).
7. **CHS is the College Hockey South conference/postseason, not an opponent.**
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

Short, broadcast shorthand. Lead with what a commentator would actually say on air: hockey achievement → leadership → family/hockey connection → academic/career → fun fact. One idea per bullet. Use `·` as the in-bullet separator. Do not repeat what the ID column already shows (position, class, hometown).
