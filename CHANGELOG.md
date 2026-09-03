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
