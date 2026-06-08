// Tests for state management functions
// These test the public API of the invoice state module

// --- resetInvoice() ---
test("resetInvoice() returns an object with correct shape", () => {
  const state = resetInvoice();
  assertOk(state.hasOwnProperty("invoiceNumber"), "has invoiceNumber");
  assertOk(state.hasOwnProperty("date"), "has date");
  assertOk(state.hasOwnProperty("company"), "has company");
  assertOk(state.hasOwnProperty("client"), "has client");
  assertOk(state.hasOwnProperty("items"), "has items");
  assertOk(state.hasOwnProperty("taxRate"), "has taxRate");
  assertOk(state.hasOwnProperty("notes"), "has notes");
  assertOk(state.hasOwnProperty("totals"), "has totals");
});

test("resetInvoice() generates a 3-digit padded invoice number", () => {
  const state = resetInvoice();
  assertOk(/^\d{3}$/.test(state.invoiceNumber), "invoiceNumber is 3 digits");
});

test("resetInvoice() sets date to today", () => {
  const state = resetInvoice();
  const today = new Date().toISOString().split("T")[0];
  assertEqual(state.date, today);
});

test("resetInvoice() company is empty defaults", () => {
  const state = resetInvoice();
  assertEqual(state.company.name, "");
  assertEqual(state.company.address, "");
  assertEqual(state.company.email, "");
  assertEqual(state.company.logo, null);
});

test("resetInvoice() client is empty defaults", () => {
  const state = resetInvoice();
  assertEqual(state.client.name, "");
  assertEqual(state.client.address, "");
  assertEqual(state.client.email, "");
});

test("resetInvoice() items has one default line item", () => {
  const state = resetInvoice();
  assertEqual(state.items.length, 1);
  assertEqual(state.items[0].description, "");
  assertEqual(state.items[0].quantity, 1);
  assertEqual(state.items[0].unitPrice, 0);
});

test("resetInvoice() taxRate defaults to 0", () => {
  const state = resetInvoice();
  assertEqual(state.taxRate, 0);
});

test("resetInvoice() notes defaults to empty string", () => {
  const state = resetInvoice();
  assertEqual(state.notes, "");
});

test("resetInvoice() totals default to zeros", () => {
  const state = resetInvoice();
  assertEqual(state.totals.subtotal, 0);
  assertEqual(state.totals.tax, 0);
  assertEqual(state.totals.total, 0);
});

test("resetInvoice() each call returns a new object", () => {
  const a = resetInvoice();
  const b = resetInvoice();
  assertNotSameRef(a, b, "different objects");
  a.invoiceNumber = "999";
  assertEqual(b.invoiceNumber, "001", "second object is not mutated");
});

// --- calculateTotals(state) ---
test("calculateTotals() computes subtotal as sum of qty × unitPrice", () => {
  const state = resetInvoice();
  state.items = [
    { description: "Dev work", quantity: 10, unitPrice: 150 },
    { description: "Design", quantity: 5, unitPrice: 100 },
  ];
  state.taxRate = 0;
  const result = calculateTotals(state);
  // (10 × 150) + (5 × 100) = 1500 + 500 = 2000
  assertEqual(result.totals.subtotal, 2000);
});

test("calculateTotals() computes tax from subtotal and rate", () => {
  const state = resetInvoice();
  state.items = [{ description: "Work", quantity: 1, unitPrice: 1000 }];
  state.taxRate = 10;
  const result = calculateTotals(state);
  // subtotal = 1000, tax = 1000 × 10 / 100 = 100
  assertEqual(result.totals.subtotal, 1000);
  assertEqual(result.totals.tax, 100);
});

test("calculateTotals() total = subtotal + tax", () => {
  const state = resetInvoice();
  state.items = [{ description: "Work", quantity: 2, unitPrice: 500 }];
  state.taxRate = 5;
  const result = calculateTotals(state);
  // subtotal = 1000, tax = 50, total = 1050
  assertEqual(result.totals.total, 1050);
});

test("calculateTotals() empty items yields all zeros", () => {
  const state = resetInvoice();
  state.items = [];
  const result = calculateTotals(state);
  assertEqual(result.totals.subtotal, 0);
  assertEqual(result.totals.tax, 0);
  assertEqual(result.totals.total, 0);
});

test("calculateTotals() zero tax rate yields zero tax", () => {
  const state = resetInvoice();
  state.items = [{ description: "Work", quantity: 1, unitPrice: 500 }];
  state.taxRate = 0;
  const result = calculateTotals(state);
  assertEqual(result.totals.subtotal, 500);
  assertEqual(result.totals.tax, 0);
  assertEqual(result.totals.total, 500);
});

test("calculateTotals() handles decimal quantities and prices", () => {
  const state = resetInvoice();
  state.items = [
    { description: "Item A", quantity: 1.5, unitPrice: 10.99 },
  ];
  state.taxRate = 8.5;
  const result = calculateTotals(state);
  // subtotal = 1.5 × 10.99 = 16.485, tax = 16.485 × 0.085 = 1.401225
  // totals rounded to 2 decimal places
  assertEqual(result.totals.subtotal, 16.49);
  assertEqual(result.totals.tax, 1.4);
  assertEqual(result.totals.total, 17.89);
});

test("calculateTotals() does not mutate input state", () => {
  const state = resetInvoice();
  state.items = [{ description: "Work", quantity: 1, unitPrice: 100 }];
  state.taxRate = 10;
  const originalItems = state.items;
  const result = calculateTotals(state);
  assertEqual(result.totals.subtotal, 100);
  // Original state totals should be unchanged
  assertEqual(state.totals.subtotal, 0, "original totals not mutated");
});

// --- getInvoiceState() ---
test("getInvoiceState() returns current state", () => {
  // Reset to known state first
  resetInvoice();
  const state = getInvoiceState();
  assertOk(state.hasOwnProperty("invoiceNumber"), "has invoiceNumber");
  assertOk(state.hasOwnProperty("date"), "has date");
  assertOk(state.hasOwnProperty("company"), "has company");
  assertOk(state.hasOwnProperty("client"), "has client");
  assertOk(state.hasOwnProperty("items"), "has items");
  assertOk(state.hasOwnProperty("taxRate"), "has taxRate");
  assertOk(state.hasOwnProperty("notes"), "has notes");
  assertOk(state.hasOwnProperty("totals"), "has totals");
});

// --- updateInvoiceField(path, value) ---
test("updateInvoiceField() updates top-level string field", () => {
  resetInvoice();
  updateInvoiceField("invoiceNumber", "005");
  assertEqual(getInvoiceState().invoiceNumber, "005");
});

test("updateInvoiceField() updates top-level number field", () => {
  resetInvoice();
  updateInvoiceField("taxRate", 15);
  assertEqual(getInvoiceState().taxRate, 15);
});

test("updateInvoiceField() updates nested company field via dot-path", () => {
  resetInvoice();
  updateInvoiceField("company.name", "Acme Corp");
  updateInvoiceField("company.address", "123 Main St");
  updateInvoiceField("company.email", "acme@test.com");
  const company = getInvoiceState().company;
  assertEqual(company.name, "Acme Corp");
  assertEqual(company.address, "123 Main St");
  assertEqual(company.email, "acme@test.com");
});

test("updateInvoiceField() updates nested client field via dot-path", () => {
  resetInvoice();
  updateInvoiceField("client.name", "ClientCo");
  updateInvoiceField("client.address", "456 Oak Ave");
  updateInvoiceField("client.email", "client@test.com");
  const client = getInvoiceState().client;
  assertEqual(client.name, "ClientCo");
  assertEqual(client.address, "456 Oak Ave");
  assertEqual(client.email, "client@test.com");
});

test("updateInvoiceField() updates line item field via dot-path with index", () => {
  resetInvoice();
  updateInvoiceField("items[0].description", "Consulting");
  updateInvoiceField("items[0].quantity", 5);
  updateInvoiceField("items[0].unitPrice", 200);
  const item = getInvoiceState().items[0];
  assertEqual(item.description, "Consulting");
  assertEqual(item.quantity, 5);
  assertEqual(item.unitPrice, 200);
});

test("updateInvoiceField() stores number values as numbers", () => {
  resetInvoice();
  updateInvoiceField("taxRate", "8.5");
  assertEqual(typeof getInvoiceState().taxRate, "number");
  assertEqual(getInvoiceState().taxRate, 8.5);
});

test("updateInvoiceField() stores string values as strings", () => {
  resetInvoice();
  updateInvoiceField("notes", "Pay within 30 days");
  assertEqual(getInvoiceState().notes, "Pay within 30 days");
});
