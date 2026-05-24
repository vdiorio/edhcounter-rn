import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {CdmgSideBar} from '../components/CdmgSideBar';
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

describe('CdmgSideBar', () => {
  beforeEach(() => {
    resetStore();
  });

  it('toggling chain flips the target player chain flag', () => {
    const {getByTestId} = render(<CdmgSideBar playerId={0} />);

    fireEvent(getByTestId('cdmg-sidebar-0-chain'), 'valueChange', true);

    expect(useGameStore.getState().players[0]!.chain).toBe(true);
  });

  it('toggling partner shows the second incrementer for an attacker row', () => {
    const {getByTestId, queryByTestId} = render(<CdmgSideBar playerId={0} />);

    expect(queryByTestId('cdmg-0-1-partner-plus')).toBeNull();

    fireEvent(getByTestId('cdmg-sidebar-0-partner-1'), 'valueChange', true);

    expect(getByTestId('cdmg-0-1-partner-plus')).toBeTruthy();
  });
});