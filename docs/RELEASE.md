# WorkZen Mobile — release checklist

## Prerequisites

- [ ] Production HTTPS API URL in `EXPO_PUBLIC_API_URL`
- [ ] `EXPO_PUBLIC_WEB_ORIGIN` matches web `CLIENT_URL` host
- [ ] `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` matches backend `GOOGLE_CLIENT_ID`
- [ ] [App Links](./APPLINKS.md) `assetlinks.json` live with correct SHA-256
- [ ] `eas login` and project linked (`eas init`)

## Build commands

```bash
cd workzen-mobile
npm install

# Internal APK for QA
eas build -p android --profile preview

# Play Store bundle
eas build -p android --profile production
```

## QA matrix (minimum)

| Area | Check |
|------|--------|
| Auth | Login, register + verify email, forgot/reset password, Google login, logout, token refresh |
| Roles | Admin / member / employee homes; wrong role cannot open other group's tabs |
| Invites | Member & employee links; password + Google accept; invalid token |
| Employee | Confirm shift + location, comment, photos, history detail, unlock, payroll range |
| Member | Attendance list/detail (read-only), payroll + CSV export, profile |
| Admin | Dashboard stats, verification queue, verify shift, team invite/resend, activate/deactivate, company profile, unlock decide |
| Device | Real Android phone, deny/allow location & photos, share CSV, back navigation |

## Out of scope (web-only for now)

- Admin extra-shifts configuration UI
- Full activity log detail modal (list on record detail is included)
- Desktop-style employee multi-select filters on payroll (date range + pagination only)
