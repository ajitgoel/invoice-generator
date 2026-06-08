// Tests for standalone calculation functions
// These test the pure mathematical functions individually

// --- calculateSubtotal(items) ---

test("calculateSubtotal() returns 0 for empty items array", () => {
  assertEqual(calculateSubtotal([]), 0);
});

test("calculateSubtotal() returns 0 for single zero-priced item", () => {
  assertEqual(calculateSubtotal([{ quantity: 1, unitPrice: 0 }]), 0);
});

test("calculateSubtotal() sums qty × unitPrice for multiple items", () => {
  const items = [
    { description: "Dev work", quantity: 10, unitPrice: 150 },
    { description: "Design", quantity: 5, unitPrice: 100 },
  ];
  // (10 × 150) + (5 × 100) = 1500 + 500 = 2000
  assertEqual(calculateSubtotal(items), 2000);
});

test("calculateSubtotal() handles decimal quantities", () => {
  const items = [
    { description: "Item A", quantity: 1.5, unitPrice: 10.99 },
  ];
  // 1.5 × 10.99 = 16.485 → rounded to 16.49
  assertEqual(calculateSubtotal(items), 16.49);
});

test("calculateSubtotal() handles zero quantity", () => {
  const items = [
    { description: "Free", quantity: 0, unitPrice: 100 },
  ];
  assertEqual(calculateSubtotal(items), 0);
});

test("calculateSubtotal() clamps negative quantity to 0 per line item", () => {
  // Decision: negative values make no sense on invoices. Each line's
  // qty × unitPrice is clamped to 0 (effectively ignoring negative contributions).
  const items = [
    { description: "Normal", quantity: 5, unitPrice: 100 },
    { description: "Negative qty", quantity: -2, unitPrice: 50 },
  ];
  // 5 × 100 = 500, clamped(-2 × 50) = clamped(-100) = 0 → total = 500
  assertEqual(calculateSubtotal(items), 500);
});

test("calculateSubtotal() clamps negative unitPrice to 0 per line item", () => {
  const items = [
    { description: "Normal", quantity: 5, unitPrice: 100 },
    { description: "Negative price", quantity: 2, unitPrice: -30 },
  ];
  // 5 × 100 = 500, clamped(2 × -30) = clamped(-60) = 0 → total = 500
  assertEqual(calculateSubtotal(items), 500);
});

test("calculateSubtotal() clamps result to 0 when all items negative", () => {
  const items = [
    { description: "Bad data", quantity: -10, unitPrice: 50 },
  ];
  // clamped(-500) = 0
  assertEqual(calculateSubtotal(items), 0);
});

// --- calculateTax(subtotal, taxRate) ---

test("calculateTax() returns 0 for subtotal of 0", () => {
  assertEqual(calculateTax(0, 10), 0);
});

test("calculateTax() returns 0 for 0% tax rate", () => {
  assertEqual(calculateTax(1000, 0), 0);
});

test("calculateTax() computes tax from subtotal and rate", () => {
  // 1000 × 10 / 100 = 100
  assertEqual(calculateTax(1000, 10), 100);
});

test("calculateTax() handles decimal tax rate", () => {
  // 500 × 8.5 / 100 = 42.5
  assertEqual(calculateTax(500, 8.5), 42.5);
});

test("calculateTax() handles decimal subtotal", () => {
  // 16.49 × 10 / 100 = 1.649 → rounded to 1.65
  assertEqual(calculateTax(16.49, 10), 1.65);
});

test("calculateTax() rounds to 2 decimal places", () => {
  // 1 × 0.1 / 100 = 0.001 → rounded to 0
  assertEqual(calculateTax(1, 0.1), 0);
});

test("calculateTax() clamps negative tax rate to 0", () => {
  // Negative tax rate is nonsensical, clamp to 0
  assertEqual(calculateTax(1000, -5), 0);
});

test("calculateTax() clamps negative subtotal to 0", () => {
  // Negative subtotal shouldn't happen, but if it does, tax is 0
  assertEqual(calculateTax(-100, 10), 0);
});

// --- calculateTotal(subtotal, tax) ---

test("calculateTotal() returns subtotal when tax is 0", () => {
  assertEqual(calculateTotal(1000, 0), 1000);
});

test("calculateTotal() returns tax when subtotal is 0", () => {
  assertEqual(calculateTotal(0, 50), 50);
});

test("calculateTotal() adds subtotal and tax", () => {
  // 1000 + 100 = 1100
  assertEqual(calculateTotal(1000, 100), 1100);
});

test("calculateTotal() returns 0 when both are 0", () => {
  assertEqual(calculateTotal(0, 0), 0);
});

test("calculateTotal() handles decimal values", () => {
  // 16.49 + 1.40 = 17.89
  assertEqual(calculateTotal(16.49, 1.4), 17.89);
});

test("calculateTotal() clamps negative subtotal to 0", () => {
  assertEqual(calculateTotal(-100, 10), 10);
});

test("calculateTotal() clamps negative tax to 0", () => {
  assertEqual(calculateTotal(100, -10), 100);
});

test("calculateTotal() clamps result to 0 when both negative", () => {
  assertEqual(calculateTotal(-100, -50), 0);
});

// --- calculateTotals() regression tests ---
// Verify the refactored calculateTotals still works the same way

test("calculateTotals() still computes correctly after refactor", () => {
  const state = resetInvoice();
  state.items = [
    { description: "Dev work", quantity: 10, unitPrice: 150 },
    { description: "Design", quantity: 5, unitPrice: 100 },
  ];
  state.taxRate = 8.5;
  const result = calculateTotals(state);
  // subtotal = 2000, tax = 2000 × 8.5 / 100 = 170, total = 2170
  assertEqual(result.totals.subtotal, 2000);
  assertEqual(result.totals.tax, 170);
  assertEqual(result.totals.total, 2170);
});

test("calculateTotals() does not mutate input state (regression)", () => {
  const state = resetInvoice();
  state.items = [{ description: "Work", quantity: 1, unitPrice: 100 }];
  state.taxRate = 10;
  const result = calculateTotals(state);
  assertEqual(result.totals.subtotal, 100);
  assertEqual(state.totals.subtotal, 0, "original totals not mutated");
  assertNotSameRef(state, result, "returns new object");
});

test("calculateTotals() handles decimal quantities and prices (regression)", () => {
  const state = resetInvoice();
  state.items = [
    { description: "Item A", quantity: 1.5, unitPrice: 10.99 },
  ];
  state.taxRate = 8.5;
  const result = calculateTotals(state);
  // subtotal = 1.5 × 10.99 = 16.485 → 16.49
  // tax = 16.485 × 0.085 = 1.401225 → 1.4
  // total = 16.49 + 1.40 = 17.89
  assertEqual(result.totals.subtotal, 16.49);
  assertEqual(result.totals.tax, 1.4);
  assertEqual(result.totals.total, 17.89);
});
