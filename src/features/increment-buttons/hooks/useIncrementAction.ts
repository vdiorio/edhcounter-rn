import {useCallback, useEffect, useRef} from 'react';
import {HOLD_INTERVAL} from '@/shared/constants/ui';

export type IncrementAction = {
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

export function useIncrementAction(input: {
  onTick: () => void;
  intervalMs?: number;
}): IncrementAction {
  const {onTick, intervalMs = HOLD_INTERVAL} = input;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track the latest callback so the interval always calls the freshest one.
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPressIn = useCallback(() => {
    clear();
    onTickRef.current();
    timerRef.current = setInterval(() => {
      onTickRef.current();
    }, intervalMs);
  }, [clear, intervalMs]);

  const onPressOut = useCallback(() => {
    clear();
  }, [clear]);

  const onPress = useCallback(() => {
    // If a hold already fired, the tap is redundant. The button wires onPress
    // for the case where the platform delivered a tap without a press-in/out
    // (rare). Fire if no interval is active.
    if (timerRef.current === null) {
      onTickRef.current();
    }
  }, []);

  useEffect(() => () => clear(), [clear]);

  return {onPressIn, onPressOut, onPress};
}
