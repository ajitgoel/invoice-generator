---
title: "Bulk CSV Product Import"
labels: []
---

## What to build

Implement bulk CSV product import inside the "Products" tab, allowing users to upload a CSV containing product names/descriptions and unit prices, validate them client-side, and save them in browser storage.

1. **HTML Layout (index.html)**:
   - Inside `#view-products` (under the manual "Add Product" form section), add a new section for CSV imports.
   - Include a file input with ID `csvFileInput`, `accept=".csv"`, and a label/button for uploading a CSV.
   - Add status message spans/divs with ID `csvImportSuccessMsg` and `csvImportErrorMsg` to display progress and results.
   - Add format instructions: "Format: CSV file with columns 'Description, Price' (with or without headers)."

2. **JS Logic (app.js)**:
   - Wire up event listener on `csvFileInput` to handle file selection.
   - Use `FileReader` to read the file as text.
   - Implement a CSV parser in JS:
     - Split file content by newline characters.
     - Clean and trim whitespace and surrounding quotes from fields.
     - Detect and ignore header rows (e.g. if the first row has column values like "description" or "price").
     - Validate each row: Description must not be empty, Price must be a non-negative number.
     - If a row is valid, generate a unique ID (`prod_` + timestamp + random suffix) and create a product object `{id, description, unitPrice}`.
     - Count successfully parsed items and skipped invalid items.
   - Merge valid product objects into the `_products` array and save them to `localStorage` under `invoice_saved_products`.
   - Update the UI list table and the product selector dropdown by calling `renderProductsList()` and `populateProductSelector()`.
   - Show a status message in the UI: `Successfully imported X products. (Y invalid rows skipped)`.

## Acceptance criteria

- [ ] "Import Products" section exists in the Products tab with a file selector for `.csv` files.
- [ ] Uploading a CSV parses and validates the file client-side.
- [ ] Valid items are merged into the existing products catalog in `localStorage.invoice_saved_products`.
- [ ] Invalid rows (e.g., negative prices, empty descriptions) are skipped.
- [ ] Header rows (if present) are automatically detected and skipped without causing errors.
- [ ] A success message is displayed detailing the number of imported products and any skipped rows.
- [ ] The catalog table and invoice selector immediately update with the newly imported products.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## Blocked by

- 09-products-catalog.md
