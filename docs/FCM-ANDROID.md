# Android push (FCM) — `google-services.json`

If logcat shows:

```text
Default FirebaseApp is not initialized … Did you configure googleServicesFile?
```

the APK was built **without** Firebase. Fix below, then **rebuild** the preview APK.

## 1. Firebase project (must match LawSikho FCM channel 37)

WorkZen sends pushes through **LawSikho FCM** using **device tokens**. Those tokens belong to a **Firebase Android app**.

Use the **same Firebase project** that powers **FCM channel 37** on `fcm-backend.lawsikho.in`. If you create a new Firebase project, LawSikho must update channel 37 with that project’s server credentials or pushes will not deliver.

Ask your FCM admin which Firebase project to use, or create one and send them the new **FCM v1 / legacy server key** for channel 37.

## 2. Register the Android app in Firebase

1. [Firebase Console](https://console.firebase.google.com/) → your project.
2. **Add app** → **Android**.
3. **Package name:** `com.workzen.mobile` (must match `app.json`).
4. Download **`google-services.json`**.

## 3. Add the file to this repo

```text
workzen-mobile/google-services.json
```

`app.config.js` already points to `./google-services.json`.

Commit the file (it is client config, not a secret) **or** upload via EAS:

```bash
eas secret:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
```

(See [Expo FCM credentials](https://docs.expo.dev/push-notifications/fcm-credentials/) if you use EAS-managed credentials instead of a committed file.)

## 4. EAS FCM credentials (recommended)

```bash
cd workzen-mobile
eas credentials -p android
```

Configure **Google Service Account** / FCM for push per Expo docs so cloud builds embed Firebase correctly.

## 5. Rebuild and verify

```bash
npm run build:preview
```

Install APK → login → logcat:

```text
[WorkZen FCM] linked via POST /api/fcm/link
```

Or **Push debug** alert: **Linked OK**.

## Google Sign-In note

You already use `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`. The Firebase project is often the **same** Google Cloud project as OAuth — adding `google-services.json` does not replace OAuth client IDs; it only initializes Firebase Messaging in the app.
