import AsyncStorage from '@react-native-async-storage/async-storage';
import type {StateStorage} from 'zustand/middleware';

/**
 * StateStorage adapter that wraps AsyncStorage and turns failures into
 * console.warn entries instead of unhandled rejections. Persist errors are
 * non-fatal: the in-memory store keeps working, but the next launch may not
 * see the latest mutation.
 */
export const asyncStorageAdapter: StateStorage = {
  getItem: async key => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      console.warn('[persistence] getItem failed', key, err);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.warn('[persistence] setItem failed', key, err);
    }
  },
  removeItem: async key => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn('[persistence] removeItem failed', key, err);
    }
  },
};
