import type {StateCreator} from 'zustand';
import type {GameStore} from '@/store/gameStore';

export type LifeSlice = {
  incrementLife: (input: {playerId: number; value: number}) => void;
  setLife: (input: {playerId: number; newLife: number}) => void;
};

export const createLifeSlice: StateCreator<GameStore, [], [], LifeSlice> = (
  set,
  get,
) => ({
  incrementLife: ({playerId, value}) => {
    const player = get().players[playerId];
    if (!player) return;
    set(state => {
      const current = state.players[playerId]!;
      return {
        players: {
          ...state.players,
          [playerId]: {
            ...current,
            lTotal: current.lTotal + value,
            delta: current.delta + value,
          },
        },
      };
    });
    get()._scheduleDeltaReset(playerId);
  },

  setLife: ({playerId, newLife}) => {
    const player = get().players[playerId];
    if (!player) return;
    const delta = newLife - player.lTotal;
    set(state => {
      const current = state.players[playerId]!;
      return {
        players: {
          ...state.players,
          [playerId]: {
            ...current,
            lTotal: newLife,
            delta,
          },
        },
      };
    });
    get()._scheduleDeltaReset(playerId);
  },
});
