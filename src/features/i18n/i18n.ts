import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {usePreferencesStore} from '@/store/preferencesStore';
import en from './locales/en.json';
import pt from './locales/pt.json';

let initialized: Promise<void> | null = null;

export function initI18n(): Promise<void> {
  if (initialized) return initialized;
  const language = usePreferencesStore.getState().language;
  initialized = i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources: {
        en: {translation: en},
        pt: {translation: pt},
      },
      lng: language,
      fallbackLng: 'en',
      interpolation: {escapeValue: false},
    })
    .then(() => undefined);
  return initialized;
}

usePreferencesStore.subscribe(state => {
  if (i18n.isInitialized && i18n.language !== state.language) {
    i18n.changeLanguage(state.language).catch(() => {
      // Language switch is best-effort; ignore rejection.
    });
  }
});

export default i18n;
