import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useGameStore} from '@/store/gameStore';
import {Typography} from '@/shared/ui';
import {useIncrementAction} from '../hooks/useIncrementAction';

type Props = {
  playerId: number;
};

const PRESS_DOWN_SCALE = 0.95;
const PRESS_DURATION = 100;

function SideButton({
  testID,
  label,
  onTick,
  underlay,
}: {
  testID: string;
  label: string;
  onTick: () => void;
  underlay: string;
}): React.JSX.Element {
  const scale = useSharedValue(1);
  const {onPress, onPressIn, onPressOut} = useIncrementAction({onTick});

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = (): void => {
    scale.value = withTiming(PRESS_DOWN_SCALE, {duration: PRESS_DURATION});
    onPressIn();
  };
  const handlePressOut = (): void => {
    scale.value = withTiming(1, {duration: PRESS_DURATION});
    onPressOut();
  };

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({pressed}) => [styles.touchable, pressed && {backgroundColor: underlay}]}>
      <Animated.View style={animatedStyle}>
        <Typography variant="title" style={styles.label}>
          {label}
        </Typography>
      </Animated.View>
    </Pressable>
  );
}

export function IncrementerButtons({playerId}: Props): React.JSX.Element {
  const incrementLife = useGameStore(s => s.incrementLife);

  return (
    <View style={styles.container}>
      <SideButton
        testID={`incrementer-${playerId}-minus`}
        label="−"
        underlay="rgba(255,0,0,0.12)"
        onTick={() => incrementLife({playerId, value: -1})}
      />
      <SideButton
        testID={`incrementer-${playerId}-plus`}
        label="+"
        underlay="rgba(0,255,0,0.12)"
        onTick={() => incrementLife({playerId, value: 1})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  touchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#FFFFFF99',
    fontSize: 36,
    fontWeight: '900',
  },
});
