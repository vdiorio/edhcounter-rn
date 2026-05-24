import {useCallback, useEffect, useRef} from 'react';
import {HOLD_INTERVAL, LONG_PRESS_DELAY} from '@/shared/constants/ui';

export type IncrementAction = {
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

export function useIncrementAction(input: {
  onTick: () => void;
  intervalMs?: number;
  longPressDelayMs?: number;
}): IncrementAction {
  const {
    onTick,
    intervalMs = HOLD_INTERVAL,
    longPressDelayMs = LONG_PRESS_DELAY,
  } = input;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressInFiredRef = useRef(false);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const clearTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const onPressIn = useCallback(() => {
    clearTimers();
    pressInFiredRef.current = true;
    onTickRef.current();
    timeoutRef.current = setTimeout(() => {
      onTickRef.current();
      intervalRef.current = setInterval(() => {
        onTickRef.current();
      }, intervalMs);
    }, longPressDelayMs);
  }, [clearTimers, intervalMs, longPressDelayMs]);

  const onPressOut = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const onPress = useCallback(() => {
    // Fallback for the platform-skipped-pressIn case (test renderers, mostly).
    // On a normal device flow the flag is already true here so we no-op.
    if (!pressInFiredRef.current) {
      onTickRef.current();
    }
    pressInFiredRef.current = false;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {onPressIn, onPressOut, onPress};
}
