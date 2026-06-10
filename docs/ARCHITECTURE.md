# Architecture

How the shipped code is wired together. For the original design intent see
[`docs/specs/`](./specs/) (start with `00-overview.md`). This document describes
what the code actually does today.

## Principles

- **Feature-based layout.** Each `src/features/<name>/` owns its components,
  hooks, Zustand slice (if it owns state), and tests, and exposes a single
  `index.ts` barrel.
- **Barrel imports only.** Cross-feature imports go through `features/<name>`
  (or the feature's public sub-path), never deep relative paths into another
  feature's internals.
- **Immutable updates.** State transitions return new objects; nothing is
  mutated in place.
- **TypeScript strict**, path alias `@/*` → `src/*`.

## Layers

```
src/app/        NavigationContainer, RootNavigator, route param types
src/screens/    Screen-level composition (GameScreen composes the board)
src/features/   Feature modules (slice + components + hooks + tests + index.ts)
src/store/      Composed gameStore, preferencesStore, reset contract
src/shared/     Cross-feature primitives: ui/, animations/, hooks/, constants/
```

## State model

A single `useGameStore` (`src/store/gameStore.ts`) is composed from per-feature
slice factories. The store type is the intersection of every slice type:

```ts
type GameStore =
  & CoreSlice & LifeSlice & CdmgSlice & CountersSlice
  & MonarchInitiativeSlice & ProliferateSlice & DamageAllSlice;
```

Each `createXSlice(set, get, store)` is independently testable with a mock
`set`/`get`. `coreSlice` owns the player records and the new-game / reset
lifecycle; feature slices add their own actions on top.

### Per-player data lives in `CoreSlice.Player` (intentional boundary)

The `Player` record (`src/store/coreSlice.ts`) holds **all** per-player fields —
`lTotal`, `delta`, `history`, `Cdmg`, `chain`, `poison`, `energy`,
`experience` — even though some are conceptually owned by the commander-damage
and counters features. This is a deliberate trade-off: a single flat `Player`
keeps reads/writes, persistence, and the 2–6 player layout trivial. The cost is
that adding a new per-player stat touches `coreSlice.ts` (`Player` + the
`buildPlayer` factory). For an app of this size that is acceptable; decomposing
`Player` into per-feature sub-records is **not** planned (high persistence and
cross-slice blast radius, low practical payoff).

### Cross-slice actions

Actions that span players or slices — `proliferate` / `undoProliferate` and
`damageAll` — are written as **pure functions** in their feature directory
(`features/proliferate/action.ts`, `features/damage-all/action.ts`) and
re-exposed on the store via thin slice wrappers. This keeps the multi-player
logic unit-testable without React.

### Game-reset contract

`setNumPlayers` (new game) and `resetGame` must wipe every slice's
cross-cutting state. Rather than duplicate that logic in both actions and reach
into each feature's internals, the composition root delegates to
`src/store/gameReset.ts`:

- each resettable slice exports a **reset partial** (store state to restore to
  defaults) — e.g. `MONARCH_INITIATIVE_INITIAL_STATE`, `PROLIFERATE_RESET_STATE`;
- and, if it keeps module-level state (see below), a **side-effect** cleanup —
  e.g. `clearProliferateUndoStack`.

`gameReset.ts` aggregates these into `buildGameResetState()` and
`runGameResetSideEffects()`, which both `setNumPlayers` and `resetGame` call.
**To make a new slice participate in reset**, add its reset partial /
side-effect to the arrays in `gameReset.ts` — nothing else changes.

### Known wrinkle: module-level undo stack

`features/proliferate/action.ts` keeps its undo stack in a module-level `Map`,
not in store state. It works (and is cleared via the reset contract above), but
it is a hidden singleton: it is not isolated per store instance and relies on
the reset side-effect for cleanup. Moving it into slice state would make it
fully store-scoped, but touches persistence (`partialize`) and is deferred as
not worth the churn today. New cross-cutting undo/history state should prefer
living in the slice, not a module global.

## Persistence

`useGameStore` is wrapped with `zustand/middleware/persist` over AsyncStorage
(`features/persistence/middleware.ts`):

- **Key** `edhcounter:game:v1`, **version** `1`.
- `partialize` allow-lists what round-trips: `numPlayers`, `alt`, `gameLayout`,
  and players **minus the transient `delta`** (delta is re-seeded to `0` on
  rehydrate so an in-flight animation value is never restored from disk).
- `merge` overlays persisted fields onto the live store; `migrate` resets to
  defaults for older versions rather than stranding the user with an unreadable
  blob.

When you add a persisted field to a slice, update `partializeGameState` to
allow-list it.

`preferencesStore` (language) persists separately under its own key.

## Navigation

React Navigation native-stack with three routes
(`src/app/navigation/types.ts`):

```ts
type RootStackParamList = {
  LayoutSelector: undefined;
  Game: { numPlayers: number; alt?: boolean };
  Cdmg: { targetPlayerId: number };
};
```

Hardware back on `Game` prompts before resetting; back from `Cdmg` returns to
`Game` without state change.

## Shared primitives

`src/shared/` holds cross-feature building blocks: `ui/` (`AppModal`,
`Typography`), `animations/` (`AutoAdjustableView`, animation hooks),
`constants/ui.ts` (timings, colors, font sizes), and `hooks/`
(`useHoldRepeat` — the tap-or-hold press primitive shared by the damage-all and
proliferate buttons).

## Feature reference

| Feature | Owns state? | Public surface (via `index.ts`) |
|---|---|---|
| `life-total` | yes (`LifeSlice`) | `Lifetotal`, `HistorySideBar`, life actions |
| `commander-damage` | yes (`CdmgSlice`) | `CdmgScreen`, `CdmgSideBar`, deal-damage + chain toggle |
| `counters` | yes (`CountersSlice`) | `CountersTopBar`, `CountersSideBar`, counter actions |
| `monarch-initiative` | yes | `StatusBottomBar`, claim/toggle, `MONARCH_INITIATIVE_INITIAL_STATE` |
| `proliferate` | yes (count) | `ProliferateButton`, `useProliferate`, pure action, `PROLIFERATE_RESET_STATE` |
| `damage-all` | action only | `DamageAllButton`, pure `damageAll` action |
| `increment-buttons` | no | `IncrementerButtons`, `useIncrementAction` |
| `game-layout` | no | `LayoutGenerator`, `Rotator`, `computeLayout` |
| `layout-selector` | no | `LayoutSelectorScreen`, `LayoutVisualizer` |
| `starting-player-wheel` | no | `StartingPlayerButton`, `Confetti`, `useStartingPlayer` |
| `sidebar-shell` | no | `SidebarSlot`, `UtilsSideBar`, `useSidebarState`, sidebar registry |
| `player-box` | no | `PlayerBox` — composes the per-player features into a board cell |
| `theming` | yes (style store) | `useAppColors`, `usePlayerColor`, palette |
| `i18n` | no | i18next init, `en` / `pt` locales |
| `persistence` | no | `persist` middleware, AsyncStorage adapter, partialize |

Features that own state register their slice in `store/gameStore.ts`; see the
"when adding a new slice" checklist in that file.

## Tests

Three tiers, all under each feature's `__tests__/`:

1. **Pure logic** — slice factories and cross-slice actions with a mock
   `set`/`get`, no React.
2. **Hooks** — `renderHook` + Jest fake timers (hold-to-repeat, delta fade).
3. **Components** — `@testing-library/react-native`; reset the store in
   `beforeEach`.

Reanimated, gesture-handler, AsyncStorage, `react-native-localize`, and vector
icons are mocked in `jest.setup.js`.
