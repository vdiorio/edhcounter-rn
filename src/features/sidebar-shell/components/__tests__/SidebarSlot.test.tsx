import React from 'react';
import {render} from '@testing-library/react-native';
import {SidebarSlot} from '../SidebarSlot';
import {useGameStore} from '@/store/gameStore';

describe('SidebarSlot', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    useGameStore.getState().setNumPlayers({playerCount: 4});
  });

  it('renders nothing when no bar is selected', () => {
    const {queryByTestId} = render(<SidebarSlot playerId={0} selectedBar={null} />);
    expect(queryByTestId('sidebar-slot-0')).toBeNull();
  });

  it('renders the cdmg sidebar for the cdmg key', () => {
    const {getByTestId} = render(<SidebarSlot playerId={0} selectedBar="cdmg" />);
    expect(getByTestId('sidebar-slot-0')).toBeTruthy();
    expect(getByTestId('cdmg-sidebar-0')).toBeTruthy();
  });

  it('renders the history sidebar for the history key', () => {
    const {getByTestId} = render(<SidebarSlot playerId={0} selectedBar="history" />);
    expect(getByTestId('history-baseline')).toBeTruthy();
  });

  it('renders the counters sidebar for the counters key', () => {
    const {getByTestId} = render(<SidebarSlot playerId={0} selectedBar="counters" />);
    expect(getByTestId('counters-sidebar-0')).toBeTruthy();
  });

  it('renders nothing for an unknown key', () => {
    const {queryByTestId} = render(<SidebarSlot playerId={0} selectedBar="does-not-exist" />);
    expect(queryByTestId('sidebar-slot-0')).toBeNull();
  });
});
