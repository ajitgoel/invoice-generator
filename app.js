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
var CUSTOMER_PROFILE_KEY = "invoice_saved_customer";

// Module-level variable for the company profile logo data URL
var _profileCompanyLogo = null;

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
 * Saves the Bill To Customer profile from form fields to localStorage.
 */
function saveCustomerProfile() {
  var profile = {
    name: document.getElementById("profileClientName").value.trim(),
    address: document.getElementById("profileClientAddress").value.trim(),
    email: document.getElementById("profileClientEmail").value.trim(),
  };
  try {
    localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
    showSaveConfirm("customerProfileSavedMsg");
  } catch (e) {
    // localStorage unavailable or full
  }
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
 * Loads the Bill To Customer profile from localStorage and populates the form.
 */
function loadCustomerProfile() {
  try {
    var raw = localStorage.getItem(CUSTOMER_PROFILE_KEY);
    if (!raw) return;
    var profile = JSON.parse(raw);
    if (profile.name !== undefined) setFieldValue("profileClientName", profile.name);
    if (profile.address !== undefined) setFieldValue("profileClientAddress", profile.address);
    if (profile.email !== undefined) setFieldValue("profileClientEmail", profile.email);
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

  // Logo
  if (state.company.logo) {
    html +=
      '<img src="' +
      state.company.logo +
      '" alt="Company Logo" class="inv-logo">';
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
  var filename = "invoice-" + state.invoiceNumber + ".pdf";

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

  // --- Bill To Customer Profile ---

  // Load saved customer profile
  loadCustomerProfile();

  // Save button
  var saveCustomerBtn = document.getElementById("saveCustomerProfileBtn");
  if (saveCustomerBtn) {
    saveCustomerBtn.addEventListener("click", saveCustomerProfile);
  }

  // --- Products Tab ---
  // Placeholder — full implementation in issue 09
}

// Initialize form on DOM ready (browser only)
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    initForm();
    initTabs();
    initProfileForms();
  });
}
