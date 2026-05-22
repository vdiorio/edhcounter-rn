import React from 'react';
import {Text} from 'react-native';
import {render, act} from '@testing-library/react-native';
import {LayoutGenerator} from '../components/LayoutGenerator';
import {useGameStore} from '@/store/gameStore';
import type {Direction} from '../types';

function resetTo(playerCount: number, alt = false) {
  act(() => {
    useGameStore.setState({
      players: {},
      numPlayers: 0,
      alt: false,
      gameLayout: [0, 0, 0, 0],
      startingPlayerId: null,
    });
    useGameStore.getState().setNumPlayers({playerCount, alt});
  });
}

describe('LayoutGenerator', () => {
  it('invokes renderPiece once per slot derived from gameLayout', () => {
    resetTo(4); // [0,2,2,0]
    const renderPiece = jest.fn(
      ({playerId, direction}: {playerId: number; direction: Direction}) => (
        <Text testID={`piece-${playerId}`}>
          {playerId}-{direction}
        </Text>
      ),
    );
    render(<LayoutGenerator renderPiece={renderPiece} />);
    expect(renderPiece).toHaveBeenCalledTimes(4);
    const calls = renderPiece.mock.calls.map(c => c[0]);
    const ids = calls.map(c => c.playerId).sort();
    expect(ids).toEqual([0, 1, 2, 3]);
  });

  it('passes the geometry direction through to renderPiece', () => {
    resetTo(4, true); // [1,1,1,1]
    const renderPiece = jest.fn(
      ({playerId}: {playerId: number}) => <Text testID={`piece-${playerId}`}>x</Text>,
    );
    render(<LayoutGenerator renderPiece={renderPiece} />);
    const directions = renderPiece.mock.calls
      .map(c => (c[0] as unknown as {direction: Direction}).direction)
      .sort((a, b) => a - b);
    expect(directions).toEqual([-90, 0, 90, 180]);
  });

  it('renders nothing when numPlayers is 0', () => {
    act(() => {
      useGameStore.setState({
        players: {},
        numPlayers: 0,
        alt: false,
        gameLayout: [0, 0, 0, 0],
        startingPlayerId: null,
      });
    });
    const renderPiece = jest.fn(() => <Text>x</Text>);
    render(<LayoutGenerator renderPiece={renderPiece} />);
    expect(renderPiece).not.toHaveBeenCalled();
  });
});
