# PRD: Multiple Customer Profiles Support

## Introduction/Overview
Currently, the invoice generator only supports saving a single company profile and a single customer profile in their respective tabs. To make the tool more versatile for freelancers and business owners who bill multiple clients, we need to extend the "Bill To Customer" tab to support managing a list of multiple customer profiles. In the "Invoice Generator" tab, the user should be able to select from their saved customers via autocomplete suggestions, select from saved products, specify their quantities, and generate an invoice.

## Goals
- Allow users to save and manage multiple customer profiles in the "Bill To Customer" tab.
- Provide a list/table of saved customers with a "Delete" button for each customer (consistent with the Products catalog).
- Auto-populate customer details in the "Invoice Generator" tab via autocomplete suggestions based on the saved customer profiles.
- Support selecting multiple products in the "Invoice Generator" tab, with the ability to specify their quantities, descriptions, and unit prices.

## User Stories

### US-001: Manage multiple customer profiles in the "Bill To Customer" tab
**Description:** As a freelancer, I want to save and manage multiple customer profiles in a dedicated tab so that I can easily reuse them when generating invoices for different clients.

**Acceptance Criteria:**
- [ ] The "Bill To Customer" tab displays a form to add a new customer (fields: Client Name, Address, and Email) and a table of saved customers below it.
- [ ] Each saved customer in the table displays their details (Name, Address, Email) and has a "Delete" button that removes them from the catalog.
- [ ] Customer profiles list is persisted in `localStorage` under the key `invoice_saved_customers` as a JSON array of customer objects.
- [ ] If no customers are saved, an empty-state message "No customers saved yet. Add one above." is displayed.
- [ ] Validation prevents adding a customer with a blank name.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-002: Search and autocomplete customers in the Invoice Generator
**Description:** As a freelancer, I want to search and select a customer from my saved customers list when generating an invoice, so that I don't have to re-type their information.

**Acceptance Criteria:**
- [ ] In the Invoice Generator tab, focusing or typing in the "Client Name" input displays a suggestion dropdown showing matching saved customer profiles.
- [ ] Clicking a suggestion auto-populates Client Name, Client Address, and Client Email.
- [ ] If the input is focused but empty, the suggestion dropdown shows all saved customer profiles.
- [ ] The user can override suggestions by typing manually without choosing a suggestion.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-003: Select multiple products and specify quantities on the Invoice Generator
**Description:** As a freelancer, I want to select multiple products from my catalog and specify their quantities for the invoice.

**Acceptance Criteria:**
- [ ] In the Invoice Generator tab under "Line Items", selecting a saved product from the dropdown appends a new row to the line items table.
- [ ] The appended row pre-fills the description and unit price from the selected product, defaulting quantity to 1.
- [ ] Users can add multiple different products or the same product multiple times.
- [ ] Users can edit the description, quantity, and unit price of any line item directly on the invoice generator form.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## Functional Requirements
- FR-1: Update the "Bill To Customer" UI to include an "Add Customer" form (Client Name, Client Address, Client Email) and a "Saved Customers" list table.
- FR-2: Persist saved customers under `localStorage` key `invoice_saved_customers` as a JSON array of objects, each with a unique ID (e.g. `cust_[timestamp]_[random]`).
- FR-3: Implement a "Delete" function to remove a customer from `invoice_saved_customers` by ID.
- FR-4: Update autocomplete suggestion logic for the "Client Name" input on the Invoice Generator to pull from the `invoice_saved_customers` array.
- FR-5: Ensure selecting a customer suggestion populates Client Name, Client Address, and Client Email.
- FR-6: Ensure selecting a product from the dropdown appends a line item to the active invoice state with a default quantity of 1 and the saved unit price.

## Non-Goals
- Editing saved customers inline (adding/deleting is sufficient).
- Saving customer-specific custom fields.
- Importing/exporting customer lists.
- Multiple saved company profiles (My Company remains a single saved profile).

## Technical Considerations
- Keep dependencies at zero.
- Re-use the layout patterns (add forms and lists) from the Products catalog tab.
- Re-use the suggestion dropdown logic for Client Name, modifying it to match substring queries across the names of saved customers.

## Success Metrics
- Users can select a customer profile in under 2 clicks.
- Adding a line item from saved products takes 2 clicks or fewer.
- Customer profiles persist across page reloads.

## Open Questions
- None.
