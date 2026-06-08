---
title: "Add localStorage persistence"
labels: []
---

## What to build

Add auto-save to localStorage so form data persists across page refreshes and tab closes.

Functions in `app.js`:
- `saveToStorage(state)` — serializes state to JSON and saves to `localStorage.invoiceGeneratorState`
- `loadFromStorage()` — reads and parses. Returns null if nothing saved.
- `clearStorage()` — removes the saved data

On page load: check localStorage, if data exists, restore it into the form and re-render the preview.
On every state change: auto-save.
Add a "Reset All" button that clears localStorage and resets to default state.

## Acceptance criteria

- [ ] Form data survives page refresh
- [ ] "Reset All" button clears saved data and resets the form
- [ ] Empty/null logo field doesn't break serialization
- [ ] No errors if localStorage is unavailable (private browsing)

## Blocked by

- #2 (or: 02-invoice-preview-panel.md)
