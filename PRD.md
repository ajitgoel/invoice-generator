# PRD: Invoice Generator

## Problem Statement

Freelancers, contractors, and small business owners need a quick, professional way to generate invoices. Existing solutions are either too complex (full accounting software requiring signup), too expensive, or produce ugly invoices. Users want a simple tool that works instantly in the browser, generates a clean PDF, and costs nothing to use.

## Solution

A single-page, zero-dependency invoice generator that runs entirely in the browser. Users fill in company details, client info, and line items — the invoice preview updates in real time. One click downloads a professional PDF. Session data persists in localStorage so partial work isn't lost. Monetized via Google AdSense.

## User Stories

### Core Invoice Generation Stories
1. As a freelancer, I want to enter my company name, address, email, and logo, so that my invoices look professional.
2. As a freelancer, I want to enter my client's name, address, and email, so the invoice is properly addressed.
3. As a freelancer, I want to add multiple line items with description, quantity, and unit price, so I can bill for all work performed.
4. As a freelancer, I want to see subtotal, tax amount, and total calculated automatically, so I don't make arithmetic errors.
5. As a freelancer, I want to set a tax percentage (default 0%), so I can charge VAT/GST/HST as needed.
6. As a freelancer, I want an auto-generated invoice number that I can edit, so my invoices are sequentially numbered.
7. As a freelancer, I want the invoice date to default to today with the option to change it, so I can backdate or forward-date invoices.
8. As a freelancer, I want a notes/terms field for payment terms or additional context, so my invoices are complete.
9. As a freelancer, I want to preview the invoice in the browser before downloading, so I can verify everything looks right.
10. As a freelancer, I want one click to download the invoice as a PDF, so I can email or print it.
11. As a freelancer, I want my form data saved automatically in my browser (localStorage), so I don't lose data if I close the tab.
12. As a freelancer, I want to clear all form data with one button, so I can start fresh for a new client.
13. As a visitor, I want the page to load fast and work without signing up, so I can generate an invoice immediately.
14. As a site owner, I want Google AdSense ads displayed without degrading the user experience, so the site generates revenue.
15. As a freelancer, I want a responsive layout that works on mobile, so I can create invoices from my phone.
16. As a freelancer, I want to upload my company logo, so my branding appears on the invoice.

### Profile Library & Saved Data Stories (Added in v1.1)

#### US-017: Manage My Company profile in a separate tab
**Description:** As a freelancer, I want a dedicated tab to save my company information (name, address, email, logo) so that I can reuse it across multiple invoices without re-typing.

**Acceptance Criteria:**
- [ ] Tab bar added to the top of the interface: "Invoice Generator", "My Company", "Bill To Customer", and "Products".
- [ ] Selecting "My Company" hides other views and shows a form with fields for Company Name, Address, Email, and Logo upload.
- [ ] Saving company profile persists the data to `localStorage` under `invoice_saved_company`.
- [ ] If saved company data exists, it is loaded automatically when loading the page and the tab.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

#### US-018: Manage multiple Bill To Customer profiles in a separate tab
**Description:** As a freelancer, I want a dedicated tab to save and manage multiple customer profiles (client name, address, email) so I can quickly load them on my invoices.

**Acceptance Criteria:**
- [ ] Selecting the "Bill To Customer" tab hides other views and shows a form to add a new customer (fields: Client Name, Address, and Email) and a table of saved customers below it.
- [ ] Each customer in the saved list has a "Delete" button that removes them from the catalog.
- [ ] Customers list is persisted in `localStorage` under `invoice_saved_customers` (JSON array of customer objects with unique IDs).
- [ ] Validation ensures client name is not blank and email/address are trimmed.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

#### US-019: Manage Products and Prices list in a separate tab
**Description:** As a freelancer, I want a dedicated tab to manage a list of products/services and their prices.

**Acceptance Criteria:**
- [ ] Selecting the "Products" tab displays a list of currently saved products/services and a form to add a new product (Name/Description, Unit Price).
- [ ] Each item in the list has a "Delete" button that removes it from the catalog.
- [ ] Products catalog is persisted in `localStorage` under `invoice_saved_products`.
- [ ] Validation ensures product names are not blank and prices are valid non-negative numbers.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

#### US-020: Auto-populate Company & Customer Details via Suggestions
**Description:** As a freelancer, I want to auto-populate the Invoice Generator form fields using suggestions from my saved company and multiple customer profiles.

**Acceptance Criteria:**
- [ ] In the Invoice Generator tab, focusing the "Company Name" input displays a suggestion dropdown showing the saved company profile (if set).
- [ ] Selecting the suggestion auto-populates Company Name, Address, Email, and Logo.
- [ ] Focusing the "Client Name" input displays a suggestion dropdown showing matching saved customer profiles based on what is typed (or all saved customer profiles if field is empty).
- [ ] Selecting a customer suggestion auto-populates Client Name, Address, and Email.
- [ ] Standard typing override remains available.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

#### US-021: Add Saved Product as Line Item in Invoice
**Description:** As a freelancer, I want to quickly add line items to the invoice using autocomplete/suggestions from my saved products catalog.

**Acceptance Criteria:**
- [ ] In the Invoice Generator tab, under the "Line Items" section, add a product dropdown or auto-suggest input to select from saved products.
- [ ] Selecting a saved product adds a new row to the line items table with description and price pre-filled.
- [ ] Handled correctly even when multiple items are appended.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

#### US-022: Bulk import products via CSV file
**Description:** As a freelancer with an existing list of products and pricing, I want to upload a CSV file in the Products tab to import multiple items at once.

**Acceptance Criteria:**
- [ ] An "Import Products" section is added to the Products tab, featuring a file selector accepting `.csv` files.
- [ ] Displays instructions detailing the expected format: a two-column CSV with columns representing `Description` and `Unit Price`.
- [ ] Validates imported rows (requires description and non-negative price), skipping invalid entries.
- [ ] Merges newly imported products into the existing catalog in `localStorage.invoice_saved_products`.
- [ ] Displays a success banner showing the count of successfully imported products and any skipped invalid rows.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### Google AdSense & Search Term Analytics (Added in v1.2)

#### US-023: Configure Google AdSense on the application
**Description:** As a site owner, I want Google AdSense configured on the page so that I can generate revenue from visitor traffic without degrading the user experience.

**Acceptance Criteria:**
- [ ] AdSense placeholder block added to `index.html` (publisher ID and slot ID configured as easily-replaceable variables or central HTML markup placeholders).
- [ ] Non-intrusive AdSense banner container placed below the invoice generator layout (after the "Download PDF" button) that displays ads when active.
- [ ] Verify that AdSense scripts load asynchronously and do not block the page load or invoice generation logic.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

#### US-024: Track landing page search terms via Google Analytics
**Description:** As a site owner, I want to track what search terms visitors specify before they come to the website using Google Analytics, so I can optimize SEO and content.

**Acceptance Criteria:**
- [ ] Google Analytics 4 (GA4) tag integrated asynchronously in `index.html` using a configurable Measurement ID.
- [ ] Client-side JS script parses the landing page URL query parameters (specifically looking for `utm_term`, `q`, `query`, `keyword`) when the page loads.
- [ ] If search terms are detected, log a custom event `search_term_landing` to Google Analytics 4 with the captured search term value.
- [ ] Capture the `document.referrer` host if search terms are detected, sending it as custom parameter `referrer_host` to GA4.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## Implementation Decisions

### Architecture

- **Fully client-side static site**: No server, no database, no build step. Single HTML file (or HTML + CSS + JS files) served from Cloudflare Pages.
- **No framework**: Vanilla HTML, CSS, and JavaScript. Zero npm dependencies at build time.
- **html2pdf.js for PDF generation**: Loaded from CDN. Converts the invoice preview DOM node to PDF using html2canvas + jsPDF. To avoid height collapse and scroll position clipping, the target is statically cloned inside a temporary absolute-positioned wrapper at the top of the body, and html2canvas scroll offsets are reset (`scrollX: 0, scrollY: 0`).
- **localStorage persistence**:
  - Invoice session state autosaves under `invoiceGeneratorState` on changes.
  - Saved company profile saved under `invoice_saved_company`.
  - Saved customer profiles list saved under `invoice_saved_customers` (JSON array of customer objects).
  - Saved products list saved under `invoice_saved_products` (JSON array).
- **AdSense placement**: Single banner ad below the invoice generation area (after the "Download PDF" button). Non-intrusive, doesn't compete with form input space.
- **Google Analytics Integration**: GA4 script loaded asynchronously from Google CDN using a measurement ID (configured via a placeholder or config constant at the top of the page).
- **Landing Search Query Tracking**: JavaScript extracts search terms from the URL query parameters on load and fires custom events to GA4. No local database or dashboard UI is used.

### Major Modules

1. **Invoice state module** (`app.js`) — Central state object holding all invoice data. Pure functions for calculations (subtotal, tax, total). Interface: `getInvoiceState()`, `updateInvoiceField(path, value)`, `calculateTotals(state)`, `resetInvoice()`.
2. **Invoice rendering module** (`app.js`) — Renders the live preview from state. Called on every state change. Interface: `renderPreview(state)`.
3. **PDF generation module** (`app.js`) — Thin wrapper around html2pdf.js. Interface: `downloadPDF(element)`.
4. **Persistence module** (`app.js`) — localStorage save/load/clear. Interface: `saveToStorage(state)`, `loadFromStorage()`, `clearStorage()`. Also handles management of saved company, client, and product profiles.
5. **Navigation module** (`app.js`) — Manages tab rendering, active tab states, and hiding/showing pages.
6. **Autocomplete suggestion module** (`app.js`) — Handles displaying autocomplete suggestion lists for Company Name, Client Name, and Product selection in the invoice generator form.

### Data Flow

```
Tab Navigation Click → Toggle Visibility of views
Saved Profile Update → Write to localStorage
User Typing/Selecting Suggestion → state update → re-render preview → auto-save to localStorage
                                                → [Download PDF] → html2pdf captures preview DOM → save as file
```

### State Shape

#### Current Invoice State
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

#### Saved Data State (in localStorage)
- Key `invoice_saved_company`: `{ name: "", address: "", email: "", logo: null }`
- Key `invoice_saved_customers`: `[{ id: "cust_uuid-or-timestamp", name: "", address: "", email: "" }]`
- Key `invoice_saved_products`: `[{ id: "prod_uuid-or-timestamp", description: "", unitPrice: 0 }]`

### Visual Design

- Clean, professional aesthetic inspired by Stripe's design language.
- Two-column layout on desktop: form on left, preview on right.
- Single-column stacked layout on mobile.
- System font stack, generous whitespace, subtle borders/shadows.
- Print-friendly CSS for the preview panel.
- AdSense banner ad below both columns, full width.
- **Tab Layout**:
  - Global navigation tab bar at the top with options: "Invoice Generator", "My Company", "Bill To Customer", "Products".
  - Sleek modern layout where the active tab is visually highlighted (using harmonized color scheme like custom HSL colors, no generic gray/blue).
- **Suggestions UX**:
  - Non-intrusive floating suggestion boxes below input fields when focused.
  - Dropdown options can be navigated with mouse/touch or dismissed.

## Testing Decisions

- **What makes a good test**: Test the calculation logic (subtotal, tax, total) as pure functions. Test that state updates correctly propagate. Test the localStorage load/save helpers. Do not test DOM rendering or PDF generation — those are browser/CDN concerns.
- **What will be tested**: Invoice calculation functions (`calculateSubtotal`, `calculateTax`, `calculateTotal`) as unit tests. Saved profile persistence getters and setters.
- **Testing tools**: Vanilla JS test assertions — a simple test runner or QUnit-style inline tests, since there are no npm dependencies.

## Out of Scope

- Multi-currency support
- Discounts or adjustments
- Invoice history / dashboard / list of past invoices (only active invoice state)
- Email sending from the app
- Backend or database of any kind (pure browser local storage only)
- User accounts or authentication
- Multi-language / i18n support
- Recurring invoices / subscriptions
- Time tracking
- Expense tracking
- Multiple saved company profiles (only a single saved company profile is supported)
- Custom self-hosted analytics dashboard or in-app reports (all metrics/search terms are viewed in Google Analytics console)

## Further Notes

- Domain name selection and Cloudflare Pages setup will be handled separately before launch.
- AdSense application and ad unit creation is a separate process after the site is live.
- The project lives at `/Users/ajitgoel/simple-website/`.
- Development time target: under 1 hour for a single developer.
