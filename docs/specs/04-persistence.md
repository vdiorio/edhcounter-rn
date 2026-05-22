# 04 — Persistence

## Purpose
Persist `gameStore` state across app restarts using `zustand/middleware/persist` over AsyncStorage. New behavior vs. the current Expo app (which loses game state on kill). Designed with explicit allow-list of persisted fields, schema versioning for migrations, and exclusion of transient fields like `delta` and timers.

## Public API

```ts
// src/features/persistence/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

export const asyncStorageAdapter: StateStorage = { getItem, setItem, removeItem };

// src/features/persistence/middleware.ts
import { PersistOptions } from 'zustand/middleware';
import { GameStore } from '@/store/gameStore';

export const persistConfig: PersistOptions<GameStore, PersistedGameState>;

export type PersistedGameState = {
  numPlayers: number;
  gameLayout: [number, number, number, number];
  players: Record<number, PersistedPlayer>;
  monarchPlayerId: number | null;
  initiativePlayerId: number | null;
  showMonarchBar: boolean;
  showInitiativeBar: boolean;
};

export type PersistedPlayer = {
  id: number;
  lTotal: number;
  history: number[];
  Cdmg: Record<number, [number, number]>;
  chain: boolean;
  poison: number;
  energy: number;
  experience: number;
};
```

### Persistence rules
- **Persisted:** all of the above (`PersistedGameState`).
- **Not persisted:** `delta`, `startingPlayerId`, in-flight timer IDs, any UI state (sidebar selection, animations).
- **Storage key:** `edhcounter:game:v1`.
- **Version:** `1`. Future shape changes bump this and add a migration.

## Dependencies
- 03-game-store-core (the store being wrapped).

## Behavior spec (TDD anchor)

1. After `incrementLife({ playerId: 0, value: -3 })` and a `flush`, AsyncStorage at key `edhcounter:game:v1` contains `players[0].lTotal === 37`.
2. The persisted JSON does NOT include `delta` (zero or otherwise) or `startingPlayerId` for any player.
3. On fresh store creation with an existing persisted blob, `players[0].lTotal === 37` is rehydrated.
4. After rehydrate, `players[0].delta === 0` (transient field defaulted, not loaded).
5. After rehydrate, no delta-reset timers are scheduled (verified by checking the timer map is empty).
6. `resetGame()` overwrites the persisted blob with default state.
7. A persisted blob with `version: 0` triggers a migration path (initially a no-op that resets to defaults; future versions can supply real migrations).
8. AsyncStorage errors (e.g., quota) are caught and logged via `console.warn`; the app does not crash.

## Acceptance tests
- `persistence.test.ts`:
  - Uses `@react-native-async-storage/async-storage/jest/async-storage-mock`.
  - Covers behaviors 1–8.
- `persistence.partialize.test.ts`: confirms the `partialize` function returns only allow-listed fields for an arbitrary store snapshot.

## Non-goals
- Does not persist `StyleStore` (player colors). Theming reshuffles on each game reset; that behavior is preserved.
- Does not persist `PreferencesStore` (language) — that store has its own persist config in feature 16.
- Does not implement real migrations (only the migration scaffold). Migrations are added as schema changes are introduced.

## Notes for the implementer
- Use Zustand's `partialize` option to pick the allow-listed fields. Do NOT use `omit` — silent inclusion of new state is the wrong default.
- `onRehydrateStorage` should reset the in-memory delta-timer map and zero out all players' `delta` fields.
- For tests, clear AsyncStorage in `beforeEach` and force a fresh store import (use `jest.resetModules()` or expose a `createGameStore()` factory used only in tests).
- The persist middleware writes synchronously to AsyncStorage on every change. For high-frequency actions (hold-to-repeat), consider throttling via `zustand/middleware`'s `merge` + a custom debounce — but only if profiling shows write storms. Default behavior is acceptable.
