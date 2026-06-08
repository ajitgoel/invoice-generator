// Tests for company logo upload functionality
// Tests state management — DOM/file APIs are tested visually

// --- Setting and clearing company.logo ---

test("updateInvoiceField() sets company.logo to a data URL string", () => {
  resetInvoice();
  var dataUrl = "data:image/png;base64,iVBORw0KGgo=";
  updateInvoiceField("company.logo", dataUrl);
  assertEqual(getInvoiceState().company.logo, dataUrl);
});

test("updateInvoiceField() clears company.logo when set to null", () => {
  resetInvoice();
  updateInvoiceField("company.logo", "data:image/png;base64,abc=");
  updateInvoiceField("company.logo", null);
  assertEqual(getInvoiceState().company.logo, null);
});

test("resetInvoice() has company.logo defaulting to null", () => {
  var state = resetInvoice();
  assertEqual(state.company.logo, null);
});

// --- isLogoSizeLarge(dataUrl) ---

test("isLogoSizeLarge() returns false for empty string", () => {
  assertEqual(isLogoSizeLarge(""), false);
});

test("isLogoSizeLarge() returns false for null", () => {
  assertEqual(isLogoSizeLarge(null), false);
});

test("isLogoSizeLarge() returns false for small data URL", () => {
  var smallUrl = "data:image/png;base64," + "A".repeat(100);
  assertEqual(isLogoSizeLarge(smallUrl), false);
});

test("isLogoSizeLarge() returns true for data URL over 500KB threshold", () => {
  // Each base64 char = 1 byte in the string. 500KB = 512000 chars.
  var largeUrl = "data:image/png;base64," + "A".repeat(512001);
  assertEqual(isLogoSizeLarge(largeUrl), true);
});

// --- Persistence round-trip ---

test("logo survives save/load round-trip via localStorage", () => {
  resetInvoice();
  var dataUrl = "data:image/png;base64,iVBORw0KGgo=";
  updateInvoiceField("company.logo", dataUrl);
  saveToStorage();

  // Load into a fresh state
  var loaded = loadFromStorage();
  assertOk(loaded !== null, "loaded state exists");
  assertEqual(loaded.company.logo, dataUrl);
});
