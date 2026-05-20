# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Jekyll personal site for Ali Abid, deployed via GitHub Pages to `www.thinkingslightly.com` (see `CNAME`). Contains the portfolio landing page, a blog ("Thinking Slightly"), and a few standalone HTML tools/support pages.

## Commands

```bash
bundle install                    # install gems (first time / after Gemfile change)
bundle exec jekyll serve          # local dev server on http://localhost:4000 with live reload
bundle exec jekyll serve --drafts # also render _drafts/
bundle exec jekyll build          # one-shot build into _site/
```

There is no test suite, linter, or JS toolchain — Sass is compiled by Jekyll itself.

## Architecture notes

**Theme situation is non-obvious.** `Gemfile` declares `jekyll-theme-clean-blog` and `_sass/minima/` contains legacy minima partials, but **neither is actually used at runtime**. The site renders entirely from the local `_layouts/` + `_includes/` + `_sass/styles.scss`. `_includes/header.html` is a vestigial minima header; the live nav is `_includes/navbar.html` (pulled in by `_layouts/default.html`). When restyling, edit `_sass/styles.scss` — it owns the design system (CSS custom properties under `:root`, DM Serif Display + DM Sans typography). `assets/main.scss` is the Sass entry point and just `@import "styles";`.

**Layout chain.** Everything ultimately wraps `_layouts/default.html`, which composes `head` → `navbar` → `{{ content }}` → `footer` → `scripts` → `google-analytics`. `home.html` is the landing page (hardcoded project cards + 5 most recent posts). `page.html` is the generic content wrapper. `post.html` adds post meta, prev/next nav, and uses `_includes/read_time.html`.

**Posts use a custom excerpt marker.** `_config.yml` sets `excerpt_separator: <!-- excerpt-end -->` — post summaries on the home/posts pages cut at that marker, not at the first paragraph. Honor this when authoring or editing posts in `_posts/`.

**Standalone HTML pages at repo root** fall into two camps. The older pages (`options-payoff.html`, `wizardroute.html`, `wizardroute-privacy.html`, `wizardroute-support.html`, `aoe2-stats.html`) carry large inline `<style>` blocks scoped to a page-specific class (`.opts-page`, `.wr-page`, `.wr-landing`, `.aoe-landing`). The newer landings (`carpool1.html`, `metacurrents.html`, `es-options.html`) use the **shared `.proj-*` classes** defined at the bottom of `_sass/styles.scss` (`.proj-landing`, `.proj-hero`, `.proj-status`, `.proj-section`, `.proj-stack`, `.proj-links`, plus `.proj-status-live/-review/-beta` modifiers) — no inline styles needed. Prefer the shared classes for any new landing page; the older inline-style pages can be migrated opportunistically. All of them reuse the design tokens (`var(--ink)`, `var(--nav-h)`, etc.) so changing those tokens cascades site-wide. `options-payoff.html` is a self-contained ES futures options payoff calculator — no backend.

**App landing convention.** For each hosted side-project app, the root has a triplet: `<app>.html` (landing, e.g. `wizardroute.html` → `/wizardroute/`), `<app>-privacy.html`, and `<app>-support.html`. The privacy/support pages set `sitemap: false`; the landing page is the visible front door and is linked from the home-page card. App Store Connect uses the privacy + support URLs as the official marketing links — do not rename or move them without updating the App Store Connect listings. Web-only projects (Carpool1, MetaCurrents, ES Options) only need the landing page, no privacy/support stubs.

**Project status badges.** Cards on `_layouts/home.html` carry a status pill via `<span class="card-badge badge-live">` (or `badge-review`, `badge-beta`). Styles live in `_sass/styles.scss` under `.card-badge`. The same status states are mirrored on landing pages via `.proj-status-live/-review/-beta` on `<span class="proj-status">`. Update both when an app's lifecycle changes.

**Home-page card structure.** Project cards on `_layouts/home.html` are `<div class="card">` (not `<a>`) and end with a `.card-actions` flex container holding two links: a primary `.card-link` pointing to the internal project landing page, and a secondary `.card-link-secondary` pointing to the live app (external) — `↗` for external, `→` for internal. The GitHub profile cards remain single-link `<a class="card">` anchors because they only have one destination. `a.card { cursor: pointer; }` is scoped just to that anchor variant.

**Card "Updated MM/DD/YYYY" metadata.** Each card carries a `<p class="card-meta">Updated MM/DD/YYYY</p>` line right above `.card-actions`. Format is numeric US (`05/19/2026`). The date corresponds to the last meaningful commit date in the project's source repo (sibling folders under `/Users/ali/alidev/` for the side-projects; this repo itself for the GitHub-aliabiddev card and for the `options-payoff.html` tool). When something ships, edit the date in `_layouts/home.html` by hand — there's no automation.

**Top nav is intentionally minimal** — `_includes/navbar.html` only carries Home / Writing / About / LinkedIn. Individual project pages are reachable only via the home-page cards by design (avoid cluttering global nav as more apps are added). Adding a new top-level nav entry requires deliberate editing of `navbar.html`.

**Reveal-on-scroll** — any element with class `reveal` fades in via the IntersectionObserver in `_includes/scripts.html` (adds `.visible`). Use it for new sections to match existing motion.

## Site-wide front matter conventions

- `_config.yml` `author: Ali Abid`, `title: Thinking Slightly` — templates reference both, don't confuse them.
- `site.github_username` (aliabiddev) vs `site.github_username2` (aliencoded) — two distinct GitHub profiles surfaced on the home page and footer.
- Pages that shouldn't appear in sitemap/SEO set `sitemap: false` (see wizardroute pages).
