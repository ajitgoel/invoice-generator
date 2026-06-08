// Simple test runner for vanilla JS
// Tests are registered then run when the page loads

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assertEqual(actual, expected, msg) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(
      (msg ? msg + ": " : "") +
        "expected " + expectedStr + ", got " + actualStr
    );
  }
}

function assertDeepEqual(actual, expected, msg) {
  // Deep comparison that handles nested objects and arrays
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(
      (msg ? msg + ": " : "") +
        "expected " + expectedStr + ", got " + actualStr
    );
  }
}

function assertNotEqual(actual, expected, msg) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    throw new Error(
      (msg ? msg + ": " : "") + "got unexpected equality: " + actualStr
    );
  }
}

function assertNotSameRef(actual, expected, msg) {
  if (actual === expected) {
    throw new Error(
      (msg ? msg + ": " : "") + "expected different object references, got same"
    );
  }
}

function assertOk(value, msg) {
  if (!value) {
    throw new Error((msg ? msg + ": " : "") + "expected truthy, got " + value);
  }
}

function runTests() {
  const resultsEl = document.getElementById("results");
  for (const t of tests) {
    try {
      t.fn();
      passed++;
      resultsEl.innerHTML +=
        '<div class="pass">✅ PASS: ' + t.name + "</div>";
    } catch (e) {
      failed++;
      resultsEl.innerHTML +=
        '<div class="fail">❌ FAIL: ' + t.name + " — " + e.message + "</div>";
    }
  }
  resultsEl.innerHTML +=
    "<hr><strong>" +
    passed +
    " passed, " +
    failed +
    " failed, " +
    tests.length +
    " total</strong>";
}
