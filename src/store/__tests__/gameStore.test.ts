import {useGameStore} from '../gameStore';
import {STARTING_LIFE_TOTAL} from '../constants/game';
import {PLAYER_LAYOUTS} from '../constants/playerLayouts';

beforeEach(() => {
  // Hard reset back to the initial slice state for isolation.
  useGameStore.setState({
    players: {},
    numPlayers: 0,
    alt: false,
    gameLayout: [0, 0, 0, 0],
    startingPlayerId: null,
  });
});

describe('useGameStore', () => {
  it('exposes the CoreSlice surface', () => {
    const state = useGameStore.getState();
    expect(state).toHaveProperty('players');
    expect(state).toHaveProperty('numPlayers');
    expect(state).toHaveProperty('gameLayout');
    expect(state).toHaveProperty('startingPlayerId');
    expect(typeof state.setNumPlayers).toBe('function');
    expect(typeof state.resetGame).toBe('function');
  });

  it('setNumPlayers wires through to the CoreSlice', () => {
    useGameStore.getState().setNumPlayers({playerCount: 5, alt: true});
    const state = useGameStore.getState();
    expect(state.numPlayers).toBe(5);
    expect(state.alt).toBe(true);
    expect(state.gameLayout).toEqual(PLAYER_LAYOUTS[5]![1]);
    expect(Object.keys(state.players)).toHaveLength(5);
    expect(state.players[0]!.lTotal).toBe(STARTING_LIFE_TOTAL);
  });

  it('resetGame restores default player records', () => {
    useGameStore.getState().setNumPlayers({playerCount: 3});
    useGameStore.setState(prev => ({
      players: {
        ...prev.players,
        1: {...prev.players[1]!, lTotal: 5, history: [-3]},
      },
    }));
    expect(useGameStore.getState().players[1]!.lTotal).toBe(5);

    useGameStore.getState().resetGame();
    expect(useGameStore.getState().players[1]!.lTotal).toBe(STARTING_LIFE_TOTAL);
    expect(useGameStore.getState().players[1]!.history).toEqual([]);
  });
});
