import {MONARCH_INITIATIVE_INITIAL_STATE} from '@/features/monarch-initiative';
import {
  clearProliferateUndoStack,
  PROLIFERATE_RESET_STATE,
} from '@/features/proliferate';
import type {GameStore} from './gameStore';

/**
 * Game-reset contract for cross-cutting slice state.
 *
 * `gameStore` is the composition root: when a new game starts (setNumPlayers)
 * or the current game resets (resetGame), each slice's transient/cross-cutting
 * state must be wiped. Rather than have those two actions duplicate the same
 * body and reach into every feature's internals, each resettable slice
 * contributes here:
 *
 *  - a reset *partial* (store state to merge back to defaults), and
 *  - optionally a reset *side-effect* (module-level cleanup, e.g. undo stacks).
 *
 * To make a new slice participate in reset, add its `X_RESET_STATE` to
 * `RESET_PARTIALS` and any cleanup function to `RESET_SIDE_EFFECTS`. Nothing
 * else changes.
 */
const RESET_PARTIALS: Partial<GameStore>[] = [
  MONARCH_INITIATIVE_INITIAL_STATE,
  PROLIFERATE_RESET_STATE,
];

const RESET_SIDE_EFFECTS: Array<() => void> = [clearProliferateUndoStack];

/** Merged store partial that returns every participating slice to its defaults. */
export function buildGameResetState(): Partial<GameStore> {
  return Object.assign({}, ...RESET_PARTIALS);
}

/** Runs each slice's non-store cleanup (e.g. clearing module-level undo stacks). */
export function runGameResetSideEffects(): void {
  RESET_SIDE_EFFECTS.forEach(effect => effect());
}
