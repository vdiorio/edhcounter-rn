import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LayoutSelectorScreen from '@/screens/LayoutSelectorScreen';
import GameScreen from '@/screens/GameScreen';
import CdmgScreen from '@/screens/CdmgScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="LayoutSelector"
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="LayoutSelector" component={LayoutSelectorScreen} />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{
          statusBarHidden: true,
          statusBarTranslucent: true,
          navigationBarHidden: true,
        }}
        initialParams={{numPlayers: 4}}
      />
      <Stack.Screen
        name="Cdmg"
        component={CdmgScreen}
        initialParams={{targetPlayerId: 0}}
      />
    </Stack.Navigator>
  );
}
