# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Jekyll personal site for **Ali Abid**, deployed via GitHub Pages to `www.thinkingslightly.com` (see `CNAME`). It is the public-facing portfolio + work-history + skills site for a Principal-level technologist. **Audience is senior tech hiring managers, fintech founders, recruiters, and peers — not weekend dev-blog readers.**

## Positioning (read this before editing copy)

The site is deliberately framed as **"Principal Technologist · Architecture, Platforms & Identity"** — broad senior leadership + breadth, *not* IAM-specialist, *not* consultant. User explicitly rejected the consulting framing in favor of technologist/leader. Default to language that signals seniority across disciplines.

- **Don't** lead copy with "IAM" or "Identity" alone — those are *one* of several pillars (alongside architecture, platforms, product engineering). Putting IAM first reads as over-specialization.
- **Don't** reintroduce "consultant," "consulting engagements," or "fractional" framing in headers or CTAs. The hero status pill on /work says "Available for senior technology & leadership roles" — keep that phrasing.
- **Don't** reintroduce or surface the blog: `_posts/` still exists with stale 2021 placeholder content; `/posts/` was deliberately replaced with a "writing temporarily archived" page (`posts.md`), removed from nav, and stripped from the home page. Adding a "Recent Writing" section back, or linking to `/posts/` from About, undoes user-direction work.
- **Use real employer names** (Capital One, Vanguard, JPMorgan Chase). User explicitly chose to name them. "Fortune 100 Bank / Top-10 Asset Manager" anonymization is reserved for *consulting clients with NDAs* — these are employers, public via LinkedIn, not under NDA.
- **Tagline** in `_config.yml` is `Principal Technologist — Architecture, Platforms & Identity`. **Do not** revert to "Senior Software Engineer."

## IAM attribution split — CRITICAL, got swapped twice

The IAM work is split between Vanguard (prior) and Capital One (current) in a specific way. Earlier versions of this site conflated or reversed them. The current correct split:

**Vanguard, Application Engineering Tech Lead, IAM (Mar 2022 – Aug 2024)** — Led the flagship **Okta–SailPoint IIQ integration** covering **30K+ users and 50K+ accounts**. Built **ServiceNow CMDB and Active Directory APIs**. Improved **SDLC, QA automation, and release processes**. Primary technical interface to executive sponsors.

**Capital One, Principal Cybersecurity Engineer (Sep 2024 – Present)** — Continuing **SailPoint IIQ development**. Designing **SOX-aligned certification campaigns**. Built **Google Workspace integration**. Contributing to the firm's **SailPoint ISC migration**.

Career narrative: built deep SailPoint IIQ + Okta expertise + the 30K+/50K+ scale story at **Vanguard**, brought that foundation to **Capital One** where the work is now ISC-migration-flavored + SaaS-identity-extending. The numbers (30K+/50K+) belong to **Vanguard**, not Capital One. Do not propagate them to Capital One.

`resume.txt` at the repo root still reflects the older DOCX framing (puts some of the above at Capital One). The website is the corrected source of truth — if updating resume.txt, follow the website's attribution.

## Commands

```bash
bundle install                    # install gems (first time / after Gemfile change)
bundle exec jekyll serve          # local dev server on http://localhost:4000
bundle exec jekyll build          # one-shot build into _site/
```

No test suite, no linter, no JS toolchain. Sass is compiled by Jekyll itself. There's a pre-existing Sass `@import` deprecation warning at build time — not actionable, just noise.

## Information architecture

```
/                     Home — hero (with "Now" line) → career timeline → products & ventures grid
/work/                Engagements index — 4 cards + "How I lead programs" pillars + contact
/work/capital-one/    Engagement detail (current role)
/work/vanguard-iam/   Engagement detail (Vanguard Tech Lead, IAM)
/work/vanguard-eng/   Engagement detail (Vanguard Senior Full Stack)
/work/jpmorgan/       Engagement detail (JPMorgan, payments)
/skills/              D3 + GSAP interactive radial skill tree (data from _data/skills.yml)
/about/               Full professional bio
/posts/               Placeholder ("writing temporarily archived"). Old _posts/ folder still exists but unsurfaced.
/carpool1/            Product detail pages
/metacurrents/
/wizardroute/
/es-options/
/aoe2-stats/
/jiminez-construction/    NB: a *business venture* (handyman service), not a tech product. Card label is "Business · Home Services."
/options-payoff/      The actual interactive tool (not the marketing page; that's /es-options/)
```

**Nav**: `Home / Work / Skills / About + LinkedIn`. Writing was removed. Adding new nav entries requires editing `_includes/navbar.html`.

**Footer**: name + GitHub aliabiddev + GitHub aliencoded + carpool1.com + metacurrents.com + LinkedIn + copyright. Currently basic; could be polished if time.

## Theme + design system

`Gemfile` declares `jekyll-theme-clean-blog` and `_sass/minima/` contains legacy partials — **neither is used at runtime**. The site renders entirely from local `_layouts/` + `_includes/` + `_sass/styles.scss`. `_includes/header.html` is a vestigial minima header; the live nav is `_includes/navbar.html`.

`_sass/styles.scss` owns the design system: CSS custom properties under `:root`, DM Serif Display + DM Sans typography, and all component CSS. `assets/main.scss` is the Sass entry point and just `@import "styles";`.

**Accent color** is `#4F46E5` (CSS var `--accent`). It propagates to favicon background, hero CTA, theme-color meta, manifest, status pills, etc. If changing brand color, update all five.

## Page-template conventions

### Shared `.proj-*` classes

Bottom of `_sass/styles.scss` defines `.proj-landing`, `.proj-hero`, `.proj-status`, `.proj-section`, `.proj-stack`, `.proj-links`, plus `.proj-status-live/-review/-beta` modifiers. All product and engagement detail pages use these. New landing pages should reuse them, not invent new scoped class names.

Older pages (`options-payoff.html`, `wizardroute.html`, `wizardroute-privacy.html`, `wizardroute-support.html`, `aoe2-stats.html`) still carry their own inline `<style>` blocks with page-scoped classes (`.opts-page`, `.wr-page`, `.aoe-landing`). They work, they just predate the shared system. Migrate opportunistically.

### Home-page card structure

Product/venture cards on `_layouts/home.html` are `<div class="card">` (not `<a>`). Each ends with a `.card-actions` flex row containing two links:
- Primary `.card-link` → internal detail page (with `→` arrow)
- Secondary `.card-link-secondary` → live site / GitHub / etc. (with `↗` for external)

Card layout: `.card-badge` (status pill, top-right) → `.card-icon` (SVG) → `.card-label` (kicker text) → `.card-title` (h3) → `.card-meta` (small line under title, often role or "Updated MM/DD/YYYY") → `.card-desc` → `.card-actions`.

### Career timeline (home-page Selected Engagements section)

Replaced the 4-card engagement grid that previously duplicated `/work`. Uses `.career-timeline` (grid of 4 `.timeline-marker` anchors with a `.timeline-track` horizontal line behind them). On mobile (<720px) it rotates to vertical orientation. Capital One marker has class `.timeline-current` for the pulsing dot animation.

### Hero "Now" line

`<p class="hero-now"><span class="hero-now-label">Now</span> ...</p>` lives between the tagline and action buttons. Pulsing accent dot via `now-pulse` keyframes. Edit the sentence every couple months — the freshness signal is the whole point. CSS lives next to `.hero-sub` in `_sass/styles.scss`.

### Status badges

`.card-badge` variants on home cards: `badge-live` (green), `badge-review` (amber), `badge-beta` (blue). Same states mirrored on landing pages as `.proj-status-live/-review/-beta`. When an app's lifecycle changes, update both.

### Card "Updated MM/DD/YYYY" metadata

Some cards still carry `<p class="card-meta">Updated MM/DD/YYYY</p>`. Format is numeric US. Date = last meaningful commit in source repo. Manual bump only — no automation.

### Engagement-card distinction

`.card-engagement` (left-accent border, display-font company name as title, role as meta) visually distinct from `.card-accent` (product/venture cards with purple-tinted background). Currently the home-page Selected Engagements is now the *timeline* rather than these cards; `.card-engagement` still appears on `/work` index.

## Skill tree (`/skills`)

Interactive radial tree fed by `_data/skills.yml` (single source of truth — 11 categories, 75+ nodes across 3-4 depths). Page is `skills.html`; viz code is `assets/js/skill-tree.js`. D3 v7 + GSAP 3 loaded from jsDelivr CDN (~120KB total).

**Layout knobs** at top of `skill-tree.js`:
- `RADII = { root: 0, cat: 260, skill: 520, sub: 740 }` — distance per depth
- `STAGGER_SKILL = [0, 130, 50, 180, 90, 220]` and `STAGGER_SUB = [0, 90, 40, 130]` — sibling radius offsets so pills don't collide
- `viewBox = 2000x2000` — pills extend far from center; users zoom to read

Adding/removing/renaming a skill = edit YAML, rebuild, done. Code never needs touching. Labels in the YAML are intentionally trimmed (e.g. `Asset Mgmt`, `Anthropic / OpenAI`, `CI/CD`) — avoid restoring full names unless also bumping stagger.

Interactions: scroll/pinch = zoom (D3 default), drag = pan, click a node = GSAP-animated camera focus + popover. Esc or "Reset view" restores.

## Favicon

`favicon.svg` at repo root is the new primary favicon: 64×64 viewBox, accent-purple rounded square with a path-based serif "A" (not text — so it renders identically across browsers/OSes without a web-font dependency). Wired via `_includes/head.html` with PNG fallbacks. `site.webmanifest` updated with name fields + brand colors.

## Resume

`resume.txt` at repo root, plain text, **excluded from the build** via `_config.yml`'s `exclude:` list — so it's git-tracked but never published. Anyone who needs the resume gets it via GitHub or by asking. If updating, follow the website's IAM attribution (see "IAM attribution split" above), not the older DOCX framing.

## Site-wide front matter

- `_config.yml`: `author: Ali Abid`, `title: Thinking Slightly`, `tagline: Principal Technologist — Architecture, Platforms & Identity`
- `site.github_username` (aliabiddev) vs `site.github_username2` (aliencoded) — two distinct GitHub profiles, surfaced as small social icons in hero + in footer
- `sitemap: false` on pages that shouldn't appear in SEO (wizardroute support/privacy, the `/posts/` placeholder)

## Reveal-on-scroll

Any element with class `.reveal` fades in via IntersectionObserver in `_includes/scripts.html` (adds `.visible`). Use it for new sections to match existing motion.

## Sibling project repos (where the source actually lives)

The Jekyll site at this folder hosts *landing pages* for projects whose **source code lives in sibling folders** under `/Users/ali/alidev/`:

- `carpooler1/` — Carpool1 Flutter app. Bundle `com.carpool1.carpool1`. Has its own detailed `CLAUDE.md`. Companion `carpool1-landing/` is the static carpool1.com site.
- `aliencoded.github.io/` — MetaCurrents source (CNAME = metacurrents.com).
- `running-shooting-clone/` — Unity 6 iOS game "Wizard Route" (bundle `com.aliabid.wizardroute`).
- `aoe2-stats-mod/` — Electron overlay for Age of Empires II: DE. **Currently closed source**; open-source release planned. Don't claim it's open source on the site — that was an earlier error.
- `flappy-bird-clone/` — Swift + SpriteKit, not currently surfaced on the site.

For accurate "last touched" dates, `git log -1 --format='%ad' --date=format:'%Y-%m-%d'` inside each repo.

## Things NOT to do (lessons from prior sessions)

- **Don't push the consulting framing.** User chose Technologist/Leader. Reverting headers, hero copy, or page titles to consulting language will need to be undone.
- **Don't reintroduce a "Recent Writing" home section or link to `/posts/` from About.** Blog is deliberately archived.
- **Don't anonymize Capital One / Vanguard / JPMorgan.** They're employers, not NDA clients.
- **Don't put metrics (30K+, 50K+, 80%+, 13yrs) in the hero as a strip.** It was tried twice and removed both times — feels too marketing-y and conflates achievements from different roles. Metrics belong on engagement detail pages where they're tied to a specific role.
- **Don't conflate Vanguard IAM and Capital One IAM work.** See "IAM attribution split" — got reversed twice. The numbers and the Okta-SailPoint integration story are Vanguard; the ISC migration and Google Workspace are Capital One.
- **Don't reintroduce GitHub profile cards in the projects grid.** They're profiles, not products — moved to small icons in hero and footer-links.
- **Don't expand the skill tree without a clear reason.** It's already 11 categories / 75+ nodes; staggered to prevent overlap. More skills = more crowding.
- **Don't add `Side Projects` framing back.** It's `Products & Ventures` — confident framing for shipped work + an operating business.
- **Don't claim AoE2 Stats Overlay is open source.** It's closed for now; open-source release planned.

## Site goal in one line

Get a recruiter, hiring manager, fintech founder, or peer to land on the home page, scan in 60 seconds, and walk away with: *"Principal-level technologist with deep Fortune 100 history, ships products independently, runs a business on the side, ready for senior roles."* Every edit should reinforce that arc.
