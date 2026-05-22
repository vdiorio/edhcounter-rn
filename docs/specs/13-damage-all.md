# 13 — Damage All

## Purpose
A single-button shortcut that deals 1 damage to every opponent of the calling player. Tap deals -1 to all opponents; long-press changes mode to +1 (heal) to all and repeats at `DAMAGE_ALL_INTERVAL` ms. A rotating star icon provides visual feedback during the hold.

## Public API

```ts
// src/features/damage-all/action.ts
export function damageAllAction(
  state: GameStore,
  callerId: number,
  value: number,
): Partial<GameStore>;

// Wired into the store as:
damageAllOpponents: (input: { playerId: number; value: number }) => void;

// src/features/damage-all/index.ts
export { DamageAllButton } from './components/DamageAllButton';

type DamageAllButtonProps = { playerId: number };
```

## Dependencies
- 03-game-store-core.
- 07-life-total (calls `incrementLife` for each opponent).
- 08-increment-buttons (`useIncrementAction` pattern with a custom interval).

## Behavior spec (TDD anchor)

### damageAllAction (pure)
1. `damageAllAction(state, 0, -1)` reduces `lTotal` by 1 for every player `id !== 0`. The action is a signed life delta — same convention as `incrementLife`.
2. The caller (`id === 0`) is unaffected.
3. Each affected player's `delta` accumulates per the standard rules (feature 07).
4. `value` is signed; `+1` heals all opponents.

### DamageAllButton (component)
5. Tap fires `damageAllOpponents({ playerId, value: -1 })` once.
6. Long press starts a 400 ms interval (`DAMAGE_ALL_INTERVAL`) firing `damageAllOpponents({ playerId, value: +1 })` — the mode swap between tap (damage) and hold (heal) is intentional. **Implementer: verify the exact tap/hold signs against `components/PlayerBox/Components/DamageAllButton.tsx` in the current repo — if the source disagrees, follow the source and update this spec.**
7. The button shows a star icon (MaterialCommunityIcons `star` or current source's choice).
8. On tap, the icon rotates 45° as press feedback (200 ms ease-out).
9. While held, the icon spins 360° in a linear loop (5 s per revolution) until release.
10. Icon stroke color shifts to green during heal mode (hold).

## Acceptance tests
- `damageAll.action.test.ts`: behaviors 1–4.
- `DamageAllButton.test.tsx`:
  - Tap reduces all opponents' lTotal by 1; caller unchanged.
  - Holding for 1200 ms triggers ≥ 2 heal ticks (allow timing tolerance).
  - Icon rotation is set by Reanimated shared value (mock and assert target rotation).

## Non-goals
- Does not implement the +/- buttons for the caller's own life (that's 08).
- No undo for damage-all — the user can revert manually with +1 taps.

## Notes for the implementer
- Constant: `DAMAGE_ALL_INTERVAL = 400` ms.
- The inverted-sign-on-hold is a deliberate UX choice (single button, two modes). Document this with a one-line WHY comment at the implementation site.
- Reference current source: `components/PlayerBox/Components/DamageAllButton.tsx`, `store/GameStore.ts` (`damageAllOponents` — note the typo in the current source; correct it to `damageAllOpponents` in the rewrite).
