import {useGameStore} from '@/store/gameStore';
import {
  clearProliferateUndoStack,
  getProliferateUndoCount,
  proliferateAction,
  undoProliferateAction,
} from '../action';

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

describe('proliferateAction', () => {
  beforeEach(() => {
    clearProliferateUndoStack();
    resetStore();
  });

  it('increments only the caller energy/experience when they are above zero', () => {
    useGameStore.getState().incrementEnergy({playerId: 0, value: 2});
    const next = proliferateAction(useGameStore.getState(), 0);

    expect(next.players![0]!.energy).toBe(3);
    expect(next.players![0]!.experience).toBe(0);
  });

  it('increments poison only for opponents with poison above zero', () => {
    useGameStore.getState().incrementPoison({playerId: 1, value: 1});
    const next = proliferateAction(useGameStore.getState(), 0);

    expect(next.players![1]!.poison).toBe(2);
    expect(next.players![2]!.poison).toBe(0);
    expect(next.players![3]!.poison).toBe(0);
  });

  it('never mutates caller poison nor opponents energy/experience', () => {
    useGameStore.getState().incrementPoison({playerId: 0, value: 3});
    useGameStore.getState().incrementEnergy({playerId: 1, value: 2});
    useGameStore.getState().incrementExperience({playerId: 2, value: 4});

    const next = proliferateAction(useGameStore.getState(), 0);

    expect(next.players![0]!.poison).toBe(3);
    expect(next.players![1]!.energy).toBe(2);
    expect(next.players![2]!.experience).toBe(4);
  });

  it('pushes undo records per caller', () => {
    useGameStore.getState().incrementEnergy({playerId: 0, value: 1});

    proliferateAction(useGameStore.getState(), 0);
    proliferateAction(useGameStore.getState(), 0);

    expect(getProliferateUndoCount(0)).toBe(2);
  });

  it('undo pops the most recent record and reverses exactly one step', () => {
    useGameStore.getState().incrementEnergy({playerId: 0, value: 1});
    let state = useGameStore.getState();

    state = {...state, ...proliferateAction(state, 0)};
    state = {...state, ...proliferateAction(state, 0)};
    const undone = undoProliferateAction(state, 0, 0);

    expect(undone.players![0]!.energy).toBe(2);
    expect(getProliferateUndoCount(0)).toBe(1);
  });

  it('undo subtracts one even after intervening changes', () => {
    useGameStore.getState().incrementPoison({playerId: 1, value: 1});
    let state = useGameStore.getState();

    state = {...state, ...proliferateAction(state, 0)};
    state = {
      ...state,
      players: {
        ...state.players,
        1: {
          ...state.players[1]!,
          poison: state.players[1]!.poison + 5,
        },
      },
    };
    const undone = undoProliferateAction(state, 0, 0);

    expect(undone.players![1]!.poison).toBe(6);
  });

  it('undo with empty stack is a no-op', () => {
    const state = useGameStore.getState();
    const undone = undoProliferateAction(state, 0, 0);

    expect(undone.players).toEqual(state.players);
  });
});