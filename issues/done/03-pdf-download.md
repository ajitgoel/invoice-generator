---
title: "Add PDF download with html2pdf.js"
labels: []
---

## What to build

Add the "Download PDF" button and integrate html2pdf.js (loaded from CDN). Clicking the button captures the invoice preview DOM and generates a downloadable PDF.

The `downloadPDF(element)` function in `app.js` calls `html2pdf().from(element).save(filename)` with sensible defaults:
- Filename: `invoice-{number}.pdf` (e.g., `invoice-001.pdf`)
- Margin: 0.5in
- Image quality: high
- Paper size: Letter (US) or A4

Add a "Download PDF" button below the form. Show a brief loading state while PDF generates.

## Acceptance criteria

- [ ] Clicking "Download PDF" generates a PDF matching the preview
- [ ] PDF filename includes the invoice number
- [ ] PDF is print-friendly with proper margins
- [ ] Loading indicator shows during generation
- [ ] Works on mobile browsers

## Blocked by

- #2 (or: 02-invoice-preview-panel.md)
