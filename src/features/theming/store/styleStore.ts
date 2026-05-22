import {create} from 'zustand';
import {PLAYER_COLORS} from '../constants/playerColors';

export type StyleStore = {
  playerColors: string[];
  shufflePlayerColors: () => void;
};

function fisherYatesShuffle<T>(input: ReadonlyArray<T>): T[] {
  const copy = [...input];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

export const useStyleStore = create<StyleStore>(set => ({
  playerColors: fisherYatesShuffle(PLAYER_COLORS),
  shufflePlayerColors: () => set({playerColors: fisherYatesShuffle(PLAYER_COLORS)}),
}));
