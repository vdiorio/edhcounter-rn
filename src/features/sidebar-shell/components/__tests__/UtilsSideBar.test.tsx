import React from 'react';
import {render, renderHook, fireEvent, act} from '@testing-library/react-native';
import {UtilsSideBar} from '../UtilsSideBar';
import {useGameStore} from '@/store/gameStore';
import {resetAllSidebars, useSidebarState} from '../../hooks/useSidebarState';

describe('UtilsSideBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetAllSidebars();
    useGameStore.getState().resetGame();
    useGameStore.getState().setNumPlayers({playerCount: 4});
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders a button per icon sidebar plus the damage-all button', () => {
    const {getByTestId, queryByTestId} = render(<UtilsSideBar playerId={0} />);
    expect(getByTestId('sidebar-button-0-cdmg')).toBeTruthy();
    expect(getByTestId('sidebar-button-0-history')).toBeTruthy();
    // counters has no icon -> no button
    expect(queryByTestId('sidebar-button-0-counters')).toBeNull();
    expect(getByTestId('damage-all-0')).toBeTruthy();
  });

  it('toggling the shield button opens then clears the cdmg sidebar', () => {
    const observer = renderHook(() => useSidebarState(0));
    const {getByTestId} = render(<UtilsSideBar playerId={0} />);

    act(() => fireEvent.press(getByTestId('sidebar-button-0-cdmg')));
    expect(observer.result.current.selectedBar).toBe('cdmg');

    act(() => fireEvent.press(getByTestId('sidebar-button-0-cdmg')));
    expect(observer.result.current.selectedBar).toBeNull();
  });
});
