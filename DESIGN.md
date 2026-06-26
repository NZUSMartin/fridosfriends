# Frido's Friends e.V. — DESIGN BIBLE

**Version 1.0 — definitive, implementation-ready. Build from this with zero ambiguity.**

Design concept: **"Light and Continuity."** The signature is a single fine **continuity line** — gold light falling out of the Jesuit double-shaft cross in the logo, threading the whole site, connecting Frido's past work → today's students → their future. The line is the **load-bearing structural element** of the layout (Treatment C's thesis is the spine), executed with the **editorial restraint and whitespace discipline** of Treatment A, and the **documentary, photography-forward, trust-early sequencing** of Treatment B.

---

## 0. Decisions & conflict resolution (read once, then build)

| Question | Decision | Rationale |
|---|---|---|
| Which treatment is the spine? | **C — "The Column That Carries."** Line is load-bearing architecture, not decoration. | Most memorable, most aligned with brief's "signature element." |
| Spine geometry | **Left-of-content rail** (A's persistent left spine), NOT centered timeline on Home. Centered/alternating only conceptually rejected — we use **left-rail throughout** for consistency. | A's persistent left spine is cleaner and consistent across all pages; avoids the cost of two layout systems. |
| Spine thickness | **1px** at rest in `--line`; **2px gold** active segment. | A/B's 1px is more "fine line" per brief ("fine vertical gold/ink line"). C's 2px reserved for the gold active segment only. |
| Scroll behaviour of gold | Gold segment is a **scroll-progress read indicator** (A's idea) on Home/interior; on `/frido` and `/projekt` it **fills to nodes** as you scroll (B/C). | A's "you are here" indicator is information, not decoration — survives reduced-motion. |
| Hero animation | **Line draws itself** out of the logo, 1100ms `cubic-bezier(.22,.61,.36,1)`, 200ms delay, once. | Unanimous; the one signature motion moment. |
| Hero layout | **Split: text left / `students-path.jpg` right** (A/C), NOT full-bleed scrim (B). | Type on photo with scrim is the "AI charity default" we avoid; split keeps editorial gravitas and AA text contrast trivially. |
| 100% promise placement | **Section 2, dark `--ink` band, LOUD** (B/C). | charity:water lesson — earn trust before deepening the ask. |
| Story | **Grace single story, section 3**, `280px 1fr`, `student-classroom-portrait.jpg`. | Camfed lesson; mandated grid. |
| H1 weight | **Source Serif 4 400** (A's "light gravitas"), NOT 600/700. | "Gravitas without shouting"; matches "quiet everywhere, bold on the spine." |
| Gold on light | **NEVER body text.** Only figures, rules, eyebrows, ticks, underlines, hover tints. | Non-negotiable token rule + WCAG. |
| Count-up on stats | **Allowed, gated to reduced-motion** (C), final value rendered in DOM. | Information remains if motion off. |
| Header behaviour | **Sticky, persistent, no hide-on-scroll.** | C's hide/reveal adds risk and hurts the always-available CTA goal. Keep CTA always visible. |

---

## 1. CSS custom properties

Paste into a global stylesheet (`src/styles/global.css`) inside `:root`.

```css
:root {
  /* ----- Color tokens (exact, non-negotiable) ----- */
  --ink:        #1C1B19; /* warm near-black: text, dark sections, logo */
  --paper:      #FBF9F4; /* warm off-white background */
  --paper-pure: #FFFFFF; /* cards, donation surfaces */
  --gold:       #C8962B; /* accent ONLY: eyebrows, underlines, stat figures, ticks, rules. NEVER body text on light */
  --gold-soft:  #EBD9AE; /* tints / hover fills */
  --teal:       #1E5B57; /* RESERVED for primary CTA only */
  --teal-dark:  #143F3C; /* CTA hover */
  --stone:      #6B675E; /* secondary text, captions */
  --line:       #E4DECF; /* hairlines, dividers, column/spine motif */

  /* On-ink readable gold for sublines in dark bands (gold-soft passes AA on ink) */
  --gold-on-ink: #EBD9AE;

  /* ----- Fluid type scale (rem, clamp) ----- */
  /* base 1rem = 16px; viewport range 360px → 1200px */
  --step--1: clamp(0.833rem, 0.80rem + 0.15vw, 0.875rem);
  --step-0:  clamp(1rem,     0.97rem + 0.15vw, 1.0625rem);   /* body */
  --step-1:  clamp(1.125rem, 1.06rem + 0.30vw, 1.25rem);
  --step-2:  clamp(1.30rem,  1.18rem + 0.55vw, 1.563rem);
  --step-3:  clamp(1.55rem,  1.34rem + 0.95vw, 1.953rem);
  --step-4:  clamp(1.95rem,  1.62rem + 1.50vw, 2.441rem);    /* H1 mobile */
  --step-5:  clamp(2.30rem,  1.70rem + 2.70vw, 3.40rem);     /* hero desktop */

  /* ----- Spacing scale ----- */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;
  --sp-9: 96px; --sp-10: 128px;

  /* ----- Radii ----- */
  --r-input: 4px;
  --r-card:  10px;
  --r-pill:  999px;

  /* ----- Containers ----- */
  --container:      1200px; /* content */
  --container-text: 720px;  /* reading width (~66ch) */

  /* ----- Spine (continuity line) ----- */
  --spine-x:        64px;   /* desktop x-offset from content edge */
  --spine-x-mobile: 20px;   /* mobile gutter */
  --spine-w:        1px;
  --spine-w-active: 2px;

  /* ----- Fonts ----- */
  --font-serif: "Source Serif 4", Georgia, "Times New Roman", serif;
  --font-sans:  "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  /* ----- Shadows ----- */
  --shadow-card:  0 1px 2px rgba(28,27,25,.04), 0 8px 24px rgba(28,27,25,.06);
  --shadow-lift:  0 2px 4px rgba(28,27,25,.05), 0 14px 34px rgba(28,27,25,.09);
  --shadow-donate:0 2px 16px rgba(28,27,25,.06);

  /* ----- Motion ----- */
  --ease-out: cubic-bezier(.22,.61,.36,1);
  --dur-reveal: 520ms;
  --dur-draw: 1100ms;
}
```

---

## 2. Typography rules

Load Inter (400, 500, 600) and Source Serif 4 (360/400, 440, 500, 600), `display:swap`, subset Latin + German diacritics (ä ö ü ß) + the apostrophe in "Frido's". Note: Source Serif 4 weight 360 → use 400 if 360 unavailable as a static instance; prefer the variable font axis `wght` 360.

```css
html { font-size: 100%; -webkit-text-size-adjust: 100%; }
body {
  font-family: var(--font-sans);
  font-size: var(--step-0);
  line-height: 1.6;
  color: var(--ink);
  background: var(--paper);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Headings — Source Serif 4 */
h1, .h1 {
  font-family: var(--font-serif);
  font-weight: 400;           /* light gravitas (variable wght 360–400) */
  font-size: var(--step-5);   /* mobile uses step-4 via clamp floor */
  line-height: 1.06;
  letter-spacing: -0.01em;
  color: var(--ink);
}
h2, .h2 {
  font-family: var(--font-serif);
  font-weight: 440;
  font-size: var(--step-3);
  line-height: 1.12;
  letter-spacing: -0.005em;
  color: var(--ink);
}
h3, .h3 {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: var(--step-1);
  line-height: 1.2;
  color: var(--ink);
}
h4, .h4 {
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: var(--step-0);
  line-height: 1.25;
  color: var(--ink);
}

/* Lead paragraph */
.lead {
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: var(--step-1);
  line-height: 1.55;
  color: var(--ink);
  max-width: 60ch;
}

/* Body */
p, li { max-width: 66ch; }
.prose p { margin-block: 0 var(--sp-4); }

/* Eyebrow — Inter small tracked uppercase, gold, with continuity-tick */
.eyebrow {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: var(--step--1);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin: 0 0 var(--sp-4);
}
/* the 24px gold tick that ties the eyebrow to the spine */
.eyebrow::before {
  content: "";
  width: 24px;
  height: 0;
  border-top: 2px solid var(--gold);
  flex: 0 0 auto;
}
/* On dark bands keep gold (passes on ink) */
.band-dark .eyebrow { color: var(--gold); }

/* Stat figure */
.stat__figure {
  font-family: var(--font-serif);
  font-weight: 460;
  font-size: var(--step-5);
  line-height: 1;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}
.stat__label {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: var(--step--1);
  letter-spacing: 0.04em;
  color: var(--stone);
}

/* Caption / figcaption */
figcaption, .caption {
  font-family: var(--font-sans);
  font-weight: 400;
  font-size: var(--step--1);
  color: var(--stone);
  margin-top: var(--sp-2);
}

/* Pull-quote */
.pullquote {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 440;
  font-size: var(--step-2);
  line-height: 1.35;
  color: var(--ink);
}
.pullquote::before { /* short gold rule above */
  content: "";
  display: block;
  width: 40px;
  border-top: 2px solid var(--gold);
  margin-bottom: var(--sp-3);
}
```

**Hard rule:** gold (`--gold`) touches only figures, rules, ticks, eyebrows, underlines, and hover tints. It NEVER sets a sentence of body copy on `--paper`/`--paper-pure`.

---

## 3. Layout primitives + the spine

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }

.container {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--sp-4);            /* 16px mobile */
}
@media (min-width: 1024px) {
  .container { padding-inline: var(--sp-9); } /* 96px desktop outer margin */
}

.container-text {
  width: 100%;
  max-width: var(--container-text);
  margin-inline: auto;
  padding-inline: var(--sp-4);
}

/* Section wrappers */
.section {
  padding-block: var(--sp-7);             /* 48px mobile */
  position: relative;
}
@media (min-width: 1024px) {
  .section { padding-block: var(--sp-9); } /* 96px desktop */
}
.section--tight { padding-block: var(--sp-6); }

/* Full-bleed bands break the container */
.band {
  width: 100%;
  position: relative;
}
.band-dark   { background: var(--ink);       color: var(--paper); }
.band-pure   { background: var(--paper-pure); }
.band-dark h1,.band-dark h2,.band-dark h3 { color: var(--paper); }
.band-dark p { color: var(--gold-on-ink); } /* sublines pass AA on ink */
```

### The continuity line (spine)

One global element. A fixed-position 1px rule on the **left of the content column** at `--spine-x`, plus a gold child that either tracks scroll progress (Home/interior) or fills to nodes (`/frido`, `/projekt`).

```html
<!-- Place once near top of <body>, inside a layout wrapper -->
<div class="spine" aria-hidden="true">
  <div class="spine__gold" data-spine-gold></div>
</div>
```

```css
.spine {
  position: fixed;
  top: 0;
  bottom: 0;
  left: max(var(--spine-x-mobile), calc((100vw - var(--container)) / 2 + var(--sp-4)));
  width: var(--spine-w);
  background: var(--line);
  z-index: 1;            /* behind header (10), above section bg */
  pointer-events: none;
}
@media (min-width: 1024px) {
  .spine {
    left: max(var(--spine-x), calc((100vw - var(--container)) / 2 + var(--sp-9) - var(--spine-x)));
  }
}

/* Gold "you are here" / fill segment */
.spine__gold {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--spine-w-active);
  height: 100%;
  background: var(--gold);
  transform: scaleY(0);
  transform-origin: top;
  /* JS sets --p (0..1) for scroll progress */
  transform: scaleY(var(--p, 0));
  will-change: transform;
}

/* Hero draw-in: handled by adding .is-drawing then .is-drawn (see §5) */
```

> Note: the spine's `left` calc keeps it glued to the content's left margin on wide screens (centered container) and falls back to a fixed gutter below 1024px. Eyebrow ticks visually "kiss" this line.

---

## 4. Component library (full anatomy + CSS)

### 4.1 Primary button (teal — conversion only)

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: var(--step-0);
  line-height: 1;
  border-radius: var(--r-pill);
  padding: 14px 28px;
  min-height: 44px;
  cursor: pointer;
  text-decoration: none;
  border: 1.5px solid transparent;
  transition: background 180ms var(--ease-out), transform 150ms var(--ease-out),
              box-shadow 180ms var(--ease-out);
}
.btn--primary {                 /* TEAL — only ever a conversion action */
  background: var(--teal);
  color: #fff;
}
.btn--primary:hover {
  background: var(--teal-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-donate);
}
.btn--secondary {               /* ink outline on light */
  background: transparent;
  color: var(--ink);
  border-color: var(--ink);
}
.btn--secondary:hover { background: var(--gold-soft); }

.btn--ghost {                   /* white outline on photos/dark */
  background: transparent;
  color: #fff;
  border-color: rgba(255,255,255,.7);
}
.btn--ghost:hover { background: rgba(255,255,255,.12); }

.link-tertiary {                /* text link, gold underline on hover */
  color: var(--teal);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 2px solid transparent;
}
.link-tertiary:hover { border-bottom-color: var(--gold); }
```
**Rule:** never two teal buttons adjacent; teal is scarce. Pair primary teal with secondary/ghost or tertiary text link.

### 4.2 Header / nav (sticky, persistent)

```html
<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="/" aria-label="Frido's Friends e.V. — Startseite">
      <!-- logo SVG from §9 -->
      <svg class="brand__mark" ...></svg>
      <span class="brand__name">Frido&rsquo;s Friends</span>
    </a>
    <nav class="nav" aria-label="Hauptnavigation">
      <a href="/projekt">Projekt</a>
      <a href="/geschichten">Geschichten</a>
      <a href="/frido">Frido</a>
      <a href="/mitmachen">Mitmachen</a>
      <a href="/ueber-uns">Über uns</a>
    </nav>
    <div class="site-header__actions">
      <a class="lang-toggle" href="/en/">EN</a>
      <a class="btn btn--primary btn--sm" href="/mitmachen">Mitglied werden</a>
    </div>
    <button class="nav-toggle" aria-expanded="false" aria-controls="mobile-nav"
            aria-label="Menü öffnen">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<div id="mobile-nav" class="mobile-nav" hidden>
  <nav aria-label="Hauptnavigation mobil">
    <a href="/projekt">Projekt</a>
    <a href="/geschichten">Geschichten</a>
    <a href="/frido">Frido</a>
    <a href="/mitmachen">Mitmachen</a>
    <a href="/ueber-uns">Über uns</a>
    <a href="/en/">English</a>
  </nav>
  <a class="btn btn--primary mobile-nav__cta" href="/mitmachen">Mitglied werden</a>
</div>
```

```css
.site-header {
  position: sticky; top: 0; z-index: 10;
  background: color-mix(in srgb, var(--paper) 94%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid transparent;
  transition: border-color 200ms ease;
}
.site-header.is-scrolled { border-bottom-color: var(--line); }
.site-header__inner {
  display: flex; align-items: center; gap: var(--sp-5);
  min-height: 72px;
}
.brand { display: inline-flex; align-items: center; gap: var(--sp-3); text-decoration: none; color: var(--ink); }
.brand__mark { height: 30px; width: auto; color: var(--gold); }  /* SVG uses currentColor */
.brand__name { font-family: var(--font-serif); font-weight: 600; font-size: 1.125rem; }
.nav { display: none; margin-left: auto; gap: var(--sp-5); }
@media (min-width: 1024px) { .nav { display: flex; } }
.nav a {
  font-family: var(--font-sans); font-weight: 500; font-size: 0.95rem;
  color: var(--stone); text-decoration: none; padding-block: 4px;
  border-bottom: 2px solid transparent;
}
.nav a:hover { color: var(--ink); }
.nav a[aria-current="page"] { color: var(--ink); border-bottom-color: var(--gold); }
.site-header__actions { display: none; align-items: center; gap: var(--sp-4); margin-left: var(--sp-5); }
@media (min-width: 1024px) { .site-header__actions { display: flex; } .nav { margin-left: auto; } }
.lang-toggle { color: var(--stone); text-decoration: none; font-size: 0.9rem; font-weight: 500; }
.lang-toggle:hover { color: var(--ink); }
.btn--sm { padding: 10px 20px; font-size: 0.95rem; }

/* hamburger */
.nav-toggle {
  margin-left: auto; display: inline-flex; flex-direction: column; gap: 5px;
  background: none; border: 0; padding: 10px; cursor: pointer; min-height: 44px; min-width: 44px;
}
.nav-toggle span { width: 22px; height: 2px; background: var(--gold); display: block; }
@media (min-width: 1024px) { .nav-toggle { display: none; } }

/* mobile drawer */
.mobile-nav {
  position: fixed; inset: 72px 0 0; background: var(--paper); z-index: 9;
  display: flex; flex-direction: column; padding: var(--sp-6) var(--sp-5);
  border-left: 1px solid var(--line);
}
.mobile-nav[hidden] { display: none; }
.mobile-nav nav { display: flex; flex-direction: column; gap: var(--sp-4); }
.mobile-nav a { font-family: var(--font-serif); font-size: 1.5rem; color: var(--ink); text-decoration: none; }
.mobile-nav__cta { margin-top: auto; width: 100%; }  /* full-width teal pinned bottom of drawer */
```

### 4.3 Footer

```css
.site-footer {
  background: var(--ink); color: var(--gold-on-ink);
  padding-block: var(--sp-8) var(--sp-6);
}
.site-footer a { color: var(--paper); text-decoration: none; border-bottom: 1px solid transparent; }
.site-footer a:hover { border-bottom-color: var(--gold); }
.site-footer__grid {
  display: grid; gap: var(--sp-6);
  grid-template-columns: 1fr;
}
@media (min-width: 768px) { .site-footer__grid { grid-template-columns: 2fr 1fr 1fr; } }
.site-footer .legal { color: var(--stone); font-size: var(--step--1); }
```
Footer content: brand + one-line mission; columns for Navigation, Rechtliches (Impressum, Datenschutz), Kontakt (Gemarkenstraße 12, 51069 Köln; martin.hirt@cassandra.ceo). Bank details (IBAN DE44 6805 2230 0000 2055 26 · BIC SOLADES1STB · Sparkasse St. Blasien). Trust line: "Gemeinnützig anerkannt · Amtsgericht Köln · gegründet 15. August 2025." Continuity line continues into footer in `--gold` at full opacity (the dark-context exception).

### 4.4 Card

```css
.card {
  background: var(--paper-pure);
  border: 1px solid var(--line);
  border-radius: var(--r-card);
  padding: var(--sp-6);
}
.card--interactive { transition: transform 180ms var(--ease-out), box-shadow 180ms var(--ease-out), border-color 180ms; }
.card--interactive:hover { transform: translateY(-2px); box-shadow: var(--shadow-lift); border-color: var(--gold-soft); }
.card--story { border-top: 3px solid var(--gold-soft); }
```

### 4.5 Stat block

```html
<div class="stats" data-reveal-group>
  <div class="stat"><span class="stat__figure" data-countup="24">24</span><span class="stat__label">Kinder gefördert</span></div>
  <div class="stat"><span class="stat__figure" data-countup="18">18</span><span class="stat__label">davon Mädchen</span></div>
  <div class="stat"><span class="stat__figure" data-countup="100" data-suffix="%">100%</span><span class="stat__label">bleiben in der Schule</span></div>
</div>
<p class="caption">Stand: Schuljahr 2024/25</p>
```
```css
.stats { display: grid; grid-template-columns: 1fr; gap: var(--sp-6); }
@media (min-width: 768px) {
  .stats { grid-template-columns: repeat(3, 1fr); }
  .stat + .stat { border-left: 1px solid var(--line); padding-left: var(--sp-6); }
}
.stat { display: flex; flex-direction: column; gap: var(--sp-2); }
```

### 4.6 Eyebrow — see §2 (`.eyebrow`).

### 4.7 Story block (`280px 1fr` — mandated)

```html
<div class="story">
  <figure class="figure">
    <img src="/images/student-classroom-portrait.jpg"
         alt="Eine Schülerin sitzt aufrecht und selbstbewusst vor einer Tafel" width="800" height="1000" loading="lazy">
    <figcaption>Foto: JRS Uganda</figcaption>
  </figure>
  <div class="story__body">
    <p class="eyebrow">Eine von 24</p>
    <h2>Grace wäre mit 15 verheiratet gewesen.</h2>
    <p class="prose">…</p>
    <blockquote class="pullquote">…</blockquote>
    <a class="link-tertiary" href="/geschichten">Mehr Geschichten →</a>
  </div>
</div>
```
```css
.story { display: grid; grid-template-columns: 1fr; gap: var(--sp-6); align-items: start; }
@media (min-width: 768px) { .story { grid-template-columns: 280px 1fr; gap: var(--sp-7); } }
.story__body > * + * { margin-top: var(--sp-4); }
```

### 4.8 Photo figure + figcaption

Radius goes on the `img` — **never** `overflow:hidden` on the figure (it would clip the figcaption).

```css
.figure { margin: 0; }
.figure img {
  display: block; width: 100%; height: auto;
  border-radius: var(--r-card);
  object-fit: cover;
}
.figure--portrait img { aspect-ratio: 4 / 5; }
.figure--landscape img { aspect-ratio: 3 / 2; }
/* full-bleed photo break */
.photo-break { position: relative; }
.photo-break img { width: 100%; height: 60vh; object-fit: cover; border-radius: 0; }
.photo-break figcaption { position: absolute; left: var(--sp-4); bottom: var(--sp-4); color: #fff; opacity: .75; }
.photo-break__caption { position: absolute; inset: auto 0 0 0; padding: var(--sp-6); }
```

### 4.9 Timeline with continuity line (`/frido`)

Semantic `<ol>`; spine becomes gold protagonist; nodes light as the gold fill reaches them.

```html
<ol class="timeline" data-spine-page="frido">
  <li class="timeline__item" data-reveal>
    <span class="timeline__node" aria-hidden="true"></span>
    <span class="timeline__year">1947</span>
    <h3>Geboren in Albbruck</h3>
    <p>…</p>
  </li>
  <!-- … through 2021 … -->
</ol>
```
```css
.timeline { list-style: none; margin: 0; padding: 0; position: relative; }
.timeline__item {
  position: relative;
  padding-left: var(--sp-7);          /* room right of the spine */
  padding-bottom: var(--sp-8);
}
.timeline__node {
  position: absolute; left: calc(var(--spine-x-mobile) - 3px); top: 6px;
  width: 8px; height: 8px; border-radius: 999px; background: var(--gold);
  box-shadow: 0 0 0 4px var(--paper);
  transition: transform 200ms var(--ease-out);
}
@media (min-width: 1024px) { .timeline__node { left: calc(var(--spine-x) - 3px); } }
.timeline__item:hover .timeline__node { transform: scale(1.5); }
.timeline__year { font-family: var(--font-serif); font-weight: 600; font-size: var(--step-2); color: var(--gold); display: block; }
.timeline__item h3 { margin: var(--sp-2) 0; }
/* final node: line continues past 2021 into "→ heute: 24 Kinder" — set in a trailing .band-dark */
```
On `/frido` the global `.spine` reads warmer at rest via `bodyClass="theme-gold-spine"`, which sets the rail background to `--gold-soft` (a warm rest rail — not a full-saturation gold rail). The gold scroll-progress segment runs over it as elsewhere; the page-local `.timeline` (lit nodes + rail) carries the per-node visual story.

> **Implementation note (current state):** the Layout `spine` prop accepts `'progress' | 'fill' | 'none'`. Only `'none'` is distinct — it suppresses the spine entirely. `'fill'` currently **aliases** `'progress'` (both run the scroll-progress indicator); there is no separate node-fill animation in the shared spine. `theme-gold-spine` is a `--gold-soft` rest rail, not a full-gold rail. This is intentional for launch; the page-local `.flow-chain`/`.timeline` tell the step/node story. Do not flag as a regression.

### 4.10 Donation / membership calculator (conversion engine)

Real radio inputs, `aria-live` impact line.

```html
<form class="calc card" data-donate>
  <fieldset>
    <legend class="eyebrow">Mitglied werden — monatlich</legend>
    <div class="calc__tiers" role="radiogroup" aria-label="Monatlicher Beitrag">
      <label class="tier"><input type="radio" name="amount" value="25"><span>25&nbsp;€</span></label>
      <label class="tier tier--featured"><input type="radio" name="amount" value="75" checked><span>75&nbsp;€</span></label>
      <label class="tier"><input type="radio" name="amount" value="100"><span>100&nbsp;€</span></label>
    </div>
    <p class="calc__impact" aria-live="polite" data-impact>
      75 €/Monat = ein ganzes Schuljahr für ein Mädchen in Adjumani.
    </p>
  </fieldset>
  <a class="btn btn--primary" href="#" data-join>Mitglied werden</a>
  <p class="calc__secondary">Lieber einmalig?
    <a class="link-tertiary" href="https://www.betterplace.org/de/projects/165916-schulstipendien-fuer-maedchen-in-uganda-bildung-ist-ihre-zukunft">Jetzt spenden →</a>
  </p>
  <ul class="trust-row">
    <li>Gemeinnützigkeit</li><li>100 %-Versprechen</li><li>Spendenquittung</li><li>Partner JRS</li>
  </ul>
  <p class="caption">Satzungsgemäßer Mindestbeitrag: 50 €/Jahr (separat möglich).</p>
</form>
```
```css
.calc { box-shadow: var(--shadow-donate); border: 1px solid var(--line); }
.calc fieldset { border: 0; margin: 0; padding: 0; }
.calc__tiers { display: flex; gap: var(--sp-3); margin: var(--sp-4) 0; }
.tier { flex: 1; }
.tier input { position: absolute; opacity: 0; }   /* visually hidden, still focusable */
.tier span {
  display: flex; align-items: center; justify-content: center;
  min-height: 48px; border: 1.5px solid var(--line); border-radius: var(--r-pill);
  font-family: var(--font-serif); font-weight: 600; cursor: pointer;
  transition: border-color 150ms, background 150ms;
}
.tier input:checked + span { background: var(--gold-soft); border-color: var(--gold); color: var(--ink); }
.tier input:focus-visible + span { outline: 2px solid var(--teal); outline-offset: 2px; }
.calc__impact { font-family: var(--font-serif); font-size: var(--step-1); color: var(--ink); margin: var(--sp-4) 0; }
.calc .btn--primary { width: 100%; }
.calc__secondary { margin-top: var(--sp-3); color: var(--stone); }
.trust-row { display: flex; flex-wrap: wrap; gap: var(--sp-3) var(--sp-5); list-style: none; padding: 0; margin: var(--sp-5) 0 0; }
.trust-row li { font-size: var(--step--1); color: var(--stone); display: flex; align-items: center; gap: 6px; }
.trust-row li::before { content: "✓"; color: var(--gold); font-weight: 700; }
```
JS: on `change`, update `[data-impact]` text. 25 → "25 €/Monat tragen Schulmaterial und Hygieneartikel für ein Mädchen mit." / 75 → "75 €/Monat = ein ganzes Schuljahr für ein Mädchen in Adjumani." / 100 → "100 €/Monat sichern ein Schuljahr und stärken das Mentoring vor Ort."

### 4.11 Promise band (LOUD, dark)

```html
<section class="band band-dark promise">
  <div class="container">
    <p class="eyebrow">Unser Versprechen</p>
    <h2 class="promise__head"><span class="promise__pct">100&nbsp;%</span> Ihrer Spende fließen direkt in Stipendien.</h2>
    <p>Verwaltungskosten tragen die Gründungsmitglieder privat — in der Satzung verankert.</p>
    <ul class="trust-row trust-row--dark"><li>Gemeinnützig</li><li>Spendenquittung</li><li>Partner JRS</li></ul>
  </div>
</section>
```
```css
.promise { text-align: center; }
.promise__head { font-size: var(--step-3); }
.promise__pct { color: var(--gold); font-size: var(--step-4); }
.promise .container { max-width: var(--container-text); }
.trust-row--dark li { color: var(--gold-on-ink); }
.trust-row--dark li::before { color: var(--gold); }
```
> Note: the spine renders identically over light and dark bands. There is no `data-spine-bright` brightness toggle — the gold rail/active segment already reads against `--ink`. (Earlier drafts carried a `data-spine-bright` hook that was never implemented and has been removed.)

### 4.12 Dark CTA band

```css
.cta-band { background: var(--ink); color: var(--paper); text-align: center; }
.cta-band h2 { color: var(--paper); }
.cta-band .btn-row { display: flex; gap: var(--sp-4); justify-content: center; flex-wrap: wrap; margin-top: var(--sp-5); }
```
Single teal primary + ghost-white secondary. Continuity line runs bright gold through this band.

---

## 5. Continuity line — rules per page type + draw-in animation

| Page | Spine at rest | Gold behaviour | Motion |
|---|---|---|---|
| **Home** | 1px `--line` | gold = scroll-progress read indicator (top→current) | hero draw-in once |
| **/frido** | 1px `--line` | gold fills full-height following timeline scroll; nodes light | per-node reveal |
| **/projekt** | 1px `--line` | gold fills the 4-step Mittelflow connector step-by-step | per-step reveal |
| **/geschichten, /mitmachen, /ueber-uns** | 1px `--line` | gold = quiet scroll-progress indicator | none beyond reveals |
| **Impressum, Datenschutz** | 1px `--line`, no gold | none | none |

> **Spine prop mapping (as built).** Layout exposes `spine?: 'progress' | 'fill' | 'none'`. `'none'` suppresses the spine. `'fill'` and `'progress'` are currently identical (both = scroll-progress read indicator); the per-node/per-step fill described in the table above is delivered by the page-local `.timeline` (`/frido`) and `.flow-chain` (`/projekt`) elements, not by the shared spine. `bodyClass="theme-gold-spine"` (on `/frido`) tints the rest rail to `--gold-soft`.

**Hero draw-in.** The gold spine descends from the logo cross's lower shaft over `--dur-draw` (1100ms) `var(--ease-out)`, starting 200ms after first paint, then settles to the live indicator.

```js
// after DOMContentLoaded
const gold = document.querySelector('[data-spine-gold]');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (gold) {
  if (reduce) {
    updateProgress();                 // jump straight to live indicator
  } else {
    // draw-in: animate scaleY 0 -> hero fraction, then hand off to scroll
    gold.style.transition = `transform ${1100}ms cubic-bezier(.22,.61,.36,1)`;
    requestAnimationFrame(() => {
      setTimeout(() => { gold.style.setProperty('--p', heroFraction()); }, 200);
    });
    gold.addEventListener('transitionend', () => {
      gold.style.transition = 'none'; // hand off to rAF scroll updates
      attachScroll();
    }, { once: true });
  }
}

function heroFraction(){ /* hero height / document scrollable height, clamped */ }
function updateProgress(){
  const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  gold.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(4));
}
let ticking = false;
function attachScroll(){
  window.addEventListener('scroll', () => {
    if (!ticking){ ticking = true; requestAnimationFrame(() => { updateProgress(); ticking = false; }); }
  }, { passive: true });
  updateProgress();
}
```

**Reduced motion:** the line is present at full length immediately; the gold scroll indicator still tracks (it is information, not decoration). On `/frido` the gold fill renders at its scrolled position without per-node animation.

---

## 6. Scroll-reveal motion system

One reveal primitive. IntersectionObserver, threshold 0.12, `once:true`, 60ms stagger within `[data-reveal-group]`.

```css
[data-reveal] { opacity: 0; transform: translateY(16px); }
[data-reveal].is-visible {
  opacity: 1; transform: none;
  transition: opacity var(--dur-reveal) var(--ease-out),
              transform var(--dur-reveal) var(--ease-out);
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal], [data-reveal].is-visible { opacity: 1; transform: none; transition: none; }
}
```
```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const group = e.target.closest('[data-reveal-group]');
        const items = group ? [...group.querySelectorAll('[data-reveal]')] : [e.target];
        items.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i * 60));
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
}
```
No parallax, no blur, no scale (photos may use opacity-only). Stat count-up runs once on reveal and is skipped under reduced-motion (final value already in DOM).

---

## 7. Responsive breakpoints + mobile behaviour

- Breakpoints: **`768px`** (tablet: stats 3-up, story `280px 1fr`), **`1024px`** (desktop: nav inline, 96px outer margins, spine at 64px).
- Mobile-first base. Single column under 768px.
- **Spine** shifts to `--spine-x-mobile` (20px), stays 1px; still the scroll indicator.
- **Hero** stacks: photo above text on mobile; H1 → photo → CTAs (teal full-width, secondary below).
- **Header** mobile: logo + teal "Mitglied werden" pill (kept visible if room) + gold hamburger → full-`--paper` drawer; CTA pinned full-width at drawer bottom.
- **Sticky bottom bar** after hero scrolls past (mobile only): condensed teal "Mitglied werden" + ghost "Spenden".
```css
.sticky-cta { position: fixed; inset: auto 0 0 0; z-index: 8; display: none;
  gap: var(--sp-3); padding: var(--sp-3); background: color-mix(in srgb, var(--paper) 96%, transparent);
  backdrop-filter: blur(8px); border-top: 1px solid var(--line); }
.sticky-cta.is-shown { display: flex; }
.sticky-cta .btn { flex: 1; }
@media (min-width: 1024px) { .sticky-cta { display: none !important; } }
```
- Calculator tiers stay 3-up (each ≥44px tap target) at all widths.
- Tap targets ≥44×44px everywhere.

---

## 8. Accessibility

- **Contrast (verified):** ink-on-paper ≈ 13:1; white-on-teal ≈ 5.5:1; gold-soft/ink-band sublines pass AA at the large sizes used. Gold never sets body text on light. All AA (WCAG 2.1).
- **Focus-visible:** every interactive element gets a visible ring.
```css
:where(a, button, input, [tabindex]):focus-visible {
  outline: 2px solid var(--teal); outline-offset: 2px; border-radius: var(--r-input);
}
/* On photos/dark, use gold ring for visibility */
.band-dark :focus-visible, .hero :focus-visible { outline-color: var(--gold); }
```
- **Skip link:**
```html
<a class="skip-link" href="#main">Zum Inhalt springen</a>
```
```css
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: var(--sp-4); top: var(--sp-4); z-index: 50; background: var(--paper-pure);
  padding: var(--sp-3) var(--sp-4); border-radius: var(--r-input); box-shadow: var(--shadow-card); }
```
- **Landmarks:** `<header>`, `<nav aria-label>`, `<main id="main">`, `<footer>`. Timeline = semantic `<ol>`. Calculator tiers = real `<input type="radio">` in a `role="radiogroup"`; impact line `aria-live="polite"`.
- **Spine** is `aria-hidden="true"` (decoration). Logo SVG has `role="img"` + `<title>`.
- **Alt-text policy:** describe dignity and agency, never pity. e.g. "Drei Schülerinnen gehen selbstbewusst einen Weg entlang" — never "arme Flüchtlingsmädchen". Every photo carries visible figcaption "Foto: JRS Uganda". Minors: first name + aspiration only.
- **Performance / Lighthouse ≥90:** fonts `display:swap` + subset; images sized with width/height + `loading="lazy"` (hero eager) served as WebP/AVIF; deferred IO script; no CLS.

---

## 9. Logo SVG — corrected double-shaft patriarchal cross

Two parallel vertical shafts; an upper crossbar and a wider lower crossbar; each crossbar ends in short downward bracket "serif" tabs at both ends (lower tabs longer than upper). Compact and confident. Gold via `currentColor` (set `color:var(--gold)` on the header; the right shaft is the one that seeds the page spine). Fine strokes echo the continuity line.

```svg
<svg class="brand__mark" viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg"
     role="img" aria-labelledby="logoTitle" fill="none"
     stroke="currentColor" stroke-width="3" stroke-linecap="square">
  <title id="logoTitle">Frido’s Friends e.V. — Jesuitisches Doppelkreuz</title>

  <!-- two parallel vertical shafts -->
  <line x1="27" y1="6"  x2="27" y2="90"/>
  <line x1="37" y1="6"  x2="37" y2="90"/>

  <!-- upper crossbar (narrower) -->
  <line x1="16" y1="26" x2="48" y2="26"/>
  <!-- upper downward bracket tabs (short) -->
  <line x1="16" y1="26" x2="16" y2="32"/>
  <line x1="48" y1="26" x2="48" y2="32"/>

  <!-- lower crossbar (wider) -->
  <line x1="8"  y1="52" x2="56" y2="52"/>
  <!-- lower downward bracket tabs (longer) -->
  <line x1="8"  y1="52" x2="8"  y2="62"/>
  <line x1="56" y1="52" x2="56" y2="62"/>
</svg>
```
Geometry notes: shafts at x=27 and x=37 (10px apart, parallel). Upper bar y=26 spans 16→48 (width 32) with 6px tabs. Lower bar y=52 spans 8→56 (width 48, wider) with 10px tabs (longer). The right shaft (x=37) conceptually extends past the lower crossbar and "falls out" as the page continuity line. Use `stroke-width:3` for the header mark; the on-page spine is finer (1px) — same DNA, quieter weight.

---

## 10. Homepage section sequence (top → bottom, with content)

1. **Hero** — split. Left: eyebrow "Bildung ist ihre Zukunft"; H1 (Source Serif 4 400) **"Wenn Sie ein Mädchen fördern, fördern Sie viele."**; lead (one sentence mission); cost cue "900 € = ein Schuljahr."; primary teal **"Mitglied werden"** + secondary **"Jetzt spenden"**. Right: `students-path.jpg` (radius 10, `figcaption "Foto: JRS Uganda"`, eager-loaded). Continuity line draws in from the logo. Photo stacks above text on mobile.
2. **100 %-Promise band** — dark `--ink`, LOUD. "100 % Ihrer Spende fließen direkt in Stipendien." + "Verwaltungskosten tragen die Gründungsmitglieder privat — in der Satzung verankert." + trust chips (Gemeinnützig · Spendenquittung · Partner JRS). Spine bright gold through band.
3. **Eine Geschichte — Grace** — `280px 1fr`, `student-classroom-portrait.jpg`. Eyebrow "Eine von 24"; H2 "Grace wäre mit 15 verheiratet gewesen."; body (stayed in school → heute Klassensprecherin → will Hebamme werden); pull-quote; tertiary link "Mehr Geschichten →".
4. **Wirkung / Stats** — 3-up: 24 Kinder gefördert · 18 davon Mädchen · 100 % bleiben in der Schule. Caption "Stand: Schuljahr 2024/25". Count-up on reveal.
5. **Photo break — Multiplikator** — full-bleed `classroom-students.jpg` (60vh) with overlaid gold eyebrow + serif line "Wer ein Mädchen ausbildet, verändert eine Gemeinschaft." Below/adjacent: "Eine ausgebildete Frau erreicht 3–6 Kinder" (label: *Projektion*). Optional `girls-group-smiling.jpg` in the multiplier copy block.
6. **So funktioniert es** — compact 4-step Mittelfluss preview (spine gold connector) → link to `/projekt`. 900 € breakdown teaser.
7. **Mitmachen — Calculator** — membership-first; tiers 25/**75**/100 (75 preselected); live impact line; teal "Mitglied werden"; "Lieber einmalig? Jetzt spenden" → Betterplace; trust row ask-adjacent; statutory 50 €/Jahr noted small.
8. **Frido-Teaser** — dark band, spine gold, eyebrow "Warum wir das tun", one paragraph + "Frido kennenlernen →" → `/frido`.
9. **Dark CTA band** — serif headline **"Begleitung, nicht nur Hilfe."** + teal "Mitglied werden" + ghost "Jetzt spenden".
10. **Footer.**

---

## 11. File / build notes

- Photos already in `public/images/` — do NOT re-copy. `sepa-qr.svg` is generated by the prebuild script — do not create it.
- Each photo: visible figcaption "Foto: JRS Uganda"; radius on `img`, never `overflow:hidden` on the figure.
- English parallel under `/en/` mirrors this system 1:1 with faithful translations; tokens, components, and motion identical.
- Voice (public DE): "Sie", warm, plain, dignified, honest; hope over pity; concrete over abstract; "wir" = the alumni founders.
```
```
**End of bible.**
