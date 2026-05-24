import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {CountersSideBar} from '../components/CountersSideBar';
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

describe('CountersSideBar', () => {
  beforeEach(() => {
    resetStore();
  });

  it('plus and minus buttons mutate the correct counters', () => {
    const {getByTestId} = render(<CountersSideBar playerId={0} />);

    fireEvent.press(getByTestId('counters-sidebar-0-poison-plus'));
    fireEvent.press(getByTestId('counters-sidebar-0-energy-plus'));
    fireEvent.press(getByTestId('counters-sidebar-0-experience-plus'));
    fireEvent.press(getByTestId('counters-sidebar-0-energy-minus'));

    expect(useGameStore.getState().players[0]!.poison).toBe(1);
    expect(useGameStore.getState().players[0]!.energy).toBe(0);
    expect(useGameStore.getState().players[0]!.experience).toBe(1);
  });

  it('renders a proliferate slot row', () => {
    const {getByTestId} = render(<CountersSideBar playerId={0} />);

    expect(getByTestId('counters-sidebar-0-proliferate-slot')).toBeTruthy();
  });
});