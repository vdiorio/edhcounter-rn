import {useCallback, useEffect, useRef} from 'react';
import {LONG_PRESS_DELAY} from '@/shared/constants/ui';
import {PROLIFERATE_UNDO_INTERVAL} from '@/store/constants/game';
import {useGameStore} from '@/store/gameStore';

export function useProliferate(playerId: number): {
  onTap: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
  undoCount: number;
} {
  const proliferate = useGameStore(s => s.proliferate);
  const undoProliferate = useGameStore(s => s.undoProliferate);
  const undoCount = useGameStore(s => s.proliferateUndoCountByPlayer[playerId] ?? 0);
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

  const onTap = useCallback(() => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    proliferate(playerId);
  }, [playerId, proliferate]);

  const onPressIn = useCallback(() => {
    clearTimers();
    longPressTriggeredRef.current = false;
    timeoutRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      intervalRef.current = setInterval(() => {
        undoProliferate(playerId);
      }, PROLIFERATE_UNDO_INTERVAL);
    }, LONG_PRESS_DELAY);
  }, [clearTimers, playerId, undoProliferate]);

  const onPressOut = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {onTap, onPressIn, onPressOut, undoCount};
}