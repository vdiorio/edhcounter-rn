import {create} from 'zustand';
import {createCoreSlice, type CoreSlice} from './coreSlice';

/**
 * The composed game store. Spec 03 lays the foundation with CoreSlice only;
 * Specs 07/09/10/12 extend the type and composition with their own slices.
 *
 * When adding a new slice:
 *  1. Extend the `GameStore` intersection with the slice's type.
 *  2. Spread `createXSlice(set, get, store)` into the composer below.
 *  3. (Spec 04) Update persistConfig to whitelist/blacklist any new fields.
 */
export type GameStore = CoreSlice;

export const useGameStore = create<GameStore>()((set, get, store) => ({
  ...createCoreSlice(set, get, store),
}));
