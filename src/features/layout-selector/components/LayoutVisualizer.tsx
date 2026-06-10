import React from 'react';
import {StyleSheet, View} from 'react-native';
import {computeLayoutPieces, type GameLayoutTuple} from '@/features/game-layout';
import {useStyleStore} from '@/features/theming';
import {BORDER_COLOR} from '@/shared/constants/ui';

type Props = {
  layout: GameLayoutTuple;
  width: number;
  height: number;
  colors?: string[];
};

export function LayoutVisualizer({
  layout,
  width,
  height,
  colors,
}: Props): React.JSX.Element {
  const storeColors = useStyleStore(s => s.playerColors);
  const palette = colors ?? storeColors;
  const pieces = computeLayoutPieces(layout, width, height);

  return (
    <View
      testID="layout-visualizer"
      style={[styles.container, {width, height}]}>
      {pieces.map(p => (
        <View
          key={p.playerId}
          testID={`visualizer-cell-${p.playerId}`}
          style={[
            styles.cell,
            {
              left: p.x,
              top: p.y,
              width: p.width,
              height: p.height,
              backgroundColor: palette[p.playerId % palette.length],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
  },
  cell: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER_COLOR,
  },
});
