# WorkZen Mobile (Android)

React Native **Expo** client for [workzen-backend](../workzen-backend). Parity with web for **admin**, **member**, and **employee** roles (see [docs/RELEASE.md](./docs/RELEASE.md)).

## Design

Mobile UI follows **workzen-frontend** tokens (Obsidian Ledger light/dark). Use the **sun/moon control** on auth and in-app headers to switch themes. List screens use the same card layout as the web `MobileList` pattern.

## Setup

1. **Node 22.13+** (required for Expo SDK 57). Use [nvm](https://github.com/nvm-sh/nvm) and `nvm use` (see `.nvmrc`).
2. Copy `.env.example` → `.env`
3. Set **`EXPO_PUBLIC_API_URL`** to your machine LAN URL (e.g. `http://192.168.1.10:4000`) for dev
4. Install and start:

   ```bash
   cd workzen-mobile
   rm -rf node_modules package-lock.json   # Windows: rmdir /s /q node_modules & del package-lock.json
   npm install
   npx expo install --fix
   npx expo start
   ```

   Press `a` for Android emulator or scan QR with Expo Go.

### `ERR_UNKNOWN_FILE_EXTENSION` (.ts) for `expo-modules-core`

1. **Do not** put `expo-web-browser` in `app.json` → `plugins` (it is not a config plugin; loading it during `expo start` triggers this error).
2. If it persists: use **Node 22.13+**, delete `node_modules` + `package-lock.json`, run `npm install` and `npx expo install --fix`.

Optional: Google Sign-In, App Links host — see `.env.example`.

## Feature coverage

| Area | Mobile |
|------|--------|
| **Auth** | Login, register, verify email, forgot/reset password, Google login/register admin |
| **Invites** | Deep links + password/Google accept |
| **Employee** | Today attendance, history → detail, payroll list, unlock, profile + password |
| **Member** | Attendance → detail, payroll + CSV export, profile |
| **Admin** | Dashboard, verification queue, attendance, payroll + export, unlock, team (employees/members), company profile |

## Production

- [docs/APPLINKS.md](./docs/APPLINKS.md) — Android App Links
- [docs/RELEASE.md](./docs/RELEASE.md) — EAS build & QA checklist

```bash
eas build -p android --profile preview    # APK
eas build -p android --profile production # AAB
```

## Backend

No schema changes. Native clients use the same REST API as the Vite web app. CORS allows requests without `Origin`.
