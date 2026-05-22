# 00 — EdhCounter bare-React-Native Rewrite (Master Spec)

## Purpose
Rebuild EdhCounter as a bare React Native 0.81+ Android + iOS app in a fresh repo (`edhcounter-rn`) with feature parity to the current Expo SDK 52 build, plus persistence as an improvement. Primary drivers: smaller binary, fewer runtime dependencies, self-owned native toolchain.

The current app is an EDH (Magic: The Gathering Commander) life tracker for tabletop play. Features include 2–6 player layouts with per-player rotation, life totals with delta animation and history, commander damage tracking (with optional life-chain), poison/energy/experience counters, proliferate, monarch and initiative tracking, "damage all opponents", a starting-player wheel with confetti, theming, and bilingual UI (en / pt).

## Non-goals
- No web target. No `npm run web`.
- No Expo runtime, no `@expo/*` packages, no EAS, no expo-router.
- No UX redesign — same layouts, gestures, animations, behavior.
- No iPad-specific layouts (current `supportsTablet: true` is dropped).
- No new game features. Persistence is the only behavioral addition.

## Stack
| Layer | Library |
|---|---|
| Framework | React Native 0.81+ (New Architecture on) |
| Language | TypeScript |
| Navigation | `@react-navigation/native` + `@react-navigation/native-stack` |
| State | Zustand 5 (composed slices + `persist` middleware) |
| Persistence | `@react-native-async-storage/async-storage` |
| Animations | `react-native-reanimated` |
| Gestures | `react-native-gesture-handler` |
| Icons | `react-native-vector-icons` |
| Gradients | `react-native-linear-gradient` |
| Locale | `react-native-localize` + `i18next` + `react-i18next` |
| Splash | `react-native-bootsplash` |
| Keep awake | `react-native-keep-awake` |
| Nav bar (Android) | `react-native-system-navigation-bar` |
| SVG | `react-native-svg` |
| Safe area | `react-native-safe-area-context` |
| Screens | `react-native-screens` |
| Test | Jest + `@testing-library/react-native` |

Dropped from the Expo build: `react-native-wheely` (replaced by a custom Reanimated wheel in feature 14), `patch-package` (re-evaluate after port — likely unneeded), `jest-expo`, all `expo-*` packages.

## Architecture

### Feature-based layout
Source code is organized by feature, not by type. Each `src/features/<name>/` directory owns its components, hooks, Zustand slice (if it owns state), tests, and a `README.md` describing the public API. Features expose a single `index.ts` barrel; cross-feature imports go through barrels only — no deep imports.

```
src/
├── app/
│   ├── App.tsx                # NavigationContainer, providers, splash hide
│   └── navigation/
│       ├── RootNavigator.tsx  # Native stack
│       └── types.ts           # RootStackParamList
├── features/
│   ├── layout-selector/
│   ├── game-layout/
│   ├── life-total/
│   ├── increment-buttons/
│   ├── commander-damage/
│   ├── counters/
│   ├── proliferate/
│   ├── monarch-initiative/
│   ├── damage-all/
│   ├── starting-player-wheel/
│   ├── theming/
│   ├── i18n/
│   ├── persistence/
│   ├── sidebar-shell/
│   └── player-box/             # composition of per-player features
├── screens/
│   ├── GameScreen.tsx          # composes game-layout + player-box
│   └── CdmgScreen.tsx          # commander damage full-screen view
├── store/
│   ├── gameStore.ts            # combines slices from features that own state
│   └── preferencesStore.ts
├── shared/
│   ├── ui/                     # AppModal, Typography
│   ├── animations/             # AutoAdjustableView, helpers
│   ├── constants/ui.ts
│   ├── hooks/                  # usePressRotation, etc.
│   └── types/
└── index.tsx
```

### State (composed slices)
A single `useGameStore` is composed from feature-owned slice factories:

```ts
type GameStore = CoreSlice & LifeSlice & CdmgSlice & CountersSlice & MonarchInitiativeSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get, store) => ({
      ...createCoreSlice(set, get, store),
      ...createLifeSlice(set, get, store),
      ...createCdmgSlice(set, get, store),
      ...createCountersSlice(set, get, store),
      ...createMonarchInitiativeSlice(set, get, store),
    }),
    persistConfig,
  ),
);
```

Cross-slice actions (`proliferate`, `damageAll`) live as standalone pure functions in their own feature directories and are re-exposed on the store. Each slice factory is testable in isolation with a mock `set`/`get`.

### Navigation
The current `ScreenStore` (`main | game | cdmg`) is replaced by React Navigation. Three routes:

```ts
type RootStackParamList = {
  LayoutSelector: undefined;
  Game: { numPlayers: number; alt?: boolean };
  Cdmg: { targetPlayerId: number };
};
```

Hardware back on `Game` prompts before reset (parity with current). Back from `Cdmg` returns to `Game` without state change.

### Persistence
`useGameStore` is wrapped with `zustand/middleware/persist` over AsyncStorage. Only `gameStore` persists — `preferencesStore` and `StyleStore` opt in separately. Persisted state is versioned (`version: 1`) for future migrations. See `04-persistence.md`.

## Feature specs

| # | Spec | Owns | Blocked by |
|---|---|---|---|
| 01 | Project scaffold | Repo init, native config, build, F-Droid | — |
| 02 | App shell & navigation | App.tsx, RootNavigator | 01 |
| 03 | Game store core | Core slice, slice composition | 01 |
| 04 | Persistence | `persist` middleware + storage | 03 |
| 05 | Layout selector | LayoutSelector screen, AltOptions, LayoutVisualizer | 02, 03 |
| 06 | Game layout & rotation | LayoutGenerator, PlayerPiece, Rotator | 02, 03 |
| 07 | Life total + delta + history | LifeSlice, Lifetotal, HistorySideBar | 03 |
| 08 | Increment buttons | IncrementerButtons + hold-to-repeat hook | 07 |
| 09 | Commander damage | CdmgSlice, CdmgBox screen, CdmgSideBar | 03, 17 |
| 10 | Counters | CountersSlice, CountersTopBar, CountersSideBar | 03, 17 |
| 11 | Proliferate | Cross-slice action + UI | 10 |
| 12 | Monarch & Initiative | MonarchInitiativeSlice + StatusBottomBar | 03 |
| 13 | Damage all | Cross-slice action + DamageAllButton | 07 |
| 14 | Starting-player wheel | Custom Reanimated wheel + confetti | 02, 03, 18 |
| 15 | Theming | StyleStore, useAppColors | 01 |
| 16 | i18n | i18next init + locales | 01 |
| 17 | Sidebar shell | UtilsSideBar, SidebarSlot, useSidebarState | 02, 15 |
| 18 | Shared UI | AppModal, Typography, AutoAdjustableView | 01 |

**PlayerBox composition.** The per-player UI is wired together by `features/player-box/`, which imports from `life-total`, `increment-buttons`, `counters`, `sidebar-shell`, `monarch-initiative`, and `damage-all`. It is not its own spec — the composition rules live in feature 17 (sidebar) and feature 02 (app shell).

## Suggested sequencing for subagents

```
Foundation (sequential):    01 → 02, 03, 15, 16, 18 (parallel) → 04 → 17
Screens & per-player:       05, 06, 07, 08 (parallel after 17)
Gameplay (parallel):        09, 10, 11, 12, 13, 14
```

Once foundation specs merge, 07–14 can be implemented in parallel by independent subagents — slices are isolated and cross-slice actions are explicit.

## TDD expectations
Every feature spec carries a **Behavior spec** section listing numbered behavioral assertions phrased as test cases. The subagent writes those tests first (red), then makes them green. Three test tiers per feature where applicable:

1. **Pure logic.** Slice factories tested with mock `set`/`get`. No React.
2. **Hook tests.** `renderHook` with Jest fake timers for hold-to-repeat, delta fade.
3. **Component tests.** Render + interaction. `useGameStore.getState().resetGame()` in `beforeEach`.

## Build & release
- **Android.** Gradle wrapper. Java 17 (`AndroidComponents.finalizeDsl` pin). `minSdkVersion 24`. Hermes on. Portrait-locked manifest. Reproducible-build settings from the current repo's `metadata/`, `fastlane/`, and release workflow carried over; Java 21 in the F-Droid CI workflow (matches commit `ec06be9` in the current repo).
- **iOS.** CocoaPods. Bundle ID `com.vdiorio.edhcounter`. Portrait + portrait-upside-down only.
- **No EAS.** Builds run from local Gradle / Xcode and CI.

## Conventions
- TypeScript `strict: true`.
- Path alias `@/*` → `src/*` (via `babel-plugin-module-resolver` + `tsconfig.json` paths).
- No cross-feature deep imports — go through `features/<name>/index.ts`.
- No comments unless capturing a non-obvious WHY.
- Match the existing app's animation timings exactly (see per-feature spec constants).
