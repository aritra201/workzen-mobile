# Google Sign-In on iOS

WorkZen uses the same backend as web: `POST /api/auth/login/google` with a Google **ID token**. The **Web client ID** must stay aligned with `GOOGLE_CLIENT_ID` on the API.

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** (same project as your Web client).
2. **Create credentials** → **OAuth client ID** → **iOS**.
3. **Bundle ID:** `com.workzen.mobile` (must match `app.json`).
4. Copy the new **iOS client ID** (ends with `.apps.googleusercontent.com`).

You should already have:

- **Web** client → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- **Android** client → `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## 2. EAS build env

Set the iOS client on every profile you use for device builds:

```json
"EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
```

In `eas.json` → `build.preview.env` and `build.production.env` (replace the empty string).

Local dev (optional) in `.env`:

```env
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID='YOUR_IOS_CLIENT_ID.apps.googleusercontent.com'
```

## 3. First iOS build (Apple credentials — one time)

Preview uses **internal** distribution. EAS must create or upload an **Apple Distribution** cert + **provisioning profile** (and register test devices for ad hoc).

**Do not use `--non-interactive` the first time.** From `workzen-mobile`:

```bash
npm run build:preview:ios:setup
```

Sign in to Expo + Apple when prompted. Choose **Let EAS handle credentials** (recommended). For internal installs, register your iPhone UDID when EAS asks (or in [expo.dev](https://expo.dev) → project → Devices).

After credentials exist on Expo, CI-style builds work:

```bash
npm run build:preview:ios
```

Optional: `eas credentials -p ios` to inspect or reset signing.

## 4. Rebuild iOS (after Google client ID is in eas.json)

```bash
cd workzen-mobile
npm run build:preview:ios:setup
# later: npm run build:preview:ios
```

## Behaviour

| Environment | Flow |
|-------------|------|
| **EAS iOS build** + `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` set | Native Google Sign-In (`@react-native-google-signin/google-signin`) |
| **Expo Go** or missing iOS client ID | Browser OAuth (`expo-auth-session`) — add redirect URI from dev console log to **Web** client if needed |

`app.config.js` sets `iosUrlScheme` from the **iOS** client ID (not the Android one).

## Troubleshooting

- **“Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID…”** → Add env var and run a **new** EAS iOS build.
- **Sign-in cancelled / no id token** → Confirm bundle ID in Google Cloud matches `com.workzen.mobile`.
- **Backend rejects token** → Web client ID in the app must match `GOOGLE_CLIENT_ID` on `workzen-backend`.
