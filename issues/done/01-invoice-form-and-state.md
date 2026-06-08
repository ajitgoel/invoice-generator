---
title: "Set up invoice form and state management"
labels: []
---

## What to build

Build the core invoice form with state management. This is the foundation slice — the full data entry form and the central state object that drives everything else.

Create `index.html`, `styles.css`, and `app.js`. The form collects:
- **Invoice info**: invoice number (auto-generated "001"), date (defaults to today)
- **Company details**: name, address, email
- **Client details**: name, address, email
- **Line items**: one row with description, quantity (default 1), unit price (default 0), with "Add item" and "Remove" buttons
- **Tax rate**: percentage input (default 0)
- **Notes/terms**: textarea

The state object lives in `app.js` with this shape:

```js
{
  invoiceNumber: "001",
  date: "2026-06-07",
  company: { name: "", address: "", email: "", logo: null },
  client: { name: "", address: "", email: "" },
  items: [{ description: "", quantity: 1, unitPrice: 0 }],
  taxRate: 0,
  notes: "",
  totals: { subtotal: 0, tax: 0, total: 0 }
}
```

Functions:
- `getInvoiceState()` — returns current state
- `updateInvoiceField(path, value)` — updates nested field by dot-path (e.g., `"company.name"`)
- `calculateTotals(state)` — pure function that computes subtotal, tax, total
- `resetInvoice()` — returns fresh default state

## Acceptance criteria

- [ ] Form renders with all fields described above
- [ ] Invoice number auto-generates as incrementing "001", "002" etc.
- [ ] Date defaults to today's date
- [ ] Adding/removing line items works
- [ ] State object holds all form data
- [ ] `calculateTotals` correctly computes subtotal (sum of qty × unitPrice), tax (subtotal × rate/100), and total (subtotal + tax)
- [ ] `resetInvoice()` returns clean initial state

## Blocked by

None - can start immediately
