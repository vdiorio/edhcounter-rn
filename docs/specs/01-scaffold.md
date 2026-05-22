# 01 — Project Scaffold

## Purpose
Bootstrap a fresh React Native 0.81+ project for Android + iOS with TypeScript, install all runtime dependencies that replace Expo modules, configure the native projects, and carry over the F-Droid reproducible-build setup from the current repo. After this spec, `npx react-native run-android` shows a blank styled screen with the correct splash, status bar, and system navigation bar colors.

## Public API
None at the feature level. This spec produces a buildable project shell and shared configuration that every other spec consumes.

## Dependencies
None within the project.

## Tasks

### 1. Init
```
npx @react-native-community/cli@latest init EdhCounter --version latest --skip-install
```
Move into the new project. Set up `git`, push to a fresh `edhcounter-rn` repo.

### 2. Install runtime deps
```
@react-navigation/native @react-navigation/native-stack
react-native-screens react-native-safe-area-context
react-native-gesture-handler react-native-reanimated
react-native-svg react-native-linear-gradient
react-native-vector-icons
react-native-localize i18next react-i18next
react-native-bootsplash react-native-keep-awake
react-native-system-navigation-bar
@react-native-async-storage/async-storage
zustand
```

Dev deps:
```
@types/react-native-vector-icons @testing-library/react-native
babel-plugin-module-resolver eslint @types/jest
```

### 3. Module resolver & paths
- `tsconfig.json`: add `"baseUrl": "."` and `"paths": { "@/*": ["src/*"] }`.
- `babel.config.js`: add `babel-plugin-module-resolver` with the same alias.
- Add `react-native-reanimated/plugin` as the **last** Babel plugin.

### 4. Source structure
Create the empty directory tree from `00-overview.md`. Each `features/<name>/` directory gets an `index.ts` placeholder.

### 5. Android native config
- `android/app/build.gradle`: `applicationId "com.vdiorio.edhcounter"`, `minSdkVersion 24`, Hermes on (template default).
- `AndroidComponents.finalizeDsl` block pinning Java 17 — copy verbatim from the current repo's `android/build.gradle` (commits `8ef1c50` and `64ce932`).
- `AndroidManifest.xml`: `android:screenOrientation="portrait"` on the main activity. Adaptive icon background `#1e1d22`. App label `EdhCounter`.
- `styles.xml`: status bar dark icons on dark background; window background `#1e1d22` to match splash.

### 6. iOS native config
- `Info.plist`: `UISupportedInterfaceOrientations` = portrait + portrait-upside-down only.
- Bundle identifier `com.vdiorio.edhcounter`.
- Status bar style: light content.
- `Podfile`: ensure `react-native-vector-icons`, `react-native-bootsplash`, and other linked libs are present after `pod install`.

### 7. Splash
Use `react-native-bootsplash` generator:
```
npx react-native generate-bootsplash assets/images/splash-icon.png --background-color=1e1d22 --logo-width=200
```
Both Android `styles.xml` and the iOS storyboard get the generated values. `App.tsx` (spec 02) calls `BootSplash.hide({ fade: true })` after navigation mount.

### 8. System navigation bar (Android)
On app mount, call `SystemNavigationBar.setNavigationColor('#1e1d22', 'dark')`. Wire this into `App.tsx` (spec 02).

### 9. Vector icons
- Run `npx react-native-asset` (or follow the lib's manual link steps) after placing icon TTFs in `assets/fonts/`.
- Sets used in the current app: `Ionicons`, `MaterialCommunityIcons`, `FontAwesome5`. Import sites change from `@expo/vector-icons` to `react-native-vector-icons/<SetName>`.

### 10. F-Droid reproducible build
Copy from the current repo:
- `metadata/com.vdiorio.edhcounter/` (full directory).
- `fastlane/` (full directory).
- The GitHub Actions release workflow (Java 21).
- Any reproducible-build Gradle settings.

Adapt paths to the new module structure where they reference source files.

### 11. Testing setup
- `jest.config.js`: use `preset: "react-native"`, not `jest-expo`.
- `__mocks__/`: add only the mocks actually needed (Reanimated, gesture-handler, AsyncStorage, react-native-localize, react-native-vector-icons). Do NOT carry over Expo-specific mocks.
- `setupFilesAfterEach`: enable `@testing-library/jest-native` matchers.

### 12. Lint & format
- ESLint with `@react-native` config (template default) + Prettier.
- No `eslint-config-expo`.

## Behavior spec (TDD anchor)
This spec is mostly configuration. Acceptance is a working build, not behavioral tests. The "tests" are:

1. `npx react-native run-android` builds and launches with the dark splash, then a blank screen with the right colors.
2. `npx react-native run-ios` builds and launches with the same behavior.
3. `npm test` runs Jest against an empty test suite without errors.
4. `tsc --noEmit` reports no errors.
5. `eslint src/` reports no errors.
6. F-Droid `metadata/` validates with `fdroid lint .` (if `fdroidserver` is installed locally).

## Non-goals
No screens, no navigation, no state — those are 02 and 03.

## Notes for the implementer
- The `--skip-install` flag avoids a slow first install; the explicit install in step 2 controls the dependency set.
- Reanimated requires the Babel plugin **last** in the plugins array — common cause of "Reanimated Worklets" errors.
- For `react-native-vector-icons`, prefer per-set imports (`react-native-vector-icons/Ionicons`) over the umbrella `react-native-vector-icons` to avoid pulling in unused fonts.
- iPad support is dropped; do not configure iPad orientations.
- Pin exact patch versions of native libs in `package.json` for reproducibility — F-Droid builds care.
