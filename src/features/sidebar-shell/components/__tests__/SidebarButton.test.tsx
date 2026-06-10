import React from 'react';
import {StyleSheet} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import {SidebarButton} from '../SidebarButton';

describe('SidebarButton', () => {
  it('fires onPress when tapped', () => {
    const onPress = jest.fn();
    const {getByTestId} = render(
      <SidebarButton testID="btn" icon="shield" selected={false} onPress={onPress} />,
    );
    fireEvent.press(getByTestId('btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('tints with the player color when selected', () => {
    const {getByTestId} = render(
      <SidebarButton testID="btn" icon="shield" selected color="#abcdef" onPress={() => {}} />,
    );
    expect(StyleSheet.flatten(getByTestId('btn').props.style).borderColor).toBe('#abcdef');
  });

  it('tints white when not selected', () => {
    const {getByTestId} = render(
      <SidebarButton testID="btn" icon="shield" selected={false} color="#abcdef" onPress={() => {}} />,
    );
    expect(StyleSheet.flatten(getByTestId('btn').props.style).borderColor).toBe('#ffffff');
  });
});
