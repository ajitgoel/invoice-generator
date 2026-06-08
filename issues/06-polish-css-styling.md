---
title: "Style the app with polished CSS"
labels: []
---

## What to build

Apply a clean, professional design system to the entire app — inspired by Stripe's aesthetic. This is the visual polish layer.

Design tokens:
- Font: system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- Colors: slate grays for text/borders, blue accent (#2563eb) for buttons/links, white backgrounds
- Border radius: 6px for inputs, 8px for cards
- Spacing: generous whitespace, consistent 16px/24px/32px rhythm

Layout:
- Max container width: 1200px, centered
- Desktop: two-column grid (6/5 split with gap) — form left, preview right
- Mobile (<768px): single column, stacked
- Both columns inside white card panels with subtle shadows

Preview styling:
- Print-friendly invoice look: bordered table, right-aligned totals, professional headings
- AdSense placement: full-width banner below the two columns, with 16px top margin

## Acceptance criteria

- [ ] Clean, professional design consistent throughout
- [ ] Responsive: works on mobile, tablet, desktop
- [ ] Preview panel looks like a real invoice
- [ ] All form elements consistently styled
- [ ] "Download PDF" button is prominent and branded
- [ ] AdSense placeholder area exists with appropriate sizing

## Blocked by

- #2 (or: 02-invoice-preview-panel.md)
- Relies on the full form + preview being wired up to style properly
