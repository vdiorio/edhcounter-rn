import {partializeGameState, type PersistedGameState} from '../middleware';
import {useGameStore, type GameStore} from '@/store/gameStore';

function makeFullState(): GameStore {
  return {
    ...useGameStore.getState(),
    players: {
      0: {
        id: 0,
        lTotal: 37,
        delta: -3,
        history: [-3],
        Cdmg: {1: [0, 0]},
        chain: false,
        poison: 1,
        energy: 0,
        experience: 0,
      },
      1: {
        id: 1,
        lTotal: 40,
        delta: 0,
        history: [],
        Cdmg: {0: [0, 0]},
        chain: false,
        poison: 0,
        energy: 0,
        experience: 0,
      },
    },
    numPlayers: 2,
    alt: false,
    gameLayout: [1, 0, 0, 1],
    startingPlayerId: 0,
  };
}

describe('partializeGameState', () => {
  it('keeps numPlayers, alt, gameLayout', () => {
    const out = partializeGameState(makeFullState());
    expect(out.numPlayers).toBe(2);
    expect(out.alt).toBe(false);
    expect(out.gameLayout).toEqual([1, 0, 0, 1]);
  });

  it('omits startingPlayerId', () => {
    const out = partializeGameState(makeFullState()) as Partial<PersistedGameState> &
      Record<string, unknown>;
    expect('startingPlayerId' in out).toBe(false);
  });

  it('omits action fields (setNumPlayers, resetGame, _scheduleDeltaReset)', () => {
    const out = partializeGameState(makeFullState()) as Record<string, unknown>;
    expect('setNumPlayers' in out).toBe(false);
    expect('resetGame' in out).toBe(false);
    expect('_scheduleDeltaReset' in out).toBe(false);
  });

  it('preserves player lTotal, history, Cdmg, chain, poison, energy, experience', () => {
    const out = partializeGameState(makeFullState());
    expect(out.players[0]).toMatchObject({
      id: 0,
      lTotal: 37,
      history: [-3],
      Cdmg: {1: [0, 0]},
      chain: false,
      poison: 1,
      energy: 0,
      experience: 0,
    });
  });

  it('strips delta from each player record', () => {
    const out = partializeGameState(makeFullState());
    expect('delta' in out.players[0]!).toBe(false);
  });
});
