import {useGameStore} from '@/store/gameStore';
import {STARTING_LIFE_TOTAL} from '@/store/constants/game';
import {damageAllAction} from '../action';

function resetStore() {
  useGameStore.setState({
    players: {},
    numPlayers: 0,
    alt: false,
    gameLayout: [0, 0, 0, 0],
    startingPlayerId: null,
  });
  useGameStore.getState().setNumPlayers({playerCount: 4});
}

describe('damageAllAction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetStore();
  });

  afterEach(() => {
    useGameStore.getState().resetGame();
    jest.useRealTimers();
  });

  it('reduces life by 1 for every opponent and leaves the caller unchanged', () => {
    const next = damageAllAction(useGameStore.getState(), 0, -1);
    const players = next.players!;

    expect(players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL);
    expect(players[1]!.lTotal).toBe(STARTING_LIFE_TOTAL - 1);
    expect(players[2]!.lTotal).toBe(STARTING_LIFE_TOTAL - 1);
    expect(players[3]!.lTotal).toBe(STARTING_LIFE_TOTAL - 1);
  });

  it('accumulates delta for each affected opponent', () => {
    useGameStore.getState().incrementLife({playerId: 1, value: -2});

    const next = damageAllAction(useGameStore.getState(), 0, -1);
    const players = next.players!;

    expect(players[1]!.delta).toBe(-3);
    expect(players[2]!.delta).toBe(-1);
    expect(players[3]!.delta).toBe(-1);
    expect(players[0]!.delta).toBe(0);
  });

  it('supports signed healing values', () => {
    useGameStore.getState().incrementLife({playerId: 2, value: -4});

    const next = damageAllAction(useGameStore.getState(), 0, 1);
    const players = next.players!;

    expect(players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL);
    expect(players[1]!.lTotal).toBe(STARTING_LIFE_TOTAL + 1);
    expect(players[2]!.lTotal).toBe(STARTING_LIFE_TOTAL - 3);
    expect(players[3]!.lTotal).toBe(STARTING_LIFE_TOTAL + 1);
  });
});