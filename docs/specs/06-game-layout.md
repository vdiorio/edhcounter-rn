# 06 — Game Layout & Rotation

## Purpose
Compute the per-player grid geometry from the current `gameLayout` and screen dimensions, place a `PlayerPiece` at each slot, and rotate each `PlayerPiece` so its content faces the player sitting on that edge of the table. Also provides the parallel `CdmgPiece` for the CDMG screen.

## Public API

```ts
// src/features/game-layout/index.ts
export { LayoutGenerator } from './components/LayoutGenerator';
export { PlayerPiece } from './components/PlayerPiece';
export { CdmgPiece } from './components/CdmgPiece';
export { Rotator } from './components/Rotator';
export { useLayoutGenerator } from './hooks/useLayoutGenerator';
export type { Direction } from './types';

export type Direction = 0 | 90 | 180 | -90;     // degrees

// LayoutGenerator props
type LayoutGeneratorProps = {
  renderPiece: (props: { playerId: number; direction: Direction; width: number; height: number }) => ReactNode;
};

// PlayerPiece props
type PlayerPieceProps = {
  playerId: number;
  direction: Direction;
  width: number;
  height: number;
};

// CdmgPiece props
type CdmgPieceProps = PlayerPieceProps & { targetPlayerId: number };

// Rotator props
type RotatorProps = {
  direction: Direction;
  width: number;
  height: number;
  children: ReactNode;
};

// useLayoutGenerator return shape
type LayoutGeometry = {
  pieces: Array<{ playerId: number; direction: Direction; width: number; height: number; x: number; y: number }>;
  containerWidth: number;
  containerHeight: number;
};
```

## Dependencies
- 02-app-shell (rendered inside `GameScreen` and `CdmgScreen`).
- 03-game-store-core (`numPlayers`, `gameLayout`).
- 16-player-box / 09-commander-damage (the actual piece content is composed elsewhere; this feature provides the geometric scaffolding and rotation only).

## Behavior spec (TDD anchor)

### Geometry (`useLayoutGenerator`)
1. Given `gameLayout = [1, 1, 1, 1]` and a 360×800 screen, returns 4 pieces: top, right, bottom, left, each sized appropriately so all slots fit without overlap.
2. Given `gameLayout = [0, 2, 0, 2]` (4-player wide), returns 4 pieces all on the sides; the top and bottom rows have height 0.
3. Side pieces have their `direction` set to `90` (right) or `-90` (left). Top piece direction `180`. Bottom piece direction `0`.
4. Piece IDs are assigned in scanline order: top row first, then right column top-to-bottom, then bottom row left-to-right (matching the current `getPlayerIds` utility behavior).
5. Container width/height equals the safe-area-adjusted screen dimensions.

### Rotation (`Rotator`)
6. With `direction = 0`, child is rendered as-is.
7. With `direction = 90` or `-90`, child is rotated and `width` / `height` swap so the rendered layout still fills the slot.
8. With `direction = 180`, child is flipped upside down.
9. Rotator does not break absolute positioning of its children — it only transforms.

### LayoutGenerator
10. `LayoutGenerator` reads `numPlayers` and `gameLayout` from `useGameStore`, computes geometry, and calls `renderPiece` once per slot.
11. Each rendered piece is wrapped in `Rotator` with the correct direction.

## Acceptance tests
- `useLayoutGenerator.test.ts`: covers behaviors 1–5 with parameterized inputs.
- `Rotator.test.tsx`: snapshot + style assertions for all four directions.
- `LayoutGenerator.test.tsx`: given a mocked `useGameStore`, verifies `renderPiece` is invoked with expected props for representative 2/3/4/5/6-player layouts.

## Non-goals
- Does not implement `PlayerBox` content (feature 17 composition).
- Does not handle starting-player highlight (feature 14 toggles a boolean read by `PlayerBox`).
- Does not animate piece entry — animations live inside `PlayerBox` (feature 17 / 18).

## Notes for the implementer
- Reference current source: `components/LayoutGenerator/Component/Player/PlayerPiece.tsx`, `components/LayoutGenerator/Component/Cdmg/CdmgPiece.tsx`, `components/LayoutGenerator/Component/utils/index.ts`, `components/Rotator/Rotator.tsx`, `hooks/useLayoutGenerator.ts`.
- Use `useWindowDimensions()` and `useSafeAreaInsets()` for geometry — don't hardcode.
- `usePressRotation` (current `hooks/usePressRotation.ts`) is a shared visual-feedback hook with `{ maxDeg: 45, duration: 300 }` — move it to `src/shared/hooks/usePressRotation.ts` rather than feature 06.
- Direction is a strict union of four values. TypeScript should narrow at usage sites.
