import type {StateCreator} from 'zustand';
import type {GameStore} from '@/store/gameStore';

export type MonarchInitiativeSlice = {
  monarchPlayerId: number | null;
  initiativePlayerId: number | null;
  showMonarchBar: boolean;
  showInitiativeBar: boolean;
  claimMonarch: (playerId: number) => void;
  claimInitiative: (playerId: number) => void;
  toggleMonarchBar: (playerId: number) => void;
  toggleInitiativeBar: (playerId: number) => void;
};

export const MONARCH_INITIATIVE_INITIAL_STATE = {
  monarchPlayerId: null,
  initiativePlayerId: null,
  showMonarchBar: false,
  showInitiativeBar: false,
} as const;

export const createMonarchInitiativeSlice: StateCreator<GameStore, [], [], MonarchInitiativeSlice> =
  set => ({
    ...MONARCH_INITIATIVE_INITIAL_STATE,

    claimMonarch: playerId => {
      set({monarchPlayerId: playerId});
    },

    claimInitiative: playerId => {
      set({initiativePlayerId: playerId});
    },

    toggleMonarchBar: playerId => {
      set(state => {
        if (state.showMonarchBar) {
          return {showMonarchBar: false, monarchPlayerId: null};
        }
        return {showMonarchBar: true, monarchPlayerId: playerId};
      });
    },

    toggleInitiativeBar: playerId => {
      set(state => {
        if (state.showInitiativeBar) {
          return {showInitiativeBar: false, initiativePlayerId: null};
        }
        return {showInitiativeBar: true, initiativePlayerId: playerId};
      });
    },
  });