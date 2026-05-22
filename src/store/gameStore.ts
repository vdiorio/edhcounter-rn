import {create} from 'zustand';

/**
 * Stub implementation — Spec 03 (game-store-core) will replace this with the
 * composed slice-based store. App-shell-level callers (Spec 02) only need
 * resetGame and setNumPlayers to exist.
 */
export type SetNumPlayersArgs = {
  playerCount: number;
  alt?: boolean;
};

export type GameStore = {
  numPlayers: number;
  alt: boolean;
  setNumPlayers: (args: SetNumPlayersArgs) => void;
  resetGame: () => void;
};

export const useGameStore = create<GameStore>(set => ({
  numPlayers: 0,
  alt: false,
  setNumPlayers: ({playerCount, alt = false}) =>
    set({numPlayers: playerCount, alt}),
  resetGame: () => set({numPlayers: 0, alt: false}),
}));
