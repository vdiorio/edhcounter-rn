import {useEffect} from 'react';
import {
  type SharedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {AUTO_ADJUST, SLIDER_TOGGLE} from '@/shared/constants/ui';

export type AutoAdjustmentValues = {
  width: SharedValue<number>;
  height: SharedValue<number>;
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
};

export function useAutoAdjustmentAnimation(
  shouldExit: boolean,
  duration: number = AUTO_ADJUST,
): AutoAdjustmentValues {
  const width = useSharedValue(100);
  const height = useSharedValue(100);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const target = shouldExit ? 0 : 1;
    const sizeTarget = shouldExit ? 0 : 100;
    width.value = withTiming(sizeTarget, {duration});
    height.value = withTiming(sizeTarget, {duration});
    opacity.value = withTiming(target, {duration});
    scale.value = withTiming(target, {duration});
  }, [shouldExit, duration, width, height, opacity, scale]);

  return {width, height, opacity, scale};
}

export type SliderValues = {
  highlightWidth: SharedValue<number>;
  highlightLeft: SharedValue<number>;
};

export function useSliderAnimation(active: boolean): SliderValues {
  // Normalized positions: 0 = left, 1 = right.
  const highlightLeft = useSharedValue(active ? 1 : 0);
  // Mid-toggle the highlight stretches: 0.35 → 0.4 → 0.35.
  const highlightWidth = useSharedValue(0.35);

  useEffect(() => {
    highlightLeft.value = withSpring(active ? 1 : 0, {
      damping: 40,
      stiffness: 150,
    });
    highlightWidth.value = withTiming(0.35, {duration: SLIDER_TOGGLE});
  }, [active, highlightLeft, highlightWidth]);

  return {highlightWidth, highlightLeft};
}
