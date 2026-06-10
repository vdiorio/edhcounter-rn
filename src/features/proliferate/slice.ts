import type {StateCreator} from 'zustand';
import type {GameStore} from '@/store/gameStore';
import {
  getProliferateUndoCount,
  proliferateAction,
  undoProliferateAction,
} from './action';

export type ProliferateSlice = {
  proliferateUndoCountByPlayer: Record<number, number>;
  proliferate: (playerId: number) => void;
  undoProliferate: (playerId: number) => void;
};

/**
 * Store state this slice contributes to a game reset. The composition root
 * (store/gameReset.ts) merges this with other slices' reset partials; the
 * module-level undo stack is cleared separately via clearProliferateUndoStack.
 */
export const PROLIFERATE_RESET_STATE: Pick<
  ProliferateSlice,
  'proliferateUndoCountByPlayer'
> = {
  proliferateUndoCountByPlayer: {},
};

export const createProliferateSlice: StateCreator<
  GameStore,
  [],
  [],
  ProliferateSlice
> = (set, get) => ({
  ...PROLIFERATE_RESET_STATE,

  proliferate: playerId => {
    if (!get().players[playerId]) return;
    set(state => ({
      ...proliferateAction(state, playerId),
      proliferateUndoCountByPlayer: {
        ...state.proliferateUndoCountByPlayer,
        [playerId]: getProliferateUndoCount(playerId),
      },
    }));
  },

  undoProliferate: playerId => {
    if (!get().players[playerId]) return;
    set(state => ({
      ...undoProliferateAction(state, playerId),
      proliferateUndoCountByPlayer: {
        ...state.proliferateUndoCountByPlayer,
        [playerId]: getProliferateUndoCount(playerId),
      },
    }));
  },
});
