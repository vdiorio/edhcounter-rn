import {PROLIFERATE_UNDO_INTERVAL} from '@/store/constants/game';
import {useGameStore} from '@/store/gameStore';
import {useHoldRepeat} from '@/shared/hooks/useHoldRepeat';

export function useProliferate(playerId: number): {
  onTap: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
  undoCount: number;
} {
  const proliferate = useGameStore(s => s.proliferate);
  const undoProliferate = useGameStore(s => s.undoProliferate);
  const undoCount = useGameStore(
    s => s.proliferateUndoCountByPlayer[playerId] ?? 0,
  );

  // Tap proliferates; holding rewinds one proliferate per interval.
  const {onTap, onPressIn, onPressOut} = useHoldRepeat({
    onTap: () => proliferate(playerId),
    onHoldTick: () => undoProliferate(playerId),
    intervalMs: PROLIFERATE_UNDO_INTERVAL,
  });

  return {onTap, onPressIn, onPressOut, undoCount};
}
