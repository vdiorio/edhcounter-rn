import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {StatusBottomBar} from '../components/StatusBottomBar';
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

describe('StatusBottomBar', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders no buttons while both bars are hidden', () => {
    const {queryByTestId} = render(<StatusBottomBar playerId={0} />);

    expect(queryByTestId('status-bottom-0-monarch')).toBeNull();
    expect(queryByTestId('status-bottom-0-initiative')).toBeNull();
  });

  it('renders both buttons when bars are shown and applies holder colors', () => {
    act(() => {
      useGameStore.getState().toggleMonarchBar(0);
      useGameStore.getState().toggleInitiativeBar(0);
    });

    const {getByTestId} = render(<StatusBottomBar playerId={0} />);

    expect(getByTestId('status-bottom-0-monarch')).toBeTruthy();
    expect(getByTestId('status-bottom-0-initiative')).toBeTruthy();
    expect(getByTestId('status-bottom-0-monarch').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({backgroundColor: '#d4af37'})]),
    );
    expect(getByTestId('status-bottom-0-initiative').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({backgroundColor: '#7e57c2'})]),
    );
  });

  it('tapping crown on current monarch clears holder via toggle', () => {
    act(() => {
      useGameStore.getState().toggleMonarchBar(0);
    });
    const {getByTestId} = render(<StatusBottomBar playerId={0} />);

    fireEvent.press(getByTestId('status-bottom-0-monarch'));

    expect(useGameStore.getState().monarchPlayerId).toBeNull();
    expect(useGameStore.getState().showMonarchBar).toBe(false);
  });
});