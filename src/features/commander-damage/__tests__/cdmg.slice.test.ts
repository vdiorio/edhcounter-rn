import {useGameStore} from '@/store/gameStore';
import {CDMG_LIMIT, STARTING_LIFE_TOTAL} from '@/store/constants/game';

function resetStore() {
  useGameStore.setState({
    players: {},
    numPlayers: 0,
    alt: false,
    gameLayout: [0, 0, 0, 0],
    startingPlayerId: null,
  });
}

describe('CdmgSlice', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetStore();
    useGameStore.getState().setNumPlayers({playerCount: 4});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stores commander damage on the main slot for the attacker', () => {
    useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: 3});

    expect(useGameStore.getState().players[0]!.Cdmg[1]).toEqual([3, 0]);
  });

  it('clamps the result into the [0, 21] range', () => {
    useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: 2});
    useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: -5});
    useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: 99});

    expect(useGameStore.getState().players[0]!.Cdmg[1]).toEqual([CDMG_LIMIT, 0]);
  });

  it('writes partner damage to slot index 1', () => {
    useGameStore.getState().dealCommanderDamage({
      playerId: 0,
      attackerId: 1,
      value: 3,
      partner: true,
    });

    expect(useGameStore.getState().players[0]!.Cdmg[1]).toEqual([0, 3]);
  });

  it('with chain enabled also decrements life and delta for the target', () => {
    useGameStore.getState().togglePlayerChain(0);
    useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: 3});

    expect(useGameStore.getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL - 3);
    expect(useGameStore.getState().players[0]!.delta).toBe(-3);
  });

  it('with chain disabled does not change life', () => {
    useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: 3});

    expect(useGameStore.getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL);
  });

  it('togglePlayerChain flips the flag', () => {
    expect(useGameStore.getState().players[0]!.chain).toBe(false);

    useGameStore.getState().togglePlayerChain(0);
    expect(useGameStore.getState().players[0]!.chain).toBe(true);

    useGameStore.getState().togglePlayerChain(0);
    expect(useGameStore.getState().players[0]!.chain).toBe(false);
  });

  it('supports signed reversal while keeping clamp semantics', () => {
    useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: 6});
    useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: -2});

    expect(useGameStore.getState().players[0]!.Cdmg[1]).toEqual([4, 0]);
  });

  it('reaching 21 does not auto-zero life', () => {
    useGameStore.getState().dealCommanderDamage({playerId: 0, attackerId: 1, value: 21});

    expect(useGameStore.getState().players[0]!.Cdmg[1]).toEqual([21, 0]);
    expect(useGameStore.getState().players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL);
  });
});