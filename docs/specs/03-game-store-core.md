# 03 — Game Store Core

## Purpose
Define the composed `useGameStore`, the `CoreSlice` (numPlayers, gameLayout, resetGame, setNumPlayers), the slice composition pattern that all stateful features extend, and the player-record shape consumed by every gameplay feature.

## Public API

```ts
// src/store/gameStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCoreSlice, CoreSlice } from '@/store/coreSlice';
import { createLifeSlice, LifeSlice } from '@/features/life-total/slice';
import { createCdmgSlice, CdmgSlice } from '@/features/commander-damage/slice';
import { createCountersSlice, CountersSlice } from '@/features/counters/slice';
import { createMonarchInitiativeSlice, MonarchInitiativeSlice } from '@/features/monarch-initiative/slice';
import { persistConfig } from '@/features/persistence/middleware';

export type GameStore = CoreSlice & LifeSlice & CdmgSlice & CountersSlice & MonarchInitiativeSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get, store) => ({
      ...createCoreSlice(set, get, store),
      ...createLifeSlice(set, get, store),
      ...createCdmgSlice(set, get, store),
      ...createCountersSlice(set, get, store),
      ...createMonarchInitiativeSlice(set, get, store),
    }),
    persistConfig,
  ),
);
```

### CoreSlice

> **Note:** `CoreSlice` lives in `src/store/coreSlice.ts`, not under `src/features/`. It is store infrastructure, not a feature — it owns the player-record shape and the `setNumPlayers` / `resetGame` lifecycle that every feature depends on.

```ts
// src/store/coreSlice.ts
export type Player = {
  id: number;
  // populated by LifeSlice, CdmgSlice, CountersSlice — typed as a union by intersection
  lTotal: number;
  delta: number;
  history: number[];
  Cdmg: Record<number, [number, number]>;
  chain: boolean;
  poison: number;
  energy: number;
  experience: number;
};

export type CoreSlice = {
  players: Record<number, Player>;
  numPlayers: number;                          // 2..6
  gameLayout: [number, number, number, number]; // [top, right, bottom, left]
  startingPlayerId: number | null;
  setNumPlayers: (input: { playerCount: number; alt?: boolean }) => void;
  resetGame: () => void;
};

export const createCoreSlice: StateCreator<GameStore, [], [], CoreSlice>;
```

### Slice factory contract
Every feature slice exports:
```ts
export type XSlice = { /* state fields owned by this feature + their mutators */ };
export const createXSlice: StateCreator<GameStore, [], [], XSlice>;
```
A slice only mutates its own fields. Touching another slice's fields is a bug — use a cross-slice action (feature 11, 13).

### Combined action surface
The composed store exposes every slice's actions plus the cross-slice actions wired in via `gameStore.ts`. The full action surface seen by components:

```ts
// CoreSlice
setNumPlayers, resetGame
// LifeSlice
incrementLife, setLife
// CdmgSlice
dealCommanderDamage, togglePlayerChain
// CountersSlice
incrementPoison, incrementEnergy, incrementExperience
// MonarchInitiativeSlice
claimMonarch, claimInitiative, toggleMonarchBar, toggleInitiativeBar
// Cross-slice (defined in features 11, 13; wired here)
proliferate, undoProliferate, damageAllOpponents
```

Cross-slice actions are wired in `gameStore.ts` after slice composition:
```ts
proliferate: (playerId) => set((state) => proliferateAction(state, playerId)),
undoProliferate: (playerId) => set((state) => undoProliferateAction(state, playerId)),
damageAllOpponents: ({ playerId, value }) => set((state) => damageAllAction(state, playerId, value)),
```

### Layout table
```ts
// src/store/constants/playerLayouts.ts
// Indexed by [numPlayers - 2][alt ? 1 : 0]; each entry is [top, right, bottom, left]
export const PLAYER_LAYOUTS: Record<number, [Layout, Layout]>;
```
Carry the table from the current repo's `store/playerLayouts.ts` verbatim. There are 12 configurations across 2–6 players.

### Constants
```ts
// src/store/constants/game.ts
export const STARTING_LIFE_TOTAL = 40;
export const TIME_TO_RESET_DELTA = 2000;       // ms
export const CDMG_LIMIT = 21;
export const PROLIFERATE_UNDO_INTERVAL = 400;  // ms
export const DAMAGE_ALL_INTERVAL = 400;        // ms
export const HOLD_INTERVAL = 100;              // ms (increment buttons)
```

## Dependencies
- Each feature slice in `features/<name>/slice.ts` exports its `createXSlice` factory. CoreSlice depends on none of them at the type level; the composition happens in `store/gameStore.ts`.

## Behavior spec (TDD anchor)

CoreSlice tests (pure, no React):

1. After `setNumPlayers({ playerCount: 4 })`, `players` contains entries `{0,1,2,3}`.
2. Each newly-created player has `lTotal === 40`, `delta === 0`, `history === []`, `Cdmg === {}`, `chain === false`, `poison === 0`, `energy === 0`, `experience === 0`.
3. `gameLayout` after `setNumPlayers({ playerCount: 4 })` equals the default 4-player layout from `PLAYER_LAYOUTS[4][0]`.
4. `gameLayout` after `setNumPlayers({ playerCount: 4, alt: true })` equals `PLAYER_LAYOUTS[4][1]`.
5. `setNumPlayers` clears `monarchPlayerId`, `initiativePlayerId`, `startingPlayerId` (delegates to a `_resetTransient` helper called from CoreSlice).
6. `resetGame` re-applies the current `numPlayers` and `alt` with full default state.
7. `resetGame` clears all pending delta timers (see implementation note below).
8. `setNumPlayers({ playerCount: 1 })` is a no-op (or throws — pick one and assert). `playerCount` must be in `[2, 6]`.

Persistence integration (covered fully in 04): the store rehydrates `players`, `numPlayers`, `gameLayout`, `monarch/initiative IDs` on next launch; transient fields like `delta` and `startingPlayerId` are excluded from persistence.

## Acceptance tests
- `core.slice.test.ts` covers behaviors 1–8 above.
- `gameStore.test.ts` smoke-tests composition: instantiating the store exposes all slice fields.

## Non-goals
- Does not implement life mutations (`incrementLife`, etc.) — that's 07.
- Does not implement persistence — that's 04.
- Does not implement proliferate or damage-all — those are 11 and 13.

## Notes for the implementer
- Delta reset timers: each player has a single in-flight timer ID. Store them in a module-level `Map<playerId, NodeJS.Timeout>` outside the Zustand state (timers must not be serialized). `incrementLife` (spec 07) cancels any in-flight timer for that player before scheduling a new one. `resetGame` iterates the map and clears all.
- Match the player-record shape exactly so persistence (04) can rehydrate without migrations.
- Selectors live in `src/store/selectors.ts` (e.g., `selectPlayer`, `selectPlayerCount`). Each feature may add its own selectors under its directory and re-export from `selectors.ts`.
