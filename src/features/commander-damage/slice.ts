import type {StateCreator} from 'zustand';
import {CDMG_LIMIT} from '@/store/constants/game';
import type {GameStore} from '@/store/gameStore';

const CHAIN_RESET_MS = 500;

function clampCdmg(value: number): number {
  return Math.min(CDMG_LIMIT, Math.max(0, value));
}

export type CdmgSlice = {
  dealCommanderDamage: (input: {
    playerId: number;
    attackerId: number;
    value: number;
    partner?: boolean;
  }) => void;
  togglePlayerChain: (playerId: number) => void;
};

export const createCdmgSlice: StateCreator<GameStore, [], [], CdmgSlice> = (set, get) => ({
  dealCommanderDamage: ({playerId, attackerId, value, partner = false}) => {
    const target = get().players[playerId];
    if (!target) return;

    const slotIndex = partner ? 1 : 0;
    const prevTuple = target.Cdmg[attackerId] ?? [0, 0];
    const nextTuple: [number, number] = [...prevTuple] as [number, number];
    nextTuple[slotIndex] = clampCdmg(prevTuple[slotIndex] + value);
    const appliedDelta = nextTuple[slotIndex] - prevTuple[slotIndex];

    set(state => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId]!,
          Cdmg: {
            ...state.players[playerId]!.Cdmg,
            [attackerId]: nextTuple,
          },
        },
      },
    }));

    if (target.chain && appliedDelta !== 0) {
      get().incrementLife({playerId, value: -appliedDelta});
      get()._scheduleDeltaReset(playerId, CHAIN_RESET_MS);
    }
  },

  togglePlayerChain: playerId => {
    const player = get().players[playerId];
    if (!player) return;

    set(state => ({
      players: {
        ...state.players,
        [playerId]: {
          ...state.players[playerId]!,
          chain: !state.players[playerId]!.chain,
        },
      },
    }));
  },
});