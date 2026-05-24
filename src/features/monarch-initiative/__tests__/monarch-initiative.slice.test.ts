import {useGameStore} from '@/store/gameStore';

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

describe('MonarchInitiativeSlice', () => {
  beforeEach(() => {
    resetStore();
  });

  it('starts with null holders and hidden bars', () => {
    const state = useGameStore.getState();

    expect(state.monarchPlayerId).toBeNull();
    expect(state.initiativePlayerId).toBeNull();
    expect(state.showMonarchBar).toBe(false);
    expect(state.showInitiativeBar).toBe(false);
  });

  it('claimMonarch sets only monarch player id', () => {
    useGameStore.getState().claimMonarch(2);

    expect(useGameStore.getState().monarchPlayerId).toBe(2);
    expect(useGameStore.getState().showMonarchBar).toBe(false);
  });

  it('claimInitiative sets initiative player id', () => {
    useGameStore.getState().claimInitiative(3);

    expect(useGameStore.getState().initiativePlayerId).toBe(3);
  });

  it('toggleMonarchBar opens with owner then closes and clears', () => {
    useGameStore.getState().toggleMonarchBar(0);

    expect(useGameStore.getState().showMonarchBar).toBe(true);
    expect(useGameStore.getState().monarchPlayerId).toBe(0);

    useGameStore.getState().toggleMonarchBar(0);

    expect(useGameStore.getState().showMonarchBar).toBe(false);
    expect(useGameStore.getState().monarchPlayerId).toBeNull();
  });

  it('toggleInitiativeBar mirrors monarch behavior', () => {
    useGameStore.getState().toggleInitiativeBar(1);

    expect(useGameStore.getState().showInitiativeBar).toBe(true);
    expect(useGameStore.getState().initiativePlayerId).toBe(1);

    useGameStore.getState().toggleInitiativeBar(1);

    expect(useGameStore.getState().showInitiativeBar).toBe(false);
    expect(useGameStore.getState().initiativePlayerId).toBeNull();
  });

  it('resetGame clears monarch/initiative state', () => {
    useGameStore.getState().toggleMonarchBar(0);
    useGameStore.getState().toggleInitiativeBar(1);

    useGameStore.getState().resetGame();

    expect(useGameStore.getState().monarchPlayerId).toBeNull();
    expect(useGameStore.getState().initiativePlayerId).toBeNull();
    expect(useGameStore.getState().showMonarchBar).toBe(false);
    expect(useGameStore.getState().showInitiativeBar).toBe(false);
  });
});