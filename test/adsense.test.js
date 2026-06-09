// Integration tests for Google AdSense configuration.
// These tests verify the DOM structure of index.html, not app.js functions.
// They are designed to be evaluated via page.evaluate() in Playwright.

/**
 * Returns an object with pass/fail results for each AdSense assertion.
 * Called from the Playwright test runner via page.evaluate().
 */
function runAdsenseTests() {
  var results = [];
  var pass = 0;
  var fail = 0;

  function check(name, condition, detail) {
    if (condition) {
      pass++;
      results.push("✅ PASS: " + name);
    } else {
      fail++;
      results.push("❌ FAIL: " + name + (detail ? " — " + detail : ""));
    }
  }

  // --- Test 1: AdSense script tag in <head> ---
  var adsenseScript = document.querySelector(
    'head script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
  );
  check(
    "AdSense script tag exists in <head> with correct src",
    adsenseScript !== null
  );
  if (adsenseScript) {
    check(
      "AdSense script has async attribute",
      adsenseScript.async === true || adsenseScript.getAttribute("async") !== null
    );
    check(
      "AdSense script has data-ad-client attribute",
      adsenseScript.getAttribute("data-ad-client") !== null &&
        adsenseScript.getAttribute("data-ad-client").length > 0
    );
    check(
      "AdSense data-ad-client uses placeholder format",
      adsenseScript.getAttribute("data-ad-client") === "ca-pub-PLACEHOLDER"
    );
    check(
      "AdSense script has crossorigin='anonymous'",
      adsenseScript.getAttribute("crossorigin") === "anonymous"
    );
  }

  // --- Test 2: Ad container with adsbygoogle class exists ---
  var adContainer = document.querySelector("ins.adsbygoogle");
  check(
    "Ad container <ins> element with adsbygoogle class exists",
    adContainer !== null
  );
  if (adContainer) {
    check(
      "Ad container has data-ad-format attribute",
      adContainer.getAttribute("data-ad-format") !== null
    );
    check(
      "Ad container data-ad-format is 'auto' (responsive)",
      adContainer.getAttribute("data-ad-format") === "auto"
    );
    check(
      "Ad container has data-ad-layout-key attribute",
      adContainer.getAttribute("data-ad-layout-key") !== null
    );
    var parentContainer = adContainer.closest(".ad-container");
    check(
      "Ad container is wrapped in .ad-container div",
      parentContainer !== null
    );
  }

  // --- Test 3: .ad-container not inside preview (won't appear on PDF) ---
  var previewAd = document.querySelector("#invoicePreview .ad-container");
  check(
    ".ad-container is NOT inside the invoice preview element",
    previewAd === null
  );

  // --- Test 4: Ad container comes after the download PDF button ---
  var downloadBtn = document.getElementById("downloadPdfBtn");
  if (downloadBtn && adContainer) {
    var downloadBtnPosition =
      downloadBtn.compareDocumentPosition(adContainer);
    var isAfter =
      (downloadBtnPosition & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    check(
      "Ad container is positioned after the Download PDF button in the DOM",
      isAfter
    );
  }

  // --- Test 5: (adsbygoogle = window.adsbygoogle || []) push script ---
  var pushScripts = document.querySelectorAll("script");
  var foundPush = false;
  for (var i = 0; i < pushScripts.length; i++) {
    var text = pushScripts[i].textContent || "";
    if (
      text.indexOf("adsbygoogle") !== -1 &&
      text.indexOf(".push") !== -1
    ) {
      foundPush = true;
      break;
    }
  }
  check(
    "Inline script with (adsbygoogle = window.adsbygoogle || []).push({}) exists",
    foundPush
  );

  return {
    results: results,
    pass: pass,
    fail: fail,
    total: pass + fail,
  };
}

// Export for module environments (Playwright page.evaluate)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { runAdsenseTests };
}
