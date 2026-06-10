import type {StateCreator} from 'zustand';
import type {GameStore} from '@/store/gameStore';
import {damageAllAction} from './action';

export type DamageAllSlice = {
  damageAllOpponents: (input: {playerId: number; value: number}) => void;
};

export const createDamageAllSlice: StateCreator<GameStore, [], [], DamageAllSlice> = (
  set,
  get,
) => ({
  damageAllOpponents: ({playerId, value}) => {
    const players = get().players;
    if (!players[playerId]) return;

    const opponentIds: number[] = [];
    for (const key of Object.keys(players)) {
      const id = Number(key);
      if (id !== playerId) opponentIds.push(id);
    }
    if (opponentIds.length === 0) return;

    set(state => damageAllAction(state, playerId, value));

    opponentIds.forEach(id => {
      get()._scheduleDeltaReset(id);
    });
  },
});