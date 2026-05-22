# 17 — Sidebar Shell + PlayerBox Composition

## Purpose
Provide the per-player sliding sidebar used to host History, Commander Damage, and Counters editors, plus the `PlayerBox` composition that wires together all per-player features (life total, increment buttons, counters top bar, status bottom bar, sidebar, damage-all, confetti).

This spec deliberately bundles the sidebar shell and the `PlayerBox` composition because the sidebar is meaningful only inside `PlayerBox`.

## Public API

```ts
// src/features/sidebar-shell/hooks/useSidebarState.ts
export type SidebarKey = 'cdmg' | 'history' | 'counters' | null;

export function useSidebarState(playerId: number): {
  selectedBar: SidebarKey;
  toggleBar: (key: SidebarKey) => void;     // null clears
};

// src/features/sidebar-shell/components/UtilsSideBar.tsx
type UtilsSideBarProps = { playerId: number };

// src/features/sidebar-shell/components/SidebarSlot.tsx
type SidebarSlotProps = {
  playerId: number;
  selectedBar: SidebarKey;
};

// src/features/sidebar-shell/components/SidebarButton.tsx
type SidebarButtonProps = {
  icon: 'Shield' | 'History' | 'Counters';
  selected: boolean;
  onPress: () => void;
  color?: string;
};

// src/features/sidebar-shell/index.ts
export { UtilsSideBar, SidebarSlot, SidebarButton, useSidebarState };

// src/features/player-box/components/PlayerBox.tsx
type PlayerBoxProps = {
  playerId: number;
  debugId?: string;
  style?: ViewStyle;
};
```

### Sidebar widths (when expanded)
- CDMG: 30% of `PlayerBox` width
- History: 20%
- Counters: 26%

(Verify against current source `components/PlayerBox/Components/SidebarSlot.tsx`.)

### How `'counters'` is triggered
`UtilsSideBar` exposes only the `cdmg` and `history` buttons plus `DamageAllButton`. The `'counters'` sidebar is triggered from elsewhere — most likely a tap on `CountersTopBar` (feature 10). **Implementer: verify the trigger against current source.** If `CountersTopBar` does open the counters sidebar, wire that interaction in spec 10's `CountersTopBar` and expose `toggleBar('counters')` via the per-player `useSidebarState` instance. If no such trigger exists in the current source, `'counters'` may be unused — in which case drop it from `SidebarKey` and from this spec.

## Dependencies
- 02-app-shell.
- 03-game-store-core.
- 07-life-total (Lifetotal, HistorySideBar).
- 08-increment-buttons (IncrementerButtons).
- 09-commander-damage (CdmgSideBar).
- 10-counters (CountersTopBar, CountersSideBar).
- 12-monarch-initiative (StatusBottomBar).
- 13-damage-all (DamageAllButton).
- 14-starting-player-wheel (Confetti).
- 15-theming (useAppColors, player color).
- 18-shared-ui.

## Behavior spec (TDD anchor)

### useSidebarState
1. Initial `selectedBar === null`.
2. `toggleBar('cdmg')` sets `selectedBar === 'cdmg'`.
3. `toggleBar('cdmg')` again (same key) clears: `selectedBar === null`.
4. `toggleBar('history')` while `selectedBar === 'cdmg'` switches with a brief animation (see below) — `selectedBar` flips through `null` then to `'history'` so the slot can play exit-then-enter.
5. State is per-player (separate `useSidebarState(playerId)` instances do not share).

### SidebarSlot
6. Renders nothing when `selectedBar === null`.
7. Renders `HistorySideBar` for `'history'`, `CdmgSideBar` for `'cdmg'`, `CountersSideBar` for `'counters'`.
8. Animates in with Reanimated `SlideInLeft` (180 ms) and out with `SlideOutLeft` (50 ms).
9. When `selectedBar` switches from one non-null key to another, the slot plays a sequential exit-then-enter animation.

### UtilsSideBar
10. Renders a column of `SidebarButton`s (Shield = CDMG, History = History) plus the `DamageAllButton`.
11. Tap on a button toggles the matching slot via `useSidebarState`.
12. Buttons highlight when their key is selected.

### PlayerBox composition
13. Renders, top-to-bottom: `SidebarSlot` (overlay) + `CountersTopBar` + `Lifetotal` + `IncrementerButtons` + `StatusBottomBar` + `UtilsSideBar` (column on the side).
14. Border: white when `startingPlayerId === playerId`, else the player's theme color.
15. Mounts `Confetti` 230 ms after `startingPlayerId === playerId` becomes true; unmounts when it becomes false.
16. Entry animation: `FadeIn` 1000 ms on initial mount; `LinearTransition` for layout changes (e.g., counter shows up).
17. `debugId` (if provided) is set as `accessibilityLabel` for testing.

## Acceptance tests
- `useSidebarState.test.ts`: behaviors 1–5.
- `SidebarSlot.test.tsx`: renders correct child per key; animation values asserted on transition (with Reanimated mocked).
- `UtilsSideBar.test.tsx`: tapping shield button selects `'cdmg'`; tapping again clears.
- `PlayerBox.test.tsx`: composition smoke test — all expected child components mount; border color reacts to `startingPlayerId`; confetti mounts/unmounts on schedule.

## Non-goals
- Does not implement the contents of HistorySideBar, CdmgSideBar, CountersSideBar (those features own their own content).
- Does not implement the layout grid (that's 06).

## Notes for the implementer
- The "sequential exit-then-enter" pattern uses an intermediate `null` step. Implement as: `set selectedBar = null`, after the exit animation finishes (~50 ms), set the target key. Use `setTimeout` or animation callbacks — `setTimeout` is simpler and matches the current code.
- `PlayerBox` is composition only — no business logic. If a piece of logic naturally fits here (e.g., the 230 ms confetti delay), keep it but lift it to a small named function for testability.
- Reference current source: `components/PlayerBox/PlayerBox.tsx`, `components/PlayerBox/Components/UtilsSideBar.tsx`, `components/PlayerBox/Components/SidebarSlot.tsx`, `components/PlayerBox/Components/SidebarButton.tsx`, `hooks/useSidebarState.ts`, `hooks/usePlayerIcon.tsx`.
