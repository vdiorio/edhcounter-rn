import type {StateCreator} from 'zustand';
import type {GameStore} from '@/store/gameStore';

function clampAtZero(value: number): number {
  return Math.max(0, value);
}

function nextPoison(current: number, delta: number): number {
  if (delta >= 0) {
    return current + delta;
  }
  if (current > 10) {
    return 9;
  }
  return clampAtZero(current + delta);
}

export type CountersSlice = {
  incrementPoison: (input: {playerId: number; value: number}) => void;
  incrementEnergy: (input: {playerId: number; value: number}) => void;
  incrementExperience: (input: {playerId: number; value: number}) => void;
};

export const createCountersSlice: StateCreator<GameStore, [], [], CountersSlice> = (set, get) => ({
  incrementPoison: ({playerId, value}) => {
    const player = get().players[playerId];
    if (!player) return;

    set(state => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId]!,
          poison: nextPoison(state.players[playerId]!.poison, value),
        },
      },
    }));
  },

  incrementEnergy: ({playerId, value}) => {
    const player = get().players[playerId];
    if (!player) return;

    set(state => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId]!,
          energy: clampAtZero(state.players[playerId]!.energy + value),
        },
      },
    }));
  },

  incrementExperience: ({playerId, value}) => {
    const player = get().players[playerId];
    if (!player) return;

    set(state => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId]!,
          experience: clampAtZero(state.players[playerId]!.experience + value),
        },
      },
    }));
  },
});