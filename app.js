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
 * Pure function that computes totals from invoice state.
 * Returns a new state object with computed totals (does not mutate input).
 * @param {Object} state - Invoice state
 * @returns {Object} New state with updated totals
 */
function calculateTotals(state) {
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = subtotal * (state.taxRate / 100);
  const total = subtotal + tax;

  return {
    ...state,
    totals: {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    },
  };
}

// Module-level state and invoice counter
var _invoiceCounter = 1;
var _state = resetInvoice();

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
}

/**
 * Removes a line item by index. Keeps at least one item.
 */
function removeItem(index) {
  var state = getInvoiceState();
  if (state.items.length > 1) {
    state.items.splice(index, 1);
    renderLineItems();
  }
}

/**
 * Initializes all form event listeners.
 */
function initForm() {
  // Populate form from initial state
  populateFormFromState();

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
}

// Initialize form on DOM ready (browser only)
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initForm);
}
