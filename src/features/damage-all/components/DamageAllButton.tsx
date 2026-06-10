import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Polygon} from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {useAppColors} from '@/features/theming';
import {useGameStore} from '@/store/gameStore';
import {DAMAGE_ALL_INTERVAL} from '@/store/constants/game';
import {useHoldRepeat} from '@/shared/hooks/useHoldRepeat';

const TAP_ROTATION = 45;
const TAP_DURATION = 120;
const HOLD_ROTATION = 45;
const HOLD_DURATION = 5000;
const BUTTON_SIZE = 36;
const SPIKES = 12;
const OUTER_RADIUS = 16;
const INNER_RADIUS = 12;

function buildSpikyPoints(size: number): string {
  const center = size / 2;
  const points: string[] = [];

  for (let index = 0; index < SPIKES * 2; index++) {
    const angle = -Math.PI / 2 + (index * Math.PI) / SPIKES;
    const radius = index % 2 === 0 ? OUTER_RADIUS : INNER_RADIUS;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    points.push(`${x},${y}`);
  }

  return points.join(' ');
}

const SPIKY_POINTS = buildSpikyPoints(BUTTON_SIZE);

type Props = {
  playerId: number;
};

export function DamageAllButton({playerId}: Props): React.JSX.Element {
  const colors = useAppColors();
  const damageAllOpponents = useGameStore(s => s.damageAllOpponents);
  const rotation = useSharedValue(0);
  const [healMode, setHealMode] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  // Tap damages all opponents; holding flips to heal mode and repeats +1, so
  // one button exposes both modes. Timer bookkeeping lives in useHoldRepeat.
  const {
    onTap,
    onPressIn: holdPressIn,
    onPressOut: holdPressOut,
  } = useHoldRepeat({
    onTap: () => damageAllOpponents({playerId, value: -1}),
    onHoldStart: () => {
      setHealMode(true);
      rotation.value = withRepeat(
        withTiming(HOLD_ROTATION, {
          duration: HOLD_DURATION,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    },
    onHoldTick: () => damageAllOpponents({playerId, value: 1}),
    intervalMs: DAMAGE_ALL_INTERVAL,
    tickOnHoldStart: true,
  });

  const onPressIn = useCallback(() => {
    rotation.value = withTiming(TAP_ROTATION, {
      duration: TAP_DURATION,
      easing: Easing.ease,
    });
    holdPressIn();
  }, [holdPressIn, rotation]);

  const onPressOut = useCallback(() => {
    setHealMode(false);
    cancelAnimation(rotation);
    rotation.value = withTiming(0, {
      duration: TAP_DURATION,
      easing: Easing.ease,
    });
    holdPressOut();
  }, [holdPressOut, rotation]);

  return (
    <Pressable
      testID={`damage-all-${playerId}`}
      onPress={onTap}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
      <View style={styles.frame}>
        <Animated.View
          testID={`damage-all-${playerId}-outline-wrap`}
          style={animatedStyle}>
          <Svg
            testID={`damage-all-${playerId}-outline`}
            width={BUTTON_SIZE}
            height={BUTTON_SIZE}
            viewBox={`0 0 ${BUTTON_SIZE} ${BUTTON_SIZE}`}>
            <Polygon
              points={SPIKY_POINTS}
              fill="none"
              stroke={healMode ? colors.accent.green : colors.secondary}
              strokeWidth={1.75}
            />
          </Svg>
        </Animated.View>
        <Text
          testID={`damage-all-${playerId}-label`}
          style={[
            styles.label,
            {color: healMode ? colors.accent.green : colors.secondary},
          ]}>
          -1
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  label: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
});
