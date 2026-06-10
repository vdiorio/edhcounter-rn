import React from 'react';
import {render} from '@testing-library/react-native';
import {RootNavigator} from '../RootNavigator';

type ScreenCall = {
  name: string;
  options?: {
    navigationBarHidden?: boolean;
    statusBarHidden?: boolean;
    statusBarTranslucent?: boolean;
  };
};

const mockNavigatorProps = jest.fn();
const mockScreenCalls: ScreenCall[] = [];

jest.mock('@react-navigation/native-stack', () => {
  const ReactMock = require('react');

  return {
    createNativeStackNavigator: () => ({
      Navigator: ({
        children,
        ...props
      }: React.PropsWithChildren<Record<string, unknown>>) => {
        mockNavigatorProps(props);
        return ReactMock.createElement(ReactMock.Fragment, null, children);
      },
      Screen: ({name, options}: ScreenCall) => {
        mockScreenCalls.push({name, options});
        return null;
      },
    }),
  };
});

describe('RootNavigator fullscreen behavior', () => {
  beforeEach(() => {
    mockNavigatorProps.mockClear();
    mockScreenCalls.length = 0;
  });

  it('configures the Game route to hide system bars', () => {
    render(<RootNavigator />);

    const gameScreen = mockScreenCalls.find(screen => screen.name === 'Game');

    expect(gameScreen?.options).toEqual(
      expect.objectContaining({
        statusBarHidden: true,
        statusBarTranslucent: true,
        navigationBarHidden: true,
      }),
    );
  });
});
