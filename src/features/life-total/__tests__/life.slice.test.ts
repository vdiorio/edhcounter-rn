import {useGameStore} from '@/store/gameStore';
import {STARTING_LIFE_TOTAL, TIME_TO_RESET_DELTA} from '@/store/constants/game';

function resetStore() {
  useGameStore.setState({
    players: {},
    numPlayers: 0,
    alt: false,
    gameLayout: [0, 0, 0, 0],
    startingPlayerId: null,
  });
}

describe('LifeSlice', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetStore();
    useGameStore.getState().setNumPlayers({playerCount: 4});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('incrementLife(+1) updates lTotal and delta on the target player', () => {
    useGameStore.getState().incrementLife({playerId: 0, value: 1});
    expect(useGameStore.getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL + 1);
    expect(useGameStore.getState().players[0]!.delta).toBe(1);
  });

  it('two consecutive incrementLife calls accumulate delta', () => {
    useGameStore.getState().incrementLife({playerId: 0, value: 2});
    useGameStore.getState().incrementLife({playerId: 0, value: 3});
    expect(useGameStore.getState().players[0]!.delta).toBe(5);
    expect(useGameStore.getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL + 5);
  });

  it('delta resets to 0 and lands on history after TIME_TO_RESET_DELTA ms', () => {
    useGameStore.getState().incrementLife({playerId: 0, value: -3});
    expect(useGameStore.getState().players[0]!.delta).toBe(-3);

    jest.advanceTimersByTime(TIME_TO_RESET_DELTA);

    expect(useGameStore.getState().players[0]!.delta).toBe(0);
    expect(useGameStore.getState().players[0]!.history).toEqual([-3]);
  });

  it('a second increment within the timer window debounces the reset', () => {
    useGameStore.getState().incrementLife({playerId: 0, value: 2});
    jest.advanceTimersByTime(TIME_TO_RESET_DELTA - 100);
    useGameStore.getState().incrementLife({playerId: 0, value: 3});

    // Still below the new reset deadline — delta should remain accumulated.
    jest.advanceTimersByTime(TIME_TO_RESET_DELTA - 100);
    expect(useGameStore.getState().players[0]!.delta).toBe(5);
    expect(useGameStore.getState().players[0]!.history).toEqual([]);

    // Cross the second deadline — single history entry of 5 lands.
    jest.advanceTimersByTime(200);
    expect(useGameStore.getState().players[0]!.delta).toBe(0);
    expect(useGameStore.getState().players[0]!.history).toEqual([5]);
  });

  it('setLife replaces lTotal and overwrites delta with newLife - prevLTotal', () => {
    useGameStore.getState().incrementLife({playerId: 0, value: 5}); // lTotal 45, delta 5
    useGameStore.getState().setLife({playerId: 0, newLife: 30});

    expect(useGameStore.getState().players[0]!.lTotal).toBe(30);
    expect(useGameStore.getState().players[0]!.delta).toBe(-15);
  });

  it('resetGame cancels in-flight delta-reset timers', () => {
    useGameStore.getState().incrementLife({playerId: 0, value: -3});
    expect(jest.getTimerCount()).toBeGreaterThan(0);

    useGameStore.getState().resetGame();
    expect(jest.getTimerCount()).toBe(0);
    expect(useGameStore.getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL);
    expect(useGameStore.getState().players[0]!.history).toEqual([]);
  });

  it('negative life is allowed without clamping', () => {
    useGameStore.getState().incrementLife({playerId: 0, value: -100});
    expect(useGameStore.getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL - 100);
  });

  it('history is appended only when delta crosses to zero, not on every change', () => {
    useGameStore.getState().incrementLife({playerId: 0, value: 1});
    useGameStore.getState().incrementLife({playerId: 0, value: 1});
    useGameStore.getState().incrementLife({playerId: 0, value: 1});
    expect(useGameStore.getState().players[0]!.history).toEqual([]);

    jest.advanceTimersByTime(TIME_TO_RESET_DELTA);
    expect(useGameStore.getState().players[0]!.history).toEqual([3]);
  });

  it('incrementLife on an unknown playerId is a no-op', () => {
    useGameStore.getState().incrementLife({playerId: 99, value: 1});
    expect(useGameStore.getState().players[99]).toBeUndefined();
  });
});
