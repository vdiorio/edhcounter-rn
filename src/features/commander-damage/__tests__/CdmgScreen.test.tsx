import React from 'react';
import {render, act} from '@testing-library/react-native';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CdmgScreen from '@/screens/CdmgScreen';
import {useGameStore} from '@/store/gameStore';
import type {RootStackParamList} from '@/app/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function GameProbe(): React.JSX.Element {
  return <></>;
}

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

describe('CdmgScreen', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders pieces for all players for the target player route', async () => {
    const {findByTestId} = render(
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Cdmg" screenOptions={{headerShown: false}}>
          <Stack.Screen name="Game" component={GameProbe} initialParams={{numPlayers: 4}} />
          <Stack.Screen name="Cdmg" component={CdmgScreen} initialParams={{targetPlayerId: 0}} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    await findByTestId('screen-cdmg');
    await findByTestId('cdmg-box-0-0');
    await findByTestId('cdmg-box-0-1');
    await findByTestId('cdmg-box-0-2');
    await findByTestId('cdmg-box-0-3');
  });

  it('allows navigating back to Game', async () => {
    const navRef = createNavigationContainerRef<RootStackParamList>();
    const {findByTestId, queryByTestId} = render(
      <NavigationContainer ref={navRef}>
        <Stack.Navigator initialRouteName="Game" screenOptions={{headerShown: false}}>
          <Stack.Screen name="Game" component={GameProbe} initialParams={{numPlayers: 4}} />
          <Stack.Screen name="Cdmg" component={CdmgScreen} initialParams={{targetPlayerId: 0}} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    act(() => {
      navRef.navigate('Cdmg', {targetPlayerId: 0});
    });
    await findByTestId('screen-cdmg');

    act(() => {
      navRef.goBack();
    });

    expect(queryByTestId('screen-cdmg')).toBeNull();
  });
});