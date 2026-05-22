import React from 'react';
import {Text} from 'react-native';
import {render} from '@testing-library/react-native';
import {AutoAdjustableView} from '../AutoAdjustableView';

describe('AutoAdjustableView', () => {
  it('renders children when not exiting', () => {
    const {getByText} = render(
      <AutoAdjustableView shouldExit={false}>
        <Text>inside</Text>
      </AutoAdjustableView>,
    );
    expect(getByText('inside')).toBeTruthy();
  });

  it('still renders the container when shouldExit is true (animates out, not unmounts)', () => {
    const {getByText} = render(
      <AutoAdjustableView shouldExit={true}>
        <Text>inside</Text>
      </AutoAdjustableView>,
    );
    expect(getByText('inside')).toBeTruthy();
  });
});
