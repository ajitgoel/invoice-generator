---
title: "Global Tab Navigation & Profile Management"
labels: []
---

## What to build

Add a global navigation tab bar to the top of the interface and implement forms to manage single profiles for "My Company" and "Bill To Customer" persisted in browser storage.

1. **HTML Layout (index.html)**:
   - Add a global navigation tab bar at the top of the container: "Invoice Generator", "My Company", "Bill To Customer", and "Products".
   - Wrap the main invoice generator content (form and preview columns) inside a view container that is only visible when the "Invoice Generator" tab is active.
   - Create view containers for "My Company" and "Bill To Customer".
   - The "My Company" tab should contain form fields for: Company Name, Address, Email, and Logo upload (reusing the existing logo file input layout / design).
   - The "Bill To Customer" tab should contain fields for: Client Name, Address, and Email.

2. **CSS Styling (styles.css)**:
   - Style the tab bar at the top. The tabs should look premium, styled using harmonized CSS styling (e.g. system font stack, modern HSL borders/shadows/active states).
   - Ensure other view containers are hidden/shown depending on the active tab state.

3. **JS Logic (app.js)**:
   - Implement tab switching logic that toggles a class (like `.active` or similar) to hide/show views.
   - Save profiles in `localStorage` under `invoice_saved_company` (for My Company) and `invoice_saved_customer` (for Bill To Customer) when their respective "Save Profile" buttons are clicked.
   - Load and populate these forms on DOM ready if saved profile data exists in `localStorage`.

## Acceptance criteria

- [ ] Global tab bar is styled and visible at the top of the page
- [ ] Clicking a tab shows that view and hides all other views
- [ ] Active tab is visually highlighted
- [ ] Saving "My Company" profile saves Company Name, Address, Email, and Logo to `localStorage.invoice_saved_company`
- [ ] Saving "Bill To Customer" profile saves Client Name, Address, and Email to `localStorage.invoice_saved_customer`
- [ ] Saved values load automatically and populate forms when loading the page
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Blocked by

- 04-localstorage-persistence.md
