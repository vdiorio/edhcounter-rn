# 07 — Life Total + Delta + History

## Purpose
Track each player's life total, animate recent deltas, accumulate a history of life changes, and render the central life number plus a scrollable history sidebar.

## Public API

```ts
// src/features/life-total/slice.ts
export type LifeSlice = {
  // state lives on Player records via CoreSlice
  incrementLife: (input: { playerId: number; value: number }) => void;
  setLife: (input: { playerId: number; newLife: number }) => void;
};

export const createLifeSlice: StateCreator<GameStore, [], [], LifeSlice>;

// src/features/life-total/hooks/useDeltaAnimation.ts
export function useDeltaAnimation(delta: number): {
  translateY: SharedValue<number>;
  signedString: string;             // "+5", "-3", ""
  color: string;                    // lime or red
};

// src/features/life-total/index.ts
export { Lifetotal } from './components/Lifetotal';
export { HistorySideBar } from './components/HistorySideBar';

// Lifetotal props
type LifetotalProps = {
  playerId: number;
  fontSize?: number;       // default 48 (LIFE_FONT_SIZE)
};

// HistorySideBar props
type HistorySideBarProps = {
  playerId: number;
};
```

## Dependencies
- 03-game-store-core (`Player.lTotal`, `Player.delta`, `Player.history`).
- 17-sidebar-shell (HistorySideBar renders inside the shared sidebar).
- 18-shared-ui (`Typography`).

## Behavior spec (TDD anchor)

### LifeSlice (pure)
1. `incrementLife({ playerId: 0, value: 1 })` sets `players[0].lTotal === 41` and `players[0].delta === 1`.
2. Two consecutive `incrementLife` calls with values 2 then 3 result in `delta === 5` (accumulates).
3. `incrementLife` schedules a delta-reset timer (`TIME_TO_RESET_DELTA = 2000 ms`). After 2000 ms, `delta === 0` and the prior delta is pushed onto `players[0].history`.
4. If a second `incrementLife` arrives before the 2000 ms timer fires, the timer is rescheduled (debounced) so the full accumulated delta lands on history together.
5. `setLife({ playerId: 0, newLife: 30 })` sets `lTotal === 30` and `delta === 30 - previousLTotal`.
6. `resetGame` cancels any in-flight delta timer for every player.
7. Negative life is allowed (no clamp). Display layer handles "dead" rendering.
8. History is appended only when delta crosses to zero — never on every change.

### useDeltaAnimation (hook)
9. With `delta = 0`, `signedString === ''` and the animation is at rest.
10. With `delta = 5`, `signedString === '+5'`, `color === '#A0FF00'` (lime), and `translateY` animates from `-3` to `0` over `DELTA_ANIMATION = 100 ms`.
11. With `delta = -3`, `signedString === '-3'` and `color === '#FF0000'` (red).

### Lifetotal (component)
12. Renders the current `lTotal` at `fontSize = 48`.
13. Renders the animated delta (via `useDeltaAnimation`) above the life total.
14. Renders no delta text when `delta === 0`.

### HistorySideBar (component)
15. Scrollable list of `players[playerId].history` entries with running totals.
16. Each entry color-coded: positive = green, negative = red.
17. Most recent entry is at the top of the visible list.
18. Empty history renders an empty state (no crash, just nothing or a placeholder icon).

## Acceptance tests
- `life.slice.test.ts`: behaviors 1–8.
- `useDeltaAnimation.test.ts`: behaviors 9–11, using fake timers.
- `Lifetotal.test.tsx`: behaviors 12–14.
- `HistorySideBar.test.tsx`: behaviors 15–18.

## Non-goals
- Does not handle +/- buttons (feature 08).
- Does not handle commander-damage chain (feature 09 calls into LifeSlice).
- Does not implement scroll virtualization for history — a simple ScrollView is fine for the expected length.

## Notes for the implementer
- Delta-reset timers live in a module-level `Map<number, NodeJS.Timeout>` outside the store (per spec 03 implementation note). The slice action signature should accept an `onDeltaResetScheduler` injected in tests, or use a wrapped `setTimeout` you can mock.
- When a CDMG hit lands while `chain === true`, the CDMG slice calls `incrementLife` directly — keep `incrementLife` the single point of life mutation.
- Match constants exactly: `STARTING_LIFE_TOTAL = 40`, `TIME_TO_RESET_DELTA = 2000`, `DELTA_ANIMATION = 100`, `LIFE_FONT_SIZE = 48`.
- Reference current source: hooks/useDeltaAnimation.ts, components/PlayerBox/Components/Lifetotal.tsx, components/PlayerBox/Components/HistorySideBar.tsx, store/GameStore.ts.
