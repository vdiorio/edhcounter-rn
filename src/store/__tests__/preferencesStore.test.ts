import AsyncStorage from '@react-native-async-storage/async-storage';
import {PREFERENCES_STORAGE_KEY} from '@/features/i18n/constants';

type Locale = {languageCode: 'en' | 'pt'};

function applyLocale(language: 'en' | 'pt'): void {
  const RNLocalize = require('react-native-localize');
  RNLocalize.getLocales.mockReturnValue([
    {
      countryCode: language === 'pt' ? 'BR' : 'US',
      languageTag: `${language}-${language === 'pt' ? 'BR' : 'US'}`,
      languageCode: language,
      isRTL: false,
    } as Locale,
  ]);
}

async function freshStore(language: 'en' | 'pt' = 'en') {
  jest.resetModules();
  applyLocale(language);
  const {default: AsyncStorageReloaded} = require('@react-native-async-storage/async-storage');
  await AsyncStorageReloaded.clear();
  return {
    module: require('../preferencesStore'),
    AsyncStorage: AsyncStorageReloaded,
  };
}

async function freshStoreWithSeed(
  language: 'en' | 'pt',
  storageSeed: Record<string, string> = {},
) {
  jest.resetModules();
  applyLocale(language);
  const {default: AsyncStorageReloaded} = require('@react-native-async-storage/async-storage');
  await AsyncStorageReloaded.clear();
  for (const [k, v] of Object.entries(storageSeed)) {
    await AsyncStorageReloaded.setItem(k, v);
  }
  return {
    module: require('../preferencesStore'),
    AsyncStorage: AsyncStorageReloaded,
  };
}

async function waitForHydration(store: {
  persist: {hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void};
}): Promise<void> {
  if (store.persist.hasHydrated()) return;
  await new Promise<void>(resolve => {
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

describe('preferencesStore', () => {
  it('defaults to en when device locale is not pt', async () => {
    const {module} = await freshStore('en');
    await waitForHydration(module.usePreferencesStore);
    expect(module.usePreferencesStore.getState().language).toBe('en');
  });

  it('seeds language to pt when device locale is pt', async () => {
    const {module} = await freshStore('pt');
    await waitForHydration(module.usePreferencesStore);
    expect(module.usePreferencesStore.getState().language).toBe('pt');
  });

  it('setLanguage updates the store', async () => {
    const {module} = await freshStore('en');
    await waitForHydration(module.usePreferencesStore);
    module.usePreferencesStore.getState().setLanguage('pt');
    expect(module.usePreferencesStore.getState().language).toBe('pt');
  });

  it('writes language to AsyncStorage on setLanguage', async () => {
    const {module, AsyncStorage: storage} = await freshStore('en');
    await waitForHydration(module.usePreferencesStore);
    module.usePreferencesStore.getState().setLanguage('pt');
    await new Promise<void>(r => setTimeout(() => r(), 0));
    const raw = await storage.getItem(PREFERENCES_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.language).toBe('pt');
  });

  it('rehydrates persisted language on cold start, overriding device locale', async () => {
    const seed = {
      [PREFERENCES_STORAGE_KEY]: JSON.stringify({state: {language: 'pt'}, version: 0}),
    };
    const {module} = await freshStoreWithSeed('en', seed);
    await waitForHydration(module.usePreferencesStore);
    expect(module.usePreferencesStore.getState().language).toBe('pt');
  });
});
