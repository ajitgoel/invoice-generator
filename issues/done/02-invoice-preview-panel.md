---
title: "Add invoice preview panel"
labels: []
---

## What to build

Build the live invoice preview panel that renders alongside the form. On desktop it sits in a right column; on mobile it stacks below the form.

The preview renders the current invoice state as a styled document that looks like a real invoice:
- Company name, address, email at top (logo placeholder for now)
- "INVOICE" heading with invoice number and date
- Client billing details section
- Line items table with Description, Qty, Unit Price, Amount columns
- Totals section showing subtotal, tax (with rate), and total
- Notes/terms at bottom

The `renderPreview(state)` function in `app.js` clears the preview container and re-renders from state. Call it on every state change.

## Acceptance criteria

- [ ] Preview updates in real time as the user types in the form
- [ ] Desktop layout: form left (60%), preview right (40%)
- [ ] Mobile layout: form on top, preview below
- [ ] Preview shows all invoice data correctly including calculated totals
- [ ] Empty fields show gracefully (dash or blank, no "undefined")

## Blocked by

- #1 (or: 01-invoice-form-and-state.md)
