import {useCallback, useEffect, useRef} from 'react';
import {create} from 'zustand';

/**
 * Matches SidebarSlot's SlideOutLeft duration. When switching directly from one
 * open bar to another, we clear to `null` first and set the target after the
 * exit window so the slot can play exit-then-enter.
 */
export const SIDEBAR_EXIT_MS = 50;

type SidebarStore = {
  bars: Record<number, string>;
  setBar: (playerId: number, key: string | null) => void;
  reset: () => void;
};

/**
 * Per-player sidebar selection is ephemeral UI state shared across a player's
 * UtilsSideBar (writer) and PlayerBox/SidebarSlot (readers). It lives in its
 * own non-persisted store keyed by playerId so different players stay isolated.
 * Keys are plain strings validated against the sidebar registry, not a union.
 */
const useSidebarStore = create<SidebarStore>(set => ({
  bars: {},
  setBar: (playerId, key) =>
    set(state => {
      const bars = {...state.bars};
      if (key === null) {
        delete bars[playerId];
      } else {
        bars[playerId] = key;
      }
      return {bars};
    }),
  reset: () => set({bars: {}}),
}));

/** Test helper — clears all per-player sidebar selections. */
export function resetAllSidebars(): void {
  useSidebarStore.getState().reset();
}

type UseSidebarState = {
  selectedBar: string | null;
  toggleBar: (key: string | null) => void;
};

export function useSidebarState(playerId: number): UseSidebarState {
  const selectedBar = useSidebarStore(state => state.bars[playerId] ?? null);
  const setBar = useSidebarStore(state => state.setBar);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSwitchTimer = useCallback(() => {
    if (switchTimer.current) {
      clearTimeout(switchTimer.current);
      switchTimer.current = null;
    }
  }, []);

  const toggleBar = useCallback(
    (key: string | null) => {
      clearSwitchTimer();

      if (key === null || key === selectedBar) {
        setBar(playerId, null);
        return;
      }

      if (selectedBar === null) {
        setBar(playerId, key);
        return;
      }

      // Switching between two open bars: clear now, set target after the exit.
      setBar(playerId, null);
      switchTimer.current = setTimeout(() => {
        switchTimer.current = null;
        setBar(playerId, key);
      }, SIDEBAR_EXIT_MS);
    },
    [selectedBar, setBar, playerId, clearSwitchTimer],
  );

  useEffect(() => clearSwitchTimer, [clearSwitchTimer]);

  return {selectedBar, toggleBar};
}
