import React from 'react';
import {render} from '@testing-library/react-native';
import {LayoutVisualizer} from '../components/LayoutVisualizer';
import {useStyleStore} from '@/features/theming';

describe('LayoutVisualizer', () => {
  it('renders one sub-cell per player slot for [1, 2, 1, 2] (6 cells)', () => {
    const {getAllByTestId} = render(
      <LayoutVisualizer layout={[1, 2, 1, 2]} width={160} height={280} />,
    );
    expect(getAllByTestId(/^visualizer-cell-/)).toHaveLength(6);
  });

  it('uses provided colors in playerId order', () => {
    const colors = ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd'];
    const {getByTestId} = render(
      <LayoutVisualizer layout={[1, 1, 1, 1]} width={160} height={280} colors={colors} />,
    );
    for (let i = 0; i < 4; i++) {
      const cell = getByTestId(`visualizer-cell-${i}`);
      expect(cell.props.style.backgroundColor).toBe(colors[i]);
    }
  });

  it('falls back to StyleStore.playerColors when colors prop is omitted', () => {
    const palette = useStyleStore.getState().playerColors;
    const {getByTestId} = render(
      <LayoutVisualizer layout={[1, 1, 1, 1]} width={160} height={280} />,
    );
    for (let i = 0; i < 4; i++) {
      const cell = getByTestId(`visualizer-cell-${i}`);
      expect(cell.props.style.backgroundColor).toBe(palette[i % palette.length]);
    }
  });

  it('positions cells within the container bounds', () => {
    const W = 160;
    const H = 280;
    const {getAllByTestId} = render(
      <LayoutVisualizer layout={[1, 1, 1, 1]} width={W} height={H} />,
    );
    for (const cell of getAllByTestId(/^visualizer-cell-/)) {
      const {left, top, width, height} = cell.props.style;
      expect(left).toBeGreaterThanOrEqual(0);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(left + width).toBeLessThanOrEqual(W + 0.01);
      expect(top + height).toBeLessThanOrEqual(H + 0.01);
    }
  });
});
