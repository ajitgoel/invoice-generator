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

// ============================================================
// Profile Persistence Module
// ============================================================

var COMPANY_PROFILE_KEY = "invoice_saved_company";
var CUSTOMERS_STORAGE_KEY = "invoice_saved_customers";

// Module-level variable for the company profile logo data URL
var _profileCompanyLogo = null;

// Module-level customers array — loaded from localStorage on init
var _customers = [];

// Tracks which customer ID is being edited in the Bill To form (null = add mode)
var _editingCustomerId = null;

/**
 * Saves the My Company profile from form fields to localStorage.
 */
function saveCompanyProfile() {
  var profile = {
    name: document.getElementById("profileCompanyName").value.trim(),
    address: document.getElementById("profileCompanyAddress").value.trim(),
    email: document.getElementById("profileCompanyEmail").value.trim(),
    logo: _profileCompanyLogo || null,
  };
  try {
    localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(profile));
    showSaveConfirm("companyProfileSavedMsg");
  } catch (e) {
    // localStorage unavailable or full
  }
}

/**
 * Loads customers from localStorage into the module-level array.
 * Migrates legacy single-customer key if present.
 * @returns {Array} The customers array [{id, name, address, email}, ...]
 */
function loadCustomers() {
  try {
    var raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (raw) {
      _customers = JSON.parse(raw);
      return _customers;
    }
    // Migrate legacy single-customer key if present
    var legacyRaw = localStorage.getItem("invoice_saved_customer");
    if (legacyRaw) {
      var legacy = JSON.parse(legacyRaw);
      if (legacy && legacy.name) {
        _customers = [{
          id: generateCustomerId(),
          name: legacy.name || "",
          address: legacy.address || "",
          email: legacy.email || "",
        }];
        saveCustomers();
        localStorage.removeItem("invoice_saved_customer");
        return _customers;
      }
    }
    _customers = [];
  } catch (e) {
    _customers = [];
  }
  return _customers;
}

/**
 * Persists the current customers array to localStorage.
 */
function saveCustomers() {
  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(_customers));
  } catch (e) {
    // localStorage unavailable or full
  }
}

/**
 * Generates a unique ID for a new customer.
 * @returns {string} Unique identifier
 */
function generateCustomerId() {
  return "cust_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
}

/**
 * Validates customer form data.
 * @param {string} name - Customer name
 * @returns {string|null} Error message or null if valid
 */
function validateCustomer(name) {
  if (!name || name.trim() === "") {
    return "Please enter a client name.";
  }
  return null;
}

/**
 * Adds a customer to the saved list.
 * Validates, persists to storage, clears form, re-renders.
 * @param {string} name - Client name
 * @param {string} address - Client address
 * @param {string} email - Client email
 * @returns {boolean} True if added, false if validation failed
 */
function addCustomer(name, address, email) {
  var error = validateCustomer(name);
  if (error) {
    showCustomerError(error);
    return false;
  }
  _customers.push({
    id: generateCustomerId(),
    name: name.trim(),
    address: (address || "").trim(),
    email: (email || "").trim(),
  });
  saveCustomers();
  renderCustomersList();
  showCustomerAddedConfirm();
  // Clear form inputs
  setFieldValue("profileClientName", "");
  setFieldValue("profileClientAddress", "");
  setFieldValue("profileClientEmail", "");
  return true;
}

/**
 * Removes a customer by ID from the saved list.
 * @param {string} id - The customer ID to delete
 */
function deleteCustomer(id) {
  _customers = _customers.filter(function (c) {
    return c.id !== id;
  });
  saveCustomers();
  renderCustomersList();
  // If we were editing the deleted customer, reset
  if (_editingCustomerId === id) {
    cancelEditCustomer();
  }
}

/**
 * Loads a customer into the form for editing.
 * @param {string} id - The customer ID to edit
 */
function startEditCustomer(id) {
  for (var i = 0; i < _customers.length; i++) {
    if (_customers[i].id === id) {
      _editingCustomerId = id;
      setFieldValue("profileClientName", _customers[i].name);
      setFieldValue("profileClientAddress", _customers[i].address);
      setFieldValue("profileClientEmail", _customers[i].email);
      var addBtn = document.getElementById("addCustomerBtn");
      var cancelBtn = document.getElementById("cancelEditCustomerBtn");
      if (addBtn) addBtn.textContent = "Update Customer";
      if (cancelBtn) cancelBtn.style.display = "";
      // Scroll to top of form
      var card = document.querySelector("#view-customer .profile-card");
      if (card) card.scrollIntoView({ behavior: "smooth" });
      break;
    }
  }
}

/**
 * Exits edit mode, clears the customer form, and resets buttons.
 */
function cancelEditCustomer() {
  _editingCustomerId = null;
  setFieldValue("profileClientName", "");
  setFieldValue("profileClientAddress", "");
  setFieldValue("profileClientEmail", "");
  var addBtn = document.getElementById("addCustomerBtn");
  var cancelBtn = document.getElementById("cancelEditCustomerBtn");
  if (addBtn) addBtn.textContent = "Add Customer";
  if (cancelBtn) cancelBtn.style.display = "none";
  // Hide any lingering error
  var errEl = document.getElementById("customerErrorMsg");
  if (errEl) errEl.style.display = "none";
}

/**
 * Renders the customers list table (or empty state message).
 */
function renderCustomersList() {
  var table = document.getElementById("customersTable");
  var tbody = document.getElementById("customersTableBody");
  var emptyMsg = document.getElementById("customersEmptyMsg");

  if (!table || !tbody) return;

  tbody.innerHTML = "";

  if (_customers.length === 0) {
    table.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "";
  } else {
    table.style.display = "";
    if (emptyMsg) emptyMsg.style.display = "none";

    for (var i = 0; i < _customers.length; i++) {
      var customer = _customers[i];
      var row = document.createElement("tr");

      row.innerHTML =
        "<td>" +
        escapeHtml(customer.name) +
        "</td>" +
        "<td>" +
        escapeHtml(customer.address) +
        "</td>" +
        "<td>" +
        escapeHtml(customer.email) +
        "</td>" +
        '<td class="customer-actions-cell">' +
        '<button type="button" class="btn-edit-customer" data-customer-id="' +
        customer.id +
        '">Edit</button>' +
        '<button type="button" class="btn-delete-product" data-customer-id="' +
        customer.id +
        '">Delete</button>' +
        "</td>";

      tbody.appendChild(row);
    }
  }
}

/**
 * Shows a brief confirmation when a customer is added.
 */
function showCustomerAddedConfirm() {
  var el = document.getElementById("customerAddedMsg");
  if (!el) return;
  var errEl = document.getElementById("customerErrorMsg");
  if (errEl) errEl.style.display = "none";
  el.style.display = "inline-block";
  el.style.animation = "none";
  el.offsetHeight;
  el.style.animation = "";
  setTimeout(function () {
    el.style.display = "none";
  }, 2000);
}

/**
 * Shows a brief confirmation when a customer is updated.
 */
function showCustomerUpdatedConfirm() {
  var el = document.getElementById("customerUpdatedMsg");
  if (!el) return;
  var errEl = document.getElementById("customerErrorMsg");
  if (errEl) errEl.style.display = "none";
  el.style.display = "inline-block";
  el.style.animation = "none";
  el.offsetHeight;
  el.style.animation = "";
  setTimeout(function () {
    el.style.display = "none";
  }, 2000);
}

/**
 * Shows a validation error message for the customer form.
 * @param {string} msg - The error text
 */
function showCustomerError(msg) {
  var el = document.getElementById("customerErrorMsg");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "inline-block";
  el.style.animation = "none";
  el.offsetHeight;
  el.style.animation = "";
  setTimeout(function () {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.3s ease";
    setTimeout(function () {
      el.style.display = "none";
      el.style.opacity = "1";
      el.style.transition = "";
    }, 300);
  }, 3000);
}

/**
 * Shows a brief confirmation message and auto-hides it.
 * @param {string} elementId - The ID of the confirmation span
 */
function showSaveConfirm(elementId) {
  var el = document.getElementById(elementId);
  if (!el) return;
  el.style.display = "inline-block";
  // Restart animation by removing and re-adding the element trigger
  el.style.animation = "none";
  el.offsetHeight; // force reflow
  el.style.animation = "";
  // Hide after animation completes (2s)
  setTimeout(function () {
    el.style.display = "none";
  }, 2000);
}

/**
 * Loads the My Company profile from localStorage and populates the form.
 */
function loadCompanyProfile() {
  try {
    var raw = localStorage.getItem(COMPANY_PROFILE_KEY);
    if (!raw) return;
    var profile = JSON.parse(raw);
    if (profile.name !== undefined) setFieldValue("profileCompanyName", profile.name);
    if (profile.address !== undefined) setFieldValue("profileCompanyAddress", profile.address);
    if (profile.email !== undefined) setFieldValue("profileCompanyEmail", profile.email);
    _profileCompanyLogo = profile.logo || null;
    renderProfileCompanyLogo();
  } catch (e) {
    // silently ignore parse errors
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
// Logo Upload Module
// ============================================================

/**
 * Pure function: checks whether a data URL exceeds the recommended 500KB limit.
 * Data URLs are base64-encoded, so string length is a close proxy for binary size.
 * @param {string|null} dataUrl - The data URL to check
 * @returns {boolean} True if the data URL exceeds 500KB
 */
function isLogoSizeLarge(dataUrl) {
  if (!dataUrl) return false;
  // 500KB = 512000 bytes. Base64 adds ~33% overhead, but string length is
  // a reasonable proxy that errs on the side of warning too early.
  return dataUrl.length > 512000;
}

/**
 * Reads an image file via FileReader and sets it as the company logo.
 * Validates file type (PNG, JPG, WebP) and warns on large files.
 * @param {File} file - The selected image file
 */
function handleLogoFile(file) {
  if (!file) return;

  // Validate file type
  var validTypes = ["image/png", "image/jpeg", "image/webp"];
  if (validTypes.indexOf(file.type) === -1) {
    alert("Please select a PNG, JPG, or WebP image.");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    var dataUrl = e.target.result;
    if (isLogoSizeLarge(dataUrl)) {
      alert("Warning: Logo is over 500KB. Large images may cause slow page loads.");
    }
    setCompanyLogo(dataUrl);
  };
  reader.readAsDataURL(file);
}

/**
 * Sets the company logo data URL in state and updates the UI.
 * @param {string} dataUrl - Base64 data URL of the logo image
 */
function setCompanyLogo(dataUrl) {
  updateInvoiceField("company.logo", dataUrl);
  renderLogoThumbnail();
  renderPreview();
  autoSave();
}

/**
 * Removes the company logo from state and updates the UI.
 */
function removeCompanyLogo() {
  updateInvoiceField("company.logo", null);
  renderLogoThumbnail();
  renderPreview();
  autoSave();
}

/**
 * Renders the logo thumbnail and remove button in the form.
 */
function renderLogoThumbnail() {
  var state = getInvoiceState();
  var preview = document.getElementById("logoPreview");
  var uploadArea = document.getElementById("logoUploadArea");
  var removeBtn = document.getElementById("removeLogoBtn");

  if (!uploadArea) return;

  if (state.company.logo) {
    // Show thumbnail + remove button
    if (preview) {
      preview.src = state.company.logo;
      preview.style.display = "";
    }
    if (removeBtn) removeBtn.style.display = "";
    uploadArea.classList.add("has-logo");
  } else {
    // Show upload prompt only
    if (preview) {
      preview.src = "";
      preview.style.display = "none";
    }
    if (removeBtn) removeBtn.style.display = "none";
    uploadArea.classList.remove("has-logo");
  }
}

// ============================================================
// Profile Company Logo Upload Module
// ============================================================

/**
 * Reads an image file and stores it as the profile company logo.
 * @param {File} file - The selected image file
 */
function handleProfileCompanyLogoFile(file) {
  if (!file) return;

  var validTypes = ["image/png", "image/jpeg", "image/webp"];
  if (validTypes.indexOf(file.type) === -1) {
    alert("Please select a PNG, JPG, or WebP image.");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    var dataUrl = e.target.result;
    if (isLogoSizeLarge(dataUrl)) {
      alert("Warning: Logo is over 500KB. Large images may cause slow page loads.");
    }
    _profileCompanyLogo = dataUrl;
    renderProfileCompanyLogo();
  };
  reader.readAsDataURL(file);
}

/**
 * Removes the profile company logo.
 */
function removeProfileCompanyLogo() {
  _profileCompanyLogo = null;
  renderProfileCompanyLogo();
}

/**
 * Renders the profile company logo thumbnail and controls.
 */
function renderProfileCompanyLogo() {
  var preview = document.getElementById("profileCompanyLogoPreview");
  var uploadArea = document.getElementById("profileCompanyLogoArea");
  var removeBtn = document.getElementById("profileCompanyRemoveLogoBtn");

  if (!uploadArea) return;

  if (_profileCompanyLogo) {
    if (preview) {
      preview.src = _profileCompanyLogo;
      preview.style.display = "";
    }
    if (removeBtn) removeBtn.style.display = "";
    uploadArea.classList.add("has-logo");
  } else {
    if (preview) {
      preview.src = "";
      preview.style.display = "none";
    }
    if (removeBtn) removeBtn.style.display = "none";
    uploadArea.classList.remove("has-logo");
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
 * Converts a string into a filename-safe slug.
 * Lowercases, replaces non-alphanumeric characters with hyphens,
 * collapses consecutive hyphens, and trims leading/trailing hyphens.
 * @param {string} str - The input string to slugify
 * @returns {string} Filename-safe slug, or empty string if input is empty
 */
function slugifyForFilename(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  html += '<div class="inv-company">';

  // Logo — centered above company name
  if (state.company.logo) {
    html +=
      '<div class="inv-logo-wrapper">' +
      '<img src="' +
      state.company.logo +
      '" alt="Company Logo" class="inv-logo">' +
      "</div>";
  }

  html +=
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
  // Render initial thumbnail + preview
  renderLogoThumbnail();
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

  // Logo file input
  var logoInput = document.getElementById("logoFileInput");
  if (logoInput) {
    logoInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        handleLogoFile(e.target.files[0]);
        // Reset file input so re-selecting the same file triggers change
        e.target.value = "";
      }
    });
  }

  // Remove logo button
  var removeLogoBtn = document.getElementById("removeLogoBtn");
  if (removeLogoBtn) {
    removeLogoBtn.addEventListener("click", removeCompanyLogo);
  }

  // Reset All button
  var resetBtn = document.getElementById("resetAllBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      clearStorage();
      _invoiceCounter = 1;
      _state = resetInvoice();
      populateFormFromState();
      renderLogoThumbnail();
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
  var customerSlug = slugifyForFilename(state.client.name) || "client";
  var dateSlug = (state.date || "").replace(/-/g, "");
  var filename = customerSlug + "-invoice-" + dateSlug + "-" + state.invoiceNumber + ".pdf";

  // Show loading spinner, hide button text
  var btnText = document.getElementById("downloadBtnText");
  var btnSpinner = document.getElementById("downloadBtnSpinner");
  var btn = document.getElementById("downloadPdfBtn");

  if (btnText) btnText.style.display = "none";
  if (btnSpinner) btnSpinner.className = "";
  if (btn) btn.disabled = true;

  var wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:absolute;left:0;top:0;width:800px;z-index:9998;background:#fff;" +
    "padding:24px;";

  var clone = element.cloneNode(true);
  clone.style.position = "static";
  clone.style.width = "100%";
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Force layout so html2canvas reads the correct dimensions
  wrapper.offsetHeight;

  var opt = {
    margin: 0.5,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  function cleanup() {
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    if (btnText) btnText.style.display = "";
    if (btnSpinner) btnSpinner.className = "spinner-hidden";
    if (btn) btn.disabled = false;
  }

  html2pdf()
    .set(opt)
    .from(clone)
    .save()
    .then(cleanup)
    .catch(function () {
      cleanup();
      alert("PDF generation failed. Please try again.");
    });
}

// ============================================================
// Products Catalog Module
// ============================================================

var PRODUCTS_STORAGE_KEY = "invoice_saved_products";

// Module-level products array — loaded from localStorage on init
var _products = [];

/**
 * Loads products from localStorage into the module-level array.
 * @returns {Array} The products array [{id, description, unitPrice}, ...]
 */
function loadProducts() {
  try {
    var raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      _products = JSON.parse(raw);
    } else {
      _products = [];
    }
  } catch (e) {
    _products = [];
  }
  return _products;
}

/**
 * Persists the current products array to localStorage.
 */
function saveProducts() {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(_products));
  } catch (e) {
    // localStorage unavailable or full
  }
}

/**
 * Generates a unique ID for a new product (timestamp-based).
 * @returns {string} Unique identifier
 */
function generateProductId() {
  return "prod_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
}

/**
 * Validates a product before adding.
 * Returns an error string if invalid, or null if valid.
 * @param {string} name - Product description
 * @param {string} priceStr - Unit price as string from the form input
 * @returns {string|null} Error message or null
 */
function validateProduct(name, priceStr) {
  if (!name || name.trim() === "") {
    return "Please enter a product name or description.";
  }
  var price = parseFloat(priceStr);
  if (isNaN(price) || price < 0) {
    return "Please enter a valid non-negative price.";
  }
  return null;
}

/**
 * Adds a product to the catalog.
 * Validates the form, persists to storage, and re-renders the list.
 * @param {string} name - Product description
 * @param {number} price - Unit price
 * @returns {boolean} True if the product was added, false if validation failed
 */
function addProduct(name, price) {
  var error = validateProduct(name, String(price));
  if (error) {
    showProductError(error);
    return false;
  }
  var parsedPrice = parseFloat(price);
  _products.push({
    id: generateProductId(),
    description: name.trim(),
    unitPrice: Math.round(parsedPrice * 100) / 100,
  });
  saveProducts();
  renderProductsList();
  showProductAddConfirm();
  // Clear form inputs
  setFieldValue("productName", "");
  setFieldValue("productPrice", "");
  return true;
}

/**
 * Removes a product by ID from the catalog.
 * @param {string} id - The product ID to delete
 */
function deleteProduct(id) {
  _products = _products.filter(function (p) {
    return p.id !== id;
  });
  saveProducts();
  renderProductsList();
}

/**
 * Renders the products list table (or empty state message).
 */
function renderProductsList() {
  var table = document.getElementById("productsTable");
  var tbody = document.getElementById("productsTableBody");
  var emptyMsg = document.getElementById("productsEmptyMsg");

  if (!table || !tbody) return;

  // Clear table
  tbody.innerHTML = "";

  if (_products.length === 0) {
    table.style.display = "none";
    if (emptyMsg) emptyMsg.style.display = "";
  } else {
    table.style.display = "";
    if (emptyMsg) emptyMsg.style.display = "none";

    for (var i = 0; i < _products.length; i++) {
      var product = _products[i];
      var row = document.createElement("tr");

      row.innerHTML =
        "<td>" +
        escapeHtml(product.description) +
        "</td>" +
        '<td class="product-price-cell">' +
        formatCurrency(product.unitPrice) +
        "</td>" +
        '<td><button type="button" class="btn-delete-product" data-product-id="' +
        product.id +
        '">Delete</button></td>';

      tbody.appendChild(row);
    }
  }

  // Refresh the product selector in the invoice form
  populateProductSelector();
}

/**
 * Shows a brief confirmation when a product is added.
 */
function showProductAddConfirm() {
  var el = document.getElementById("productAddMsg");
  if (!el) return;
  // Hide any lingering error
  var errEl = document.getElementById("productErrorMsg");
  if (errEl) errEl.style.display = "none";
  el.style.display = "inline-block";
  el.style.animation = "none";
  el.offsetHeight;
  el.style.animation = "";
  setTimeout(function () {
    el.style.display = "none";
  }, 2000);
}

/**
 * Shows a validation error message for the product form.
 * @param {string} msg - The error text
 */
function showProductError(msg) {
  var el = document.getElementById("productErrorMsg");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "inline-block";
  el.style.animation = "none";
  el.offsetHeight;
  el.style.animation = "";
  // Auto-hide after 3 seconds
  setTimeout(function () {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.3s ease";
    setTimeout(function () {
      el.style.display = "none";
      el.style.opacity = "1";
      el.style.transition = "";
    }, 300);
  }, 3000);
}

// ============================================================
// CSV Product Import Module
// ============================================================

/**
 * Handles CSV file selection from the file input.
 * Reads the file as text and delegates to parseAndImportCSV.
 * @param {File} file - The selected CSV file
 */
function handleCSVFile(file) {
  if (!file) return;

  // Validate file extension
  if (!file.name.toLowerCase().endsWith(".csv")) {
    showCSVImportError("Please select a .csv file.");
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    var text = e.target.result;
    parseAndImportCSV(text, file.name);
  };
  reader.onerror = function () {
    showCSVImportError("Failed to read file. Please try again.");
  };
  reader.readAsText(file);
}

/**
 * Parses CSV text, validates rows, and imports valid products.
 * Pure parsing logic separated from file I/O for testability.
 * @param {string} csvText - Raw CSV file content
 * @param {string} [fileName] - Optional filename for messaging
 * @returns {{ imported: number, skipped: number, errors: string[] }} Result summary
 */
function parseAndImportCSV(csvText, fileName) {
  var result = { imported: 0, skipped: 0, errors: [] };

  if (!csvText || csvText.trim() === "") {
    showCSVImportError("The CSV file is empty.");
    return result;
  }

  // Split by newline (handle \n, \r\n)
  var lines = csvText.split(/\r?\n/);
  if (lines.length === 0) {
    showCSVImportError("The CSV file contains no rows.");
    return result;
  }

  // Detect and skip header row
  var startIndex = 0;
  var firstLine = lines[0].trim();
  if (firstLine) {
    var firstFields = parseCSVLine(firstLine);
    if (firstFields.length >= 2) {
      var col0 = firstFields[0].toLowerCase().trim();
      var col1 = firstFields[1].toLowerCase().trim();
      // Detect header by common column names
      if (
        col0 === "description" ||
        col0 === "name" ||
        col0 === "product" ||
        col0 === "item" ||
        col1 === "price" ||
        col1 === "unit price" ||
        col1 === "unitprice" ||
        col1 === "cost" ||
        col1 === "amount" ||
        col1 === "rate"
      ) {
        startIndex = 1;
      }
    }
  }

  var newProducts = [];

  for (var i = startIndex; i < lines.length; i++) {
    var line = lines[i].trim();
    // Skip empty lines
    if (line === "") continue;

    var fields = parseCSVLine(line);

    // Need at least description and price (2 columns)
    if (fields.length < 2) {
      result.skipped++;
      continue;
    }

    var description = cleanCSVField(fields[0]);
    var priceStr = cleanCSVField(fields[1]);
    var price = parseFloat(priceStr);

    // Validate
    if (!description || description === "") {
      result.skipped++;
      continue;
    }
    if (isNaN(price) || price < 0) {
      result.skipped++;
      continue;
    }

    // Create product object
    newProducts.push({
      id: generateProductId(),
      description: description,
      unitPrice: Math.round(price * 100) / 100,
    });
  }

  // Merge into _products array
  if (newProducts.length > 0) {
    for (var j = 0; j < newProducts.length; j++) {
      _products.push(newProducts[j]);
    }
    saveProducts();
    renderProductsList();
    populateProductSelector();
    result.imported = newProducts.length;
    showCSVImportSuccess(result.imported, result.skipped);
  } else if (result.skipped > 0) {
    showCSVImportError(
      "No valid products found. " +
        result.skipped +
        " row(s) were skipped due to invalid data."
    );
  } else {
    showCSVImportError("No data rows found in the CSV file.");
  }

  return result;
}

/**
 * Parses a single CSV line into an array of fields.
 * Handles quoted fields containing commas.
 * @param {string} line - A single line of CSV text
 * @returns {string[]} Array of field values
 */
function parseCSVLine(line) {
  var fields = [];
  var current = "";
  var inQuotes = false;

  for (var i = 0; i < line.length; i++) {
    var ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Double quote inside quotes escapes to a single quote
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip next char
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  // Push the last field
  fields.push(current);
  return fields;
}

/**
 * Cleans a CSV field value by trimming whitespace and stripping
 * surrounding quotes.
 * @param {string} field - Raw CSV field value
 * @returns {string} Cleaned field value
 */
function cleanCSVField(field) {
  if (typeof field !== "string") return "";
  var cleaned = field.trim();
  // Strip surrounding quotes if present
  if (
    cleaned.length >= 2 &&
    cleaned[0] === '"' &&
    cleaned[cleaned.length - 1] === '"'
  ) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned;
}

/**
 * Displays a success message for the CSV import.
 * @param {number} imported - Number of successfully imported products
 * @param {number} skipped - Number of skipped rows
 */
function showCSVImportSuccess(imported, skipped) {
  var successEl = document.getElementById("csvImportSuccessMsg");
  var errorEl = document.getElementById("csvImportErrorMsg");
  if (!successEl) return;

  var msg = "Successfully imported " + imported + " product(s).";
  if (skipped > 0) {
    msg += " (" + skipped + " invalid row(s) skipped)";
  }

  if (errorEl) errorEl.style.display = "none";
  successEl.textContent = msg;
  successEl.style.display = "inline-block";
  successEl.style.animation = "none";
  successEl.offsetHeight;
  successEl.style.animation = "";
  // Auto-hide after 5 seconds (longer than add confirmation since more info)
  setTimeout(function () {
    successEl.style.display = "none";
  }, 5000);
}

/**
 * Displays an error message for the CSV import.
 * @param {string} msg - Error message text
 */
function showCSVImportError(msg) {
  var errorEl = document.getElementById("csvImportErrorMsg");
  var successEl = document.getElementById("csvImportSuccessMsg");
  if (!errorEl) return;

  if (successEl) successEl.style.display = "none";
  errorEl.textContent = msg;
  errorEl.style.display = "inline-block";
  errorEl.style.animation = "none";
  errorEl.offsetHeight;
  errorEl.style.animation = "";
  // Auto-hide after 5 seconds
  setTimeout(function () {
    errorEl.style.opacity = "0";
    errorEl.style.transition = "opacity 0.3s ease";
    setTimeout(function () {
      errorEl.style.display = "none";
      errorEl.style.opacity = "1";
      errorEl.style.transition = "";
    }, 300);
  }, 5000);
}

// ============================================================
// Autocomplete & Suggestions Module
// ============================================================

/**
 * Reads the saved company profile from localStorage.
 * @returns {Object|null} The profile {name, address, email, logo} or null
 */
function getSavedCompanyProfile() {
  try {
    var raw = localStorage.getItem(COMPANY_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Reads saved customer profiles from localStorage.
 * @returns {Array} Array of customer profiles [{id, name, address, email}, ...]
 */
function getSavedCustomers() {
  return _customers;
}

/**
 * Shows a suggestion dropdown below an input element.
 * @param {HTMLElement} inputEl - The input element
 * @param {string} suggestionElId - The ID of the suggestion <ul> element
 * @param {Array} items - Array of {label, sub} suggestion objects
 * @param {function} onSelect - Callback(item, index) when an item is clicked
 */
function showSuggestions(inputEl, suggestionElId, items, onSelect) {
  var dropdown = document.getElementById(suggestionElId);
  if (!dropdown || items.length === 0) {
    if (dropdown) dropdown.classList.remove("visible");
    return;
  }

  dropdown.innerHTML = "";
  for (var i = 0; i < items.length; i++) {
    var li = document.createElement("li");
    li.setAttribute("data-index", i);
    li.textContent = items[i].label;
    if (items[i].sub) {
      var span = document.createElement("span");
      span.className = "suggestion-label";
      span.textContent = items[i].sub;
      li.appendChild(span);
    }
    // Store callback reference via closure
    li.addEventListener("mousedown", (function (item, idx) {
      return function (e) {
        e.preventDefault(); // prevent input blur before click fires
        onSelect(item, idx);
        hideAllSuggestions();
      };
    })(items[i], i));
    dropdown.appendChild(li);
  }

  dropdown.classList.add("visible");
}

/**
 * Hides all suggestion dropdowns.
 * @param {string} [exceptId] - Optional ID of a dropdown to keep open
 */
function hideAllSuggestions(exceptId) {
  var dropdowns = document.querySelectorAll(".suggestion-dropdown");
  for (var i = 0; i < dropdowns.length; i++) {
    if (exceptId && dropdowns[i].id === exceptId) continue;
    dropdowns[i].classList.remove("visible");
  }
}

/**
 * Applies a saved company profile to the active invoice state and form.
 * @param {Object} profile - The company profile {name, address, email, logo}
 */
function applyCompanySuggestion(profile) {
  if (!profile) return;
  // Update state fields
  updateInvoiceField("company.name", profile.name || "");
  updateInvoiceField("company.address", profile.address || "");
  updateInvoiceField("company.email", profile.email || "");
  // Update form inputs
  setFieldValue("companyName", profile.name || "");
  setFieldValue("companyAddress", profile.address || "");
  setFieldValue("companyEmail", profile.email || "");
  // Apply logo
  if (profile.logo) {
    setCompanyLogo(profile.logo);
  } else {
    removeCompanyLogo();
  }
}

/**
 * Applies a saved customer profile to the active invoice state and form.
 * @param {Object} profile - The customer profile {name, address, email}
 */
function applyCustomerSuggestion(profile) {
  if (!profile) return;
  // Update state fields
  updateInvoiceField("client.name", profile.name || "");
  updateInvoiceField("client.address", profile.address || "");
  updateInvoiceField("client.email", profile.email || "");
  // Update form inputs
  setFieldValue("clientName", profile.name || "");
  setFieldValue("clientAddress", profile.address || "");
  setFieldValue("clientEmail", profile.email || "");
  renderPreview();
  autoSave();
}

/**
 * Wires up autocomplete suggestion dropdowns for Company Name and Client Name inputs.
 */
function initAutocomplete() {
  // --- Company Name Autocomplete ---
  var companyInput = document.getElementById("companyName");
  var companyDropdown = document.getElementById("companyNameSuggestions");

  if (companyInput && companyDropdown) {
    companyInput.addEventListener("focus", function () {
      var profile = getSavedCompanyProfile();
      if (profile && profile.name) {
        var filter = companyInput.value.trim().toLowerCase();
        if (!filter || profile.name.toLowerCase().indexOf(filter) !== -1) {
          showSuggestions(companyInput, "companyNameSuggestions", [
            { label: profile.name, sub: profile.address || profile.email || "" }
          ], function (item) {
            applyCompanySuggestion(profile);
          });
        }
      }
    });

    companyInput.addEventListener("input", function () {
      var profile = getSavedCompanyProfile();
      if (profile && profile.name) {
        var filter = companyInput.value.trim().toLowerCase();
        if (!filter || profile.name.toLowerCase().indexOf(filter) !== -1) {
          showSuggestions(companyInput, "companyNameSuggestions", [
            { label: profile.name, sub: profile.address || profile.email || "" }
          ], function (item) {
            applyCompanySuggestion(profile);
          });
        } else {
          companyDropdown.classList.remove("visible");
        }
      }
    });

    // Hide on blur after a short delay to allow mousedown on suggestion
    companyInput.addEventListener("blur", function () {
      setTimeout(function () {
        hideAllSuggestions();
      }, 150);
    });
  }

  // --- Client Name Autocomplete ---
  var clientInput = document.getElementById("clientName");
  var clientDropdown = document.getElementById("clientNameSuggestions");

  if (clientInput && clientDropdown) {
    clientInput.addEventListener("focus", function () {
      var customers = getSavedCustomers();
      if (customers.length > 0) {
        var filter = clientInput.value.trim().toLowerCase();
        var matches = [];
        for (var i = 0; i < customers.length; i++) {
          if (!filter || customers[i].name.toLowerCase().indexOf(filter) !== -1) {
            matches.push({
              label: customers[i].name,
              sub: customers[i].address || customers[i].email || "",
              profile: customers[i]
            });
          }
        }
        if (matches.length > 0) {
          showSuggestions(clientInput, "clientNameSuggestions", matches, function (item) {
            applyCustomerSuggestion(item.profile);
          });
        }
      }
    });

    clientInput.addEventListener("input", function () {
      var customers = getSavedCustomers();
      if (customers.length > 0) {
        var filter = clientInput.value.trim().toLowerCase();
        var matches = [];
        for (var i = 0; i < customers.length; i++) {
          if (!filter || customers[i].name.toLowerCase().indexOf(filter) !== -1) {
            matches.push({
              label: customers[i].name,
              sub: customers[i].address || customers[i].email || "",
              profile: customers[i]
            });
          }
        }
        if (matches.length > 0) {
          showSuggestions(clientInput, "clientNameSuggestions", matches, function (item) {
            applyCustomerSuggestion(item.profile);
          });
        } else {
          clientDropdown.classList.remove("visible");
        }
      }
    });

    clientInput.addEventListener("blur", function () {
      setTimeout(function () {
        hideAllSuggestions();
      }, 150);
    });
  }
}

// ============================================================
// Product Selector in Invoice Form
// ============================================================

/**
 * Populates the product selector dropdown in the invoice form with
 * saved products from the catalog.
 */
function populateProductSelector() {
  var selector = document.getElementById("productSelector");
  if (!selector) return;

  // Clear existing options except the placeholder
  while (selector.options.length > 1) {
    selector.remove(1);
  }

  var products = _products;
  for (var i = 0; i < products.length; i++) {
    var option = document.createElement("option");
    option.value = products[i].id;
    option.textContent = products[i].description + " (" + formatCurrency(products[i].unitPrice) + ")";
    selector.appendChild(option);
  }
}

/**
 * Handles product selection from the dropdown — appends a pre-filled
 * line item to the invoice and resets the selector.
 */
function handleProductSelect() {
  var selector = document.getElementById("productSelector");
  if (!selector) return;
  var productId = selector.value;
  if (!productId) return;

  // Find the product
  var product = null;
  for (var i = 0; i < _products.length; i++) {
    if (_products[i].id === productId) {
      product = _products[i];
      break;
    }
  }
  if (!product) {
    selector.value = "";
    return;
  }

  var state = getInvoiceState();
  state.items.push({
    description: product.description,
    quantity: 1,
    unitPrice: product.unitPrice,
  });
  renderLineItems();
  renderPreview();
  autoSave();

  // Reset selector to placeholder
  selector.value = "";
}

// ============================================================
// Tab Navigation Module
// ============================================================

/**
 * Initializes tab switching behavior.
 * Clicking a tab activates the corresponding view container.
 */
function initTabs() {
  var tabs = document.querySelectorAll(".tab");
  var views = document.querySelectorAll(".view-container");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var targetId = "view-" + tab.dataset.tab;

      // Update active tab
      tabs.forEach(function (t) {
        t.classList.remove("active");
      });
      tab.classList.add("active");

      // Show target view, hide others
      views.forEach(function (v) {
        v.classList.remove("active");
      });
      var target = document.getElementById(targetId);
      if (target) {
        target.classList.add("active");
      }
    });
  });
}

// ============================================================
// Profile Forms Initialization
// ============================================================

/**
 * Wires up profile form elements: save buttons, logo input, and loads
 * saved profile data from localStorage on DOM ready.
 */
function initProfileForms() {
  // --- My Company Profile ---

  // Load saved company profile
  loadCompanyProfile();

  // Save button
  var saveCompanyBtn = document.getElementById("saveCompanyProfileBtn");
  if (saveCompanyBtn) {
    saveCompanyBtn.addEventListener("click", saveCompanyProfile);
  }

  // Logo file input
  var profileLogoInput = document.getElementById("profileCompanyLogoInput");
  if (profileLogoInput) {
    profileLogoInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        handleProfileCompanyLogoFile(e.target.files[0]);
        e.target.value = "";
      }
    });
  }

  // Remove logo button
  var profileRemoveLogoBtn = document.getElementById("profileCompanyRemoveLogoBtn");
  if (profileRemoveLogoBtn) {
    profileRemoveLogoBtn.addEventListener("click", removeProfileCompanyLogo);
  }

  // --- Bill To Customer Profiles ---

  // Load saved customers from localStorage and render the list
  loadCustomers();
  renderCustomersList();

  // Add / Update Customer button
  var addCustomerBtn = document.getElementById("addCustomerBtn");
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener("click", function () {
      var nameInput = document.getElementById("profileClientName");
      var addressInput = document.getElementById("profileClientAddress");
      var emailInput = document.getElementById("profileClientEmail");
      if (!nameInput || !addressInput || !emailInput) return;

      var name = nameInput.value;
      var address = addressInput.value;
      var email = emailInput.value;

      if (_editingCustomerId) {
        // Update existing customer
        var error = validateCustomer(name);
        if (error) {
          showCustomerError(error);
          return;
        }
        for (var ci = 0; ci < _customers.length; ci++) {
          if (_customers[ci].id === _editingCustomerId) {
            _customers[ci].name = name.trim();
            _customers[ci].address = (address || "").trim();
            _customers[ci].email = (email || "").trim();
            break;
          }
        }
        saveCustomers();
        renderCustomersList();
        showCustomerUpdatedConfirm();
        cancelEditCustomer();
      } else {
        addCustomer(name, address, email);
      }
    });
  }

  // Cancel Edit Customer button
  var cancelEditBtn = document.getElementById("cancelEditCustomerBtn");
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", cancelEditCustomer);
  }

  // Delegate clicks on the customers table body for edit and delete buttons
  var customersTbody = document.getElementById("customersTableBody");
  if (customersTbody) {
    customersTbody.addEventListener("click", function (e) {
      var target = e.target;
      if (target.classList.contains("btn-delete-product") && target.dataset.customerId) {
        deleteCustomer(target.dataset.customerId);
      } else if (target.classList.contains("btn-edit-customer") && target.dataset.customerId) {
        startEditCustomer(target.dataset.customerId);
      }
    });
  }

  // --- Products Catalog ---

  // Load products from localStorage and render the list
  loadProducts();
  renderProductsList();
  // Also populate the product selector in the invoice form
  populateProductSelector();

  // Add Product button
  var addProductBtn = document.getElementById("addProductBtn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", function () {
      var nameInput = document.getElementById("productName");
      var priceInput = document.getElementById("productPrice");
      if (nameInput && priceInput) {
        addProduct(nameInput.value, priceInput.value);
      }
    });
  }

  // Delegate clicks on the products table body for delete buttons
  var productsTbody = document.getElementById("productsTableBody");
  if (productsTbody) {
    productsTbody.addEventListener("click", function (e) {
      var target = e.target;
      if (target.classList.contains("btn-delete-product") && target.dataset.productId) {
        deleteProduct(target.dataset.productId);
      }
    });
  }

  // CSV file input — import products on file selection
  var csvFileInput = document.getElementById("csvFileInput");
  if (csvFileInput) {
    csvFileInput.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        // Show selected filename
        var fileNameEl = document.getElementById("csvImportFileName");
        if (fileNameEl) {
          fileNameEl.textContent = e.target.files[0].name;
        }
        handleCSVFile(e.target.files[0]);
        // Reset file input so re-selecting the same file triggers change
        e.target.value = "";
      }
    });
  }

  // Product selector in invoice form — add line item on selection
  var productSelector = document.getElementById("productSelector");
  if (productSelector) {
    productSelector.addEventListener("change", handleProductSelect);
  }
}

// Initialize form on DOM ready (browser only)
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    initForm();
    initTabs();
    initProfileForms();
    initAutocomplete();
    // Populate product selector (products already loaded by initProfileForms)
    populateProductSelector();
  });
}
