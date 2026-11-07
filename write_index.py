html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dalal Desk - Clarity-first Indian Stock Market Education</title>
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Inter + JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root{
      --radius-card:12px;
      --radius-button:6px;
      --shadow-card:0 2px 8px rgba(0,0,0,.05);
    }
    .font-inter{font-family:"Inter",system-ui,sans-serif!important;}
    .font-mono{font-family:"JetBrains Mono",ui-monospace,monospace!important;}
    .letter-tight{letter-spacing:-0.02em!important;}
  </style>
</head>
<body class="font-inter">
<!-- ============ Hero Section ============ -->
<section class="min-h-[600px] bg-white py-24 px-4 md:py-32">
  <div class="max-w-custom mx-auto">
    <div class="grid lg:grid-cols-2 gap-8 items-center">
      <div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight mb-4 letter-tight">
          Master the Indian Market. Clearly.
        </h1>
        <p class="text-lg text-[var(--text-muted)] leading-relaxed mb-6 max-w-xl">
          Candle-wise education that explains <strong>why</strong> a trade works, and practical tools for position sizing, portfolio tracking and compounding.
        </p>
        <div class="flex flex-wrap gap-3">
          <button class="btn-primary">Start Learning</button>
          <button class="btn-secondary">Explore Tools</button>
        </div>
      </div>
      <div class="lg:hidden hidden">
        <p class="text-[var(--text-muted)] text-center">
          Full experience best viewed on desktop or tablet
        </p>
      </div>
    </div>
  </div>
</section>

<!-- ============ Market Snapshot Strip ============ -->
<section class="border-t border-[var(--border)] bg-white py-4">
  <div class="max-w-custom mx-auto px-4">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center py-4">
      <!-- Nifty 50 -->
      <div class="market-item w-full sm:w-33">
        <div class="market-name">Nifty 50</div>
        <div class="flex items-center gap-2">
          <span class="market-symbol">#Nifty</span>
          <span class="market-value mono text-[var(--text-primary)]">22,458.30</span>
          <div class="market-change positive">
            <span>+124.65</span>
            <span class="text-[var(--positive)]">(+0.56%)</span>
          </div>
        </div>
        <div class="mt-2 h-2 w-full bg-green-100 rounded-full overflow-hidden">
          <div class="h-full w-1/2 bg-green-500"></div>
        </div>
      </div>
      <!-- Bank Nifty -->
      <div class="market-item w-full sm:w-33">
        <div class="market-name">Bank Nifty</div>
        <div class="flex items-center gap-2">
          <span class="market-symbol">#BankNifty</span>
          <span class="market-value mono text-[var(--text-primary)]">47,312.10</span>
          <div class="market-change negative">
            <-312.40</div>
            <span class="text-[var(--negative)]">(-0.66%)</span>
          </div>
        </div>
        <div class="mt-2 h-2 w-full bg-red-100 rounded-full overflow-hidden">
          <div class="h-full w-1/3 bg-red-500"></div>
        </div>
      </div>
      <!-- Sensex -->
      <div class="market-item w-full sm:w-33">
        <div class="market-name">Sensex</div>
        <div class="flex items-center gap-2">
          <span class="market-symbol">#Sensex</span>
          <span class="market-value mono text-[var(--text-primary)]">78,312.80</span>
          <div class="market-change positive">
            <span>+231.70</span>
            <span class="text-[var(--positive)]">(+0.30%)</span>
          </div>
        </div>
        <div class="mt-2 h-2 w-full bg-green-100 rounded-full overflow-hidden">
          <div class="h-full w-1/4 bg-green-500"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ Three Things Grid ============ -->
<section class="py-80 bg-white">
  <div class="max-w-custom mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1 -->
      <div class="card h-full flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-[var(--radius-card)] bg-[var(--brand-primary)] flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">Candle-wise Education</h3>
          <p class="text-[var(--text-muted)] leading-relaxed">Long-form articles that walk through real market behaviour — day classification, open interest, traps and proof — with every idea drawn on candles, not buried in jargon.</p>
        </div>
        <a href="blog.html" class="text-[var(--brand-primary)] text-sm font-medium mt-2 flex items-center gap-1">
          Learn More <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </a>
      </div>
      <!-- Card 2 -->
      <div class="card h-full flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-[var(--radius-card)] bg-[var(--positive)] flex items-center justify-center mb-3 text-[var(--card-background)]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">Tools that Protect</h3>
          <p class="text-[var(--text-muted)] leading-relaxed">Position sizing that tells you your exact loss before you enter, a portfolio tracker that lives privately in your browser, and compounding math that shows what patience is worth.</p>
        </div>
        <a href="tools.html" class="text-[var(--brand-primary)] text-sm font-medium mt-2 flex items-center gap-1">
          Explore <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </a>
      </div>
      <!-- Card 3 -->
      <div class="card h-full flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-[var(--radius-card)] bg-[var(--border)] flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-[var(--text-primary)] mb-2">Test Your Understanding</h3>
          <p class="text-[var(--text-muted)] leading-relaxed">Every article ends with a short quiz built around the scenarios that actually fool traders. If you can pass it, you have not just read — you have understood.</p>
        </div>
        <a href="blog/3-check-method.html#quiz" class="text-[var(--brand-primary)] text-sm font-medium mt-2 flex items-center gap-1">
          Try Quiz <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ============ Blog & Tool Previews ============ -->
<section class="py-80">
  <div class="max-w-custom mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Blog Post 1 -->
      <div class="border rounded-[var(--radius-card)] overflow-hidden hover:border-[var(--brand-primary)] transition-colors">
        <div class="h-48 w-full bg-[var(--border)]"></div>
        <div class="p-4">
          <span class="inline-block rounded-full bg-[var(--brand-primary)] text-xs font-bold text-white px-2 py-1 mr-2">#Education</span>
          <h3 class="text-[var(--text-primary)] text-lg font-bold mt-2 line-clamp-2">The 3-Check Method: classify the day before you touch the order button</h3>
          <p class="text-[var(--text-muted)] text-sm mt-2 line-clamp-2">Three checks — momentum, trade/OI, and the gap — that tell you whether today is a FAST day worth trading or a WAIT day worth watching.</p>
          <a href="blog/3-check-method.html" class="text-[var(--brand-primary)] text-sm font-medium mt-2 block">Read More</a>
        </div>
      </div>
      <!-- Blog Post 2 -->
      <div class="border rounded-[var(--radius-card)] overflow-hidden hover:border-[var(--brand-primary)] transition-colors">
        <div class="h-48 w-full bg-[var(--border)]"></div>
        <div class="p-4">
          <span class="inline-block rounded-full bg-[var(--positive)] text-xs font-bold text-[var(--card-background)] px-2 py-1 mr-2">#Beginner</span>
          <h3 class="text-[var(--text-primary)] text-lg font-bold mt-2 line-clamp-2">Why your stoploss keeps getting hit — and how to read the hunt</h3>
          <p class="text-[var(--text-muted)] text-sm mt-2 line-clamp-2">The market cannot move without stoplosses. Where the crowd parks them, why fake breakouts are really stop hunts, and how the two indices rotate.</p>
          <a href="blog/stoploss-hunting.html" class="text-[var(--brand-primary)] text-sm font-medium mt-2 block">Read More</a>
        </div>
      </div>
      <!-- Blog Post 3 -->
      <div class="border rounded-[var(--radius-card)] overflow-hidden hover:border-[var(--brand-primary)] transition-colors">
        <div class="h-48 w-full bg-[var(--border)]"></div>
        <div class="p-4">
          <span class="inline-block rounded-full bg-[var(--negative)] text-xs font-bold text-[var(--card-background)] px-2 py-1 mr-2">#Risk</span>
          <h3 class="text-[var(--text-primary)] text-lg font-bold mt-2 line-clamp-2">Position sizing is the only edge beginners control</h3>
          <p class="text-[var(--text-muted)] text-sm mt-2 line-clamp-2">You cannot control whether Nifty trends today. You fully control how much you can lose on one trade. That asymmetry is where every serious account starts.</p>
          <a href="#" class="text-[var(--brand-primary)] text-sm font-medium mt-2 block">Read More</a>
        </div>
      </div>
      <!-- Tool 1 Preview -->
      <div class="border rounded-[var(--radius-card)] overflow-hidden hover:border-[var(--brand-primary)] transition-colors">
        <div class="h-48 w-full bg-[var(--border)]"></div>
        <div class="p-4">
          <h3 class="text-[var(--text-primary)] text-lg font-bold mb-2">Position Size Calculator</h3>
          <p class="text-[var(--text-muted)] text-sm">Enter capital, risk %, entry and stop-loss — get your exact quantity and rupee loss if stopped out.</p>
          <a href="tools/position-size-calculator.html" class="text-[var(--brand-primary)] text-sm font-medium mt-2 block">Open Tool</a>
        </div>
      </div>
      <!-- Tool 2 Preview -->
      <div class="border rounded-[var(--radius-card)] overflow-hidden hover:border-[var(--brand-primary)] transition-colors">
        <div class="h-48 w-full bg-[var(--border)]"></div>
        <div class="p-4">
          <h3 class="text-[var(--text-primary)] text-lg font-bold mb-2">Portfolio Tracker</h3>
          <p class="text-[var(--text-muted)] text-sm">Add holdings, update market prices, and see live P&L per stock and overall — saved privately in your browser.</p>
          <a href="tools/portfolio-tracker.html" class="text-[var(--brand-primary)] text-sm font-medium mt-2 block">Open Tool</a>
        </div>
      </div>
      <!-- Tool 3 Preview -->
      <div class="border rounded-[var(--radius-card)] overflow-hidden hover:border-[var(--brand-primary)] transition-colors">
        <div class="h-48 w-full bg-[var(--border)]"></div>
        <div class="p-4">
          <h3 class="text-[var(--text-primary)] text-lg font-bold mb-2">SIP & Compounding Calculator</h3>
          <p class="text-[var(--text-muted)] text-sm">Set a monthly amount, expected return and horizon — see what consistency becomes with the power of compounding.</p>
          <a href="tools/sip-calculator.html" class="text-[var(--brand-primary)] text-sm font-medium mt-2 block">Open Tool</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ Footer ============ -->
<footer class="bg-[var(--border)] py-8">
  <div class="max-w-custom mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h4 class="font-bold text-[var(--text-primary)] mb-3">Dalal Desk</h4>
        <p class="text-[var(--text-muted)]">Clarity-first education and tools for the Indian stock market. Built for learners, by a learner.</p>
      </div>
      <div>
        <h4 class="font-bold text-[var(--text-primary)] mb-3">Explore</h4>
        <ul class="space-y-2 text-[var(--text-muted)]">
          <li><a href="index.html" class="hover:text-[var(--brand-primary)] transition-colors">Home</a></li>
          <li><a href="blog.html" class="hover:text-[var(--brand-primary)] transition-colors">Blog</a></li>
          <li><a href="tools.html" class="hover:text-[var(--brand-primary)] transition-colors">Tools</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold text-[var(--text-primary)] mb-3">Principles</h4>
        <ul class="space-y-2 text-[var(--text-muted)]">
          <li><a href="#" class="hover:text-[var(--brand-primary)] transition-colors">Education over tips</a></li>
          <li><a href="#" class="hover:text-[var(--brand-primary)] transition-colors">Risk first, returns second</a></li>
          <li><a href="#" class="hover:text-[var(--brand-primary)] transition-colors">Your data stays with you</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-8 pt-8 border-t border-[var(--border)] text-center">
      <p class="text-[var(--text-muted)] text-sm">© 2026 Dalal Desk · Made in India</p>
    </div>
  </div>
</footer>

<script src="js/app.js"></script>
</body>
</html>"""

import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_content)
print("index.html written successfully, size:", len(html_content), "chars")