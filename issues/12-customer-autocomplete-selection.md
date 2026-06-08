---
title: "Customer Autocomplete Selection in Invoice Form"
labels: []
---

## What to build

Update the autocomplete suggestion dropdown on the Invoice Generator tab to support selecting a client from multiple saved customer profiles, and support specifying products with their quantities.

1. **Client Name Suggestion Dropdown (app.js)**:
   - Update `getSavedCustomerProfile` (or write `getSavedCustomerProfiles`) to fetch the list of saved customers from `invoice_saved_customers`.
   - Update the focus and input event listeners on `clientName` in `initAutocomplete()`:
     - When focusing or typing in the "Client Name" input, show a list of suggestions matching the typed text.
     - If the input is focused but empty, show all saved customer profiles as suggestions.
     - Filter matches by matching the substring of the customer's name (case-insensitive).
   - Selecting a suggestion from the dropdown must auto-populate the client name, address, and email in the active invoice state and form.

2. **Verify Product Line Items Quantity Behavior (app.js)**:
   - Ensure the user can select multiple products using the product selector dropdown in the line items section, appending each product to the invoice with a default quantity of 1 and its saved price.
   - Verify that the quantity, price, and description can be edited directly on the form and changes update the live preview and active invoice state.

## Acceptance criteria

- [ ] Focusing the "Client Name" input displays suggestions for all saved customers if empty.
- [ ] Typing in the "Client Name" input filters suggestions to only show customers matching the query.
- [ ] Selecting a customer suggestion populates client name, client address, and client email fields and updates the preview.
- [ ] Selecting a saved product from the dropdown appends it to the line items table with description and price pre-filled, defaulting quantity to 1.
- [ ] Users can add multiple products and modify their quantities/prices directly on the invoice.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## Blocked by

- 11-multiple-customer-profiles.md
