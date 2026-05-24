import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {LONG_PRESS_DELAY} from '@/shared/constants/ui';

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  const startHoldMode = useCallback(() => {
    longPressTriggeredRef.current = true;
    setHealMode(true);
    rotation.value = withRepeat(
      withTiming(HOLD_ROTATION, {duration: HOLD_DURATION, easing: Easing.linear}),
      -1,
      false,
    );
    // Hold intentionally flips from damage to heal so one button exposes both modes.
    damageAllOpponents({playerId, value: 1});
    intervalRef.current = setInterval(() => {
      damageAllOpponents({playerId, value: 1});
    }, DAMAGE_ALL_INTERVAL);
  }, [damageAllOpponents, playerId, rotation]);

  const onPressIn = useCallback(() => {
    clearTimers();
    rotation.value = withTiming(TAP_ROTATION, {duration: TAP_DURATION, easing: Easing.ease});
    timeoutRef.current = setTimeout(startHoldMode, LONG_PRESS_DELAY);
  }, [clearTimers, rotation, startHoldMode]);

  const onPressOut = useCallback(() => {
    clearTimers();
    setHealMode(false);
    cancelAnimation(rotation);
    rotation.value = withTiming(0, {duration: TAP_DURATION, easing: Easing.ease});
  }, [clearTimers, rotation]);

  const onPress = useCallback(() => {
    clearTimers();

    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    damageAllOpponents({playerId, value: -1});
  }, [clearTimers, damageAllOpponents, playerId]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <Pressable
      testID={`damage-all-${playerId}`}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
      <View style={styles.frame}>
        <Animated.View testID={`damage-all-${playerId}-outline-wrap`} style={animatedStyle}>
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