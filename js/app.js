/* ============================================================
   Dalal Desk — site scripts
   Shared: nav, reveal-on-scroll, market status, candle renderer.
   Page-specific: tools calculators, portfolio, quiz (gated by DOM).
   ============================================================ */

/* ---------- nav ---------- */
const menuBtn = document.querySelector('.menu-btn');
if (menuBtn) {
  const nav = document.querySelector('.nav');
  menuBtn.setAttribute('aria-controls', 'site-nav');
  nav.id = 'site-nav';
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== menuBtn) setMenu(false);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
}

/* back-to-top button */
const toTop = document.createElement('button');
toTop.id = 'to-top';
toTop.setAttribute('aria-label', 'Back to top');
toTop.textContent = '↑';
document.body.appendChild(toTop);
const ttSync = () => toTop.classList.toggle('show', window.scrollY > 700);
window.addEventListener('scroll', ttSync, { passive: true });
ttSync();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- reveal on scroll ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ---------- market status (real IST clock) ---------- */
function istNow() {
  const fmt = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  });
  const parts = fmt.formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { weekday: get('weekday'), hour: +get('hour'), minute: +get('minute') };
}
function updateMarketStatus() {
  document.querySelectorAll('[data-market-status]').forEach(el => {
    const { weekday, hour, minute } = istNow();
    const mins = hour * 60 + minute;
    const weekend = weekday === 'Sat' || weekday === 'Sun';
    const open = !weekend && mins >= 555 && mins < 930; // 9:15–15:30 IST
    if (open) {
      el.className = 'chip live';
      el.innerHTML = '<span class="dot"></span> Market Open · NSE &amp; BSE · till 3:30 PM IST';
    } else if (weekend) {
      el.className = 'chip closed';
      el.innerHTML = '<span class="dot"></span> Market Closed · weekend';
    } else {
      const nextOpen = mins < 555 ? 'opens 9:15 AM IST'
        : weekday === 'Fri' ? 'opens Monday 9:15 AM IST'
        : 'opens tomorrow 9:15 AM IST';
      el.className = 'chip closed';
      el.innerHTML = `<span class="dot"></span> Market Closed · ${nextOpen}`;
    }
  });
}
updateMarketStatus();
setInterval(updateMarketStatus, 30000);

/* ---------- candle renderer ----------
   data: array of {o,h,l,c}; draws into `el` (an svg container div). */
function renderCandles(el, data, opts = {}) {
  if (!el) return;
  const W = opts.width || 420, H = opts.height || 240, PAD = 14;
  const showLine = opts.line !== false;
  const hi = Math.max(...data.map(d => d.h));
  const lo = Math.min(...data.map(d => d.l));
  const y = v => PAD + (hi - v) / (hi - lo || 1) * (H - 2 * PAD);
  const step = (W - 2 * PAD) / data.length;
  const bw = Math.max(4, step * 0.52);

  let out = `<svg class="candle-svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Illustrative candlestick chart">`;
  // gridlines
  for (let i = 1; i <= 3; i++) {
    const gy = PAD + (H - 2 * PAD) * i / 4;
    out += `<line x1="${PAD}" x2="${W - PAD}" y1="${gy}" y2="${gy}" stroke="#e7eae4" stroke-width="1" stroke-dasharray="2 5"/>`;
  }
  // optional level line (e.g. resistance / entry)
  if (opts.level != null) {
    const ly = y(opts.level);
    out += `<line x1="${PAD}" x2="${W - PAD}" y1="${ly}" y2="${ly}" stroke="#101b16" stroke-width="1.4" stroke-dasharray="6 5"/>
            <text x="${W - PAD}" y="${ly - 6}" text-anchor="end" font-size="10.5" fill="#57665e" font-family="Manrope" font-weight="700">${opts.levelLabel || ''}</text>`;
  }
  data.forEach((d, i) => {
    const cx = PAD + step * i + step / 2;
    const up = d.c >= d.o;
    const col = up ? '#0a7c42' : '#b42318';
    const top = y(Math.max(d.o, d.c)), bot = y(Math.min(d.o, d.c));
    out += `<g class="candle" style="animation-delay:${(opts.delayBase ?? 0) + i * (opts.delayStep ?? 45)}ms">
      <line x1="${cx}" x2="${cx}" y1="${y(d.h)}" y2="${y(d.l)}" stroke="${col}" stroke-width="1.4"/>
      <rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${Math.max(2, bot - top)}" rx="1.6" fill="${col}"/>
    </g>`;
  });
  if (showLine) {
    const pts = data.map((d, i) => `${PAD + step * i + step / 2},${y(d.c)}`).join(' ');
    out += `<polyline class="pulse-line" points="${pts}"/>`;
  }
  el.innerHTML = out + '</svg>';
}

/* hero chart — illustrative Nifty-style intraday move: flat chop, dip, strong trend */
const heroData = [
  {o:100,h:103,l:98,c:101},{o:101,h:104,l:99,c:103},{o:103,h:105,l:100,c:100.5},
  {o:100.5,h:102,l:97,c:98},{o:98,h:99.5,l:95.5,c:96},{o:96,h:98,l:94.5,c:95},
  {o:95,h:97,l:93.5,c:94},{o:94,h:96,l:92.5,c:95.5},{o:95.5,h:97.5,l:94,c:96.5},
  {o:96.5,h:99,l:95.5,c:98.5},{o:98.5,h:100,l:97,c:99},{o:99,h:102,l:98.5,c:101.5},
  {o:101.5,h:104,l:100.5,c:103.5},{o:103.5,h:105.5,l:102,c:105},{o:105,h:107,l:103.5,c:106.5},
  {o:106.5,h:108,l:105,c:107.5},{o:107.5,h:110,l:106.5,c:109.5},{o:109.5,h:112,l:108.5,c:111.5},
  {o:111.5,h:113,l:110,c:110.5},{o:110.5,h:112,l:109,c:111.5},{o:111.5,h:114,l:110.5,c:113.5},
  {o:113.5,h:116,l:112.5,c:115.5},{o:115.5,h:117.5,l:114,c:117},{o:117,h:119,l:115.5,c:118.5}
];
renderCandles(document.getElementById('hero-chart'), heroData, { width: 460, height: 250, delayStep: 55 });

/* small decorative charts on cards */
const upcomingChart = [
  {o:100,h:101,l:96,c:97},{o:97,h:98,l:92,c:93},{o:93,h:95,l:91,c:94},{o:94,h:99,l:93.5,c:98},
  {o:98,h:104,l:97.5,c:103},{o:103,h:106,l:101,c:102},{o:102,h:103,l:98,c:99},{o:99,h:101,l:96,c:97}
];
renderCandles(document.getElementById('post1-visual'), heroData.slice(8, 22), { width: 260, height: 150, line: false, delayStep: 40 });
renderCandles(document.getElementById('post2-visual'), upcomingChart, { width: 260, height: 150, line: false, delayStep: 40 });

/* ============================================================
   ARTICLE FIGURES (blog/3-check-method.html)
   ============================================================ */
/* Fig 1 — FAST day: chart & trade agree, clean one-directional trend */
renderCandles(document.getElementById('fig-fast'), [
  {o:100,h:101,l:98.5,c:99},{o:99,h:100.5,l:97.5,c:98},{o:98,h:99,l:96,c:96.5},
  {o:96.5,h:97.5,l:94.5,c:95},{o:95,h:96.5,l:93.5,c:94},{o:94,h:96,l:93,c:95.5},
  {o:95.5,h:98,l:95,c:97.5},{o:97.5,h:100,l:97,c:99.5},{o:99.5,h:102,l:99,c:101.5},
  {o:101.5,h:104,l:101,c:103.5},{o:103.5,h:106,l:103,c:105.5},{o:105.5,h:108.5,l:105,c:108},
  {o:108,h:111,l:107.5,c:110.5},{o:110.5,h:113.5,l:110,c:113}
], { width: 340, height: 180, line: false, delayStep: 45 });

/* Fig 2 — WAIT day: direction keeps flipping, no clean structure */
renderCandles(document.getElementById('fig-wait'), [
  {o:100,h:102,l:98,c:101},{o:101,h:103,l:99,c:99.5},{o:99.5,h:101,l:97,c:97.5},
  {o:97.5,h:100,l:96.5,c:99.5},{o:99.5,h:102,l:99,c:101.5},{o:101.5,h:103,l:100,c:100},
  {o:100,h:102,l:98,c:98.5},{o:98.5,h:101,l:97.5,c:100.5},{o:100.5,h:102.5,l:99,c:99},
  {o:99,h:101,l:97,c:98},{o:98,h:100,l:96,c:99.5},{o:99.5,h:102,l:98.5,c:101.5}
], { width: 340, height: 180, line: false, delayStep: 45 });

/* Fig 3 — the trap: strong green candles (trapped buyers) then one sharp red dump on negative OI */
renderCandles(document.getElementById('fig-trap'), [
  {o:100,h:101.5,l:99,c:101},{o:101,h:103,l:100.5,c:102.8},{o:102.8,h:105,l:102.3,c:104.6},
  {o:104.6,h:107.5,l:104,c:107},{o:107,h:110,l:106.5,c:109.6},{o:109.6,h:113,l:109,c:112.4},
  {o:112.4,h:115.5,l:112,c:114.8},{o:114.8,h:117,l:114,c:116.4},
  {o:116.4,h:117.2,l:109,c:109.6},          /* the dump candle */
  {o:109.6,h:110.5,l:105,c:105.8},{o:105.8,h:106.5,l:101.5,c:102.2},{o:102.2,h:103,l:99,c:99.8}
], { width: 400, height: 190, line: false, delayStep: 55 });

/* Fig 4 — sell on proof: resistance respected exactly, red rejection candles, then breakdown */
renderCandles(document.getElementById('fig-proof'), [
  {o:100,h:101.5,l:99,c:101},{o:101,h:103,l:100,c:102.5},{o:102.5,h:104.8,l:102,c:104.2},
  {o:104.2,h:107,l:103.8,c:106.4},{o:106.4,h:109.2,l:106,c:108.6},{o:108.6,h:111.4,l:108,c:110.8},
  {o:110.8,h:113.4,l:110.4,c:113},           /* approach to resistance at 113 */
  {o:113,h:113.4,l:111,c:111.4},             /* first rejection */
  {o:111.4,h:113.2,l:110.8,c:111},           /* second rejection — line respected */
  {o:111,h:111.6,l:108.4,c:108.8},           /* breakdown begins */
  {o:108.8,h:109.4,l:106,c:106.4},{o:106.4,h:107,l:103.6,c:104}
], { width: 400, height: 190, level: 113, levelLabel: 'Close-zone resistance', line: false, delayStep: 55 });

/* ============================================================
   QUIZ (article page)
   ============================================================ */
const QUIZ = [
  {
    q: 'Momentum says "fast day" but the trade/OI data says the opposite. What does the 3-Check method say?',
    opts: ['Trade immediately — momentum always wins', 'It is a WAIT day — skip until proof appears', 'It is a NEVER day — no trade today', 'Flip a coin on direction'],
    a: 2,
    ex: 'When momentum is OPPOSITE to the trade/OI picture, that is the worst combination — a NEVER day. When they merely disagree (neutral vs fast), it is a WAIT day.'
  },
  {
    q: 'Price has been rising all morning with strong green candles, but open interest data shows negative OI buildup. A tall red candle suddenly appears. What is likely happening?',
    opts: ['Healthy consolidation before the next leg up', 'Trapped buyers are being dumped on — exit and stay out', 'The market is about to gap up', 'Nothing, red candles after green are normal'],
    a: 1,
    ex: 'Negative OI + a sharp red candle after a strong rise is the classic trapped-buyer dump: late buyers are stuck and selling accelerates. This is a trap, not a dip to buy.'
  },
  {
    q: 'You want to short near a level. What counts as "proof" that the level is real resistance?',
    opts: ['Price touched the level once', 'The level is respected exactly, and strong red candles reject from it', 'A news channel mentions the level', 'Price traded above the level all day'],
    a: 1,
    ex: 'Sell on proof, not hope: a genuine resistance is touched and respected precisely, followed by strong red rejection candles. One touch is not proof.'
  }
];
(function initQuiz() {
  const root = document.getElementById('quiz-root');
  if (!root) return;
  let score = 0, answered = 0;
  QUIZ.forEach((item, qi) => {
    const card = document.createElement('div');
    card.className = 'q-card';
    card.innerHTML = `<p class="q-text">Q${qi + 1}. ${item.q}</p>
      <div class="q-opts">${item.opts.map((o, oi) =>
        `<button class="q-opt" data-q="${qi}" data-o="${oi}">${String.fromCharCode(65 + oi)}. ${o}</button>`).join('')}</div>
      <div class="q-explain">${item.ex}</div>`;
    root.appendChild(card);
  });
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('.q-opt');
    if (!btn || btn.disabled) return;
    const qi = +btn.dataset.q, oi = +btn.dataset.o;
    const card = btn.closest('.q-card');
    card.querySelectorAll('.q-opt').forEach(b => b.disabled = true);
    if (oi === QUIZ[qi].a) { btn.classList.add('correct'); score++; }
    else {
      btn.classList.add('wrong');
      card.querySelector(`[data-o="${QUIZ[qi].a}"]`).classList.add('correct');
    }
    card.querySelector('.q-explain').classList.add('show');
    answered++;
    const scoreEl = document.getElementById('quiz-score');
    const verdict = score === QUIZ.length ? ' — you are reading the market, not chasing it.' : ' — revisit the sections above and try the mental model again.';
    scoreEl.textContent = `Score: ${score}/${QUIZ.length}${answered === QUIZ.length ? verdict : ''}`;
  });
})();

/* ---------- premium header: shadow on scroll ---------- */
const headerEl = document.querySelector('.site-header');
if (headerEl) {
  const sync = () => headerEl.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', sync, { passive: true });
  sync();
}

/* ---------- page covers (decorative illustrations, no data claims) ---------- */
const COVER_FONT = 'font-family="Manrope,system-ui" font-weight="700"';
function coverStopFence(el) {
  if (!el) return;
  // candles descend toward a hard stop line; shaded band = loss you accepted in advance
  const data = [
    {o:100,h:102,l:99,c:101},{o:101,h:103,l:100,c:102.5},{o:102.5,h:104,l:101,c:100.5},
    {o:100.5,h:101.5,l:98,c:98.4},{o:98.4,h:100,l:96.8,c:99.5},{o:99.5,h:100.4,l:97,c:97.4},
    {o:97.4,h:98.6,l:95.4,c:95.8},{o:95.8,h:97,l:94.4,c:94.8},{o:94.8,h:95.6,l:92.8,c:93},
    {o:93,h:94.2,l:91.6,c:91.9},{o:91.9,h:92.6,l:90.4,c:90.7},{o:90.7,h:91.5,l:89.2,c:89.5},
    {o:89.5,h:90.4,l:88.2,c:88.5},{o:88.5,h:89.3,l:87.4,c:87.6}
  ];
  const hi = 104, lo = 85, W = 560, H = 320, PAD = 26;
  const stop = 87.6;
  const y = v => PAD + (hi - v) / (hi - lo) * (H - 2 * PAD - 40);
  const step = (W - 2 * PAD) / data.length, bw = step * 0.5;
  let out = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Illustrative chart: candles approaching a stop-loss line">`;
  out += `<rect x="18" y="${y(stop)}" width="${W - 36}" height="${H - y(stop) - 14}" fill="#fdeeea" rx="10"/>`;
  out += `<line x1="18" x2="${W - 18}" y1="${y(stop)}" y2="${y(stop)}" stroke="#b42318" stroke-width="2" stroke-dasharray="8 7"/>`;
  out += `<text x="${W - 22}" y="${y(stop) + 24}" text-anchor="end" font-size="13" fill="#b42318" ${COVER_FONT}>Your stop — the exact loss is decided BEFORE you enter</text>`;
  data.forEach((d, i) => {
    const cx = PAD + step * i + step / 2, up = d.c >= d.o, col = up ? '#0a7c42' : '#b42318';
    const top = y(Math.max(d.o, d.c)), bot = y(Math.min(d.o, d.c));
    out += `<g><line x1="${cx}" x2="${cx}" y1="${y(d.h)}" y2="${y(d.l)}" stroke="${col}" stroke-width="1.6"/>
      <rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${Math.max(2.5, bot - top)}" rx="2" fill="${col}"/></g>`;
  });
  out += `<text x="24" y="34" font-size="15" fill="#101b16" ${COVER_FONT}>Risk fixed in rupees. Quantity is the answer.</text>`;
  out += '</svg>';
  el.innerHTML = out;
}
function coverWatchWall(el) {
  if (!el) return;
  const W = 560, H = 320, cols = 6, rows = 3, gw = 84, gh = 88, gx = 26, gy = 30;
  let out = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Illustrative wall of small charts, one highlighted">`;
  out += `<rect x="14" y="16" width="${W - 28}" height="${H - 32}" fill="#f6f7f4" rx="14"/>`;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tile = (tx, ty, hot) => {
    const r = 8, x = gx + tx * (gw + 8), y0 = gy + ty * (gh + 8);
    out += `<rect x="${x}" y="${y0}" width="${gw}" height="${gh}" rx="${r}" fill="${hot ? '#0a7c42' : '#ffffff'}" stroke="${hot ? '#0a7c42' : '#e7eae4'}"/>`;
    let px = x + 12, py = y0 + 30;
    for (let k = 0; k < 3; k++) {
      const up = rnd() > 0.45, col = hot ? '#ffffff' : (up ? '#0a7c42' : '#b42318');
      const h = 8 + rnd() * 22, w = 9;
      out += `<line x1="${px + w / 2}" x2="${px + w / 2}" y1="${py - 6}" y2="${py + h + 6}" stroke="${col}" stroke-width="1.3"/>`;
      out += `<rect x="${px}" y="${py}" width="${w}" height="${h}" rx="1.5" fill="${col}"/>`;
      px += w + 12; py += up ? -6 : 5;
      if (py < y0 + 14) py = y0 + 14; if (py + h > y0 + gh - 14) py = y0 + gh - 14 - h;
    }
    out += `<text x="${x + 10}" y="${y0 + 18}" font-size="9" fill="${hot ? '#cfe7d8' : '#6d7a72'}" font-family="JetBrains Mono, monospace" font-weight="500">${['NIFTY', 'BANK', 'TCS', 'INFY', 'HDFC', 'SBIN', 'ITC', 'LT', 'RELI', 'AXIS', 'WIPRO', 'ONGC', 'BHARTI', 'M&amp;M', 'TATA', 'ASIAN', 'ULTRA', 'MARUTI'][ty * cols + tx] || 'NIFTY'}</text>`;
  };
  for (let r2 = 0; r2 < rows; r2++) for (let c = 0; c < cols; c++) tile(c, r2, r2 === 1 && c === 2);
  out += '</svg>';
  el.innerHTML = out;
}
function coverStaircase(el) {
  if (!el) return;
  const W = 560, H = 320, x0 = 40, yb = 272, bw = 30, gap = 12;
  let out = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Illustrative staircase of growing bars with a compounding curve">`;
  out += `<rect x="14" y="16" width="${W - 28}" height="${H - 32}" fill="#f6f7f4" rx="14"/>`;
  const heights = [26, 34, 44, 56, 70, 86, 104, 124, 146, 170, 196, 224];
  let pts = [];
  heights.forEach((h, i) => {
    const x = x0 + i * (bw + gap), up = i % 4 !== 3;
    out += `<rect x="${x}" y="${yb - h}" width="${bw}" height="${h}" rx="5" fill="${i === heights.length - 1 ? '#0a7c42' : (up ? '#0a7c42' : '#9ccdb0')}"/>`;
    pts.push(`${x + bw / 2},${yb - h - 22}`);
  });
  out += `<polyline points="${pts.join(' ')}" fill="none" stroke="#101b16" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const lastX = x0 + 11 * (bw + gap) + bw / 2, lastY = yb - 224 - 22;
  out += `<circle cx="${lastX}" cy="${lastY}" r="15" fill="#101b16"/><text x="${lastX}" y="${lastY + 5}" text-anchor="middle" font-size="14" fill="#ffffff" font-family="Georgia, serif">₹</text>`;
  out += `<line x1="${x0 - 8}" x2="${W - 30}" y1="${yb}" y2="${yb}" stroke="#d5dacf" stroke-width="1.6"/>`;
  out += `<text x="40" y="303" font-size="12.5" fill="#6d7a72" ${COVER_FONT}>month 1</text>`;
  out += `<text x="${W - 34}" y="303" text-anchor="end" font-size="12.5" fill="#6d7a72" ${COVER_FONT}>month 120</text>`;
  out += '</svg>';
  el.innerHTML = out;
}
function coverThreeChecks(el) {
  if (!el) return;
  const W = 560, H = 320;
  let out = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Diagram: three checks leading to FAST, WAIT or NEVER verdicts">`;
  out += `<rect x="14" y="16" width="${W - 28}" height="${H - 32}" fill="#f6f7f4" rx="14"/>`;
  const checks = [['1', 'Momentum', 62], ['2', 'Trade & OI', 62], ['3', 'Gap', 62]];
  checks.forEach((c, i) => {
    const cy = 78 + i * 74, cx = 96;
    out += `<circle cx="${cx}" cy="${cy}" r="24" fill="#ffffff" stroke="#0a7c42" stroke-width="2"/>
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="17" fill="#0a7c42" font-family="Georgia, serif">${c[0]}</text>
      <text x="${cx + 34}" y="${cy + 5}" font-size="14.5" fill="#101b16" ${COVER_FONT}>Trade &amp; OI</text>
      <path d="M ${cx + 130} ${cy} H 300" stroke="#d5dacf" stroke-width="2" marker-end="url(#arrw)"/>`;
  });
  out += `<defs><marker id="arrw" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#d5dacf"/></marker></defs>`;
  const verdicts = [['FAST', '#0a7c42', 'trade it', 78], ['WAIT', '#8a5a00', 'watch it', 152], ['NEVER', '#b42318', 'zero today', 226]];
  verdicts.forEach(v => {
    const cy = v[3];
    out += `<rect x="316" y="${cy - 26}" width="196" height="52" rx="12" fill="#ffffff" stroke="${v[1]}" stroke-width="2"/>
      <text x="336" y="${cy + 1}" font-size="15" fill="${v[1]}" ${COVER_FONT}>${v[0]}</text>
      <text x="500" y="${cy + 1}" text-anchor="end" font-size="12.5" fill="#6d7a72" ${COVER_FONT}>${v[2]}</text>`;
  });
  out += `<text x="36" y="46" font-size="15" fill="#101b16" ${COVER_FONT}>Two minutes of checks. One clear verdict.</text>`;
  out += '</svg>';
  el.innerHTML = out;
}
const COVERS = { 'stop-fence': coverStopFence, 'watch-wall': coverWatchWall, 'staircase': coverStaircase, 'three-checks': coverThreeChecks };
document.querySelectorAll('[data-cover]').forEach(el => (COVERS[el.dataset.cover] || (() => {}))(el));
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const num = (id) => parseFloat(document.getElementById(id)?.value) || 0;

/* ---------- position size calculator ---------- */
(function initPositionSize() {
  const form = document.getElementById('ps-calc');
  if (!form) return;
  const run = () => {
    const capital = num('ps-capital'), riskPct = num('ps-risk'), entry = num('ps-entry'), stop = num('ps-stop');
    const riskAmt = capital * riskPct / 100;
    const perShare = Math.abs(entry - stop);
    const qty = perShare > 0 ? Math.floor(riskAmt / perShare) : 0;
    const set = (id, v, cls) => {
      const el = document.getElementById(id);
      el.textContent = v;
      el.closest('.result-cell').className = 'result-cell' + (cls ? ' ' + cls : '');
    };
    set('ps-r-amt', inr(riskAmt));
    set('ps-qty', qty.toLocaleString('en-IN'), 'hero-cell');
    set('ps-value', inr(qty * entry));
    set('ps-loss', inr(qty * perShare));
    const wrongSide = (entry > 0 && stop > 0) && stop > entry;
    document.getElementById('ps-note').textContent = wrongSide
      ? 'Check your inputs — for a long trade the stop-loss sits below the entry. (For a short, entry is below the stop and the same math applies.)'
      : (qty > 0 ? `Risking ${riskPct}% of capital → max ${qty.toLocaleString('en-IN')} shares. If stopped out, you lose ${inr(qty * perShare)} — never more.` : 'Enter valid inputs to see your position size.');
  };
  form.addEventListener('input', run);
  form.addEventListener('submit', e => e.preventDefault());
})();

/* ---------- SIP / compounding calculator ---------- */
(function initSip() {
  const form = document.getElementById('sip-calc');
  if (!form) return;
  const run = () => {
    const monthly = num('sip-monthly'), years = num('sip-years'), rate = num('sip-rate');
    const r = rate / 100 / 12, n = years * 12;
    const fv = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : monthly * n;
    const invested = monthly * n;
    document.getElementById('sip-invested').textContent = inr(invested);
    const valEl = document.getElementById('sip-value');
    valEl.textContent = inr(fv);
    const gainEl = document.getElementById('sip-gain');
    gainEl.textContent = inr(Math.max(0, fv - invested));
    gainEl.closest('.result-cell').className = 'result-cell ' + (fv >= invested ? 'pos' : 'neg');
    document.getElementById('sip-note').textContent = years > 0
      ? `A ₹${monthly.toLocaleString('en-IN')} monthly SIP at ${rate}% p.a. for ${years} years compounds to ${inr(fv)} — the gain alone is ${inr(fv - invested)}.`
      : 'Enter valid inputs to see the projection.';
  };
  form.addEventListener('input', run);
  form.addEventListener('submit', e => e.preventDefault());
})();

/* ---------- portfolio tracker (localStorage) ---------- */
(function initPortfolio() {
  const KEY = 'dalaldesk_portfolio_v1';
  const form = document.getElementById('pf-form');
  if (!form) return;
  let holdings = [];
  try { holdings = JSON.parse(localStorage.getItem(KEY)) || []; } catch { holdings = []; }
  if (!Array.isArray(holdings)) holdings = [];
  holdings = holdings.filter(h => h && typeof h.symbol === 'string' && h.symbol.trim()
    && Number.isFinite(h.qty) && h.qty > 0 && Number.isFinite(h.avg) && h.avg > 0 && Number.isFinite(h.mkt) && h.mkt > 0);
  const save = () => localStorage.setItem(KEY, JSON.stringify(holdings));

  const tbody = document.getElementById('pf-body');
  const render = () => {
    if (!holdings.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="es-ico">₹</div>
        Your portfolio is empty. Add your first holding above — everything is saved in your browser only.</div></td></tr>`;
      updateSummary(0, 0, 0);
      return;
    }
    tbody.innerHTML = holdings.map((h, i) => {
      const inv = h.qty * h.avg, cur = h.qty * h.mkt, pnl = cur - inv, pct = inv ? (pnl / inv * 100) : 0;
      const cls = pnl >= 0 ? 'pos-num' : 'neg-num';
      return `<tr>
        <td class="sym">${h.symbol.toUpperCase()}</td>
        <td>${h.qty.toLocaleString('en-IN')}</td>
        <td>${inr(h.avg)}</td>
        <td><input class="mkt-input" type="number" step="0.05" min="0" value="${h.mkt}" data-edit="${i}" aria-label="Market price for ${h.symbol}"></td>
        <td>${inr(inv)}</td>
        <td>${inr(cur)}</td>
        <td class="${cls}">${inr(pnl)}<br><small>${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%</small></td>
        <td><button class="row-del" data-del="${i}" title="Remove holding" aria-label="Remove ${h.symbol}">✕</button></td>
      </tr>`;
    }).join('');
    const invested = holdings.reduce((s, h) => s + h.qty * h.avg, 0);
    const current = holdings.reduce((s, h) => s + h.qty * h.mkt, 0);
    updateSummary(invested, current, current - invested);
  };
  const updateSummary = (inv, cur, pnl) => {
    document.getElementById('pf-invested').textContent = inr(inv);
    const curEl = document.getElementById('pf-current'); curEl.textContent = inr(cur);
    const pnlEl = document.getElementById('pf-pnl');
    pnlEl.textContent = inr(pnl) + (inv ? ` (${(pnl / inv * 100).toFixed(2)}%)` : '');
    pnlEl.closest('.result-cell').className = 'result-cell ' + (pnl > 0 ? 'pos' : pnl < 0 ? 'neg' : '');
    pnlEl.style.color = pnl > 0 ? '#086637' : pnl < 0 ? '#b42318' : '';
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const symbol = document.getElementById('pf-symbol').value.trim();
    const qty = num('pf-qty'), avg = num('pf-avg'), mkt = num('pf-mkt') || avg;
    if (!symbol || qty <= 0 || avg <= 0) return;
    holdings.push({ symbol, qty, avg, mkt });
    save(); render(); form.reset();
    document.getElementById('pf-symbol').focus();
  });
  document.getElementById('pf-table').addEventListener('input', e => {
    const t = e.target.closest('[data-edit]'); if (!t) return;
    holdings[+t.dataset.edit].mkt = parseFloat(t.value) || 0;
    save(); render();
    // restore focus lost by re-render
    const again = document.querySelector(`[data-edit="${t.dataset.edit}"]`);
    if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
  });
  document.getElementById('pf-table').addEventListener('click', e => {
    const t = e.target.closest('[data-del]'); if (!t) return;
    holdings.splice(+t.dataset.del, 1); save(); render();
  });
  render();
})();
