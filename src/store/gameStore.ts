import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {createCdmgSlice, type CdmgSlice} from '@/features/commander-damage';
import {createCountersSlice, type CountersSlice} from '@/features/counters';
import {
  createMonarchInitiativeSlice,
  MONARCH_INITIATIVE_INITIAL_STATE,
  type MonarchInitiativeSlice,
} from '@/features/monarch-initiative';
import {
  clearProliferateUndoStack,
  createProliferateSlice,
  type ProliferateSlice,
} from '@/features/proliferate';
import {createCoreSlice, type CoreSlice} from './coreSlice';
import {createDamageAllSlice, type DamageAllSlice} from '@/features/damage-all';
import {createLifeSlice, type LifeSlice} from '@/features/life-total/slice';
import {persistConfig} from '@/features/persistence/middleware';

/**
 * The composed game store. Spec 03 lays the foundation with CoreSlice;
 * Specs 07/09/10/12 extend the type and composition with their own slices.
 *
 * When adding a new slice:
 *  1. Extend the `GameStore` intersection with the slice's type.
 *  2. Spread `createXSlice(set, get, store)` into the composer below.
 *  3. Update partializeGameState (in features/persistence/middleware.ts) to
 *     allow-list any new fields that should round-trip across restarts.
 */
export type GameStore =
  & CoreSlice
  & LifeSlice
  & CdmgSlice
  & CountersSlice
  & MonarchInitiativeSlice
  & ProliferateSlice
  & DamageAllSlice;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get, store) => {
      const core = createCoreSlice(set, get, store);
      return {
        ...core,
        ...createLifeSlice(set, get, store),
        ...createCdmgSlice(set, get, store),
        ...createCountersSlice(set, get, store),
        ...createMonarchInitiativeSlice(set, get, store),
        ...createProliferateSlice(set, get, store),
        ...createDamageAllSlice(set, get, store),
        setNumPlayers: input => {
          core.setNumPlayers(input);
          clearProliferateUndoStack();
          set({
            ...MONARCH_INITIATIVE_INITIAL_STATE,
            proliferateUndoCountByPlayer: {},
          });
        },
        resetGame: () => {
          core.resetGame();
          clearProliferateUndoStack();
          set({
            ...MONARCH_INITIATIVE_INITIAL_STATE,
            proliferateUndoCountByPlayer: {},
          });
        },
      };
    },
    persistConfig,
  ),
);
