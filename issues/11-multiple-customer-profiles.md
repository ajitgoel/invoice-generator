---
title: "Manage Multiple Customer Profiles"
labels: []
---

## What to build

Modify the "Bill To Customer" tab to support saving and managing multiple customer profiles instead of a single customer profile.

1. **HTML Layout (index.html)**:
   - Update the "Bill To Customer" view (`#view-customer`).
   - Change the form header to "Add Customer". Keep the input fields for: Client Name, Address, and Email.
   - Change the button text from "Save Profile" to "Add Customer".
   - Below the form, add a list/table section (similar to the Products catalog layout) with ID `customersListContainer` to display all saved customers.
   - The table should show columns for: Client Name, Address, Email, and a "Delete" button.
   - Add an empty state message `<p id="customersEmptyMsg" class="empty-msg" style="display:none;">No customers saved yet. Add one above.</p>`.

2. **JS Logic (app.js)**:
   - In `app.js`, manage a list of customer profiles in `localStorage` under the key `invoice_saved_customers` (replacing the single client storage key `invoice_saved_customer`).
   - Implement `loadCustomers()`, `saveCustomers()`, `addCustomer(name, address, email)`, and `deleteCustomer(id)`.
   - Each customer should have a unique ID (e.g. `cust_` + timestamp + random string).
   - Validate that the Client Name is not empty before adding. Show alert or validation error if empty.
   - Wire up the "Add Customer" button to call `addCustomer`.
   - Wire up the "Delete" buttons in the customers table to delete the customer by ID and re-render the list.
   - Update `initProfileForms()` to load the customer profiles and render the customers list table on load.
   - Render the table of customers or the empty message depending on whether customers exist.

## Acceptance criteria

- [ ] "Bill To Customer" tab shows an "Add Customer" form and a "Saved Customers" list/table below it.
- [ ] Adding a customer saves the customer data to `localStorage.invoice_saved_customers` as a JSON array.
- [ ] Form validation prevents adding a customer with an empty Name.
- [ ] Each customer row in the table shows Name, Address, Email, and a "Delete" button.
- [ ] Clicking "Delete" next to a customer removes the customer from the list and from `localStorage`.
- [ ] The customer list persists across page reloads.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## Blocked by

- 10-autocomplete-and-population.md
