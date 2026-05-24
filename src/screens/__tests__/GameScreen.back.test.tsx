import React from 'react';
import {BackHandler} from 'react-native';
import {render, fireEvent, act} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GameScreen from '../GameScreen';
import LayoutSelectorScreen from '../LayoutSelectorScreen';
import {useGameStore} from '@/store/gameStore';
import {initI18n} from '@/features/i18n';
import type {RootStackParamList} from '@/app/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function TestApp(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LayoutSelector"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="LayoutSelector" component={LayoutSelectorScreen} />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          initialParams={{numPlayers: 4}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

let backHandlers: Array<() => boolean | null | undefined> = [];

beforeAll(async () => {
  await initI18n();
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, fn) => {
    backHandlers.push(fn);
    return {
      remove: () => {
        backHandlers = backHandlers.filter(h => h !== fn);
      },
    };
  });
});

afterAll(() => {
  (BackHandler.addEventListener as jest.Mock).mockRestore?.();
});

beforeEach(() => {
  backHandlers = [];
  act(() => {
    useGameStore.setState({numPlayers: 0, alt: false});
  });
});

function fireHardwareBack(): boolean {
  // RN dispatches hardwareBackPress to handlers LIFO and stops at the first
  // that returns true; mirror that here.
  for (let i = backHandlers.length - 1; i >= 0; i--) {
    const ret = backHandlers[i]!();
    if (ret === true) return true;
  }
  return false;
}

async function enterGame(findByTestId: (id: string) => Promise<any>): Promise<void> {
  const startBtn = await findByTestId('start-game');
  fireEvent.press(startBtn);
  await findByTestId('screen-game');
}

describe('GameScreen hardware back', () => {
  it('opens a confirmation modal on hardware back, intercepting navigation', async () => {
    const {findByTestId, queryByTestId} = render(<TestApp />);
    await enterGame(findByTestId);
    expect(queryByTestId('app-modal-backdrop')).toBeNull();

    expect(backHandlers.length).toBeGreaterThan(0);

    let intercepted = false;
    act(() => {
      intercepted = fireHardwareBack();
    });
    expect(intercepted).toBe(true);

    await findByTestId('app-modal-backdrop');
  });

  it('confirm "Yes" calls resetGame and navigates to LayoutSelector', async () => {
    const resetSpy = jest.fn();
    const originalReset = useGameStore.getState().resetGame;
    act(() => {
      useGameStore.setState({resetGame: resetSpy});
    });

    try {
      const {findByTestId, queryByTestId} = render(<TestApp />);
      await enterGame(findByTestId);

      act(() => {
        fireHardwareBack();
      });

      const yesBtn = await findByTestId('confirm-back-yes');
      fireEvent.press(yesBtn);

      await findByTestId('screen-layout-selector');
      expect(resetSpy).toHaveBeenCalledTimes(1);
      expect(queryByTestId('screen-game')).toBeNull();
    } finally {
      act(() => {
        useGameStore.setState({resetGame: originalReset});
      });
    }
  });
});
