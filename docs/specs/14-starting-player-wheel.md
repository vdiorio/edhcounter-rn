# 14 — Starting Player Picker + Confetti

## Purpose
Define the starting-player picker flow and the confetti feedback shown on the selected player.

This spec no longer requires a wheel picker component.

## Public API

```ts
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
export { Confetti };
export { useStartingPlayer };
export { StartingPlayerButton } from './components/StartingPlayerButton';
```

## Dependencies
- 03-game-store-core (`numPlayers`, `startingPlayerId`).
- 16-player-box / 17-sidebar-shell (confetti mounts inside `PlayerBox` of the starting player).

## Behavior spec (TDD anchor)

### useStartingPlayer
1. `pickStartingPlayer()` runs the highlight sequence: cycles through player IDs in clockwise order (matching the current `getPlayerDirection` ordering) with these delays per step: `[80, 80, 80, 80, 80, 80, 80, 100, 120, 150, 180, 220, 260]` ms.
2. After the final delay, `startingPlayerId` is set to the landing player.
3. `isAnimating === true` during the sequence, `false` after.
4. Selection algorithm: verify against `hooks/useStartingPlayer.ts` in the current repo. If current behavior is weighted random, preserve that behavior.
5. Calling `pickStartingPlayer()` again while animating is a no-op.

### Confetti
6. When `active` flips to true, renders `particleCount` particles (24 by default) at the top of the bounding container.
7. Each particle: random color, random initial X offset within +/-70 px from center, falls 260 px over 1300 ms, drifts on the X axis by random +/-70 px, rotates by random +/-480 deg, fades out between 700 ms and 1150 ms.
8. Particles have a random initial delay 0-280 ms.
9. When `active` flips back to false, particles unmount cleanly.

### StartingPlayerButton (UI entry)
10. A button somewhere in the `Game` screen layout (placement: small floating control, usually in the corner; verify against current source).
11. Tapping fires `pickStartingPlayer`.
12. Disabled during animation.
13. `PlayerBox` (feature 17 / `player-box`) reads `startingPlayerId` and mounts `Confetti` for the matching player (230 ms after `startingPlayerId === playerId` becomes true; unmounts when it becomes false).

## Acceptance tests
- `useStartingPlayer.test.ts`: behaviors 1-5 with Jest fake timers.
- `Confetti.test.tsx`: behaviors 6-9 with Reanimated mocked.
- Integration: triggering `pickStartingPlayer` from a mocked `StartingPlayerButton` eventually sets `startingPlayerId` to a value in `[0, numPlayers)`.

## Non-goals
- Does not auto-trigger on game start. Manual.
- Does not define a wheel picker component or wheel migration work.

## Notes for the implementer
- The cycle order matches `getPlayerDirection` ordering: top row L→R, right column T→B, bottom row R→L, left column B→T. Implement as a single ordered array keyed by `playerId`.
- Confetti uses Reanimated `withDelay`/`withTiming` chains, one per particle. Keep particle count at 24 by default — going higher kills frame rate on mid-tier Androids.
- Reference current source: `hooks/useStartingPlayer.ts`, `components/PlayerBox/Components/Confetti.tsx`.
