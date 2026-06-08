---
title: "Add mathematical calculation tests"
labels: []
---

## What to build

Write unit tests for the calculation functions. Since this is a vanilla JS app with no npm, create a simple test runner (`test/index.html` + `test/runner.js`).

Test these pure functions:
- `calculateSubtotal(items)` — sum of qty × unitPrice
- `calculateTax(subtotal, taxRate)` — subtotal × rate / 100
- `calculateTotal(subtotal, tax)` — subtotal + tax
- `resetInvoice()` — returns correct default state

Test edge cases:
- Empty items array → subtotal = 0
- Zero tax rate → tax = 0
- Negative values → (treat as 0 or allow? document the decision)
- Decimal quantities and prices

## Acceptance criteria

- [ ] Tests run in the browser by opening `test/index.html`
- [ ] All calculation functions tested with normal values
- [ ] Edge cases covered: empty items, zero tax, decimal values
- [ ] Tests pass

## Blocked by

- #1 (or: 01-invoice-form-and-state.md) — needs the calculation functions
