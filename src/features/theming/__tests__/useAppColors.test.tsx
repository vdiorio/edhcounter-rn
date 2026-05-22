import React from 'react';
import {Text, useColorScheme} from 'react-native';
import {render} from '@testing-library/react-native';
import {useAppColors} from '../hooks/useAppColors';
import {AppColorsByScheme} from '../constants/theme';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

function Probe() {
  const colors = useAppColors();
  return <Text testID="bg">{colors.background}</Text>;
}

describe('useAppColors', () => {
  it('returns the dark palette when scheme is dark', () => {
    mockedUseColorScheme.mockReturnValue('dark');
    const {getByTestId} = render(<Probe />);
    expect(getByTestId('bg').props.children).toBe(AppColorsByScheme.dark.background);
  });

  it('returns the light palette when scheme is light', () => {
    mockedUseColorScheme.mockReturnValue('light');
    const {getByTestId} = render(<Probe />);
    expect(getByTestId('bg').props.children).toBe(AppColorsByScheme.light.background);
  });

  it('defaults to dark when scheme is null', () => {
    mockedUseColorScheme.mockReturnValue(null as unknown as 'dark');
    const {getByTestId} = render(<Probe />);
    expect(getByTestId('bg').props.children).toBe(AppColorsByScheme.dark.background);
  });
});
