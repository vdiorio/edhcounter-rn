import type {StateCreator} from 'zustand';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  STARTING_LIFE_TOTAL,
  TIME_TO_RESET_DELTA,
} from './constants/game';
import {getPlayerLayout, type GameLayout} from './constants/playerLayouts';

/**
 * Commander damage taken from one attacker, as `[commander, partnerCommander]`.
 * The two slots track a commander and its optional partner separately so the
 * 21-damage lethal rule (Spec 09) can be evaluated per-commander.
 */
export type CommanderDamageEntry = [number, number];

export type Player = {
  id: number;
  lTotal: number;
  delta: number;
  history: number[];
  Cdmg: Record<number, CommanderDamageEntry>;
  chain: boolean;
  poison: number;
  energy: number;
  experience: number;
};

export type CoreSliceState = {
  players: Record<number, Player>;
  numPlayers: number;
  alt: boolean;
  gameLayout: GameLayout;
  startingPlayerId: number | null;
  setNumPlayers: (input: {playerCount: number; alt?: boolean}) => void;
  resetGame: () => void;
  /**
   * Schedules a delta reset for the given player; visible on the slice so
   * features that mutate life (Spec 07) and the cross-slice damageAll action
   * (Spec 13) can share a single timer registry.
   */
  _scheduleDeltaReset: (playerId: number, durationMs?: number) => void;
};

export type CoreSlice = CoreSliceState;

function buildPlayer(id: number): Player {
  return {
    id,
    lTotal: STARTING_LIFE_TOTAL,
    delta: 0,
    history: [],
    Cdmg: {},
    chain: false,
    poison: 0,
    energy: 0,
    experience: 0,
  };
}

function buildPlayers(numPlayers: number): Record<number, Player> {
  const out: Record<number, Player> = {};
  for (let i = 0; i < numPlayers; i++) {
    out[i] = buildPlayer(i);
  }
  return out;
}

function isValidPlayerCount(n: number): boolean {
  return Number.isInteger(n) && n >= MIN_PLAYERS && n <= MAX_PLAYERS;
}

export const createCoreSlice: StateCreator<
  CoreSliceState,
  [],
  [],
  CoreSliceState
> = (set, get) => {
  // Timers live outside the store — they must not be serialized by persist.
  const timers = new Map<number, ReturnType<typeof setTimeout>>();

  const clearAllTimers = (): void => {
    for (const [id, t] of timers) {
      clearTimeout(t);
      timers.delete(id);
    }
  };

  const scheduleDeltaReset = (
    playerId: number,
    durationMs: number = TIME_TO_RESET_DELTA,
  ): void => {
    const existing = timers.get(playerId);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      timers.delete(playerId);
      const player = get().players[playerId];
      if (!player || player.delta === 0) return;
      set(state => ({
        players: {
          ...state.players,
          [playerId]: {
            ...player,
            history: [...player.history, player.delta],
            delta: 0,
          },
        },
      }));
    }, durationMs);
    timers.set(playerId, t);
  };

  return {
    players: {},
    numPlayers: 0,
    alt: false,
    gameLayout: [0, 0, 0, 0] as GameLayout,
    startingPlayerId: null,

    setNumPlayers: ({playerCount, alt = false}) => {
      if (!isValidPlayerCount(playerCount)) return;
      clearAllTimers();
      const gameLayout = getPlayerLayout(playerCount, alt);
      set({
        numPlayers: playerCount,
        alt,
        gameLayout,
        players: buildPlayers(playerCount),
        startingPlayerId: null,
      });
    },

    resetGame: () => {
      clearAllTimers();
      const {numPlayers, alt} = get();
      if (!isValidPlayerCount(numPlayers)) {
        set({
          players: {},
          startingPlayerId: null,
        });
        return;
      }
      set({
        gameLayout: getPlayerLayout(numPlayers, alt),
        players: buildPlayers(numPlayers),
        startingPlayerId: null,
      });
    },

    _scheduleDeltaReset: scheduleDeltaReset,
  };
};
