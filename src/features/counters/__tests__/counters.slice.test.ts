import {useGameStore} from '@/store/gameStore';

function resetStore() {
  useGameStore.setState({
    players: {},
    numPlayers: 0,
    alt: false,
    gameLayout: [0, 0, 0, 0],
    startingPlayerId: null,
  });
}

describe('CountersSlice', () => {
  beforeEach(() => {
    resetStore();
    useGameStore.getState().setNumPlayers({playerCount: 4});
  });

  it('incrementPoison(+1) sets poison to 1', () => {
    useGameStore.getState().incrementPoison({playerId: 0, value: 1});

    expect(useGameStore.getState().players[0]!.poison).toBe(1);
  });

  it('clamps poison, energy and experience at zero', () => {
    useGameStore.getState().incrementPoison({playerId: 0, value: -1});
    useGameStore.getState().incrementEnergy({playerId: 0, value: -1});
    useGameStore.getState().incrementExperience({playerId: 0, value: -1});

    expect(useGameStore.getState().players[0]!.poison).toBe(0);
    expect(useGameStore.getState().players[0]!.energy).toBe(0);
    expect(useGameStore.getState().players[0]!.experience).toBe(0);
  });

  it('decrementing poison from 0 stays at 0', () => {
    useGameStore.getState().incrementPoison({playerId: 0, value: -1});

    expect(useGameStore.getState().players[0]!.poison).toBe(0);
  });

  it('stores poison uncapped above 10', () => {
    useGameStore.getState().incrementPoison({playerId: 0, value: 12});

    expect(useGameStore.getState().players[0]!.poison).toBe(12);
  });

  it('uses the special poison decrement rule when current poison is above 10', () => {
    useGameStore.getState().incrementPoison({playerId: 0, value: 12});
    useGameStore.getState().incrementPoison({playerId: 0, value: -1});

    expect(useGameStore.getState().players[0]!.poison).toBe(9);
  });

  it('increments energy and experience independently', () => {
    useGameStore.getState().incrementEnergy({playerId: 0, value: 3});
    useGameStore.getState().incrementExperience({playerId: 0, value: 2});

    expect(useGameStore.getState().players[0]!.energy).toBe(3);
    expect(useGameStore.getState().players[0]!.experience).toBe(2);
  });
});