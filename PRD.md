# PRD: Invoice Generator

## Problem Statement

Freelancers, contractors, and small business owners need a quick, professional way to generate invoices. Existing solutions are either too complex (full accounting software requiring signup), too expensive, or produce ugly invoices. Users want a simple tool that works instantly in the browser, generates a clean PDF, and costs nothing to use.

## Solution

A single-page, zero-dependency invoice generator that runs entirely in the browser. Users fill in company details, client info, and line items — the invoice preview updates in real time. One click downloads a professional PDF. Session data persists in localStorage so partial work isn't lost. Monetized via Google AdSense.

## User Stories

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

## Implementation Decisions

### Architecture

- **Fully client-side static site**: No server, no database, no build step. Single HTML file (or HTML + CSS + JS files) served from Cloudflare Pages.
- **No framework**: Vanilla HTML, CSS, and JavaScript. Zero npm dependencies at build time.
- **html2pdf.js for PDF generation**: Loaded from CDN. Converts the invoice preview DOM node to PDF using html2canvas + jsPDF. To avoid height collapse and scroll position clipping, the target is statically cloned inside a temporary absolute-positioned wrapper at the top of the body, and html2canvas scroll offsets are reset (`scrollX: 0, scrollY: 0`).
- **localStorage persistence**: Form state auto-saves on every change. Restored on page load. One "Reset All" button clears saved data.
- **AdSense placement**: Single banner ad below the invoice generation area (after the "Download PDF" button). Non-intrusive, doesn't compete with form input space.

### Major Modules

1. **Invoice state module** (`app.js`) — Central state object holding all invoice data. Pure functions for calculations (subtotal, tax, total). Interface: `getInvoiceState()`, `updateInvoiceField(path, value)`, `calculateTotals(state)`, `resetInvoice()`.
2. **Invoice rendering module** (`app.js`) — Renders the live preview from state. Called on every state change. Interface: `renderPreview(state)`.
3. **PDF generation module** (`app.js`) — Thin wrapper around html2pdf.js. Interface: `downloadPDF(element)`.
4. **Persistence module** (`app.js`) — localStorage save/load/clear. Interface: `saveToStorage(state)`, `loadFromStorage()`, `clearStorage()`.

### Data Flow

```
User Input → state update → re-render preview → auto-save to localStorage
                                              → [Download PDF] → html2pdf captures preview DOM → save as file
```

### State Shape

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

### Visual Design

- Clean, professional aesthetic inspired by Stripe's design language.
- Two-column layout on desktop: form on left, preview on right.
- Single-column stacked layout on mobile.
- System font stack, generous whitespace, subtle borders/shadows.
- Print-friendly CSS for the preview panel.
- AdSense banner ad below both columns, full width.

## Testing Decisions

- **What makes a good test**: Test the calculation logic (subtotal, tax, total) as pure functions. Test that state updates correctly propagate. Do not test DOM rendering or PDF generation — those are browser/CDN concerns.
- **What will be tested**: Invoice calculation functions (`calculateSubtotal`, `calculateTax`, `calculateTotal`) as unit tests. State initialization and reset behavior.
- **Testing tools**: Vanilla JS test assertions — a simple test runner or QUnit-style inline tests, since there are no npm dependencies.

## Out of Scope

- Multi-currency support
- Discounts or adjustments
- Invoice history / dashboard / list of past invoices
- Email sending from the app
- Backend or database of any kind
- User accounts or authentication
- Multi-language / i18n support
- Recurring invoices / subscriptions
- Time tracking
- Expense tracking

## Further Notes

- Domain name selection and Cloudflare Pages setup will be handled separately before launch.
- AdSense application and ad unit creation is a separate process after the site is live.
- The project lives at `/Users/ajitgoel/simple-website/`.
- Development time target: under 1 hour for a single developer.
