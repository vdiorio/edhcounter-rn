import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {ProliferateButton} from '../components/ProliferateButton';
import {useGameStore} from '@/store/gameStore';
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

describe('ProliferateButton', () => {
  beforeEach(() => {
    clearProliferateUndoStack();
    resetStore();
  });

  it('renders icon and proliferates on tap', () => {
    act(() => {
      useGameStore.getState().incrementEnergy({playerId: 0, value: 1});
    });

    const {getByTestId} = render(<ProliferateButton playerId={0} />);
    expect(getByTestId('proliferate-0-icon')).toBeTruthy();

    fireEvent.press(getByTestId('proliferate-0'));

    expect(useGameStore.getState().players[0]!.energy).toBe(2);
  });

  it('shows undo badge when undoCount is above zero', () => {
    act(() => {
      useGameStore.getState().incrementEnergy({playerId: 0, value: 1});
      useGameStore.getState().proliferate(0);
    });

    const {getByTestId} = render(<ProliferateButton playerId={0} />);

    expect(getByTestId('proliferate-0-badge')).toBeTruthy();
    expect(getByTestId('proliferate-0-badge-value').props.children).toBe(1);
  });

  it('is disabled when there is nothing to proliferate and no undo available', () => {
    const {getByTestId} = render(<ProliferateButton playerId={0} />);

    expect(getByTestId('proliferate-0').props.accessibilityState?.disabled).toBe(true);
  });
});