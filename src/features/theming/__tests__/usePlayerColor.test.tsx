import React from 'react';
import {Text} from 'react-native';
import {render} from '@testing-library/react-native';
import {usePlayerColor} from '../hooks/usePlayerColor';
import {useStyleStore} from '../store/styleStore';

function Probe({id}: {id: number}) {
  const color = usePlayerColor(id);
  return <Text testID="c">{color}</Text>;
}

describe('usePlayerColor', () => {
  it('maps id to playerColors[id % 6]', () => {
    const palette = useStyleStore.getState().playerColors;
    for (let id = 0; id < 12; id++) {
      const {getByTestId, unmount} = render(<Probe id={id} />);
      expect(getByTestId('c').props.children).toBe(palette[id % 6]);
      unmount();
    }
  });
});
