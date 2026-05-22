import React from 'react';
import {render, act} from '@testing-library/react-native';
import {Lifetotal} from '../components/Lifetotal';
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

describe('Lifetotal', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders the current lTotal for the given playerId', () => {
    const {getByTestId} = render(<Lifetotal playerId={0} />);
    expect(getByTestId('lifetotal-0').props.children).toBe(40);
  });

  it('reflects life mutations from the store', () => {
    const {getByTestId} = render(<Lifetotal playerId={0} />);
    act(() => {
      useGameStore.getState().incrementLife({playerId: 0, value: -7});
    });
    expect(getByTestId('lifetotal-0').props.children).toBe(33);
  });

  it('renders the signed delta string while delta is non-zero', () => {
    const {getByTestId, queryByTestId} = render(<Lifetotal playerId={0} />);
    expect(queryByTestId('lifetotal-0-delta')).toBeNull();
    act(() => {
      useGameStore.getState().incrementLife({playerId: 0, value: 3});
    });
    expect(getByTestId('lifetotal-0-delta').props.children).toBe('+3');
  });

  it('hides the delta when delta is back to 0', () => {
    jest.useFakeTimers();
    try {
      const {getByTestId, queryByTestId} = render(<Lifetotal playerId={0} />);
      act(() => {
        useGameStore.getState().incrementLife({playerId: 0, value: 3});
      });
      expect(getByTestId('lifetotal-0-delta')).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(2500);
      });
      expect(queryByTestId('lifetotal-0-delta')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});
