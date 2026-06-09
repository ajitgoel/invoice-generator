---
title: "Google Analytics and Landing Search Query Tracking"
labels: []
---

## What to build

Integrate Google Analytics 4 (GA4) into the application to track visitor traffic. Parse search query parameters from the landing URL and capture referrer data, logging them as custom events to GA4.

1. **HTML Modification (index.html)**:
   - Add the Google Analytics 4 (GA4) tag asynchronously to the `<head>` of `index.html` using a configurable Measurement ID placeholder (`G-PLACEHOLDER`).

2. **JS Analytics Tracking Helper (app.js)**:
   - Implement a function `trackLandingSearchQueries()` that runs on initialization/page load.
   - Use `URLSearchParams` on `window.location.search` to look for common search query parameters: `q`, `query`, `utm_term`, `keyword`.
   - If a search term is found, capture and trim it.
   - Send the custom event `search_term_landing` to GA4 using `gtag` API with the captured search term value and the referrer host name:
     ```js
     gtag('event', 'search_term_landing', {
       'search_term': searchTerm,
       'referrer_host': document.referrer ? new URL(document.referrer).hostname : 'direct'
     });
     ```
   - Ensure this tracking helper is wrapped in try-catch and safely handles situations where `gtag` is blocked by ad blockers or privacy extensions.

## Acceptance criteria

- [ ] Google Analytics 4 tracking script integrated into `index.html` using a placeholder Measurement ID.
- [ ] Client-side script parses query parameters `q`, `query`, `utm_term`, `keyword` from `window.location.search` on page load.
- [ ] When a search parameter is found, a custom event `search_term_landing` is sent to GA4 with the search term and the referrer host name.
- [ ] Application remains fully functional even if Google Analytics is blocked by browser extensions or ad blockers.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## Blocked by

- 01-invoice-form-and-state.md
