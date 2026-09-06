# Changelog

## 2026-08-28

### Added

- Added an admin-only `roadmap.html` page with the simplified Emulator Games ID roadmap.
- Added Firestore-backed roadmap persistence with automatic initial roadmap seeding.
- Added custom roadmap status controls: `○ Planned`, `✓ Done`, `~ Partial`, `X Rejected`, and `! Blocked`.
- Added edit mode with Cancel and disabled-until-changed Save behavior.
- Added roadmap progress summary counters.
- Added the Notepad navigation button between Add Game and Join Channel.

### Changed

- Reused the existing `requireLogin()` guard for roadmap access.
- Updated shared controls toward a calmer outlined visual style.
- Fixed the inherited `emulator-config.js` closing-parenthesis syntax error.
- Updated roadmap dirty-state handling so Save automatically disables when all values are restored to their original state.
- Fixed roadmap action visibility so Cancel and Save are hidden in normal mode and only appear during editing.

## 2026-08-29

### Security

- Converted `ADMINS` into a shared UID-based admin allowlist.
- Login now rejects identifiers that are not registered in `ADMINS` before attempting Firebase authentication.
- Added `requireAdmin()` for the editor and roadmap pages.
- Added a post-login UID authorization check and sign-out for authenticated accounts without admin access.

### Required configuration

- Replace `PASTE_OWNER_FIREBASE_UID_HERE` in `js/auth.js` with the owner UID used in Firestore Rules before deploying.

## Login rate limiting

- Added ADMINS-first filtering before Firebase login requests.
- Added a localStorage cooldown after repeated failed owner login attempts.
- Added exponential cooldown growth from 30 seconds up to 10 minutes.
- Clears the local cooldown after a successful authorized admin login.
- Handles Firebase `auth/too-many-requests` without replacing Firebase server-side throttling.
