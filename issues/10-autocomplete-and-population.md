---
title: "Auto-populate Suggestions & Saved Product Insertion"
labels: []
---

## What to build

Integrate the saved company, customer profiles, and products catalog into the main "Invoice Generator" form via suggestion lists and autocomplete dropdowns.

1. **Company & Customer Autocomplete (index.html & app.js)**:
   - In the Invoice Generator tab, when the "Company Name" input is focused or typed in, show a suggestion dropdown listing the saved company name (if set).
   - Selecting the company suggestion auto-populates all company details (Company Name, Address, Email, and Logo) in the active invoice state and form.
   - When the "Client Name" input is focused or typed in, show a suggestion dropdown listing the saved customer name (if set).
   - Selecting the customer suggestion auto-populates all client details (Client Name, Address, and Email) in the active invoice state and form.
   - Suggestions dropdown should hide on blur or click outside.

2. **Product Line Item Selection (index.html & app.js)**:
   - In the "Line Items" section of the "Invoice Generator" tab, add a product selector dropdown/autocomplete field above or next to the "+ Add Item" button.
   - When a product is selected from this dropdown, it appends a new line item row to the invoice containing the product's name/description and unit price (default quantity of 1).

## Acceptance criteria

- [ ] Suggestion dropdown appears below "Company Name" input when focused/typed (if saved company exists)
- [ ] Selecting company suggestion populates Name, Address, Email, and Logo in the form and live preview
- [ ] Suggestion dropdown appears below "Client Name" input when focused/typed (if saved customer exists)
- [ ] Selecting client suggestion populates Name, Address, and Email in the form and live preview
- [ ] Product selection dropdown/autocomplete exists in the line items section
- [ ] Selecting a saved product appends a new row in line items with description and price pre-filled
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Blocked by

- #8 (or: 08-tab-navigation-and-profiles.md)
- #9 (or: 09-products-catalog.md)
