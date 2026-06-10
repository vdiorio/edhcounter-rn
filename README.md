# EdhCounter

A life and commander-damage counter for **Magic: The Gathering — Commander (EDH)** tabletop play. Built with bare React Native (no Expo) for a small binary and a self-owned native toolchain.

EdhCounter tracks 2–6 players on a single rotated board so everyone reads their own total right-side up. It covers life totals with delta animation and history, commander damage (with an optional life-chain), poison / energy / experience counters, proliferate, monarch and initiative, "damage all opponents", a starting-player picker with confetti, light/dark theming, and a bilingual UI (English / Português).

## Stack

| Layer | Choice |
|---|---|
| Framework | React Native 0.85 (New Architecture) + React 19 |
| Language | TypeScript (`strict`) |
| Navigation | `@react-navigation/native` + native-stack |
| State | Zustand 5 — feature-composed slices + `persist` middleware |
| Persistence | `@react-native-async-storage/async-storage` |
| Animation | `react-native-reanimated` |
| Gestures | `react-native-gesture-handler` |
| i18n | `i18next` + `react-i18next` + `react-native-localize` |
| Icons / SVG / Gradients | `react-native-vector-icons`, `react-native-svg`, `react-native-linear-gradient` |
| Tests | Jest + `@testing-library/react-native` |

## Requirements

- **Node ≥ 22.11.0**
- Android: JDK 17, Android SDK (see `android/`)
- iOS: Xcode + CocoaPods (macOS only)

## Getting started

```sh
npm install            # also runs patch-package (postinstall)
npm start              # Metro bundler

npm run android        # build + run on an Android device/emulator
npm run ios            # build + run on an iOS simulator (macOS)
```

## Quality checks

```sh
npm test               # Jest (single file: npx jest <path>)
npm run lint           # ESLint
npx tsc --noEmit       # type check
```

There is no `build` script — release builds go through Gradle (`android/`) and Xcode (`ios/`). CI (`.github/workflows/ci.yml`) runs typecheck + tests as blocking and lint as advisory.

## Architecture in one paragraph

Code is organized **by feature** under `src/features/<name>/`, each owning its components, hooks, Zustand slice, and tests, and exposing a single `index.ts` barrel — cross-feature imports go through barrels, never deep paths. A single `useGameStore` is composed from each feature's slice factory; cross-slice actions (proliferate, damageAll) are pure functions re-exposed on the store. Per-player UI is assembled by `features/player-box`. See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the store composition, reset contract, persistence flow, and the design specs.

## Project layout

```
src/
├── app/            # App root + React Navigation (RootNavigator, route types)
├── screens/        # Screen-level composition (GameScreen, CdmgScreen, …)
├── features/<name> # Feature slices: components + hooks + slice + tests + index.ts
├── store/          # gameStore (composed slices), preferencesStore, reset contract
└── shared/         # Cross-feature primitives: ui/, animations/, hooks/, constants/
docs/
├── specs/          # Design specs (00 overview … 18). Source of intent.
└── ARCHITECTURE.md # How the shipped code is wired together.
```

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — runtime architecture, state model, conventions.
- **[docs/specs/](docs/specs/)** — the original design specs (00 is the master overview).
- Per-feature `README.md` files document each feature's public API where present.

## License

MIT.
