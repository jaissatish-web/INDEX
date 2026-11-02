/* ============================================================
   Dalal Desk — site scripts
   Shared: nav, reveal-on-scroll, market status, candle renderer.
   Page-specific: tools calculators, portfolio, quiz (gated by DOM).
   ============================================================ */

/* ---------- nav ---------- */
const menuBtn = document.querySelector('.menu-btn');
if (menuBtn) {
  menuBtn.addEventListener('click', () => document.querySelector('.nav').classList.toggle('open'));
}

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
      const nextOpen = mins < 555 ? 'opens 9:15 AM IST' : 'opens tomorrow 9:15 AM IST';
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
], { width: 400, height: 190, level: 113, levelLabel: 'Close-zone resistance', delayStep: 55 });

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

/* ============================================================
   TOOLS — shared helpers
   ============================================================ */
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
    const wrongSide = (entry > 0 && stop > 0) && ((entry > stop && false) || (stop > entry));
    document.getElementById('ps-note').textContent = wrongSide
      ? 'Check your inputs — stop-loss should usually be below entry for a long trade.'
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
