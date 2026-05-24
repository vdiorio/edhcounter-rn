import {renderHook, act} from '@testing-library/react-native';
import {useProliferate} from '../hooks/useProliferate';
import {useGameStore} from '@/store/gameStore';
import {LONG_PRESS_DELAY} from '@/shared/constants/ui';
import {PROLIFERATE_UNDO_INTERVAL} from '@/store/constants/game';
import {clearProliferateUndoStack} from '../action';

function resetStore() {
  act(() => {
    useGameStore.setState({
      players: {},
      numPlayers: 0,
      alt: false,
      gameLayout: [0, 0, 0, 0],
      startingPlayerId: null,
      proliferateUndoCountByPlayer: {},
    });
    useGameStore.getState().setNumPlayers({playerCount: 4});
  });
}

describe('useProliferate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    clearProliferateUndoStack();
    resetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('tap proliferates once', () => {
    act(() => {
      useGameStore.getState().incrementEnergy({playerId: 0, value: 1});
    });
    const {result} = renderHook(() => useProliferate(0));

    act(() => {
      result.current.onTap();
    });

    expect(useGameStore.getState().players[0]!.energy).toBe(2);
  });

  it('long press triggers periodic undo ticks', () => {
    act(() => {
      useGameStore.getState().incrementEnergy({playerId: 0, value: 1});
      useGameStore.getState().proliferate(0);
      useGameStore.getState().proliferate(0);
    });

    const {result} = renderHook(() => useProliferate(0));

    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(LONG_PRESS_DELAY + PROLIFERATE_UNDO_INTERVAL * 2 + 10);
      result.current.onPressOut();
    });

    expect(useGameStore.getState().players[0]!.energy).toBe(1);
  });

  it('release stops undo interval', () => {
    act(() => {
      useGameStore.getState().incrementEnergy({playerId: 0, value: 1});
      useGameStore.getState().proliferate(0);
      useGameStore.getState().proliferate(0);
      useGameStore.getState().proliferate(0);
    });
    const {result} = renderHook(() => useProliferate(0));

    act(() => {
      result.current.onPressIn();
      jest.advanceTimersByTime(LONG_PRESS_DELAY + PROLIFERATE_UNDO_INTERVAL + 10);
      result.current.onPressOut();
    });
    const energyAtRelease = useGameStore.getState().players[0]!.energy;

    act(() => {
      jest.advanceTimersByTime(PROLIFERATE_UNDO_INTERVAL * 3);
    });

    expect(useGameStore.getState().players[0]!.energy).toBe(energyAtRelease);
  });
});