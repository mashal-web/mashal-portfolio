# Portfolio audit — 2026-11-01

## Scope and baseline
- Repository: mashal-web/mashal-portfolio
- Baseline branch: main
- Working branch: audit/production-hardening-2026-11
- Architecture: multi-page HTML, shared CSS, vanilla JavaScript, static GitHub Pages hosting.

## Confirmed findings and dispositions
- [x] Repository inventory completed: five primary pages, three legacy download pages, shared CSS/JS, and image assets.
- [x] Replaced outdated Computer Science / AI / cybersecurity positioning with Civil Engineering portfolio content and accurate page-specific SEO metadata.
- [x] Removed three project-card placeholder links and replaced fabricated/in-progress project listings with a transparent engineering archive empty state.
- [x] Removed broken PDF download cards that pointed to non-existent `assets/docs/*.pdf` files.
- [x] Removed three unreferenced legacy download HTML pages containing outdated profile information, embedded CSS/JS, and invalid social links.
- [x] Removed unreferenced `fixes.css`.
- [x] Removed obsolete duplicate background PNG assets after removing their stylesheet references.
- [x] Replaced missing PNG favicon references with a new monochrome SVG favicon.
- [x] Added a monochrome refinement stylesheet and converted the legacy stylesheet's colour palette to neutral tones.
- [x] Removed external Google Fonts and Font Awesome CDN requests; the site uses a system font stack and no icon-font dependency.
- [x] Removed gradient and blur treatments from the active monochrome design.
- [x] Removed inline style attributes and embedded style/script blocks from all remaining HTML pages.
- [x] Replaced the original multi-listener scroll logic with one passive requestAnimationFrame-driven scroll handler.
- [x] Updated scroll progress ARIA state, active navigation aria-current, mobile menu state, Escape handling, and reduced-motion-aware back-to-top behaviour.
- [x] Hardened contact form handling and retained entered values on failed delivery.
- [x] Added a custom 404 page, sitemap.xml, and robots.txt.
- [x] Added a concise audit checklist and this implementation record.
- [x] Fixed a malformed leftover font-import fragment discovered during QA.
- [x] Restored the visible back-to-top glyph after removing the external icon font.
- [x] Removed residual green, red, yellow, and blue CSS accents and corrected invalid legacy color declarations.
- [x] Removed unnecessary card blur and repaired the back-to-top button border.
- [x] Fixed axe findings: small-text contrast, logo accessible-name mismatch, and the decorative progress bar being outside a landmark.
- [x] Increased the mobile navigation touch target to 44 × 44 CSS pixels.
- [x] Added a dependency-free static QA workflow and a temporary Playwright/axe browser test workflow.

## Static verification performed on the working branch
- [x] All relative HTML href/src references resolve to tracked repository paths.
- [x] All local CSS url() references resolve.
- [x] No placeholder `href="#"` or javascript: links remain.
- [x] No duplicate HTML IDs detected.
- [x] Every remaining HTML page has exactly one h1.
- [x] No missing image alt attributes detected.
- [x] No inline style attributes, embedded style blocks, embedded scripts, or inline event-handler attributes remain in HTML.
- [x] Main portfolio pages have page-specific descriptions and canonical URLs.
- [x] Sitemap contains the five canonical public portfolio pages.

## Not yet verified / external limitations
- [x] Chromium layout checks at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 CSS pixels for all five primary pages (50 page/viewport combinations); no horizontal overflow detected in the successful run.
- [x] Chromium checks found no broken images, JavaScript exceptions, or console errors in the five primary pages.
- [x] Mobile hamburger open/Escape-close behaviour, empty-form native validation, and back-to-top visibility/scroll behaviour passed in the successful run.
- [x] axe-core accessibility scans passed at 390px and 1440px for all five primary pages after fixing the reported contrast, landmark, and accessible-name issues.
- [x] Re-ran browser checks against the latest source commit; browser history and 404 recovery assertions passed.
- [ ] Full manual keyboard-only and screen-reader testing in a browser (automated axe scans are not a substitute).
- [ ] HTML/CSS validator and Lighthouse/Core Web Vitals measurements.
- [ ] Contact form delivery to the configured Formspree endpoint; requires an actual submission and service access.
- [ ] GitHub Pages deployment of this branch. The production branch has not been changed; branch deployment is not confirmed.
- [ ] Live-site visual inspection. The web page fetcher did not return the live page content.

## Remaining engineering work
- The legacy layout stylesheet remains relatively large. Its visual layout rules have been preserved to avoid an unverified full rewrite; CSS coverage analysis and a careful dead-selector removal pass remain outstanding.
- The three old downloadable resources were removed because their files were missing or their HTML content was outdated. New downloadable CV/PDF resources should only be published after the factual content and final documents are supplied/approved.

## QA workflow
- Workflow: `.github/workflows/qa.yml` (pull requests targeting `main` and manual dispatch).
- Static checks use Python's standard library and Node's syntax checker.
- Browser checks install Playwright and axe-core into a temporary runner directory; no frontend dependencies are added to the website.
- Successful browser/static run on the latest source commit: `https://github.com/mashal-web/mashal-portfolio/actions/runs/41247111747` (50 viewport combinations, zero failures).

## Working branch
- `audit/production-hardening-2026-11`
