# 08 — Increment Buttons

## Purpose
Render the +1 / -1 buttons that flank the life total and provide the shared "press once / hold to repeat" interaction hook (`useIncrementAction`) used here and by other features (damage-all, proliferate-undo).

## Public API

```ts
// src/features/increment-buttons/hooks/useIncrementAction.ts
export function useIncrementAction(input: {
  onTick: () => void;
  intervalMs?: number;        // default HOLD_INTERVAL = 100
}): {
  onPressIn: () => void;
  onPressOut: () => void;
  onPress: () => void;        // single fire for tap-no-hold case
};

// src/features/increment-buttons/index.ts
export { IncrementerButtons } from './components/IncrementerButtons';
export { useIncrementAction } from './hooks/useIncrementAction';

// IncrementerButtons props
type IncrementerButtonsProps = {
  playerId: number;
};
```

## Dependencies
- 07-life-total (calls `incrementLife`).

## Behavior spec (TDD anchor)

### useIncrementAction
1. Tap (press-in + press-out within 300 ms): `onTick` fires exactly once.
2. Press-in + hold for 350 ms then release: `onTick` fires once on press-in, then once every `intervalMs` (100 ms) after the long-press threshold (current implementation fires immediately on `onLongPress` and continues at `intervalMs`).
3. Press-out cancels the interval. No further `onTick` fires after release.
4. Switching from press-in on -1 directly to press-in on +1 (without release) cancels the -1 interval and starts the +1 interval.
5. Unmounting the hook clears any pending interval (no leak warning).

### IncrementerButtons
6. Renders two `TouchableHighlight` buttons (-1 on the left, +1 on the right).
7. Press feedback: scale animation (Reanimated) on press-in / press-out.
8. -1 calls `incrementLife({ playerId, value: -1 })`. +1 calls `incrementLife({ playerId, value: +1 })`.
9. Hold-to-repeat fires at 100 ms intervals.
10. Buttons inherit the player's theme color (via `useAppColors`).

## Acceptance tests
- `useIncrementAction.test.ts`: behaviors 1–5 with Jest fake timers.
- `IncrementerButtons.test.tsx`:
  - Tap +1 increments `lTotal` by 1.
  - Hold +1 for 550 ms increments `lTotal` by ~5 (one immediate + four ticks at 100 ms — assert range `[4, 6]` to tolerate timer jitter).
  - Tap -1 decrements by 1.

## Non-goals
- Does not implement the life total display (07).
- Does not implement the proliferate or damage-all buttons (11, 13), even though they reuse this hook.

## Notes for the implementer
- Constant: `HOLD_INTERVAL = 100` (ms). Keep this in `src/shared/constants/ui.ts` so feature 11 and 13 can reuse it (they use different intervals: 400 ms; pass that to the hook explicitly).
- Use `setInterval` and store the ID in a `useRef`. Clear on unmount, on press-out, and before starting a new interval.
- Press scale animation uses `react-native-reanimated` shared values, target scale `0.95` over `~100 ms`.
- Reference current source: `components/PlayerBox/Components/IncrementerButtons.tsx`, `hooks/useIncrementAction.ts`.
