# 10 — Counters (Poison / Energy / Experience)

## Purpose
Track poison, energy, and experience counters per player. Render an inline status strip (`CountersTopBar`) and an in-sidebar editor (`CountersSideBar`) with +/- controls and labeled rows.

## Public API

```ts
// src/features/counters/slice.ts
export type CountersSlice = {
  // state lives on Player records: poison, energy, experience
  incrementPoison: (input: { playerId: number; value: number }) => void;
  incrementEnergy: (input: { playerId: number; value: number }) => void;
  incrementExperience: (input: { playerId: number; value: number }) => void;
};

export const createCountersSlice: StateCreator<GameStore, [], [], CountersSlice>;

// src/features/counters/index.ts
export { CountersTopBar } from './components/CountersTopBar';
export { CountersSideBar } from './components/CountersSideBar';

type CountersTopBarProps = { playerId: number };
type CountersSideBarProps = { playerId: number };
```

### Counter colors (from current theme)
- Poison: `#2e7d32` (green)
- Energy: `#fbc02d` (yellow)
- Experience: `#1e88e5` (blue)

## Dependencies
- 03-game-store-core (Player.poison, energy, experience).
- 17-sidebar-shell (CountersSideBar mounts inside).
- 11-proliferate (proliferate button lives inside CountersSideBar — feature 11 supplies the component).

## Behavior spec (TDD anchor)

### CountersSlice (pure)
1. `incrementPoison({ playerId: 0, value: 1 })` sets `players[0].poison === 1`.
2. Poison is clamped to `>= 0`. Energy clamps `>= 0`. Experience clamps `>= 0`.
3. Decrementing poison from 0 stays at 0 (no overflow to negative).
4. Poison display is `min(poison, 10)` but the underlying state is uncapped (lethal poison threshold is 10 in commander, but the store can hold any value).
5. There is special decrement logic for poison: when decrementing from a value `> 10`, the new value rounds down to `10` if the decrement would cross 10 (so the display always tracks state changes). Specifically: `newPoison = max(0, currentPoison > 10 ? 9 : currentPoison - 1)`. Verify against current source `store/GameStore.ts` — if behavior differs, follow the source.
6. Energy/experience decrement by `-value`, simple `-1` at the call site.

### CountersTopBar (component)
7. Renders a horizontal row of indicators for any counter `> 0`. Each indicator: icon + value, colored per the counter color above.
8. If no counter is `> 0`, renders a stats-icon placeholder (`bar-chart` or similar) and nothing else.
9. Indicators have a fixed position above the life total (top of the `PlayerBox`).

### CountersSideBar (component)
10. Three rows: Poison, Energy, Experience. Each row has the counter color as a left-edge strip, the current value, and +/- buttons.
11. A fourth row hosts the **Proliferate** button (feature 11).
12. Each +/- uses the standard `useIncrementAction` hook.

## Acceptance tests
- `counters.slice.test.ts`: behaviors 1–6.
- `CountersTopBar.test.tsx`: renders indicators only for counters > 0; renders placeholder when all zero.
- `CountersSideBar.test.tsx`: +/- buttons mutate the correct slice action; renders proliferate button as a child.

## Non-goals
- Does not implement proliferate (feature 11).
- Does not implement the actual sidebar host (feature 17).

## Notes for the implementer
- Poison special-decrement (behavior 5) is the most surprising rule — verify against `incrementPoison` in current `store/GameStore.ts` and copy the exact logic.
- The four counter rows in `CountersSideBar` are equal-height; constrain via `flex: 1` with a fixed-height parent so layout doesn't depend on font metrics.
- Use Ionicons `skull-outline` for poison, `flash` for energy, `school` for experience (or match the current source's icon choices).
- Reference current source: `components/PlayerBox/Components/CountersTopBar/index.tsx`, `components/PlayerBox/Components/CountersSideBar.tsx`, `store/GameStore.ts`.
