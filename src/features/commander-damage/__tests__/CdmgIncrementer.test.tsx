import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {CdmgIncrementer} from '../components/CdmgIncrementer';
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

describe('CdmgIncrementer', () => {
  beforeEach(() => {
    resetStore();
  });

  it('tap +1 increments the value to 1', () => {
    const {getByTestId} = render(<CdmgIncrementer targetPlayerId={0} attackerId={1} />);

    fireEvent.press(getByTestId('cdmg-0-1-plus'));

    expect(useGameStore.getState().players[0]!.Cdmg[1]).toEqual([1, 0]);
  });

  it('tap +1 when value is 21 stays at 21', () => {
    act(() => {
      useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: 21});
    });
    const {getByTestId} = render(<CdmgIncrementer targetPlayerId={0} attackerId={1} />);

    fireEvent.press(getByTestId('cdmg-0-1-plus'));

    expect(useGameStore.getState().players[0]!.Cdmg[1]).toEqual([21, 0]);
  });

  it('tap -1 from 0 stays at 0', () => {
    const {getByTestId} = render(<CdmgIncrementer targetPlayerId={0} attackerId={1} />);

    fireEvent.press(getByTestId('cdmg-0-1-minus'));

    expect(useGameStore.getState().players[0]!.Cdmg[1]).toEqual([0, 0]);
  });
});