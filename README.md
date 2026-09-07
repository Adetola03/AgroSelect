# AgroSelect

**Choose better. Farm smarter.**

Crop comparison for smallholder farmers in North-West Nigeria. A farmer enters
their state, plot size and budget, picks the crops they are weighing, and gets a
ranked comparison — cost, expected harvest, revenue and indicative return —
scaled to their own farm.

Every figure comes from the **NAERLS Agricultural Performance Survey of the 2024
Wet Season in Nigeria**, using North-West values, with July 2024 market prices.
Nothing is modelled or estimated. Where the survey has no comparable North-West
price, the site prints **Unavailable** rather than inventing a number.

---

## Contents

1. [Quick start](#quick-start)
2. [Pages](#pages)
3. [Project structure](#project-structure)
4. [What the rebuild changed, and why](#what-the-rebuild-changed-and-why)
5. [Design principles](#design-principles)
6. [The brand system](#the-brand-system)
7. [The design system](#the-design-system)
8. [Data model](#data-model)
9. [The comparison engine](#the-comparison-engine)
10. [Component notes](#component-notes)
11. [Corrections log](#corrections-log)
12. [Testing and verification](#testing-and-verification)
13. [Accessibility](#accessibility)
14. [Print](#print)
15. [Privacy](#privacy)
16. [Before you deploy](#before-you-deploy)
17. [Maintenance](#maintenance)
18. [Browser support](#browser-support)

---

## Quick start

A static site with no build step and no dependencies. Serve the directory:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Deploy by uploading the directory to any static host (Netlify, GitHub Pages,
Cloudflare Pages, Nginx). There is no server-side component.

---

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — the pitch, a worked example, crop overview, evidence |
| `problem.html` | Why the crop decision is made blind, and what it costs |
| `how-it-works.html` | The method, every calculation in full, and the limits |
| `crops.html` | All eight crops: figures, working, and sources |
| `get-started.html` | The six-question farm form |
| `results.html` | The ranked comparison (reads the form's answers) |
| `contact.html` | Contact form and FAQ |
| `404.html` | Not-found page |

---

## Project structure

```
css/agroselect.css   Whole design system — tokens, components, print styles
js/crops.js          The dataset. Single source of truth for every figure.
js/site.js           Nav, form validation, the comparison engine, rendering
assets/              Logo lockups, icons, social card
favicon.svg          Drawn frond mark
site.webmanifest     Home-screen install metadata
robots.txt           Allows everything except results.html
sitemap.xml          Six public URLs
```

---

## What the rebuild changed, and why

The starting point was five tracked files plus four untracked ones. These were
the problems, and what was done about each.

### Inherited defects

**`index.html` was not a home page.** Its `<title>` read *"Get Started |
AgroSelect"* and its body was a copy of the farm form. There was no landing
page at all. → Written from scratch as a proper home page; the form lives only
at `get-started.html`.

**The form led nowhere.** `get-started.html` ended in a submit button with no
handler and no destination. A farmer could fill in every field and receive
nothing. This was the single largest gap: the product's entire payoff was
missing. → Built `results.html` and the comparison engine behind it.

**Two navigation links pointed at files that did not exist.** The header linked
to `problem.html` and `how-it-works.html`; neither was in the repository. →
Both written.

**The logo `src` was wrong.** `get-started.html` requested
`assets/Agroselect%20logo.jpg`; the file on disk is `.jpeg`. The header
rendered a broken image. → Replaced with generated PNG lockups referenced by
correct paths, verified by an automated asset check.

**Two untracked pages referenced a file that was never committed.** Both
`index (1).html` and `agroselector-crop-details.html` loaded `AGS-logo.jpeg`,
which does not exist anywhere in the project. → Both pages superseded and
removed.

**Three competing stylesheets.** `brand.css` (root), `css/brand.css` and
`agroselector-detail.css` each redefined the same brand variables with
different names (`--brand` vs `--color-primary-500`), different spacing scales
(`--s1..--s6` vs `--space-4..--space-64`) and different radii. A change to the
brand meant editing three files and hoping. → Consolidated into one
`css/agroselect.css`.

**Three different product names.** "AgroSelect", "AgroSelector" and "Agro
Select" all appeared, sometimes on the same screen. → Standardised on
**AgroSelect** everywhere.

**A duplicate page file.** `index (1).html` was a contact page with a filename
that would break on most static hosts (space and parentheses in the URL). →
Replaced by `contact.html`.

**Crop data was hard-coded in markup.** All eight crops' figures existed only as
HTML in `agroselector-crop-details.html`, so nothing else could use them and a
correction meant hand-editing dozens of `<strong>` tags. → Extracted to
`js/crops.js`; the crops page is generated from it.

### What was added

- `results.html` and the comparison engine — the missing payoff
- `problem.html`, `how-it-works.html`, `contact.html`, `404.html`
- A real design system with tokens, components and a print stylesheet
- Generated brand assets: light and dark logo lockups, favicons, social card
- Form validation with an accessible error summary
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, canonical and Open Graph tags
- Automated tests for the engine, the form flow and page structure

---

## Design principles

These are the rules the rebuild was held to. They are written down because they
explain nearly every specific decision below.

### 1. Derive the brand from the artefact, don't invent it

The logo was the only brand input that existed. Rather than guessing a green,
the logo's pixels were sampled: the wordmark green is exactly `rgb(40, 187, 54)`
= `#28BB36`, on pure black with pure white. That green became `--green` and
everything else was built around it. The site cannot drift from the logo,
because the logo *is* the palette.

### 2. Let the logo sit on its native ground

The logo is drawn on black. Placing it on a pale header would have meant either
a black rectangle floating in a light bar, or recolouring the mark. Instead the
site's chrome — header, footer, hero, CTA bands — is near-black (`--ink`,
`#0C110D`), so the lockup sits on the ground it was designed for. Content
surfaces are warm paper. The result is a dark/light rhythm that is a
consequence of the brand rather than a decoration applied to it.

### 3. This is a numbers product, so typography serves numbers

- **Tabular figures everywhere.** `font-variant-numeric: tabular-nums` on every
  table cell, metric and stat, so ₦1,157,018 and ₦2,436,569 align digit for
  digit down a column. In a comparison tool, misaligned numerals are a
  usability defect, not a typographic nicety.
- **Space Grotesk for display and figures, Inter for reading.** Space Grotesk
  has the geometric confidence the headlines need and unambiguous numerals;
  Inter is a workhorse for body copy at small sizes on cheap screens.
- **A fluid scale.** Seven `clamp()` steps (`--step--1` to `--step-5`) so type
  scales with the viewport without breakpoint jumps.

### 4. Honesty is a design constraint, not a disclaimer

The product's value is that its numbers are real. So:

- Missing data is shown as **Unavailable**, never filled with a national
  average, an interpolation, or a plausible-looking guess. Two of the eight
  crops have no comparable North-West price, and the site says so in the table,
  on the crop page, in the results, and in the form's crop picker.
- **Sourced figures and our own guidance are kept visibly separate.** The
  dataset marks which is which, and How It Works carries a table stating, per
  figure, where it comes from and whether it affects the ranking.
- Per-hectare figures are used **as published** and multiplied by the farmer's
  area, rather than recomputed from price × yield. Recomputing would produce
  numbers that disagree with the source report by small rounding amounts, and a
  farmer who checks would find the site wrong.
- The limits are given a full section on How It Works, not a footnote.

### 5. Answer the question that was actually asked

A farmer is not asking "what is the price of maize". They are asking "what
should I plant". So the ranking is by **indicative return** — what is left after
the production bill — and every crop is checked against the budget they entered.
The highest return they cannot afford is not an answer, so the winner is the
best crop their money actually covers, and anything over budget is labelled with
how much it is over by.

**Return per ₦1 spent** is shown alongside, because when a budget is the binding
constraint the biggest total return is often the wrong target.

### 6. Assume a cheap phone on a metered connection

- No framework, no bundler, no runtime dependencies. Three static files carry
  the whole site: one stylesheet, two small scripts.
- No web fonts blocking render beyond a single Google Fonts request with
  `display=swap` and a preconnect.
- Images are the logo and nothing else. No hero photography, no icon library —
  every icon is inline SVG, a few hundred bytes each.
- Touch targets are at least 48px; form controls are 52px.

### 7. Progressive enhancement, not JavaScript-dependence

Every page is readable and navigable with JavaScript disabled. The crops page,
including every figure, is static HTML. Only the comparison itself needs JS,
and where JS renders content there is a `<noscript>` route to the static
equivalent. The mobile menu, form validation and results are enhancements
layered on working markup.

### 8. The output has to survive leaving the screen

A farmer may take the comparison to a market, a cooperative or an extension
officer. So there is a real print stylesheet: chrome hidden, dark panels
inverted to bordered white, the brand mark printed in its ink variant, and
tables reflowed to the page rather than clipped.

### 9. Never show a number the reader cannot trace

Every crop section shows its own working —
`Revenue = 2.50 MT/ha (2,500 kg) × ₦858/kg ≈ ₦2,147,684/ha` — and How It Works
lists all four calculations in full. The stated goal is that any figure on the
site can be checked with a calculator.

### 10. One source of truth

`js/crops.js` holds the data. The home page crop cards, the crops-page
comparison table and the results engine all read from it, and the static crop
sections in `crops.html` were generated from it by script. A figure exists in
one place.

---

## The brand system

### Colour

Sampled from `assets/Agroselect logo.jpeg`:

| Token | Value | Role |
| --- | --- | --- |
| `--green` | `#28BB36` | Sampled from the logo mark. Primary. |
| `--green-bright` | `#45D954` | Accents on dark grounds |
| `--green-600/700/800` | `#1E9C2A` / `#16761F` / `#0F5416` | Green text on paper, at accessible contrast |
| `--green-tint` / `-2` | `#EAF8EC` / `#D4F1D9` | Tinted grounds |
| `--ink` | `#0C110D` | Chrome, hero, footer — the logo's ground |
| `--paper` / `--paper-2` | `#FAFAF7` / `#F3F3EE` | Reading surfaces, warm rather than clinical |
| `--amber` | `#C97A09` | Caution, over-budget, unavailable |
| `--red` | `#B3261E` | Validation errors only |

Green is never used for warnings and amber is never used for success — the two
signals stay separate so a farmer can read status at a glance.

### The logo assets

The source file is a 1280×720 JPEG of the wordmark on solid black. Five
production assets were generated from it:

**`logo-dark.png` / `@2x`** — the black background removed by treating
luminance as an alpha channel and unpremultiplying the colour, giving clean
anti-aliased edges. For dark surfaces (header, footer).

**`logo-light.png` / `@2x`** — for paper and print. Built by classifying each
pixel as green or neutral by saturation and hue, then painting the exact brand
values: green stays `#28BB36`, white becomes ink. *(The first attempt reused
the unpremultiplied output, which brightened the green to a pale mint and
turned the frond grey. See the corrections log.)*

**`favicon.svg`** — a drawn frond mark, not a crop of the logo. A raster crop of
the wordmark is illegible at 16–32px. The mark is a quadratic Bézier stem with
27 pairs of barbs generated along it, raked toward the tip, with a sine length
profile so it tapers naturally at both ends — it reads as a frond at 256px and
as a clean leaf silhouette at 32px.

**`favicon.ico`, `favicon-32.png`, `favicon-512.png`, `apple-touch-icon.png`** —
rasterised from the SVG so every size is consistent.

**`og-image.jpg`** — 1200×630, the dark lockup centred on `--ink`.

`assets/Agroselect logo.jpeg` is kept as the master source. It is not referenced
by any page.

### Typography

- **Display:** Space Grotesk 500/600/700
- **Body:** Inter 400/500/550/600/650
- Headings carry `letter-spacing: -.02em` (`-.035em` on the hero) and
  `text-wrap: balance`; body copy uses `text-wrap: pretty`

### Spacing and shape

An 8-based scale (`--s-1: 4px` through `--s-10: 128px`), four radii
(`6/10/16/24px` plus a pill), three shadows, and two easing durations. Section
padding is fluid: `clamp(56px, 8vw, 104px)`.

---

## The design system

`css/agroselect.css` is organised in 26 numbered sections, tokens first:

```
 1. Tokens              10. Stats            19. Page header
 2. Reset & base        11. Steps            20. Sub-nav
 3. Layout primitives   12. Crop cards       21. Crop detail
 4. Section headings    13. Badges           22. Results
 5. Buttons             14. Metrics panel    22b. Claim panel
 6. Header              15. Data lists       23. CTA band
 7. Hero                16. Notices          24. Footer
 8. Hero preview card   17. Tables           25. Utilities
 9. Cards               18. Forms            26. Print
```

Notable decisions:

- **`* { margin: 0 }`** — all vertical rhythm is owned by explicit rules, so
  spacing is never a surprise inherited from a user-agent stylesheet. The cost
  is that every context must define its own spacing; `.prose` and `.stack` do
  this for flowing content.
- **Number spinners are suppressed** on the farm-size and budget inputs.
  Spinner arrows sit exactly where a thumb lands on a phone and silently change
  the value.
- **`:has()`** styles selected crop tiles. Where it is unsupported the tile
  simply loses its green fill; nothing breaks.
- **Inline styles are effectively banned.** The only six left in the HTML are
  progress-bar widths (four on the home page, two on the problem page), which
  are genuinely per-element data. Everything else is a class.

---

## Data model

`js/crops.js` is the only place figures live. Each crop carries two kinds of
field, deliberately kept apart:

**Sourced fields** — from NAERLS. These drive the rankings.

```
pricePerKg    yieldMtHa    costPerHa    revenuePerHa    returnPerHa
planting      harvest      risks
```

`pricePerKg: null` means the survey has no comparable North-West figure;
`revenuePerHa` and `returnPerHa` are then `null` too, and every view prints
**Unavailable**.

**Guidance fields** — written by us, as plain-language context.

```
water    startupLoad    notes    blurb    shortName
```

These never affect a number or a ranking. The How It Works page states which is
which in a table, so a reader can tell our words from the survey's figures.

`shortName` exists for one reason: "Sesame (Benniseed)" wraps to two lines on a
card and knocks its figures out of alignment with the other seven. Cards use
the short name; the crop page uses the full one.

---

## The comparison engine

`compare()` in `js/site.js`. All four calculations, in full:

```
expected harvest   = yieldMtHa × 1000 × hectares
indicative revenue = revenuePerHa × hectares
indicative return  = returnPerHa  × hectares
return per ₦1      = return ÷ cost
```

Ranking rules:

1. Priced crops sort before unpriced ones.
2. Priced crops sort by total indicative return, descending.
3. Unpriced crops sort by cost, ascending — they cannot be ranked on return, so
   the cheapest is listed first as the least committing.
4. The **winner** is the highest-return crop the farmer's budget actually
   covers, not the highest-return crop overall.

Three outcomes are handled explicitly, each with its own copy:

- **Normal** — a winner, with the margin over the next affordable option.
- **Budget too small for anything** — names the cheapest option, the shortfall,
  and the area the budget *would* cover.
- **Only unpriced crops selected** — explains why no ranking is possible and
  names the six priced crops.

---

## Component notes

### The claim panel (`.claim-panel`)

The "what this is / what this is not" pair on the home page. It started as two
stacked generic alert boxes and was rebuilt as one object with two faces:

- **A shared frame with a hairline seam**, so it reads as a single honest
  statement rather than two unrelated warnings.
- **Watermark glyphs that carry meaning.** A seedling breaking ground for what
  the tool *is*; a rain cloud for what it *is not* — the cloud is literally the
  thing the figures cannot see. Both in the accent colour at 14–17% opacity,
  behind the text on a negative z-index.
- **Accent spines** — a 4px bar the full height of each half, replacing the old
  left-border-on-a-tinted-box pattern.
- **Display-font overlines** for the labels, matching the site's eyebrows,
  instead of bold text run inline with the body. The emphasis moved to the
  claim itself: *"a like-for-like comparison"* / *"A promise."*
- **A directional tint** — a soft diagonal gradient fading out from the spine,
  rather than a flat tinted block.
- **A reserved 148px gutter** on desktop so text always clears the watermark.
  Below 560px that gutter costs more than it is worth, so the glyph bleeds off
  the right edge at lower opacity and the text runs full width — this took the
  second half from six lines to four on a 390px screen.
- **A print fallback**: tints and watermarks drop out, the spine and seam carry
  the distinction on a mono printer.

### The hero preview card

The home page hero shows a worked example on 2 ha. It is rendered by
`js/site.js` from the same dataset and the same arithmetic the results page
uses, so the marketing claim on the home page cannot drift from what the
product actually outputs. Static fallback markup is in the HTML for no-JS.

### Results table (`.data-compact`)

The results comparison carries seven columns against the crops page's six, so it
gets a variant with tighter padding and a smaller type size. Headers are
shortened (`Harvest`, `Cost`, `Revenue`, `Return`, `Per ₦1`, `Budget`) with the
full meaning carried by the visually-hidden `<caption>` and the caption below
the table.

---

## Corrections log

Every defect found and fixed, split by origin. The second list is included
because it is the more useful record: these are mistakes made *during* this
rebuild and caught by review or testing before delivery.

### Inherited defects

Covered in [What the rebuild changed](#what-the-rebuild-changed-and-why):
`index.html` was a duplicate form page; the form had no destination; two nav
links were dead; the logo `src` had the wrong extension; two pages referenced a
non-existent `AGS-logo.jpeg`; three stylesheets competed; the product had three
names; a filename contained a space and parentheses; crop data was locked in
markup.

### Defects introduced during the rebuild, and caught

**1 · Social meta delimiter collision.** The page template used
`<!--SOCIAL:title|description|path-->`, but titles contain a pipe
("Contact | AgroSelect"). Every canonical URL and OG tag on seven pages came out
corrupted — `<link rel="canonical" href="https://agroselect.ng/Questions,
corrections...|contact.html">`. Fixed by rewriting all seven meta blocks from a
table and switching the template delimiter to `~`.

**2 · `.eyebrow` specificity collision — sitewide.** `.section-head p`
(specificity 0,1,1) matched the `<p class="eyebrow">` inside it and beat
`.eyebrow` (0,1,0), rendering every section eyebrow at **21px instead of 12px**
and, in dark sections, stripping its green. Found by measuring computed styles
in a headless browser rather than by eye. Fixed with `:not(.eyebrow)` on
`.section-head p`, `.section-dark p`, `.cta-band p` and `.page-head p`.

**3 · `.prose` headings had no space beneath them.** With `* { margin: 0 }` and
rules that only handled `p + p`, body copy butted directly against every `<h2>`.
Separately, the first `h2` after an eyebrow inherited a 64px top margin,
producing an 80px gap. Fixed by replacing the ruleset with `.prose > * + *`,
`.prose h2 + *`, `.prose h3 + *` and `.prose .eyebrow + h2 { margin-top: 0 }`.

**4 · Results table overflowed its container.** Seven columns exceeded the
1120px wrap, clipping the budget-status column on desktop. Fixed with the
`.data-compact` variant and shortened headers.

**5 · Print silently clipped the table.** `.table-scroll { overflow-x: auto }`
cannot scroll on paper, so the printed comparison lost its right-hand columns
entirely — the farmer would carry a page with the budget check missing. Fixed
in the print block: `overflow: visible`, `min-width: 0`, reflowed padding,
`white-space: normal`, non-sticky `thead`, wrapping badges.

**6 · An empty grid cell printed as a grey slab.** `.result-summary` used the
"1px gap over a line-coloured container" trick. With five auto-fit items, a
narrower page wrapped them and the empty half of the last row showed the
container background as a large grey block. Fixed by making the container white
and ringing each cell with `box-shadow: 0 0 0 1px var(--line)`.

**7 · Malformed colour token.** `--ink-700: #24312727` — eight hex digits, a
typo that silently parsed as an alpha colour. Corrected to `#243127`.

**8 · The light logo variant was washed out.** Generating it by unpremultiplying
the black background brightened the wordmark green to a pale mint and turned
the frond grey. Rebuilt by classifying pixels by saturation and hue and painting
the exact brand values.

**9 · Sesame card broke the grid's alignment.** "Sesame (Benniseed)" wrapped to
two lines, pushing that card's figures below its siblings'. Fixed by adding
`shortName` to the dataset and using it on cards only.

**10 · Contact page columns floated mid-height.** `.hero-grid` centres its
columns, which left the short sidebar hovering beside the tall form. Added
`.hero-grid.align-start`.

**11 · Formula highlight lost to a specificity regression.** After refactoring
the How It Works formula cards out of inline styles, `.formula-card p strong`
(0,2,1) beat `.formula strong` (0,2,0) and killed the green on every result
term. Caught on visual re-check. Fixed with
`.formula-card p:not(.formula) strong`.

**12 · Dead space between hero and stat strip.** The hero's 128px bottom padding
plus the stat band's 64px top padding left ~192px of empty black on the same
ground. Added `.hero + .section-dark { padding-top: 0 }`.

**13 · Hero headline broke into four ragged lines.** `--step-5`'s 4.75rem
maximum was too large for the column. Reduced to
`clamp(2.5rem, 1.85rem + 3.1vw, 4.25rem)`, giving three balanced lines.

**14 · Inline styles scattered through the markup.** The How It Works formula
cards carried a dozen inline declarations. Refactored into `.formula-card` /
`.formula` components, plus `.mt-3`, `.mb-4`, `.mb-5` and `.icon-inline`
utilities for the stragglers. Only genuinely dynamic values remain inline.

**15 · Orphaned assets.** `favicon-512.png` and both `logo-light` files were
generated but unreferenced. Rather than delete them: `favicon-512.png` was
wired into a new `site.webmanifest`, and the light lockup became a print-only
brand mark at the top of `results.html` — so a printed comparison carries the
mark, which the hidden dark header could not provide. `assets/mark.svg` was an
exact duplicate of `favicon.svg` and was deleted.

**16 · Claim panel refinements.** During the redesign: watermarks were initially
clipped mid-leaf and read as a mistake rather than a bleed (repositioned inside
the panel); body text then collided with them (a 148px gutter reserved); that
gutter squeezed phone text to six lines (below 560px the glyph now bleeds off
the edge at lower opacity and the text runs full width).

---

## Testing and verification

No test framework is installed; the checks below were run against the built site
with Node and headless Chromium and can be re-run the same way.

**Engine unit tests (Node, DOM-shimmed).** Normal ranking; over-budget flagging;
unpriced crops sorting last; per-hectare scaling; no-affordable-crop path;
`affordableHa` arithmetic; unpriced-only selection; fractional hectares;
single-crop selection; unknown crop ids dropped; currency formatting; null →
"Unavailable"; return-per-naira. **All passing.**

**Form flow (headless browser, driving the real page).** Empty submit is
blocked with no navigation; the error summary appears with all five errors; the
correct field and fieldset are marked; the live crop count updates; errors clear
as they are fixed; a valid submit persists typed values with correct types
(`1.5` as a number, not a string), navigates to `results.html`, renders the
right winner, the right row count, and hides the empty state. **17 assertions
passing.**

**Navigation and rendering.** Menu opens and closes, `aria-expanded` tracks it,
Escape and outside-click close it, the toggle appears below 900px, the hero
preview renders 4 rows from data, the crop grid renders 8 cards, the footer year
is set, and `results.html` shows its empty state when there are no answers.
**11 assertions passing.**

**Structural audit across all 8 pages.** Dead anchors, cross-page fragment
targets, missing files, missing assets (including every `srcset` candidate),
`<img>` without `alt`, `<h1>` count, `lang`, `<title>`, meta description,
viewport, manifest link, skip link. **Clean.**

**Data/page consistency.** Every crop's cost, revenue and return string in
`js/crops.js` is asserted present in `crops.html`, and every crop has a matching
section id. **Clean** — this is the check that catches the generated page
drifting from the dataset.

**Console errors.** All 8 pages loaded in headless Chromium. **No errors.**

**Print.** `results.html` rendered to PDF and inspected page by page — confirmed
the brand mark prints, the dark winner card inverts legibly, all seven table
columns survive, and no grey slab appears.

---

## Accessibility

- Skip link to `#main` on every page
- Visible `:focus-visible` rings, 3px in brand green with a 2px offset
- Every form control labelled; help text wired with `aria-describedby`
- An error summary with `role="alert"` that takes focus on a failed submit and
  links to each offending field
- `aria-current="page"` on the active nav item
- Mobile menu is keyboard operable and closes on Escape, returning focus to the
  toggle
- `aria-live="polite"` on the crop counter
- Visually-hidden `<caption>` on every data table
- Decorative SVG marked `aria-hidden`; the logo carries a real `alt`
- `prefers-reduced-motion` honoured — all transitions collapse to 0.01ms
- Touch targets ≥48px; form controls 52px
- Colour is never the only signal: over-budget states carry text, not just amber

---

## Print

The comparison is meant to leave the screen. `@media print` hides the header,
footer, sub-nav, CTA band and buttons; prints the AgroSelect wordmark in its ink
variant at the top of the results; inverts the dark winner card to a bordered
white panel; reflows wide tables so no column is lost; expands external link
hrefs after their text; and prevents cards and metric panels from breaking
across pages.

---

## Privacy

There is no account, no back end and no analytics. Form answers are held in
`sessionStorage` so the farmer can move between the questions and the results,
and are cleared when the tab closes. Storage access is wrapped in `try/catch`
so private browsing modes degrade rather than break. The contact form opens the
visitor's mail client — wire it to a real endpoint if you add a back end.

---

## Before you deploy

- [ ] Replace `https://agroselect.ng` in the `<link rel="canonical">` and
      `og:`/`twitter:` tags of each page, in `robots.txt` and in `sitemap.xml`
      with the real domain.
- [ ] Confirm `agroselect25@gmail.com` on `contact.html` is the address you want
      public.
- [ ] Point the contact form at a real endpoint if you want submissions to reach
      you without the visitor's mail client.
- [ ] Re-check `sitemap.xml`'s `lastmod` dates.

---

## Maintenance

**To update figures for a new survey year:** edit `js/crops.js`. The home page
crop cards, the crops-page comparison table and the whole results engine read
from it directly.

> ⚠️ The static crop sections in `crops.html` were generated from `js/crops.js`.
> If you change a figure, update the matching section in `crops.html` too, or
> the server-rendered copy will disagree with the data file. The
> data/page consistency check described above catches this.

**To change the brand:** edit the tokens at the top of `css/agroselect.css`.
Nothing hard-codes a colour below the token block.

**To add a page:** copy the `<head>`, header and footer from an existing page —
they are identical across all eight by design — and update the nav's
`aria-current`, the breadcrumb, the title, the description and the canonical URL.

---

## Browser support

Modern evergreen browsers, degrading safely on older ones. The site is readable
and navigable with JavaScript disabled; the comparison itself needs JS. Layout
uses CSS Grid, custom properties and `:has()` — where `:has()` is missing,
selected crop tiles simply lose their green fill.

---

## Licence

Figures are © NAERLS and reproduced for comparison. See
[naerls.gov.ng/reports](https://naerls.gov.ng/reports/).
