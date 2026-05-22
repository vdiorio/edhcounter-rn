import {useEffect, useMemo} from 'react';
import {
  type SharedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {DELTA_ANIMATION} from '@/shared/constants/ui';

export const DELTA_POSITIVE_COLOR = '#A0FF00';
export const DELTA_NEGATIVE_COLOR = '#FF0000';

export type DeltaAnimation = {
  translateY: SharedValue<number>;
  signedString: string;
  color: string;
};

export function useDeltaAnimation(delta: number): DeltaAnimation {
  const translateY = useSharedValue(0);

  const {signedString, color} = useMemo(() => {
    if (delta === 0) return {signedString: '', color: DELTA_POSITIVE_COLOR};
    if (delta > 0) return {signedString: `+${delta}`, color: DELTA_POSITIVE_COLOR};
    return {signedString: `${delta}`, color: DELTA_NEGATIVE_COLOR};
  }, [delta]);

  useEffect(() => {
    translateY.value = -3;
    translateY.value = withTiming(0, {duration: DELTA_ANIMATION});
  }, [delta, translateY]);

  return {translateY, signedString, color};
}
