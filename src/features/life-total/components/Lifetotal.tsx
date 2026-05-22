import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {useGameStore} from '@/store/gameStore';
import {usePlayerColor} from '@/features/theming';
import {Typography} from '@/shared/ui';
import {LIFE_FONT_SIZE, DELTA_FACTOR} from '@/shared/constants/ui';
import {useDeltaAnimation} from '../hooks/useDeltaAnimation';

type Props = {
  playerId: number;
  fontSize?: number;
};

export function Lifetotal({playerId, fontSize = LIFE_FONT_SIZE}: Props): React.JSX.Element {
  const lTotal = useGameStore(s => s.players[playerId]?.lTotal ?? 0);
  const delta = useGameStore(s => s.players[playerId]?.delta ?? 0);
  const playerColor = usePlayerColor(playerId);

  const {translateY, signedString, color} = useDeltaAnimation(delta);
  const opacity = lTotal <= 0 ? 0.5 : 1;
  const deltaFontSize = Math.floor(fontSize * DELTA_FACTOR);

  const deltaStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    color,
    fontSize: deltaFontSize,
  }));

  return (
    <View style={styles.container}>
      {delta !== 0 ? (
        <Animated.Text
          testID={`lifetotal-${playerId}-delta`}
          style={[styles.delta, deltaStyle]}>
          {signedString}
        </Animated.Text>
      ) : null}
      <Typography
        testID={`lifetotal-${playerId}`}
        style={[
          styles.lifeTotal,
          {
            fontSize,
            opacity,
            textShadowColor: `${playerColor}BB`,
            textShadowRadius: 1,
            textShadowOffset: {width: 2, height: 2},
          },
        ]}>
        {lTotal}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  lifeTotal: {
    fontWeight: 'bold',
    margin: 10,
  },
  delta: {
    position: 'absolute',
    top: 0,
    textAlign: 'center',
    fontWeight: '900',
  },
});
