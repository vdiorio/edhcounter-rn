import {useCallback, useMemo, useRef, useState} from 'react';
import {computeLayoutPieces} from '@/features/game-layout/utils/computeLayout';
import {useGameStore} from '@/store/gameStore';

const STEP_DELAYS_MS = [80, 80, 80, 80, 80, 80, 80, 100, 120, 150, 180, 220, 260] as const;

function getClockwiseOrder(state: ReturnType<typeof useGameStore.getState>): number[] {
  const pieces = computeLayoutPieces(state.gameLayout, 100, 100);
  const existing = new Set(Object.keys(state.players).map(Number));

  const top = pieces.filter(p => p.direction === 180).sort((a, b) => a.x - b.x);
  const right = pieces.filter(p => p.direction === -90).sort((a, b) => a.y - b.y);
  const bottom = pieces.filter(p => p.direction === 0).sort((a, b) => b.x - a.x);
  const left = pieces.filter(p => p.direction === 90).sort((a, b) => b.y - a.y);

  const order: number[] = [];
  for (const piece of [...top, ...right, ...bottom, ...left]) {
    if (existing.has(piece.playerId)) order.push(piece.playerId);
  }
  return order;
}

export function useStartingPlayer(): {
  startingPlayerId: number | null;
  pickStartingPlayer: () => void;
  isAnimating: boolean;
} {
  const startingPlayerId = useGameStore(s => s.startingPlayerId);
  const [isAnimating, setIsAnimating] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  const pickStartingPlayer = useCallback(() => {
    if (isAnimating) return;

    const state = useGameStore.getState();
    const order = getClockwiseOrder(state);
    if (order.length === 0) return;

    const targetIndex = Math.floor(Math.random() * order.length);
    const stepCount = STEP_DELAYS_MS.length;
    const startIndex =
      (targetIndex - ((stepCount - 1) % order.length) + order.length) % order.length;

    setIsAnimating(true);
    clearTimers();

    let elapsed = 0;
    STEP_DELAYS_MS.forEach((delay, step) => {
      elapsed += delay;
      const timer = setTimeout(() => {
        const playerId = order[(startIndex + step) % order.length]!;
        useGameStore.setState({startingPlayerId: playerId});
        if (step === STEP_DELAYS_MS.length - 1) {
          setIsAnimating(false);
        }
      }, elapsed);
      timersRef.current.push(timer);
    });
  }, [clearTimers, isAnimating]);

  return useMemo(
    () => ({
      startingPlayerId,
      pickStartingPlayer,
      isAnimating,
    }),
    [startingPlayerId, pickStartingPlayer, isAnimating],
  );
}