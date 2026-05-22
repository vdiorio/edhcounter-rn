# 14 — Starting-Player Wheel + Confetti + Custom Wheel Picker

## Purpose
Two related deliverables in one spec because they share the same wheel primitive:

1. **A reusable custom `Wheel` component** built with Reanimated that replaces `react-native-wheely`. Consumed by both this feature and the Layout Selector (05).
2. **The starting-player picker:** a button on the player count selection sequentially highlights players (clockwise) at accelerating-then-decelerating intervals, lands on one, then triggers a confetti burst over the chosen player.

## Public API

```ts
// src/features/starting-player-wheel/components/Wheel.tsx
type WheelProps<T> = {
  values: T[];
  selectedIndex: number;
  onChange: (index: number) => void;
  itemHeight?: number;          // default 50
  visibleRest?: number;         // default 1 (items above + below center)
  scaleFactor?: number;         // default 0.7 (non-center scale)
  renderItem?: (value: T, index: number, selected: boolean) => ReactNode;
};

export function Wheel<T>(props: WheelProps<T>): JSX.Element;

// src/features/starting-player-wheel/hooks/useStartingPlayer.ts
export function useStartingPlayer(): {
  startingPlayerId: number | null;
  pickStartingPlayer: () => void;     // triggers the animation sequence
  isAnimating: boolean;
};

// src/features/starting-player-wheel/components/Confetti.tsx
type ConfettiProps = {
  active: boolean;
  particleCount?: number;     // default 24
};

// src/features/starting-player-wheel/index.ts
export { Wheel };
export { Confetti };
export { useStartingPlayer };
export { StartingPlayerButton } from './components/StartingPlayerButton';
```

## Dependencies
- 03-game-store-core (`numPlayers`, `startingPlayerId`).
- 05-layout-selector (consumes `Wheel`).
- 16-player-box / 17-sidebar-shell (confetti mounts inside `PlayerBox` of the starting player).

## Behavior spec (TDD anchor)

### Wheel (custom Reanimated picker)
1. Renders a vertical column showing `selectedIndex - visibleRest .. selectedIndex + visibleRest` items.
2. Items above/below center are scaled by `scaleFactor` (0.7 default).
3. Dragging the column up/down snaps to the nearest item on release and calls `onChange(newIndex)`.
4. Programmatic `selectedIndex` change (controlled mode) animates smoothly to the new index over ~300 ms.
5. Item layout: `itemHeight` px tall, single line, centered text by default.
6. The wheel is virtualized only insofar as items outside `[selectedIndex - visibleRest, selectedIndex + visibleRest]` are not rendered (no offscreen DOM nodes).

### useStartingPlayer
7. `pickStartingPlayer()` runs the highlight sequence: cycles through player IDs in clockwise order (matching the current `getPlayerDirection` ordering) with these delays per step: `[80, 80, 80, 80, 80, 80, 80, 100, 120, 150, 180, 220, 260]` ms.
8. After the final delay, `startingPlayerId` is set to the landing player.
9. `isAnimating === true` during the sequence, `false` after.
10. Selection algorithm: **verify against `hooks/useStartingPlayer.ts` in the current repo**. The current implementation is a weighted random picker; replicate exactly (do not simplify to uniform random unless the source already is).
11. Calling `pickStartingPlayer()` again while animating is a no-op.

### Confetti
12. When `active` flips to true, renders `particleCount` particles (24 by default) at the top of the bounding container.
13. Each particle: random color, random initial X offset within ±70 px from center, falls 260 px over 1300 ms, drifts on the X axis by random ±70 px, rotates by random ±480°, fades out between 700 ms and 1150 ms.
14. Particles have a random initial delay 0–280 ms.
15. When `active` flips back to false, particles unmount cleanly.

### StartingPlayerButton (UI entry)
16. A button somewhere in the `Game` screen layout (placement: small floating control, usually in the corner — verify against current source).
17. Tapping fires `pickStartingPlayer`.
18. Disabled during animation.
19. `PlayerBox` (feature 17 / `player-box`) reads `startingPlayerId` and mounts `Confetti` for the matching player (230 ms after `startingPlayerId === playerId` becomes true; unmounts when it becomes false).

## Acceptance tests
- `Wheel.test.tsx`: behaviors 1–6 with gesture-handler test utilities.
- `useStartingPlayer.test.ts`: behaviors 7–11 with Jest fake timers.
- `Confetti.test.tsx`: behaviors 12–15 with Reanimated mocked.
- Integration: triggering `pickStartingPlayer` from a mocked `StartingPlayerButton` eventually sets `startingPlayerId` to a value in `[0, numPlayers)`.

## Non-goals
- Does not implement a fully-virtualized wheel for very long lists. Acceptable for 2–6 items.
- Does not auto-trigger on game start. Manual.

## Notes for the implementer
- Use `react-native-gesture-handler`'s `Gesture.Pan()` for drag.
- Use `useDerivedValue` to compute the per-item scale based on translation.
- The cycle order matches `getPlayerDirection` ordering: top row L→R, right column T→B, bottom row R→L, left column B→T. Implement as a single ordered array keyed by `playerId`.
- Confetti uses Reanimated `withDelay`/`withTiming` chains, one per particle. Keep particle count at 24 by default — going higher kills frame rate on mid-tier Androids.
- Reference current source: `hooks/useStartingPlayer.ts`, `components/PlayerBox/Components/Confetti.tsx`, plus the current LayoutSelectorScreen for `react-native-wheely` usage patterns.
- Patch-package and the `expo doctor` exclude for `react-native-wheely` are removed once this feature lands.
