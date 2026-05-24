import React from 'react';
import {render, act} from '@testing-library/react-native';
import {CountersTopBar} from '../components/CountersTopBar';
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
    useGameStore.getState().setNumPlayers({playerCount: 4});
  });
}

describe('CountersTopBar', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders indicators only for counters above zero', () => {
    act(() => {
      useGameStore.getState().incrementPoison({playerId: 0, value: 12});
      useGameStore.getState().incrementEnergy({playerId: 0, value: 2});
    });

    const {getByTestId, queryByTestId} = render(<CountersTopBar playerId={0} />);

    expect(getByTestId('counters-topbar-0-poison-value').props.children).toBe(10);
    expect(getByTestId('counters-topbar-0-energy-value').props.children).toBe(2);
    expect(queryByTestId('counters-topbar-0-experience')).toBeNull();
    expect(queryByTestId('counters-topbar-0-placeholder')).toBeNull();
  });

  it('renders a placeholder when all counters are zero', () => {
    const {getByTestId, queryByTestId} = render(<CountersTopBar playerId={0} />);

    expect(getByTestId('counters-topbar-0-placeholder')).toBeTruthy();
    expect(queryByTestId('counters-topbar-0-poison')).toBeNull();
    expect(queryByTestId('counters-topbar-0-energy')).toBeNull();
    expect(queryByTestId('counters-topbar-0-experience')).toBeNull();
  });
});