# EdhCounter (edhcounter-rn)

React Native 0.85 + React 19 MTG life / commander-damage counter. TypeScript, Zustand store, i18next.

## Commands
- Test: `npm test` (Jest) — single file: `npx jest <path>`
- Lint: `npm run lint` (ESLint)
- Typecheck: `npx tsc --noEmit`
- Metro bundler: `npm start`
- Run: `npm run android` / `npm run ios`

No `build` script — release builds go through Gradle (`android/`) and Xcode (`ios/`).

## Notes
- Node >= 22.11.0 required.
- Path alias `@/` → `src/` (babel-plugin-module-resolver + tsconfig `paths`).
- `patch-package` runs on `postinstall`; patches live in `patches/`.
- Code is organized by feature under `src/features/*` (slice + components + hooks per feature).
- Formatting: Prettier 2.8.8 (`.prettierrc.js`).
