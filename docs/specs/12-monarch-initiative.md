# 12 — Monarch & Initiative

## Purpose
Track the current Monarch and Initiative holders for the game. Render a `StatusBottomBar` per player with two togglable controls (crown for Monarch, dungeon icon for Initiative). Tapping a control assigns or removes that status. The bars per player have entry/exit animations.

## Public API

```ts
// src/features/monarch-initiative/slice.ts
export type MonarchInitiativeSlice = {
  monarchPlayerId: number | null;
  initiativePlayerId: number | null;
  showMonarchBar: boolean;       // per-game toggle (visibility for all players)
  showInitiativeBar: boolean;

  claimMonarch: (playerId: number) => void;
  claimInitiative: (playerId: number) => void;
  toggleMonarchBar: (playerId: number) => void;       // toggles showMonarchBar, also sets monarchPlayerId
  toggleInitiativeBar: (playerId: number) => void;
};

export const createMonarchInitiativeSlice: StateCreator<GameStore, [], [], MonarchInitiativeSlice>;

// src/features/monarch-initiative/index.ts
export { StatusBottomBar } from './components/StatusBottomBar';

type StatusBottomBarProps = { playerId: number };
```

## Dependencies
- 03-game-store-core.
- 18-shared-ui (animations).

## Behavior spec (TDD anchor)

### Slice (pure)
1. Initial state: `monarchPlayerId === null`, `initiativePlayerId === null`, `showMonarchBar === false`, `showInitiativeBar === false`.
2. `claimMonarch(2)` sets `monarchPlayerId === 2`. `showMonarchBar` is NOT modified.
3. `claimInitiative(3)` sets `initiativePlayerId === 3`.
4. `toggleMonarchBar(0)` when `showMonarchBar === false`: sets `showMonarchBar = true` and `monarchPlayerId = 0`.
5. `toggleMonarchBar(0)` when `showMonarchBar === true`: sets `showMonarchBar = false` and `monarchPlayerId = null`.
6. `toggleInitiativeBar` mirrors monarch behavior.
7. `resetGame` clears all four fields back to initial.

### StatusBottomBar (component)
8. Two icon buttons side-by-side at the bottom of the `PlayerBox`: crown (Monarch) and dungeon (Initiative).
9. Crown button background is gold (`#d4af37`) when `monarchPlayerId === playerId`, otherwise neutral.
10. Initiative button background is purple (`#7e57c2`) when `initiativePlayerId === playerId`, otherwise neutral.
11. Tapping crown when `monarchPlayerId === playerId` calls `claimMonarch` with a null-equivalent (or `toggleMonarchBar(playerId)` to clear). Verify against current source which uses `toggleMonarchBar` for both claim and clear.
12. The buttons appear (animated) only when their respective `showXBar === true`. Use Reanimated entry/exit (SlideIn/SlideOut, 200 ms).

## Acceptance tests
- `monarch-initiative.slice.test.ts`: behaviors 1–7.
- `StatusBottomBar.test.tsx`: behaviors 8–12 with Reanimated mocked.

## Non-goals
- Does not implement a global toggle UI for `showMonarchBar` / `showInitiativeBar` — that toggle currently lives in a settings menu. If a settings menu exists in the current build, reference it in a follow-up spec; for the rewrite, accept that the bar visibility is set elsewhere.
- Does not render special player highlight (e.g., a gold border for the monarch) at the `PlayerBox` level — that's a `PlayerBox` composition concern (handled in feature 17 / `player-box`).

## Notes for the implementer
- The Monarch token in MTG passes when a player deals combat damage to the current Monarch; the app does NOT auto-track this — the user assigns manually.
- Initiative similarly does NOT auto-track.
- Verify exact `toggleMonarchBar` / `claimMonarch` semantics against current `store/GameStore.ts` — there's some overlap between "claim" and "toggle" that the test cases above approximate.
- Reference current source: `store/GameStore.ts`, `components/PlayerBox/Components/StatusBottomBar.tsx`.
