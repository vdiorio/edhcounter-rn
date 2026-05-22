import {PLAYER_COLORS} from '../constants/playerColors';
import {useStyleStore} from '../store/styleStore';

describe('useStyleStore', () => {
  it('exposes a length-6 playerColors array', () => {
    const {playerColors} = useStyleStore.getState();
    expect(playerColors).toHaveLength(6);
  });

  it('playerColors is a permutation of PLAYER_COLORS', () => {
    const {playerColors} = useStyleStore.getState();
    expect([...playerColors].sort()).toEqual([...PLAYER_COLORS].sort());
  });

  it('shufflePlayerColors yields the same color set in (probably) a new order', () => {
    const before = [...useStyleStore.getState().playerColors];
    useStyleStore.getState().shufflePlayerColors();
    const after = useStyleStore.getState().playerColors;
    // Same color set
    expect([...after].sort()).toEqual([...before].sort());
    // After-state must still be length 6
    expect(after).toHaveLength(6);
  });

  it('shufflePlayerColors produces at least one different ordering across 20 attempts', () => {
    // Statistical: with 6! = 720 permutations, P(all identical in 20 tries) is vanishing.
    const initial = [...useStyleStore.getState().playerColors].join(',');
    let sawDifferent = false;
    for (let i = 0; i < 20; i++) {
      useStyleStore.getState().shufflePlayerColors();
      if (useStyleStore.getState().playerColors.join(',') !== initial) {
        sawDifferent = true;
        break;
      }
    }
    expect(sawDifferent).toBe(true);
  });
});
