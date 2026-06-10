import {useCallback, useEffect, useRef} from 'react';
import {LONG_PRESS_DELAY} from '@/shared/constants/ui';

export type HoldRepeatConfig = {
  /** Fired on a plain tap (press + release with no hold). */
  onTap: () => void;
  /** Fired once when the press crosses the hold threshold. */
  onHoldStart?: () => void;
  /** Fired on each repeat while held (and once at the threshold if tickOnHoldStart). */
  onHoldTick: () => void;
  /** Repeat interval once holding. */
  intervalMs: number;
  /** How long to wait before a press becomes a hold. Defaults to LONG_PRESS_DELAY. */
  delayMs?: number;
  /** Emit one onHoldTick immediately when the threshold is crossed. */
  tickOnHoldStart?: boolean;
};

export type HoldRepeatHandlers = {
  onTap: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

/**
 * Tap-or-hold press handling shared by the damage-all and proliferate buttons.
 *
 * A quick press fires `onTap` on release. Holding past `delayMs` fires
 * `onHoldStart` once and then `onHoldTick` every `intervalMs`; the trailing
 * release tap is suppressed so a hold never also counts as a tap. Timers are
 * cleared on release and on unmount.
 */
export function useHoldRepeat(config: HoldRepeatConfig): HoldRepeatHandlers {
  // Whole config (callbacks AND timing/flags) read via ref so handler identity
  // stays stable across renders and timers always see the latest values.
  const configRef = useRef(config);
  configRef.current = config;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heldRef = useRef(false);

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

  const onPressIn = useCallback(() => {
    clearTimers();
    heldRef.current = false;
    const {
      delayMs = LONG_PRESS_DELAY,
      intervalMs,
      tickOnHoldStart = false,
    } = configRef.current;
    timeoutRef.current = setTimeout(() => {
      heldRef.current = true;
      configRef.current.onHoldStart?.();
      if (tickOnHoldStart) configRef.current.onHoldTick();
      intervalRef.current = setInterval(() => {
        configRef.current.onHoldTick();
      }, intervalMs);
    }, delayMs);
  }, [clearTimers]);

  const onPressOut = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const onTap = useCallback(() => {
    if (heldRef.current) {
      heldRef.current = false;
      return;
    }
    configRef.current.onTap();
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {onTap, onPressIn, onPressOut};
}
