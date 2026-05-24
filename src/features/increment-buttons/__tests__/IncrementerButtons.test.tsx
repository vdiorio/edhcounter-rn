import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {IncrementerButtons} from '../components/IncrementerButtons';
import {useGameStore} from '@/store/gameStore';

function resetStore() {
  act(() => {
    useGameStore.setState({
      players: {},
      numPlayers: 0,
      alt: false,
      gameLayout: [0, 0, 0, 0],
      startingPlayerId: null,
    });
    useGameStore.getState().setNumPlayers({playerCount: 2});
  });
}

describe('IncrementerButtons', () => {
  beforeEach(() => {
    resetStore();
  });

  it('tap +1 increments lTotal by 1', () => {
    const {getByTestId} = render(<IncrementerButtons playerId={0} />);
    act(() => {
      fireEvent.press(getByTestId('incrementer-0-plus'));
    });
    expect(useGameStore.getState().players[0]!.lTotal).toBe(41);
  });

  it('tap -1 decrements lTotal by 1', () => {
    const {getByTestId} = render(<IncrementerButtons playerId={0} />);
    act(() => {
      fireEvent.press(getByTestId('incrementer-0-minus'));
    });
    expect(useGameStore.getState().players[0]!.lTotal).toBe(39);
  });

  it('hold +1 fires repeatedly only after the long-press delay', () => {
    jest.useFakeTimers();
    try {
      const {getByTestId} = render(<IncrementerButtons playerId={0} />);
      act(() => {
        fireEvent(getByTestId('incrementer-0-plus'), 'pressIn');
      });
      // Press-in fires one tick. Inside the 350ms long-press window — no more.
      expect(useGameStore.getState().players[0]!.lTotal).toBe(41);

      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(useGameStore.getState().players[0]!.lTotal).toBe(41);

      act(() => {
        // Crosses 350ms threshold + 200ms of interval ticks at 100ms each.
        jest.advanceTimersByTime(250);
      });
      act(() => {
        fireEvent(getByTestId('incrementer-0-plus'), 'pressOut');
      });
      const lTotal = useGameStore.getState().players[0]!.lTotal;
      // 1 (press-in) + 1 (at 350) + 1 (at 450) + 1 (at 550) = 4 → 44
      expect(lTotal).toBeGreaterThanOrEqual(43);
      expect(lTotal).toBeLessThanOrEqual(44);
    } finally {
      jest.useRealTimers();
    }
  });
});
