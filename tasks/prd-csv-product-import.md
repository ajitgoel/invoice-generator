# PRD: CSV Product Import

## Introduction/Overview
To save time for users with large product lists or catalogs, we need to allow importing products and prices via a CSV file. This feature will be located in the "Products & Services" tab, providing a quick way to upload many items at once instead of typing them one by one.

## Goals
- Allow users to upload a CSV file containing product descriptions/names and prices in the "Products" tab.
- Parse the CSV client-side (zero server dependencies).
- Validate CSV rows (non-empty description, valid non-negative price) and import valid items by merging them into the existing catalog.
- Display a clear summary message to the user showing how many products were successfully imported and how many invalid rows (if any) were skipped.

## User Stories

### US-001: Upload CSV file in the Products tab
**Description:** As a user with a product catalog, I want to upload a CSV file in the "Products" tab so that I can bulk-load my products and unit prices into the app.

**Acceptance Criteria:**
- [ ] A dedicated "Import Products" section is added to the "Products" tab (below the manual "Add Product" form).
- [ ] Includes a file input accepting `.csv` files, styled to look modern (e.g., custom file select button or drop area).
- [ ] Clear instruction text displays the required format: `Description, Price` (with or without headers).
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-002: Parse and validate CSV client-side
**Description:** As a user importing a CSV, I want the system to parse and validate the file entirely in the browser, showing me the status of the import.

**Acceptance Criteria:**
- [ ] CSV parsing is performed client-side using vanilla JavaScript (no external libraries required, a robust lightweight custom parser).
- [ ] Handles standard CSV formatting (handles quotes, commas, trimming whitespace).
- [ ] Detects and ignores a header row if present (e.g., if the first row has values like `name`, `description`, `price`, `unit price`).
- [ ] Validates each row:
  - First column (description) must be a non-empty string.
  - Second column (price) must be a valid non-negative number.
- [ ] Invalid rows are skipped.
- [ ] Valid rows are merged (appended) to the existing `invoice_saved_products` array in `localStorage`.
- [ ] Once the import finishes, it displays a notification: `Successfully imported X products. (Y invalid rows skipped)`.
- [ ] The saved products list table automatically updates with the imported items.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## Functional Requirements
- FR-1: Add a file upload field (`<input type="file" accept=".csv">`) in the "Products" view.
- FR-2: Implement a JS function `importCSV(file)` that reads the file via `FileReader` and splits it into lines.
- FR-3: Parse each line using comma-separation, trimming quotes and whitespace around columns.
- FR-4: Detect header row (first line containing strings like `description`, `name`, `price`, `unit price`) and skip it.
- FR-5: Generate a unique ID (e.g. `prod_` + timestamp + random suffix) for each imported product.
- FR-6: Show success/error messages in the UI under the import area.

## Non-Goals
- Supporting excel (`.xlsx`) files directly.
- Exporting products catalog to CSV (only importing is required).
- Mapping custom CSV columns (we assume a fixed columns order: column 1 is name/description, column 2 is unit price).

## Technical Considerations
- Use browser `FileReader` API.
- Keep dependency count at zero (do not load external Papaparse from CDN unless necessary, a simple, robust custom splitter is cleaner and lighter). Let's write a simple comma-splitter that handles optional quotes: `row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)` or similar regex if we need basic escaping, but simple comma split is usually sufficient for standard name-price CSV.

## Success Metrics
- Users can import a list of 100 products in less than 2 seconds.
- Friendly error status helps users format their CSV files correctly.
