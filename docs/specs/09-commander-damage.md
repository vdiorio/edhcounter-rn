# 09 — Commander Damage

## Purpose
Track commander damage dealt by each opponent (with optional partner commander), expose a per-opponent +/- incrementer in the sidebar and a dedicated full-screen `CdmgScreen`, and provide a "chain" toggle that synchronizes commander damage with the player's life total. Commander damage hits at 21 are visually distinct (eliminates target).

## Public API

```ts
// src/features/commander-damage/slice.ts
export type CdmgSlice = {
  // state lives on Player records: Cdmg, chain
  dealCommanderDamage: (input: {
    playerId: number;            // target
    attackerId: number;
    value: number;               // signed
    partner?: boolean;           // true → target the partner slot (index 1)
  }) => void;
  togglePlayerChain: (playerId: number) => void;
};

export const createCdmgSlice: StateCreator<GameStore, [], [], CdmgSlice>;

// src/features/commander-damage/index.ts
export { CdmgScreen } from './components/CdmgScreen';
export { CdmgBox } from './components/CdmgBox';
export { CdmgSideBar } from './components/CdmgSideBar';
export { CdmgIncrementer } from './components/CdmgIncrementer';

// CdmgScreen props
type CdmgScreenProps = NativeStackScreenProps<RootStackParamList, 'Cdmg'>;

// CdmgSideBar / CdmgIncrementer props
type CdmgSideBarProps = { playerId: number };
type CdmgIncrementerProps = {
  targetPlayerId: number;
  attackerId: number;
  partner?: boolean;
};
```

## Dependencies
- 03-game-store-core (Player.Cdmg, Player.chain).
- 07-life-total (`dealCommanderDamage` calls into `incrementLife` when `chain` is true; see note below).
- 06-game-layout (`CdmgPiece` renders within the layout grid on the `Cdmg` route).
- 02-app-shell (`Cdmg` route, `targetPlayerId` param).
- 17-sidebar-shell (CdmgSideBar mounts inside the shared sidebar).

## Behavior spec (TDD anchor)

### CdmgSlice (pure)
1. `dealCommanderDamage({ playerId: 0, attackerId: 1, value: 3 })` sets `players[0].Cdmg[1] === [3, 0]`.
2. `value` is a signed delta. The **resulting slot value** is clamped to `[0, 21]` — so applying `value: -5` to a slot at `2` results in `0`, not `-3`.
3. `partner: true` writes to slot index 1: `players[0].Cdmg[1] === [0, 3]`.
4. With `players[0].chain === true`, `dealCommanderDamage` also decrements `players[0].lTotal` by the same value. A 500 ms timer batches the delta-reset for the chained life change (separate from the 2000 ms life-only timer).
5. With `chain === false`, `dealCommanderDamage` does NOT change `lTotal`.
6. `togglePlayerChain(0)` flips `players[0].chain`.
7. Negative `value` is supported (reverses prior damage). Clamp still applies.
8. CDMG reaching 21 does NOT auto-zero life; it's a visual signal only. The user resolves elimination by setting life to 0 manually or via incrementLife.

### CdmgScreen (component)
9. Reads `targetPlayerId` from route params.
10. Renders a `LayoutGenerator` with `renderPiece` returning a `CdmgBox` per slot.
11. Each `CdmgBox` shows the attacker's commander damage value against the target player. The target player's own slot shows their life total and the `chain` toggle.
12. Back button (hardware or header back) returns to `Game`.

### CdmgIncrementer (component)
13. Two buttons (-1, +1) flanking a value display. Uses `useIncrementAction` (08).
14. Background color is the attacker player's theme color.
15. Value of 21 renders with a distinct visual treatment (e.g., red border or skull icon).

### CdmgSideBar (component)
16. Lists all OTHER players as rows, each row containing a `CdmgIncrementer` for that attacker.
17. A "partner" toggle (Switch) per attacker row, adding a second incrementer for the partner slot when on.
18. A "chain" toggle (Switch) at the top of the sidebar; reflects `players[playerId].chain`. Background color when active: `#70e700ff` (CHAIN_ACTIVE constant).

## Acceptance tests
- `cdmg.slice.test.ts`: behaviors 1–8.
- `CdmgScreen.test.tsx`: renders pieces for all players, back navigation works.
- `CdmgIncrementer.test.tsx`: tap +1 increments to 1; tap when value=21 stays at 21; tap -1 from 0 stays at 0.
- `CdmgSideBar.test.tsx`: toggling chain flips `players[playerId].chain`; toggling partner shows the second incrementer.

## Non-goals
- Does not implement the navigation route itself (02 does).
- Does not implement piece geometry / rotation (06 does).

## Notes for the implementer
- Chain'd life changes have their own 500 ms reset timer to feel snappier than the 2000 ms default. Implement as a CdmgSlice-local timer map keyed by `playerId`.
- When `chain` is toggled off, do NOT retroactively undo the life changes. The slice only governs forward damage.
- `Cdmg` is `Record<attackerId, [number, number]>` — only includes entries for attackers that have dealt damage. Don't pre-populate with zeros for all players.
- Reference current source: `store/GameStore.ts` (action `dealCommanderDamage`), `components/CdmgBox/CdmgBox.tsx`, `components/CdmgBox/Components/CdmgIncrementer.tsx`, `components/PlayerBox/Components/CdmgSideBar.tsx`.
