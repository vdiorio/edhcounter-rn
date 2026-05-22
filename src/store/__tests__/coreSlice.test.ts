import {createCoreSlice, type CoreSliceState} from '../coreSlice';
import {PLAYER_LAYOUTS} from '../constants/playerLayouts';
import {STARTING_LIFE_TOTAL} from '../constants/game';

type Store = CoreSliceState;

/**
 * Build a tiny in-memory Zustand-shaped harness so the slice can be exercised
 * without bringing React or the persist middleware into the picture.
 */
function makeHarness() {
  let state: Store;
  const setState: (
    partial:
      | Partial<Store>
      | ((s: Store) => Partial<Store> | Store),
  ) => void = partial => {
    const next =
      typeof partial === 'function'
        ? (partial as (s: Store) => Partial<Store>)(state)
        : partial;
    state = {...state, ...next};
  };
  const getState = () => state;
  state = createCoreSlice(setState as never, getState as never, {} as never);
  return {
    getState,
    setState,
  };
}

describe('createCoreSlice', () => {
  it('initial state has 0 numPlayers and no players', () => {
    const {getState} = makeHarness();
    expect(getState().numPlayers).toBe(0);
    expect(getState().players).toEqual({});
    expect(getState().startingPlayerId).toBeNull();
  });

  it('setNumPlayers(4) populates players with ids 0..3', () => {
    const {getState} = makeHarness();
    getState().setNumPlayers({playerCount: 4});
    const ids = Object.keys(getState().players).map(Number).sort((a, b) => a - b);
    expect(ids).toEqual([0, 1, 2, 3]);
  });

  it('each new player has the documented default shape', () => {
    const {getState} = makeHarness();
    getState().setNumPlayers({playerCount: 3});
    for (const id of [0, 1, 2]) {
      const p = getState().players[id]!;
      expect(p).toEqual({
        id,
        lTotal: STARTING_LIFE_TOTAL,
        delta: 0,
        history: [],
        Cdmg: {},
        chain: false,
        poison: 0,
        energy: 0,
        experience: 0,
      });
    }
  });

  it('setNumPlayers picks the default layout when alt is omitted/false', () => {
    const {getState} = makeHarness();
    getState().setNumPlayers({playerCount: 4});
    expect(getState().gameLayout).toEqual(PLAYER_LAYOUTS[4]![0]);
  });

  it('setNumPlayers picks the alt layout when alt is true', () => {
    const {getState} = makeHarness();
    getState().setNumPlayers({playerCount: 4, alt: true});
    expect(getState().gameLayout).toEqual(PLAYER_LAYOUTS[4]![1]);
  });

  it('setNumPlayers clears startingPlayerId', () => {
    const {getState, setState} = makeHarness();
    getState().setNumPlayers({playerCount: 4});
    setState({startingPlayerId: 2});
    getState().setNumPlayers({playerCount: 3});
    expect(getState().startingPlayerId).toBeNull();
  });

  it('setNumPlayers is a no-op when playerCount is outside [2,6]', () => {
    const {getState} = makeHarness();
    getState().setNumPlayers({playerCount: 4});
    const beforePlayers = getState().players;
    const beforeLayout = getState().gameLayout;
    getState().setNumPlayers({playerCount: 1});
    expect(getState().players).toBe(beforePlayers);
    expect(getState().gameLayout).toBe(beforeLayout);
    getState().setNumPlayers({playerCount: 7});
    expect(getState().players).toBe(beforePlayers);
    expect(getState().gameLayout).toBe(beforeLayout);
  });

  it('resetGame re-applies current numPlayers and alt with full default state', () => {
    const {getState, setState} = makeHarness();
    getState().setNumPlayers({playerCount: 4, alt: true});
    // Mutate one player's life so we can confirm the reset.
    setState(prev => ({
      players: {
        ...prev.players,
        0: {...prev.players[0]!, lTotal: 12, history: [-3]},
      },
    }));
    expect(getState().players[0]!.lTotal).toBe(12);

    getState().resetGame();

    expect(getState().numPlayers).toBe(4);
    expect(getState().gameLayout).toEqual(PLAYER_LAYOUTS[4]![1]);
    expect(getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL);
    expect(getState().players[0]!.history).toEqual([]);
  });

  it('resetGame on an uninitialized store leaves players empty', () => {
    const {getState} = makeHarness();
    getState().resetGame();
    expect(getState().players).toEqual({});
    expect(getState().numPlayers).toBe(0);
  });

  it('resetGame clears startingPlayerId', () => {
    const {getState, setState} = makeHarness();
    getState().setNumPlayers({playerCount: 4});
    setState({startingPlayerId: 2});
    getState().resetGame();
    expect(getState().startingPlayerId).toBeNull();
  });
});

describe('createCoreSlice — delta timer cleanup', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('resetGame cancels pending delta-reset timers', () => {
    const {getState} = makeHarness();
    getState().setNumPlayers({playerCount: 2});
    // Schedule a delta reset via the slice's internal scheduler.
    getState()._scheduleDeltaReset(0);
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    getState().resetGame();
    expect(jest.getTimerCount()).toBe(0);
  });
});
