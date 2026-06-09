# InvoiceCraft — AdSense & Analytics Configuration Guide

This guide covers configuring Google AdSense (monetization) and Google Analytics 4 (traffic tracking) for [invoicecraft.org](https://invoicecraft.org).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Google AdSense](#google-adsense)
  - [1. Create an AdSense Account](#1-create-an-adsense-account)
  - [2. Get Your Publisher ID](#2-get-your-publisher-id)
  - [3. Create an Ad Unit](#3-create-an-ad-unit)
  - [4. Configure the Application](#4-configure-the-application)
  - [5. Ad Placement & Styling](#5-ad-placement--styling)
- [Google Analytics 4](#google-analytics-4)
  - [1. Create a GA4 Property](#1-create-a-ga4-property)
  - [2. Add the GA4 Script](#2-add-the-ga4-script)
  - [3. Configure Search Term Tracking](#3-configure-search-term-tracking)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A **Google account** (Gmail or Google Workspace)
- Access to the repository source code
- The domain `invoicecraft.org` verified in Google Search Console (recommended)

---

## Google AdSense

InvoiceCraft uses Google AdSense to display ads and generate revenue. The ad unit is placed below the invoice generator content and is hidden from printed/PDF output.

### 1. Create an AdSense Account

1. Go to [adsense.google.com](https://adsense.google.com) and sign in.
2. Click **Get Started** and enter `invoicecraft.org` as your site URL.
3. Complete the application — Google will review your site. Approval typically takes **1–2 weeks**.
4. While waiting, you can use placeholder IDs for development.

### 2. Get Your Publisher ID

Once approved:

1. In AdSense, go to **Account** → **Settings** → **Account information**.
2. Find your **Publisher ID** — it looks like `pub-8081762604519377`.
3. The `ca-pub-` prefix version (e.g., `ca-pub-8081762604519377`) is what you'll use.

### 3. Create an Ad Unit

1. In AdSense, go to **Ads** → **By ad unit** → **Create ad unit**.
2. Choose **Display ads**.
3. Configure:
   - **Ad size**: Responsive
   - **Ad type**: Display ads (text & image)
4. Copy the generated **Ad Slot ID** (e.g., `5282039429`) and the ad code snippet.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8081762604519377"
     crossorigin="anonymous"></script>
<!-- square-ad-unit -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-8081762604519377"
     data-ad-slot="5282039429"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>


### 4. Configure the Application

Replace the placeholder values in `index.html`:

#### Replace the AdSense script tag (line ~11)

```html
<!-- Before (placeholder) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-PLACEHOLDER" crossorigin="anonymous"></script>

<!-- After (real values) -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456" crossorigin="anonymous"></script>
```

#### Replace the ad unit attributes (line ~137–140)

```html
<!-- Before -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-PLACEHOLDER"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-ad-layout-key="-gw-3+1f-3d+2z"
     data-full-width-responsive="true"></ins>

<!-- After -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="9876543210"
     data-ad-format="auto"
     data-ad-layout-key="-gw-3+1f-3d+2z"
     data-full-width-responsive="true"></ins>
```

### 5. Ad Placement & Styling

The ad container is located at the bottom of the invoice generator view, after the preview panel and before the "Download PDF" button.

| CSS Class       | Purpose                                              |
|-----------------|------------------------------------------------------|
| `.ad-container` | Wrapper — centered, max-width 728px, responsive      |
| `@media print`  | Hides `.ad-container` with `display: none !important` |

To adjust ad placement or styling, edit the `.ad-container` block in `styles.css`.

---

## Google Analytics 4

GA4 tracks visitor traffic and captures search terms from landing URLs (e.g., from Google, Bing) as custom events.

### 1. Create a GA4 Property

1. Go to [analytics.google.com](https://analytics.google.com) and sign in.
2. Click **Admin** (gear icon) → **Create Property**.
3. Enter:
   - **Property name**: `InvoiceCraft`
   - **Reporting time zone**: Your timezone
   - **Currency**: USD
4. Click **Next** → fill in business details → **Create**.
5. Choose **Web** as the platform.
6. Enter:
   - **Website URL**: `https://invoicecraft.org`
   - **Stream name**: `InvoiceCraft Web`
7. Click **Create stream**.
8. Copy your **Measurement ID** — it looks like `G-XXXXXXXXXX`.

### 2. Add the GA4 Script

Add the Google Analytics 4 script tag to `index.html`, in the `<head>` alongside the existing AdSense script:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Place this **after** the AdSense script but **before** `</head>`.

### 3. Configure Search Term Tracking

InvoiceCraft captures search query parameters from landing URLs and sends them to GA4 as custom `search_term_landing` events. This helps understand what users are searching for when they find the site.

#### How it works

On page load, the tracking code:
1. Reads `window.location.search` for common search query parameters: `q`, `query`, `utm_term`, `keyword`
2. If a search term is found, sends a `search_term_landing` event to GA4 with:
   - `search_term` — the trimmed search phrase
   - `referrer_host` — the referring domain (or `direct` if none)

#### Implementation

Add the following function to `app.js`:

```js
/**
 * Track landing-page search queries via GA4.
 * Parses URL query parameters for search terms and sends them as
 * custom 'search_term_landing' events.
 */
function trackLandingSearchQueries() {
  try {
    if (typeof gtag !== 'function') return;

    const params = new URLSearchParams(window.location.search);
    const searchKeys = ['q', 'query', 'utm_term', 'keyword'];

    let searchTerm = null;
    for (const key of searchKeys) {
      const val = params.get(key);
      if (val && val.trim()) {
        searchTerm = val.trim();
        break;
      }
    }

    if (!searchTerm) return;

    let referrerHost = 'direct';
    try {
      if (document.referrer) {
        referrerHost = new URL(document.referrer).hostname;
      }
    } catch (_) {
      // Ignore malformed referrer URLs
    }

    gtag('event', 'search_term_landing', {
      search_term: searchTerm,
      referrer_host: referrerHost
    });
  } catch (_) {
    // Silently fail — tracking is non-critical
  }
}
```

Then call it on initialization. Add this near the bottom of `app.js`, inside any existing DOMContentLoaded or init block:

```js
// Initialize analytics tracking
trackLandingSearchQueries();
```

#### Viewing search term data in GA4

1. In GA4, go to **Reports** → **Engagement** → **Events**.
2. Find the `search_term_landing` event.
3. Click it to see the `search_term` and `referrer_host` parameters.
4. To build a custom report:
   - Go to **Explore** → **Create new exploration**
   - Add `search_term` and `referrer_host` as dimensions
   - Add `Event count` as the metric

---

## Verification

### AdSense

1. After deploying with real publisher IDs, open the site in a browser.
2. Check the browser console for AdSense-related messages.
3. Ads may take **20–60 minutes** to start serving after initial setup.
4. Use the **AdSense Preview Tool** (Chrome extension) to verify ad slots without live ads.

### Google Analytics

1. After deploying the GA4 script, open the site.
2. In GA4, go to **Reports** → **Real-time**.
3. You should see your visit appear within seconds.
4. To test search term tracking, visit:
   ```
   https://invoicecraft.org/?q=test+invoice+generator
   ```
5. The `search_term_landing` event should appear in Real-time events.

### Automated Tests

```bash
# Run AdSense integration tests
node test/run-adsense-tests.mjs

# Run linter and typechecker
npm run typecheck
npm test
```

---

## Troubleshooting

### Ads Not Showing

| Symptom                    | Likely Cause                          | Fix                                          |
|----------------------------|---------------------------------------|----------------------------------------------|
| Blank ad space             | Account still under review            | Wait for approval, use placeholders til then |
| Console: `adsbygoogle` error | Ad blocker enabled                  | Test in incognito with extensions disabled   |
| "No ad to show"            | New account, no inventory yet         | Wait 24–48 hours after approval              |
| Ad overlaps layout         | CSS conflict                          | Check `.ad-container` styles in devtools     |

### Analytics Not Tracking

| Symptom                    | Likely Cause                          | Fix                                          |
|----------------------------|---------------------------------------|----------------------------------------------|
| No real-time data          | Ad blocker or privacy extension       | Test in incognito / disable extensions       |
| `gtag is not defined`      | Script not loaded or order issue      | Ensure GA4 script is before tracking calls   |
| Missing search_term events | No `?q=` or similar in URL            | Test with `?q=test` query parameter          |

### Ad Blockers & Privacy Extensions

Both AdSense and GA4 can be blocked by:
- uBlock Origin
- AdBlock Plus
- Privacy Badger
- Brave browser (built-in shields)
- Safari (Intelligent Tracking Prevention)

The application handles this gracefully — ad containers simply don't render, and GA4 tracking fails silently without breaking the invoice generator functionality.

---

## Quick-Start Checklist

- [ ] AdSense account created and `invoicecraft.org` submitted for review
- [ ] Publisher ID (`ca-pub-XXXXXXXX`) replaced in AdSense script tag
- [ ] Ad Slot ID replaced in `data-ad-slot` attribute
- [ ] GA4 property created with `invoicecraft.org` stream
- [ ] Measurement ID (`G-XXXXXXXXXX`) added to GA4 script tag
- [ ] `trackLandingSearchQueries()` function added to `app.js`
- [ ] Search term tracking called on page init
- [ ] Tested in incognito window (no ad blockers)
- [ ] Real-time data confirmed in GA4
- [ ] `npm test` and `npm run typecheck` pass

---

## Reference: Ad Unit Codes

The `data-ad-layout-key="-gw-3+1f-3d+2z"` attribute configures a responsive layout optimized for:

| Layout Key Part | Meaning                                  |
|-----------------|------------------------------------------|
| `-gw`           | Google-width responsive                  |
| `3+1f`          | 3 content + 1 fixed column               |
| `3d+2z`         | 3 dynamic + 2 zone layout                |

This layout key works well for the 728px max-width container. If you change the ad container dimensions, generate a new layout key via the AdSense ad unit settings.
