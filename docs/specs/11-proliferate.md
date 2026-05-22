# 11 — Proliferate

## Purpose
Implement the cross-slice `proliferate` action and its inverse `undoProliferate`. Proliferate increments by 1 any counter that is currently `> 0`, across the calling player's energy/experience and every other player's poison. The action is exposed via a button in `CountersSideBar` that supports tap-to-proliferate and hold-to-undo.

## Public API

```ts
// src/features/proliferate/action.ts
export function proliferateAction(state: GameStore, playerId: number): Partial<GameStore>;
export function undoProliferateAction(state: GameStore, playerId: number, occurrenceIndex: number): Partial<GameStore>;

// Wired into the store as:
proliferate: (playerId: number) => void;
undoProliferate: (playerId: number) => void;

// src/features/proliferate/hooks/useProliferate.ts
export function useProliferate(playerId: number): {
  onTap: () => void;        // tap → proliferate
  onPressIn: () => void;    // long press → undo at PROLIFERATE_UNDO_INTERVAL (400 ms)
  onPressOut: () => void;
  undoCount: number;        // available undos
};

// src/features/proliferate/index.ts
export { ProliferateButton } from './components/ProliferateButton';

type ProliferateButtonProps = { playerId: number };
```

## Dependencies
- 03-game-store-core (entire store state needed).
- 10-counters (mutates poison/energy/experience).
- 08-increment-buttons (`useIncrementAction` reused with a 400 ms interval).

## Behavior spec (TDD anchor)

### proliferateAction (pure)
1. Calling player has `energy === 2, experience === 0`. After `proliferate(0)`, `energy === 3`, `experience === 0` (only counters `> 0` increment).
2. Other players with `poison === 1` get `poison === 2`. Other players with `poison === 0` stay at 0.
3. Other players' energy and experience are NEVER affected — only their poison.
4. Calling player's poison is NEVER affected.
5. Each call pushes an undo record onto an in-memory undo stack keyed by `playerId`. The stack is not persisted.

### undoProliferateAction
6. Pops the most recent undo record and reverses exactly those increments.
7. Undo records are stack-based: undo restores the prior state regardless of intervening user actions (the values are restored to what they were just after the inverse delta). If a counter was independently changed since the proliferate, undo still subtracts 1 — accept the resulting inconsistency rather than try to detect it. (Match current Expo behavior.)
8. Undoing with an empty stack is a no-op.

### useProliferate
9. Tap fires `proliferate(playerId)` once. Push-and-release without crossing the long-press threshold counts as tap.
10. Long press triggers a 400 ms interval calling `undoProliferate(playerId)` per tick.
11. Release stops the interval.

### ProliferateButton
12. Single button with a proliferate-themed icon (e.g., MaterialCommunityIcons `mushroom` or current source's choice).
13. Shows a badge with `undoCount` when greater than 0.
14. Disabled visually when nothing can proliferate (all counters that could increment are 0). (Optional — verify against current source; if not implemented there, omit.)

## Acceptance tests
- `proliferate.action.test.ts`: behaviors 1–8.
- `useProliferate.test.ts`: behaviors 9–11 with fake timers.
- `ProliferateButton.test.tsx`: behaviors 12–14.

## Non-goals
- Does not implement counter slices (10).
- Does not handle persistence of the undo stack — the stack is intentionally session-scoped.

## Notes for the implementer
- The undo stack is module-level (a `Map<playerId, ProliferateRecord[]>` outside the store). Reset it on `resetGame`.
- A "ProliferateRecord" is `{ counterDeltas: Array<{ playerId: number; key: 'poison'|'energy'|'experience'; delta: number }> }` — store the exact mutations so undo is a literal reversal.
- `PROLIFERATE_UNDO_INTERVAL = 400` ms (from `src/shared/constants/ui.ts`).
- Reference current source: `store/GameStore.ts` (search for `proliferate`), the proliferate UI inside `components/PlayerBox/Components/CountersSideBar.tsx`.
