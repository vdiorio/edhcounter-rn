import React from 'react';
import {render, act} from '@testing-library/react-native';
import {HistorySideBar} from '../components/HistorySideBar';
import {useGameStore} from '@/store/gameStore';
import {initI18n} from '@/features/i18n';

beforeAll(async () => {
  await initI18n();
});

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

describe('HistorySideBar', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders the starting life total as the baseline marker', () => {
    const {getByTestId} = render(<HistorySideBar playerId={0} />);
    expect(getByTestId('history-baseline').props.children).toBe(40);
  });

  it('renders one entry per history record with running totals', () => {
    act(() => {
      useGameStore.setState(prev => ({
        players: {
          ...prev.players,
          0: {...prev.players[0]!, history: [-3, 2, -5]},
        },
      }));
    });
    const {getByTestId} = render(<HistorySideBar playerId={0} />);
    expect(getByTestId('history-entry-0').props.children).toContain('-3');
    expect(getByTestId('history-entry-1').props.children).toContain('+2');
    expect(getByTestId('history-entry-2').props.children).toContain('-5');
    expect(getByTestId('history-total-0').props.children).toBe(37);
    expect(getByTestId('history-total-1').props.children).toBe(39);
    expect(getByTestId('history-total-2').props.children).toBe(34);
  });

  it('renders empty (only baseline) when history is empty', () => {
    const {queryByTestId, getByTestId} = render(<HistorySideBar playerId={0} />);
    expect(getByTestId('history-baseline')).toBeTruthy();
    expect(queryByTestId('history-entry-0')).toBeNull();
  });
});
