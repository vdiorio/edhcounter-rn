import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {useAutoAdjustmentAnimation} from './hooks';

export type AutoAdjustableViewProps = {
  shouldExit: boolean;
  children: React.ReactNode;
  duration?: number;
};

export function AutoAdjustableView({
  shouldExit,
  children,
  duration,
}: AutoAdjustableViewProps): React.JSX.Element {
  const {width, height, opacity, scale} = useAutoAdjustmentAnimation(
    shouldExit,
    duration,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    height: `${height.value}%`,
    opacity: opacity.value,
    transform: [{scale: scale.value}],
    overflow: 'hidden',
    display: scale.value === 0 ? 'none' : 'flex',
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
