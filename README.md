# Dalal Desk — Clarity-first Indian Stock Market Education & Tools

Static site: educational blog + browser-only tools for Nifty/Bank Nifty/stock learners.
Live at: https://jaissatish-web.github.io/INDEX/ (GitHub Pages, main branch, root)

## Structure
```
index.html                 Home
blog.html                  Blog listing
blog/3-check-method.html   First article (3-Check Method + interactive quiz)
tools.html                 Position size calc · Portfolio tracker · SIP/compounding calc
css/styles.css             Design system (white editorial: Fraunces + Manrope)
js/app.js                  All scripts (candle renderer, calculators, quiz, market status)
```

## Conventions
- No build step. Plain HTML/CSS/JS. Edit a file, commit, push — Pages redeploys.
- New blog post: copy `blog/3-check-method.html` as a template, add a card in `blog.html`,
  add a teaser block on `index.html`, link from nav.
- All charts are rendered from illustrative data in `js/app.js` (renderCandles) and every
  page carries the education-only disclaimer. Never present illustrative charts as live data.
- Portfolio data lives in localStorage only (`dalaldesk_portfolio_v1`).

## Content principles
Education over tips · risk first, returns second · user data stays in the browser.
