import React from 'react';
import {act, fireEvent, render} from '@testing-library/react-native';
import {StartingPlayerButton} from '../components/StartingPlayerButton';
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

describe('StartingPlayerButton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    resetStore();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('triggers starting-player flow on tap and disables during animation', () => {
    const {getByTestId} = render(<StartingPlayerButton />);

    fireEvent.press(getByTestId('starting-player-button'));

    expect(getByTestId('starting-player-button').props.accessibilityState?.disabled).toBe(true);

    act(() => {
      jest.advanceTimersByTime(DELAYS.reduce((sum, d) => sum + d, 0));
    });

    const finalId = useGameStore.getState().startingPlayerId;
    expect(finalId).not.toBeNull();
    expect(finalId!).toBeGreaterThanOrEqual(0);
    expect(finalId!).toBeLessThan(4);
  });
});