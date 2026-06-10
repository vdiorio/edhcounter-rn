import {GAME_STORAGE_KEY, type PersistedGameState} from '../middleware';
import type {GameStore} from '@/store/gameStore';

// These are real-async hydration integration tests that can exceed Jest's
// default 5s timeout on slower CI runners. Bump the per-test timeout so they
// don't flake under CI while still passing fast locally.
jest.setTimeout(20000);

async function freshStore() {
  jest.resetModules();
  const {default: AsyncStorage} = require('@react-native-async-storage/async-storage');
  await AsyncStorage.clear();
  return {
    AsyncStorage,
    module: require('@/store/gameStore'),
  };
}

async function freshStoreWithSeed(seed: Record<string, string>) {
  jest.resetModules();
  const {default: AsyncStorage} = require('@react-native-async-storage/async-storage');
  await AsyncStorage.clear();
  for (const [k, v] of Object.entries(seed)) {
    await AsyncStorage.setItem(k, v);
  }
  return {
    AsyncStorage,
    module: require('@/store/gameStore'),
  };
}

async function waitForHydration(store: {
  persist: {hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void};
}) {
  if (store.persist.hasHydrated()) return;
  await new Promise<void>(resolve => {
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

async function flushWrites() {
  await new Promise<void>(r => setTimeout(() => r(), 0));
}

function readPersisted(raw: string | null): {version: number; state: PersistedGameState} {
  if (!raw) throw new Error('no persisted blob');
  return JSON.parse(raw);
}

describe('persist middleware — write side', () => {
  it('writes state under edhcounter:game:v1 after a mutation', async () => {
    const {AsyncStorage, module} = await freshStore();
    await waitForHydration(module.useGameStore);

    module.useGameStore.getState().setNumPlayers({playerCount: 4});
    module.useGameStore.setState((prev: GameStore) => ({
      players: {
        ...prev.players,
        0: {...prev.players[0], lTotal: 37, delta: -3},
      },
    }));
    await flushWrites();

    const raw = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    const blob = readPersisted(raw);
    expect(blob.version).toBe(1);
    expect(blob.state.players[0]!.lTotal).toBe(37);
  });

  it('does not persist delta', async () => {
    const {AsyncStorage, module} = await freshStore();
    await waitForHydration(module.useGameStore);

    module.useGameStore.getState().setNumPlayers({playerCount: 2});
    module.useGameStore.setState((prev: GameStore) => ({
      players: {
        ...prev.players,
        0: {...prev.players[0], lTotal: 30, delta: -10},
      },
    }));
    await flushWrites();

    const raw = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    const blob = readPersisted(raw);
    expect('delta' in blob.state.players[0]!).toBe(false);
  });

  it('does not persist startingPlayerId', async () => {
    const {AsyncStorage, module} = await freshStore();
    await waitForHydration(module.useGameStore);

    module.useGameStore.getState().setNumPlayers({playerCount: 2});
    module.useGameStore.setState({startingPlayerId: 1});
    await flushWrites();

    const raw = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    const blob = readPersisted(raw) as unknown as {
      state: Record<string, unknown>;
    };
    expect('startingPlayerId' in blob.state).toBe(false);
  });

  it('resetGame overwrites the persisted blob with default players', async () => {
    const {AsyncStorage, module} = await freshStore();
    await waitForHydration(module.useGameStore);

    module.useGameStore.getState().setNumPlayers({playerCount: 3});
    module.useGameStore.setState((prev: GameStore) => ({
      players: {
        ...prev.players,
        0: {...prev.players[0], lTotal: 5, history: [-35]},
      },
    }));
    await flushWrites();

    module.useGameStore.getState().resetGame();
    await flushWrites();

    const raw = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    const blob = readPersisted(raw);
    expect(blob.state.players[0]!.lTotal).toBe(40);
    expect(blob.state.players[0]!.history).toEqual([]);
  });
});

describe('persist middleware — hydrate side', () => {
  it('rehydrates lTotal from a stored blob', async () => {
    const seed = {
      [GAME_STORAGE_KEY]: JSON.stringify({
        version: 1,
        state: {
          numPlayers: 2,
          alt: false,
          gameLayout: [1, 0, 0, 1],
          players: {
            0: {id: 0, lTotal: 37, history: [-3], Cdmg: {}, chain: false, poison: 0, energy: 0, experience: 0},
            1: {id: 1, lTotal: 40, history: [], Cdmg: {}, chain: false, poison: 0, energy: 0, experience: 0},
          },
        },
      }),
    };
    const {module} = await freshStoreWithSeed(seed);
    await waitForHydration(module.useGameStore);

    expect(module.useGameStore.getState().players[0]!.lTotal).toBe(37);
    expect(module.useGameStore.getState().numPlayers).toBe(2);
  });

  it('defaults delta to 0 after rehydrate even if missing in blob', async () => {
    const seed = {
      [GAME_STORAGE_KEY]: JSON.stringify({
        version: 1,
        state: {
          numPlayers: 2,
          alt: false,
          gameLayout: [1, 0, 0, 1],
          players: {
            0: {id: 0, lTotal: 37, history: [-3], Cdmg: {}, chain: false, poison: 0, energy: 0, experience: 0},
            1: {id: 1, lTotal: 40, history: [], Cdmg: {}, chain: false, poison: 0, energy: 0, experience: 0},
          },
        },
      }),
    };
    const {module} = await freshStoreWithSeed(seed);
    await waitForHydration(module.useGameStore);

    expect(module.useGameStore.getState().players[0]!.delta).toBe(0);
    expect(module.useGameStore.getState().players[1]!.delta).toBe(0);
  });

  it('migrates a version-0 blob by resetting to defaults', async () => {
    const seed = {
      [GAME_STORAGE_KEY]: JSON.stringify({
        version: 0,
        state: {
          numPlayers: 999,
          players: {0: {weird: 'shape'}},
        },
      }),
    };
    const {module} = await freshStoreWithSeed(seed);
    await waitForHydration(module.useGameStore);

    // Migration must drop the unreadable v0 payload.
    expect(module.useGameStore.getState().numPlayers).toBe(0);
    expect(module.useGameStore.getState().players).toEqual({});
  });
});

describe('persist middleware — error handling', () => {
  it('does not crash when setItem fails', async () => {
    const {AsyncStorage, module} = await freshStore();
    await waitForHydration(module.useGameStore);

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const setItemSpy = jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValue(new Error('quota exceeded'));

    expect(() => {
      module.useGameStore.getState().setNumPlayers({playerCount: 2});
    }).not.toThrow();
    await flushWrites();

    expect(warnSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
