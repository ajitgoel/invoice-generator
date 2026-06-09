---
title: "Google AdSense Configuration"
labels: []
---

## What to build

Configure Google AdSense on the invoice generator application. Insert the AdSense tag in the head and add an ad container element to the UI.

1. **HTML Modification (index.html)**:
   - In the `<head>`, load the Google AdSense script asynchronously using a configurable publisher ID placeholder (e.g., `ca-pub-PLACEHOLDER`).
   - Add a responsive ad container element below the invoice generator layout (after the "Download PDF" button).
   - Insert the standard `adsbygoogle` class and tag markup within the container.

2. **CSS Styling (styles.css)**:
   - Style the `.ad-container` class to ensure it integrates seamlessly with the visual layout (proper spacing, centered alignment, margin).
   - Ensure the ad container is excluded from print layouts by updating the `@media print` styles to set its display to `none`. This prevents blank spaces or ad content from showing up on the generated invoice PDFs.

## Acceptance criteria

- [ ] Google AdSense script added asynchronously to the head of `index.html` with publisher ID placeholders.
- [ ] Responsive AdSense ad slot unit added to `index.html` below the main content area (after the "Download PDF" button).
- [ ] Styling for `.ad-container` ensures proper spacing, responsiveness, and visual integration.
- [ ] Print styles updated to hide the ad container when downloading/printing the invoice.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## Blocked by

- 06-polish-css-styling.md
