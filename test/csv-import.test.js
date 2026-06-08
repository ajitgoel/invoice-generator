// Tests for CSV product import module
// Tests the CSV parsing and validation functions

// --- parseCSVLine() ---

test("parseCSVLine() splits a simple comma-separated line", function () {
  var result = parseCSVLine("Web Development,1500");
  assertEqual(result.length, 2, "has 2 fields");
  assertEqual(result[0], "Web Development");
  assertEqual(result[1], "1500");
});

test("parseCSVLine() handles quoted fields containing commas", function () {
  var result = parseCSVLine('"Design, UX, and Branding",2500');
  assertEqual(result.length, 2, "has 2 fields");
  assertEqual(result[0], "Design, UX, and Branding");
  assertEqual(result[1], "2500");
});

test("parseCSVLine() handles escaped double quotes inside quoted fields", function () {
  var result = parseCSVLine('"12"" Monitor",199.99');
  assertEqual(result.length, 2, "has 2 fields");
  assertEqual(result[0], '12" Monitor');
  assertEqual(result[1], "199.99");
});

test("parseCSVLine() handles single-field line (no commas)", function () {
  var result = parseCSVLine("OnlyOneField");
  assertEqual(result.length, 1, "has 1 field");
  assertEqual(result[0], "OnlyOneField");
});

test("parseCSVLine() handles empty line", function () {
  var result = parseCSVLine("");
  assertEqual(result.length, 1, "has 1 empty field");
  assertEqual(result[0], "");
});

test("parseCSVLine() handles trailing comma", function () {
  var result = parseCSVLine("Description,");
  assertEqual(result.length, 2, "has 2 fields");
  assertEqual(result[0], "Description");
  assertEqual(result[1], "");
});

// --- cleanCSVField() ---

test("cleanCSVField() trims whitespace", function () {
  var result = cleanCSVField("  Web Design  ");
  assertEqual(result, "Web Design");
});

test("cleanCSVField() strips surrounding double quotes", function () {
  var result = cleanCSVField('"Web Design"');
  assertEqual(result, "Web Design");
});

test("cleanCSVField() strips quotes and trims", function () {
  var result = cleanCSVField('  "Web Design"  ');
  assertEqual(result, "Web Design");
});

test("cleanCSVField() does not strip quotes that are not surrounding", function () {
  var result = cleanCSVField('12" Monitor');
  assertEqual(result, '12" Monitor');
});

test("cleanCSVField() returns empty string for non-string input", function () {
  assertEqual(cleanCSVField(null), "");
  assertEqual(cleanCSVField(undefined), "");
});

// --- parseAndImportCSV() integration tests ---
// Note: These tests mutate _products and localStorage.
// We save and restore state around them.

test("parseAndImportCSV() imports valid products from CSV without header", function () {
  // Save state
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Web Development,1500\nGraphic Design,500\nConsulting,200";
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 3, "imported 3 products");
    assertEqual(result.skipped, 0, "skipped 0 rows");
    assertEqual(_products.length, 3, "_products has 3 items");
    assertEqual(_products[0].description, "Web Development");
    assertEqual(_products[0].unitPrice, 1500);
    assertEqual(_products[1].description, "Graphic Design");
    assertEqual(_products[1].unitPrice, 500);
    assertEqual(_products[2].description, "Consulting");
    assertEqual(_products[2].unitPrice, 200);
  } finally {
    // Restore state
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() detects and skips header row with 'description' and 'price'", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Description,Price\nWeb Development,1500\nGraphic Design,500";
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 2, "imported 2 products (header skipped)");
    assertEqual(_products[0].description, "Web Development");
    assertEqual(_products[0].unitPrice, 1500);
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() detects header with alternate column names (Name, Cost)", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Name,Cost\nConsulting,200";
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 1, "imported 1 product (header skipped)");
    assertEqual(_products[0].description, "Consulting");
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() skips rows with empty description", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Web Development,1500\n,500\nConsulting,200";
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 2, "imported 2 valid products");
    assertEqual(result.skipped, 1, "skipped 1 row with empty description");
    assertEqual(_products.length, 2);
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() skips rows with negative price", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Web Development,1500\nRefund,-100\nConsulting,200";
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 2, "imported 2 valid products");
    assertEqual(result.skipped, 1, "skipped row with negative price");
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() skips rows with non-numeric price", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Web Development,free\nConsulting,200";
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 1, "imported 1 valid product");
    assertEqual(result.skipped, 1, "skipped row with non-numeric price");
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() handles quoted fields in CSV", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = '"Web Development, Full Stack",1500\n"Design",500';
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 2, "imported 2 products");
    assertEqual(_products[0].description, "Web Development, Full Stack");
    assertEqual(_products[0].unitPrice, 1500);
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() handles Windows-style line endings (\\r\\n)", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Description,Price\r\nWeb Development,1500\r\nDesign,500";
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 2, "imported 2 products with CRLF line endings");
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() skips empty lines between data rows", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Web Development,1500\n\nConsulting,200\n\n";
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 2, "imported 2 products, skipped blank lines");
    assertEqual(result.skipped, 0, "blank lines are not counted as skipped");
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() generates unique IDs for imported products", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Product A,10\nProduct B,20\nProduct C,30";
    parseAndImportCSV(csv, "test.csv");

    assertEqual(_products.length, 3, "3 products imported");
    // All IDs should be unique
    var ids = {};
    for (var i = 0; i < _products.length; i++) {
      ids[_products[i].id] = true;
    }
    var idCount = Object.keys(ids).length;
    assertEqual(idCount, 3, "all product IDs are unique");
    // IDs should start with "prod_"
    for (var j = 0; j < _products.length; j++) {
      assertOk(_products[j].id.indexOf("prod_") === 0, "ID starts with prod_");
    }
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() merges into existing products", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [{ id: "existing_1", description: "Existing Product", unitPrice: 100 }];
    var csv = "New Product,200";
    parseAndImportCSV(csv, "test.csv");

    assertEqual(_products.length, 2, "has 2 products after merge");
    assertEqual(_products[0].description, "Existing Product");
    assertEqual(_products[1].description, "New Product");
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});

test("parseAndImportCSV() accepts zero as a valid price", function () {
  var savedProducts = _products.slice();
  var savedStorage = localStorage.getItem("invoice_saved_products");

  try {
    _products = [];
    var csv = "Free Service,0\nPaid Service,100";
    var result = parseAndImportCSV(csv, "test.csv");

    assertEqual(result.imported, 2, "imported both products including zero-price");
    assertEqual(_products[0].unitPrice, 0);
    assertEqual(_products[1].unitPrice, 100);
  } finally {
    _products = savedProducts;
    saveProducts();
    if (savedStorage) {
      localStorage.setItem("invoice_saved_products", savedStorage);
    } else {
      localStorage.removeItem("invoice_saved_products");
    }
  }
});
