import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import {DamageAllButton} from '../components/DamageAllButton';
import {useGameStore} from '@/store/gameStore';
import {DAMAGE_ALL_INTERVAL} from '@/store/constants/game';
import {LONG_PRESS_DELAY} from '@/shared/constants/ui';
import {STARTING_LIFE_TOTAL} from '@/store/constants/game';

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

describe('DamageAllButton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetStore();
  });

  afterEach(() => {
    useGameStore.getState().resetGame();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('tap reduces all opponents life by 1 and keeps caller unchanged', () => {
    const {getByTestId} = render(<DamageAllButton playerId={0} />);

    expect(getByTestId('damage-all-0-label').props.children).toBe('-1');

    fireEvent.press(getByTestId('damage-all-0'));

    expect(useGameStore.getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL);
    expect(useGameStore.getState().players[1]!.lTotal).toBe(STARTING_LIFE_TOTAL - 1);
    expect(useGameStore.getState().players[2]!.lTotal).toBe(STARTING_LIFE_TOTAL - 1);
    expect(useGameStore.getState().players[3]!.lTotal).toBe(STARTING_LIFE_TOTAL - 1);
  });

  it('holding for 1200ms triggers at least two heal ticks on opponents', () => {
    const {getByTestId} = render(<DamageAllButton playerId={0} />);
    const button = getByTestId('damage-all-0');

    act(() => {
      fireEvent(button, 'pressIn');
      jest.advanceTimersByTime(LONG_PRESS_DELAY + DAMAGE_ALL_INTERVAL * 2 + 50);
      fireEvent(button, 'pressOut');
    });

    expect(useGameStore.getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL);
    expect(useGameStore.getState().players[1]!.lTotal).toBeGreaterThanOrEqual(STARTING_LIFE_TOTAL + 2);
    expect(useGameStore.getState().players[2]!.lTotal).toBeGreaterThanOrEqual(STARTING_LIFE_TOTAL + 2);
    expect(useGameStore.getState().players[3]!.lTotal).toBeGreaterThanOrEqual(STARTING_LIFE_TOTAL + 2);
  });

  it('animates the outline toward fast tap and hold rotations', () => {
    const withTimingSpy = jest.spyOn(Reanimated, 'withTiming');
    const withRepeatSpy = jest.spyOn(Reanimated, 'withRepeat');
    const {getByTestId} = render(<DamageAllButton playerId={0} />);
    const button = getByTestId('damage-all-0');

    act(() => {
      fireEvent(button, 'pressIn');
      jest.advanceTimersByTime(LONG_PRESS_DELAY);
    });

    expect(withTimingSpy).toHaveBeenCalledWith(360, expect.any(Object));
    expect(withTimingSpy).toHaveBeenCalledWith(360, expect.any(Object));
    expect(withRepeatSpy).toHaveBeenCalled();
    expect(getByTestId('damage-all-0-label').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({color: expect.any(String)})]),
    );
    expect(getByTestId('damage-all-0-outline')).toBeTruthy();
  });
});