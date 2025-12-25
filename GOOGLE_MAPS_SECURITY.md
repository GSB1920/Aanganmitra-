# Google Maps Security & Billing Guide

This application uses the Google Maps Platform. To ensure security and avoid unexpected costs, please follow these guidelines strictly.

## 1. API Keys & Environment Variables

The application requires a valid Google Maps API Key in your `.env` file:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**⚠️ NEVER commit your `.env` file to version control (GitHub, GitLab, etc.).**

## 2. Mandatory Security Measures (Do This Immediately)

You **MUST** restrict your API Key in the Google Cloud Console to prevent unauthorized usage.

1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Select your API Key.
3.  Under **Application restrictions**, select **Websites**.
4.  Add the following domains:
    *   `http://localhost:3000/*` (for local development)
    *   `https://your-domain.com/*` (for production)
    *   `https://www.your-domain.com/*` (for production)
5.  Under **API restrictions**, select **Restrict key**.
6.  Select **ONLY** the following APIs:
    *   **Maps JavaScript API** (required for map display & client-side geocoding)
    *   **Geocoding API** (required for address lookup service)
    *   **Places API** (only if you enable autocomplete in the future)

## 3. Billing & Budget Alerts (Crucial)

To prevent "bill shock", set up budget alerts immediately.

1.  Go to [Google Cloud Console > Billing > Budgets & alerts](https://console.cloud.google.com/billing/budgets).
2.  Create a new Budget.
3.  Set the amount to **₹2,000** or **₹3,000** (monthly hard cap).
4.  Set alert thresholds at **50%**, **80%**, and **100%**.
5.  Ensure "Email alerts to billing admins" is checked.
6.  **Action on alert:** If you receive an alert, immediately check your usage.

## 4. Banking Safety Net (ICICI SI Limit)

As per your bank notification, your current auto-debit limit is ₹75,000, which is high.

1.  Login to your ICICI Bank NetBanking / Mobile App.
2.  Go to **Standing Instructions (SI)** or **Merchant Mandates**.
3.  Find the mandate for **Google Cloud / Google India**.
4.  **Reduce the limit** to **₹5,000** or **₹10,000**.
    *   This acts as a final safety net. Even if Google Cloud tries to charge more, the bank will decline it.

## 5. Usage Optimization in Code

We have implemented the following to keep costs low:
*   **On-Demand Geocoding:** Address lookup only happens when you explicitly **click** on the map or click "Locate Me". It does NOT run on every hover or drag.
*   **No Autocomplete:** We are not using the expensive Places Autocomplete API on every keystroke.
*   **Static Maps:** We are using the standard JavaScript API which has a generous free tier (~28,000 loads/month).

## 6. Enabled APIs Checklist

Ensure ONLY these are enabled in [API Library](https://console.cloud.google.com/apis/library):
*   [x] Maps JavaScript API
*   [x] Geocoding API (if using server-side or if explicitly required by billing)
*   [ ] Places API (Disable if not using autocomplete)
*   [ ] Directions API (Disable)
*   [ ] Distance Matrix API (Disable)
*   [ ] Roads API (Disable)
