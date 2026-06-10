import React from 'react';
import {StyleSheet} from 'react-native';
import {render, act, cleanup} from '@testing-library/react-native';
import {PlayerBox} from '../PlayerBox';
import {useGameStore} from '@/store/gameStore';
import {resetAllSidebars} from '@/features/sidebar-shell';

// NOTE: zustand's useSyncExternalStore updates do not flush to a mounted tree
// under react-test-renderer, so starting-player state is set BEFORE render.
// Live reactivity is exercised on-device, not here.
describe('PlayerBox', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetAllSidebars();
    useGameStore.getState().resetGame();
    useGameStore.getState().setNumPlayers({playerCount: 4});
  });
  afterEach(() => {
    cleanup();
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it('mounts the per-player pieces', () => {
    const {getByTestId} = render(<PlayerBox playerId={0} />);
    expect(getByTestId('player-box-0')).toBeTruthy();
    expect(getByTestId('lifetotal-0')).toBeTruthy();
    expect(getByTestId('counters-topbar-0')).toBeTruthy();
    expect(getByTestId('utils-sidebar-0')).toBeTruthy();
    expect(getByTestId('damage-all-0')).toBeTruthy();
  });

  it('borders with the player color when not the starting player', () => {
    const {getByTestId} = render(<PlayerBox playerId={0} />);
    expect(
      StyleSheet.flatten(getByTestId('player-box-0').props.style).borderColor,
    ).not.toBe('#ffffff');
  });

  it('borders white when it is the starting player', () => {
    useGameStore.setState({startingPlayerId: 0});
    const {getByTestId} = render(<PlayerBox playerId={0} />);
    expect(
      StyleSheet.flatten(getByTestId('player-box-0').props.style).borderColor,
    ).toBe('#ffffff');
  });

  it('mounts confetti 230ms after mounting as the starting player', () => {
    useGameStore.setState({startingPlayerId: 0});
    const {queryByTestId, getByTestId} = render(<PlayerBox playerId={0} />);

    expect(queryByTestId('confetti-particle-0')).toBeNull();
    act(() => jest.advanceTimersByTime(229));
    expect(queryByTestId('confetti-particle-0')).toBeNull();

    act(() => jest.advanceTimersByTime(1));
    expect(getByTestId('confetti-particle-0')).toBeTruthy();
  });

  it('never shows confetti for a non-starting player', () => {
    useGameStore.setState({startingPlayerId: 0});
    const {queryByTestId} = render(<PlayerBox playerId={1} />);

    act(() => jest.advanceTimersByTime(500));
    expect(queryByTestId('confetti-particle-0')).toBeNull();
  });

  it('exposes debugId as accessibilityLabel', () => {
    const {getByTestId} = render(<PlayerBox playerId={0} debugId="p0" />);
    expect(getByTestId('player-box-0').props.accessibilityLabel).toBe('p0');
  });
});
