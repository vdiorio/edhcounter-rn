# EdhCounter bare-React-Native rewrite — Spec bundle

This bundle is the full design for rebuilding the EdhCounter Expo SDK 52 app as a bare React Native 0.81+ app with feature parity plus persistence.

## How to use

1. **Read `00-overview.md` first.** It sets the stack, architecture, navigation contract, slice-composition pattern, and feature graph.
2. **Pick a spec.** The numbered prefix indicates suggested implementation order. Foundation specs (01–04, 15, 16) must land before gameplay specs (05–14) can run in parallel.
3. **TDD it.** Each spec's `Behavior spec` section is a numbered list of test cases. Write them as failing tests first; then implement.
4. **Stay within the feature.** Feature directories own their components, hooks, slice, and tests. Cross-feature imports go through `features/<name>/index.ts`. No deep imports.

## Specs

| # | File | Owns |
|---|---|---|
| 00 | [00-overview.md](./00-overview.md) | Master overview, stack, architecture, dependency map |
| 01 | [01-scaffold.md](./01-scaffold.md) | Project init, native config, build, F-Droid carry-over |
| 02 | [02-app-shell.md](./02-app-shell.md) | App.tsx, React Navigation root, route types |
| 03 | [03-game-store-core.md](./03-game-store-core.md) | Composed gameStore, CoreSlice, slice contract |
| 04 | [04-persistence.md](./04-persistence.md) | zustand/persist over AsyncStorage |
| 05 | [05-layout-selector.md](./05-layout-selector.md) | Home screen, player count + alt + visualizer |
| 06 | [06-game-layout.md](./06-game-layout.md) | LayoutGenerator, PlayerPiece, CdmgPiece, Rotator |
| 07 | [07-life-total.md](./07-life-total.md) | LifeSlice, Lifetotal, delta animation, HistorySideBar |
| 08 | [08-increment-buttons.md](./08-increment-buttons.md) | IncrementerButtons + hold-to-repeat hook |
| 09 | [09-commander-damage.md](./09-commander-damage.md) | CdmgSlice, CdmgScreen, CdmgSideBar, chain toggle |
| 10 | [10-counters.md](./10-counters.md) | CountersSlice, CountersTopBar, CountersSideBar |
| 11 | [11-proliferate.md](./11-proliferate.md) | proliferate / undoProliferate cross-slice action |
| 12 | [12-monarch-initiative.md](./12-monarch-initiative.md) | Monarch + Initiative slice, StatusBottomBar |
| 13 | [13-damage-all.md](./13-damage-all.md) | damageAll cross-slice action + button |
| 14 | [14-starting-player-wheel.md](./14-starting-player-wheel.md) | Custom Reanimated Wheel + starting-player picker + Confetti |
| 15 | [15-theming.md](./15-theming.md) | StyleStore, useAppColors, player palette |
| 16 | [16-i18n.md](./16-i18n.md) | i18next + react-native-localize + preferencesStore |
| 17 | [17-sidebar-shell.md](./17-sidebar-shell.md) | UtilsSideBar, SidebarSlot, useSidebarState, PlayerBox composition |
| 18 | [18-shared-ui.md](./18-shared-ui.md) | AppModal, Typography, AutoAdjustableView, animation hooks |

## Dependency graph

```
01 (scaffold)
 ├── 02 (app shell)
 ├── 03 (game store core)
 │    ├── 04 (persistence)
 │    ├── 07 (life total)
 │    │    ├── 08 (increment buttons)
 │    │    └── 13 (damage all)
 │    ├── 09 (commander damage)
 │    ├── 10 (counters)
 │    │    └── 11 (proliferate)
 │    └── 12 (monarch + initiative)
 ├── 05 (layout selector) ─ depends on 02, 03, 14, 15, 16, 18
 ├── 06 (game layout)
 ├── 14 (starting player wheel) ─ depends on 02, 03, 18
 ├── 15 (theming)
 ├── 16 (i18n)
 ├── 17 (sidebar shell) ─ composition; depends on 02, 03, 07, 08, 09, 10, 12, 13, 14, 15, 18
 └── 18 (shared UI)
```

## Suggested execution

**Phase 1 (sequential):** 01 → 02 & 18 in parallel.

**Phase 2 (parallel):** 03, 15, 16. After 03 lands: 04.

**Phase 3 (parallel after foundation):** 07 → 08, 13. 10 → 11. 09. 12. 06. 14.

**Phase 4:** 17 composes everything; 05 wires the home screen. Both depend on most of the prior phases.

## TDD reminders

- Slice tests use a mock `set`/`get` — no React.
- Hook tests use `renderHook` + Jest fake timers.
- Component tests use `@testing-library/react-native`; reset the store in `beforeEach` via `useGameStore.getState().resetGame()`.
- Mock `react-native-reanimated` via the lib's recommended Jest mock.
- Mock `@react-native-async-storage/async-storage` via its jest mock helper.
- Mock `react-native-localize` and `react-native-vector-icons` per their docs.
