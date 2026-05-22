import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {
  AVAILABLE_LANGUAGES,
  PREFERENCES_STORAGE_KEY,
  type LanguageCode,
} from '@/features/i18n/constants';

export type PreferencesStore = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
};

function detectInitialLanguage(): LanguageCode {
  const locales = RNLocalize.getLocales();
  const first = locales[0]?.languageCode;
  return AVAILABLE_LANGUAGES.some(l => l.code === first)
    ? (first as LanguageCode)
    : 'en';
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    set => ({
      language: detectInitialLanguage(),
      setLanguage: lang => set({language: lang}),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
