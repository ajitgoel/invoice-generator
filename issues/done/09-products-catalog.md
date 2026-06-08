---
title: "Products & Prices Catalog Management Tab"
labels: []
---

## What to build

Create a dedicated "Products" tab to manage a list of products/services and their prices, persisted in browser storage.

1. **HTML Layout (index.html)**:
   - Create a view container for the "Products" tab.
   - Include an "Add Product" form containing: Product Name/Description input, Unit Price input, and an "Add Product" button.
   - Include a list/table section that displays all saved products, showing the product name, unit price, and a "Delete" button.

2. **JS Logic (app.js)**:
   - Manage an array of products in `localStorage` under the key `invoice_saved_products`.
   - Add a product to the catalog on submitting the "Add Product" form. Validate that Name/Description is not empty, and Price is a valid non-negative number.
   - Clicking a product's "Delete" button removes it from the array and updates `localStorage`.
   - Re-render the list/table dynamically when products are added or deleted.

## Acceptance criteria

- [ ] "Products" tab shows a list of saved products and an "Add Product" form
- [ ] Form validation prevents empty product name or negative prices
- [ ] Adding a product appends it to the list and saves to `localStorage.invoice_saved_products`
- [ ] Clicking "Delete" next to a product removes it from the list and storage
- [ ] Catalog persists across page loads
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Blocked by

- #8 (or: 08-tab-navigation-and-profiles.md)
