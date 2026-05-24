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

export const createProliferateSlice: StateCreator<GameStore, [], [], ProliferateSlice> = (
  set,
  get,
) => ({
  proliferateUndoCountByPlayer: {},

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
      ...undoProliferateAction(state, playerId, 0),
      proliferateUndoCountByPlayer: {
        ...state.proliferateUndoCountByPlayer,
        [playerId]: getProliferateUndoCount(playerId),
      },
    }));
  },
});