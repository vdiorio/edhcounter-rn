import {act, renderHook} from '@testing-library/react-native';
import {useStartingPlayer} from '../hooks/useStartingPlayer';
import {useGameStore} from '@/store/gameStore';

const DELAYS = [80, 80, 80, 80, 80, 80, 80, 100, 120, 150, 180, 220, 260];

function resetStore() {
  act(() => {
    useGameStore.setState({
      players: {},
      numPlayers: 0,
      alt: false,
      gameLayout: [0, 0, 0, 0],
      startingPlayerId: null,
    });
    useGameStore.getState().setNumPlayers({playerCount: 4});
  });
}

describe('useStartingPlayer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    resetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('pickStartingPlayer animates and lands on a valid player id', () => {
    const {result} = renderHook(() => useStartingPlayer());

    act(() => {
      result.current.pickStartingPlayer();
    });

    expect(result.current.isAnimating).toBe(true);

    act(() => {
      jest.advanceTimersByTime(DELAYS.reduce((sum, d) => sum + d, 0));
    });

    const finalId = useGameStore.getState().startingPlayerId;
    expect(finalId).not.toBeNull();
    expect(finalId!).toBeGreaterThanOrEqual(0);
    expect(finalId!).toBeLessThan(useGameStore.getState().numPlayers);
    expect(result.current.isAnimating).toBe(false);
  });

  it('second call while animating is a no-op', () => {
    const {result} = renderHook(() => useStartingPlayer());

    act(() => {
      result.current.pickStartingPlayer();
    });
    const timerCount = jest.getTimerCount();

    act(() => {
      result.current.pickStartingPlayer();
    });

    expect(jest.getTimerCount()).toBe(timerCount);
  });
});