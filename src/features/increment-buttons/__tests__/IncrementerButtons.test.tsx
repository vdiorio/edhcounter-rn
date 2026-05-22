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

  it('hold +1 fires repeatedly at the hold interval', () => {
    jest.useFakeTimers();
    try {
      const {getByTestId} = render(<IncrementerButtons playerId={0} />);
      act(() => {
        fireEvent(getByTestId('incrementer-0-plus'), 'pressIn');
      });
      act(() => {
        // 550 ms hold: 1 immediate + 5 ticks @ 100ms each
        jest.advanceTimersByTime(550);
      });
      act(() => {
        fireEvent(getByTestId('incrementer-0-plus'), 'pressOut');
      });
      const lTotal = useGameStore.getState().players[0]!.lTotal;
      expect(lTotal).toBeGreaterThanOrEqual(45);
      expect(lTotal).toBeLessThanOrEqual(47);
    } finally {
      jest.useRealTimers();
    }
  });
});
