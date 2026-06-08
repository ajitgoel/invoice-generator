// Invoice Generator — State Management Module

/**
 * Returns a fresh default invoice state object.
 * @returns {Object} Default invoice state
 */
function resetInvoice() {
  // Auto-increment invoice number (padded to 3 digits)
  var num = String(_invoiceCounter).padStart(3, "0");
  _invoiceCounter++;

  _state = {
    invoiceNumber: num,
    date: new Date().toISOString().split("T")[0],
    company: { name: "", address: "", email: "", logo: null },
    client: { name: "", address: "", email: "" },
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
    taxRate: 0,
    notes: "",
    totals: { subtotal: 0, tax: 0, total: 0 },
  };
  return _state;
}

/**
 * Pure function: sums qty × unitPrice across all items.
 * Negative per-item amounts are clamped to 0 (nonsensical on invoices).
 * Result is rounded to 2 decimal places.
 * @param {Array} items - Line items [{quantity, unitPrice}, ...]
 * @returns {number} Subtotal, never negative
 */
function calculateSubtotal(items) {
  if (!items || items.length === 0) return 0;

  var raw = items.reduce(function (sum, item) {
    var amount = item.quantity * item.unitPrice;
    return sum + (amount > 0 ? amount : 0);
  }, 0);

  // Clamp negative result to 0, then round
  return raw > 0 ? Math.round(raw * 100) / 100 : 0;
}

/**
 * Pure function: computes tax from subtotal and tax rate.
 * Negative inputs are clamped to 0 (nonsensical on invoices).
 * Result is rounded to 2 decimal places.
 * @param {number} subtotal - Pre-tax subtotal
 * @param {number} taxRate - Tax percentage (e.g., 8.5 for 8.5%)
 * @returns {number} Tax amount, never negative
 */
function calculateTax(subtotal, taxRate) {
  var s = subtotal > 0 ? subtotal : 0;
  var r = taxRate > 0 ? taxRate : 0;
  var raw = s * (r / 100);
  return raw > 0 ? Math.round(raw * 100) / 100 : 0;
}

/**
 * Pure function: computes total from subtotal and tax.
 * Negative inputs are clamped to 0.
 * Result is rounded to 2 decimal places.
 * @param {number} subtotal - Subtotal
 * @param {number} tax - Tax amount
 * @returns {number} Total, never negative
 */
function calculateTotal(subtotal, tax) {
  var s = subtotal > 0 ? subtotal : 0;
  var t = tax > 0 ? tax : 0;
  var raw = s + t;
  return raw > 0 ? Math.round(raw * 100) / 100 : 0;
}

/**
 * Pure function that computes totals from invoice state.
 * Returns a new state object with computed totals (does not mutate input).
 * Delegates to calculateSubtotal, calculateTax, and calculateTotal.
 * @param {Object} state - Invoice state
 * @returns {Object} New state with updated totals
 */
function calculateTotals(state) {
  var subtotal = calculateSubtotal(state.items);
  var tax = calculateTax(subtotal, state.taxRate);
  var total = calculateTotal(subtotal, tax);

  return {
    ...state,
    totals: {
      subtotal: subtotal,
      tax: tax,
      total: total,
    },
  };
}

// Module-level state and invoice counter
// Initialized directly (not via resetInvoice) to avoid premature counter increment.
// initForm() will overwrite _state if saved data exists, or call resetInvoice() if not.
var _invoiceCounter = 1;
var _state = {
  invoiceNumber: "001",
  date: new Date().toISOString().split("T")[0],
  company: { name: "", address: "", email: "", logo: null },
  client: { name: "", address: "", email: "" },
  items: [{ description: "", quantity: 1, unitPrice: 0 }],
  taxRate: 0,
  notes: "",
  totals: { subtotal: 0, tax: 0, total: 0 },
};

// ============================================================
// localStorage Persistence Module
// ============================================================

var STORAGE_KEY = "invoiceGeneratorState";
var COUNTER_KEY = "invoiceGeneratorCounter";

/**
 * Saves current state and invoice counter to localStorage.
 * Silently no-ops if localStorage is unavailable (private browsing).
 */
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    localStorage.setItem(COUNTER_KEY, String(_invoiceCounter));
  } catch (e) {
    // localStorage unavailable or full — silently ignore
  }
}

/**
 * Loads state and counter from localStorage.
 * Returns the parsed state object, or null if nothing saved or unavailable.
 */
function loadFromStorage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    var counter = localStorage.getItem(COUNTER_KEY);
    if (counter) {
      _invoiceCounter = parseInt(counter, 10) || 1;
    }
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Clears stored invoice data and counter from localStorage.
 */
function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COUNTER_KEY);
  } catch (e) {
    // silently ignore
  }
}

/**
 * Helper: auto-save current state to localStorage.
 * Called on every state mutation.
 */
function autoSave() {
  saveToStorage();
}

/**
 * Returns the current invoice state object.
 * @returns {Object} Current invoice state
 */
function getInvoiceState() {
  return _state;
}

/**
 * Updates a nested field in the invoice state by path.
 * Supports dot-notation ("company.name") and bracket notation ("items[0].description").
 * Coerces values to match the existing value's type (number or string).
 * @param {string} path - Dot-path to the field
 * @param {string|number} value - New value
 */
function updateInvoiceField(path, value) {
  // Parse path into segments: "items[0].description" → ["items", "0", "description"]
  var segments = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".");

  // Navigate to the parent of the target field
  var target = _state;
  for (var i = 0; i < segments.length - 1; i++) {
    target = target[segments[i]];
  }

  var lastKey = segments[segments.length - 1];
  var currentValue = target[lastKey];

  // Coerce value to match existing value's type
  if (typeof currentValue === "number") {
    target[lastKey] = parseFloat(value) || 0;
  } else {
    target[lastKey] = value;
  }
}

// ============================================================
// Form Wiring Module
// ============================================================

/**
 * Populates all form fields from the current state.
 */
function populateFormFromState() {
  var state = getInvoiceState();
  setFieldValue("invoiceNumber", state.invoiceNumber);
  setFieldValue("invoiceDate", state.date);
  setFieldValue("companyName", state.company.name);
  setFieldValue("companyAddress", state.company.address);
  setFieldValue("companyEmail", state.company.email);
  setFieldValue("clientName", state.client.name);
  setFieldValue("clientAddress", state.client.address);
  setFieldValue("clientEmail", state.client.email);
  setFieldValue("taxRate", state.taxRate);
  setFieldValue("notes", state.notes);
  renderLineItems();
}

/**
 * Helper: sets a form field value by element ID.
 */
function setFieldValue(id, value) {
  var el = document.getElementById(id);
  if (el) {
    el.value = value;
  }
}

/**
 * Renders line item rows in the form from current state.
 */
function renderLineItems() {
  var container = document.getElementById("itemsContainer");
  if (!container) return;

  var items = getInvoiceState().items;
  container.innerHTML = "";

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var row = document.createElement("div");
    row.className = "item-row";

    row.innerHTML =
      '<input type="text" class="item-desc" placeholder="Description" value="' +
      escapeHtml(item.description) +
      '" data-index="' +
      i +
      '" data-field="description">' +
      '<input type="number" class="item-qty" placeholder="Qty" value="' +
      item.quantity +
      '" min="0" step="1" data-index="' +
      i +
      '" data-field="quantity">' +
      '<input type="number" class="item-price" placeholder="Price" value="' +
      item.unitPrice +
      '" min="0" step="0.01" data-index="' +
      i +
      '" data-field="unitPrice">' +
      '<button type="button" class="btn btn-remove" data-index="' +
      i +
      '" title="Remove item">&times;</button>';

    container.appendChild(row);
  }
}

/**
 * Escapes HTML entities to prevent XSS.
 */
function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Adds a new empty line item to the state and re-renders.
 */
function addItem() {
  var state = getInvoiceState();
  state.items.push({ description: "", quantity: 1, unitPrice: 0 });
  renderLineItems();
  renderPreview();
  autoSave();
}

/**
 * Removes a line item by index. Keeps at least one item.
 */
function removeItem(index) {
  var state = getInvoiceState();
  if (state.items.length > 1) {
    state.items.splice(index, 1);
    renderLineItems();
    renderPreview();
    autoSave();
  }
}

// ============================================================
// Preview Rendering Module
// ============================================================

/**
 * Formats a number as USD currency (e.g., $1,234.56).
 */
function formatCurrency(amount) {
  return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Formats an ISO date string to a human-readable format (e.g., "Jun 7, 2026").
 */
function formatDate(isoStr) {
  if (!isoStr) return "";
  var d = new Date(isoStr + "T00:00:00");
  var months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

/**
 * Returns a value if truthy, otherwise a dash placeholder.
 */
function dashIfEmpty(val) {
  return val !== null && val !== undefined && val !== "" ? val : "—";
}

/**
 * Renders the invoice preview from current state into the #invoicePreview element.
 */
function renderPreview() {
  var state = getInvoiceState();
  var totals = calculateTotals(state).totals;
  var container = document.getElementById("invoicePreview");
  if (!container) return;

  var html = "";

  // --- Company info ---
  html += '<div class="inv-header">';
  html +=
    '<div class="inv-company">' +
    "<h3>" +
    dashIfEmpty(state.company.name) +
    "</h3>" +
    "<p>" +
    dashIfEmpty(state.company.address) +
    "</p>" +
    "<p>" +
    dashIfEmpty(state.company.email) +
    "</p>" +
    "</div>";

  // --- Invoice heading ---
  html += '<div class="inv-title">';
  html += "<h2>INVOICE</h2>";
  html +=
    "<p>#" + state.invoiceNumber + " &middot; " + formatDate(state.date) + "</p>";
  html += "</div>";
  html += "</div>";

  // --- Client details ---
  html += '<div class="inv-client">';
  html += "<h4>Bill To:</h4>";
  html +=
    "<p>" +
    dashIfEmpty(state.client.name) +
    "</p>" +
    "<p>" +
    dashIfEmpty(state.client.address) +
    "</p>" +
    "<p>" +
    dashIfEmpty(state.client.email) +
    "</p>";
  html += "</div>";

  // --- Line items table ---
  html += '<table class="inv-table">';
  html +=
    "<thead><tr>" +
    "<th>Description</th>" +
    "<th>Qty</th>" +
    "<th>Unit Price</th>" +
    "<th>Amount</th>" +
    "</tr></thead>";
  html += "<tbody>";

  for (var i = 0; i < state.items.length; i++) {
    var item = state.items[i];
    var amount = item.quantity * item.unitPrice;
    html +=
      "<tr>" +
      "<td>" +
      dashIfEmpty(item.description) +
      "</td>" +
      "<td>" +
      item.quantity +
      "</td>" +
      "<td>" +
      formatCurrency(item.unitPrice) +
      "</td>" +
      "<td>" +
      formatCurrency(amount) +
      "</td>" +
      "</tr>";
  }

  html += "</tbody></table>";

  // --- Totals ---
  html += '<div class="inv-totals">';
  html +=
    '<div class="inv-total-row">' +
    "<span>Subtotal</span>" +
    "<span>" +
    formatCurrency(totals.subtotal) +
    "</span>" +
    "</div>";
  html +=
    '<div class="inv-total-row">' +
    "<span>Tax (" +
    state.taxRate +
    "%)</span>" +
    "<span>" +
    formatCurrency(totals.tax) +
    "</span>" +
    "</div>";
  html +=
    '<div class="inv-total-row inv-total-grand">' +
    "<span>Total</span>" +
    "<span>" +
    formatCurrency(totals.total) +
    "</span>" +
    "</div>";
  html += "</div>";

  // --- Notes ---
  if (state.notes) {
    html +=
      '<div class="inv-notes">' +
      "<h4>Notes / Terms</h4>" +
      "<p>" +
      state.notes +
      "</p>" +
      "</div>";
  }

  container.innerHTML = html;
}

/**
 * Initializes all form event listeners.
 */
function initForm() {
  // Try to restore state from localStorage
  var savedState = loadFromStorage();
  if (savedState) {
    _state = savedState;
  } else {
    // No saved data — use a fresh state with auto-increment
    _state = resetInvoice();
  }

  // Populate form from current state
  populateFormFromState();
  // Render initial preview
  renderPreview();

  // Simple field mappings: element ID → state path
  var fieldMappings = {
    invoiceNumber: "invoiceNumber",
    invoiceDate: "date",
    companyName: "company.name",
    companyAddress: "company.address",
    companyEmail: "company.email",
    clientName: "client.name",
    clientAddress: "client.address",
    clientEmail: "client.email",
    taxRate: "taxRate",
    notes: "notes",
  };

  // Bind input events for simple fields
  Object.keys(fieldMappings).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", function () {
        updateInvoiceField(fieldMappings[id], el.value);
        renderPreview();
        autoSave();
      });
    }
  });

  // Delegate events on the items container for dynamic line items
  var itemsContainer = document.getElementById("itemsContainer");
  if (itemsContainer) {
    itemsContainer.addEventListener("input", function (e) {
      var target = e.target;
      if (target.dataset.index !== undefined && target.dataset.field) {
        var path =
          "items[" + target.dataset.index + "]." + target.dataset.field;
        updateInvoiceField(path, target.value);
        renderPreview();
        autoSave();
      }
    });

    itemsContainer.addEventListener("click", function (e) {
      var target = e.target;
      if (
        target.classList.contains("btn-remove") &&
        target.dataset.index !== undefined
      ) {
        removeItem(parseInt(target.dataset.index, 10));
      }
    });
  }

  // Add Item button
  var addBtn = document.getElementById("addItemBtn");
  if (addBtn) {
    addBtn.addEventListener("click", addItem);
  }

  // Download PDF button
  var downloadBtn = document.getElementById("downloadPdfBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      downloadPDF(document.getElementById("invoicePreview"));
    });
  }

  // Reset All button
  var resetBtn = document.getElementById("resetAllBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      clearStorage();
      _invoiceCounter = 1;
      _state = resetInvoice();
      populateFormFromState();
      renderPreview();
    });
  }
}

// ============================================================
// PDF Download Module
// ============================================================

/**
 * Generates and downloads a PDF from the invoice preview element.
 * Uses html2pdf.js (loaded from CDN). Shows a loading spinner during generation.
 * @param {HTMLElement} element - The DOM element to capture as PDF
 */
function downloadPDF(element) {
  if (!element) return;
  if (typeof html2pdf === "undefined") {
    alert("PDF library is still loading. Please try again in a moment.");
    return;
  }

  var state = getInvoiceState();
  var filename = "invoice-" + state.invoiceNumber + ".pdf";

  // Show loading spinner, hide button text
  var btnText = document.getElementById("downloadBtnText");
  var btnSpinner = document.getElementById("downloadBtnSpinner");
  var btn = document.getElementById("downloadPdfBtn");

  if (btnText) btnText.style.display = "none";
  if (btnSpinner) btnSpinner.className = "";
  if (btn) btn.disabled = true;

  var opt = {
    margin: 0.5,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(function () {
      if (btnText) btnText.style.display = "";
      if (btnSpinner) btnSpinner.className = "spinner-hidden";
      if (btn) btn.disabled = false;
    })
    .catch(function () {
      if (btnText) btnText.style.display = "";
      if (btnSpinner) btnSpinner.className = "spinner-hidden";
      if (btn) btn.disabled = false;
      alert("PDF generation failed. Please try again.");
    });
}

// Initialize form on DOM ready (browser only)
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initForm);
}
