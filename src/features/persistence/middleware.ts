import {createJSONStorage, type PersistOptions} from 'zustand/middleware';
import type {GameStore} from '@/store/gameStore';
import type {Player} from '@/store/coreSlice';
import type {GameLayout} from '@/store/constants/playerLayouts';
import {asyncStorageAdapter} from './storage';

export const GAME_STORAGE_KEY = 'edhcounter:game:v1';
export const GAME_STORAGE_VERSION = 1;

export type PersistedPlayer = Omit<Player, 'delta'>;

export type PersistedGameState = {
  numPlayers: number;
  alt: boolean;
  gameLayout: GameLayout;
  players: Record<number, PersistedPlayer>;
};

function stripDelta(player: Player): PersistedPlayer {
  const {delta: _delta, ...rest} = player;
  return rest;
}

export function partializeGameState(state: GameStore): PersistedGameState {
  const persistedPlayers: Record<number, PersistedPlayer> = {};
  for (const [id, p] of Object.entries(state.players)) {
    persistedPlayers[Number(id)] = stripDelta(p);
  }
  return {
    numPlayers: state.numPlayers,
    alt: state.alt,
    gameLayout: state.gameLayout,
    players: persistedPlayers,
  };
}

/**
 * Restores zustand/persist defaults onto each rehydrated player record so
 * transient fields (`delta`) are never sourced from disk.
 */
function rehydratePlayers(
  persisted: Record<number, PersistedPlayer>,
): Record<number, Player> {
  const out: Record<number, Player> = {};
  for (const [id, p] of Object.entries(persisted)) {
    out[Number(id)] = {...p, delta: 0};
  }
  return out;
}

export const persistConfig: PersistOptions<GameStore, PersistedGameState> = {
  name: GAME_STORAGE_KEY,
  version: GAME_STORAGE_VERSION,
  storage: createJSONStorage(() => asyncStorageAdapter),
  partialize: partializeGameState,
  merge: (persisted, current) => {
    if (!persisted || typeof persisted !== 'object') return current;
    const typed = persisted as PersistedGameState;
    return {
      ...current,
      numPlayers: typed.numPlayers,
      alt: typed.alt,
      gameLayout: typed.gameLayout,
      players: rehydratePlayers(typed.players ?? {}),
    };
  },
  migrate: (persisted, version) => {
    // Version 0 → 1: no real migration yet — reset to defaults so the user
    // is not stranded with an unreadable blob.
    if (version < GAME_STORAGE_VERSION) {
      return {
        numPlayers: 0,
        alt: false,
        gameLayout: [0, 0, 0, 0] as GameLayout,
        players: {},
      } satisfies PersistedGameState;
    }
    return persisted as PersistedGameState;
  },
};
