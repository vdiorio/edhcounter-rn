import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LayoutSelectorScreen} from '../components/LayoutSelectorScreen';
import {useGameStore} from '@/store/gameStore';
import {initI18n} from '@/features/i18n';
import type {RootStackParamList} from '@/app/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const mockNavigate = jest.fn();

function GameProbe(): React.JSX.Element {
  return <></>;
}

function TestApp(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LayoutSelector"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="LayoutSelector" component={LayoutSelectorScreen} />
        <Stack.Screen name="Game" component={GameProbe} initialParams={{numPlayers: 4}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

beforeAll(async () => {
  await initI18n();
});

beforeEach(() => {
  mockNavigate.mockClear();
  useGameStore.setState({numPlayers: 0, players: {}, startingPlayerId: null});
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({navigate: mockNavigate}),
  };
});

describe('LayoutSelectorScreen', () => {
  it('mounts with default selection of 4 players (primary layout)', () => {
    const {getByTestId, getAllByTestId} = render(<TestApp />);
    expect(getByTestId('count-4').props.accessibilityState?.selected).toBe(true);
    // primary 4p layout is [0,2,0,2] → 4 cells
    expect(getAllByTestId(/^visualizer-cell-/)).toHaveLength(4);
  });

  it('changing the picker does not mutate useGameStore', () => {
    const {getByTestId} = render(<TestApp />);
    fireEvent.press(getByTestId('count-6'));
    expect(useGameStore.getState().numPlayers).toBe(0);
  });

  it('tapping Start navigates to Game with the current selection (default 4, alt=false)', () => {
    const {getByTestId} = render(<TestApp />);
    fireEvent.press(getByTestId('start-game'));
    expect(mockNavigate).toHaveBeenCalledWith('Game', {numPlayers: 4, alt: false});
  });

  it('changing count to 6 then Start fires navigate with numPlayers=6', () => {
    const {getByTestId} = render(<TestApp />);
    fireEvent.press(getByTestId('count-6'));
    fireEvent.press(getByTestId('start-game'));
    expect(mockNavigate).toHaveBeenCalledWith('Game', {numPlayers: 6, alt: false});
  });

  it('toggling alt then Start fires navigate with alt=true', () => {
    const {getByTestId} = render(<TestApp />);
    fireEvent.press(getByTestId('alt-alt'));
    fireEvent.press(getByTestId('start-game'));
    expect(mockNavigate).toHaveBeenCalledWith('Game', {numPlayers: 4, alt: true});
  });

  it('switching player count resets alt back to primary', () => {
    const {getByTestId} = render(<TestApp />);
    fireEvent.press(getByTestId('alt-alt'));
    fireEvent.press(getByTestId('count-3'));
    fireEvent.press(getByTestId('start-game'));
    expect(mockNavigate).toHaveBeenCalledWith('Game', {numPlayers: 3, alt: false});
  });

  it('changing (count, alt) updates the visualizer cell count', () => {
    const {getByTestId, getAllByTestId} = render(<TestApp />);
    fireEvent.press(getByTestId('count-5'));
    // 5p primary is [0,2,1,2] → 5 cells
    expect(getAllByTestId(/^visualizer-cell-/)).toHaveLength(5);
    fireEvent.press(getByTestId('count-2'));
    // 2p primary is [1,0,1,0] → 2 cells
    expect(getAllByTestId(/^visualizer-cell-/)).toHaveLength(2);
  });
});
