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
 
- [x] Clicking "Download PDF" generates a PDF matching the preview
- [x] PDF filename includes the invoice number
- [x] PDF is print-friendly with proper margins
- [x] Loading indicator shows during generation
- [x] Works on mobile browsers
 
## Implementation Details

- **Viewport Scroll Reset**: Sets `scrollX: 0, scrollY: 0` in `html2canvas` options to prevent clipping or blank output when downloading while scrolled down.
- **Rendering Clone Layout**: Clones the preview statically (`position: static`) inside an absolute-positioned wrapper (`position: absolute; left: 0; top: 0;`) appended to `document.body`, and passes the static `clone` to `html2pdf()`. This ensures the temporary container does not collapse to `0` height.

## Blocked by
 
- #2 (or: 02-invoice-preview-panel.md)
