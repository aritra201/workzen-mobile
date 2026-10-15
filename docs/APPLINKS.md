# Android App Links (invite URLs)

Production invite emails use `https://<your-domain>/invite/member|employee?token=…`. When the app is installed, Android should open **workzen-mobile** instead of the browser.

## 1. Set the web host in mobile env

In `workzen-mobile/.env` (used at build time via `app.config.js`):

```env
EXPO_PUBLIC_WEB_ORIGIN=https://workzenapps.in
EXPO_PUBLIC_APP_LINK_HOSTS=workzenapps.in,www.workzenapps.in
```

Include **www** if your site redirects apex → www. Rebuild the native app after changing env.

## 2. Host `assetlinks.json`

Serve at:

`https://<your-domain>/.well-known/assetlinks.json`

Example (replace SHA-256 with your **upload key** or **Play App Signing** certificate fingerprint from EAS/Google Play):

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.workzen.mobile",
      "sha256_cert_fingerprints": [
        "AB:CD:..."
      ]
    }
  }
]
```

Get the fingerprint for an EAS build:

```bash
eas credentials -p android
```

## 3. Verify

```bash
adb shell am start -a android.intent.action.VIEW -d "https://<your-domain>/invite/employee?token=test"
```

With `autoVerify: true`, Android checks `assetlinks.json` after install. Until verification succeeds, links may still open in Chrome (user can choose “Open in app”).

## Dev without App Links

Use the custom scheme from email fallback or:

`workzen://invite/employee?token=…`
