---
title: "Add company logo upload"
labels: []
---

## What to build

Add company logo upload functionality. A file input in the company section lets the user select an image file.

Store the logo as a data URL (read via FileReader) in state under `company.logo`. The preview panel displays the logo image at the top if one is loaded. localStorage persistence should handle the data URL (keep it small — resize/recommend under 500KB).

Show the uploaded logo as a thumbnail next to the file input. Provide a "Remove logo" button.

## Acceptance criteria

- [ ] File input accepts common image formats (PNG, JPG, WebP)
- [ ] Selected logo displays as thumbnail in the form
- [ ] Logo appears in the invoice preview
- [ ] Logo persists across page refresh (via localStorage data URL)
- [ ] "Remove logo" button clears the logo
- [ ] Large images don't break localStorage (size warning if >500KB)

## Blocked by

- #2 (or: 02-invoice-preview-panel.md)
