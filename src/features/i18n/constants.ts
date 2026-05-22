export type LanguageCode = 'en' | 'pt';

export const AVAILABLE_LANGUAGES: ReadonlyArray<{
  code: LanguageCode;
  name: string;
  flag: string;
}> = [
  {code: 'en', name: 'English', flag: '🇺🇸'},
  {code: 'pt', name: 'Português', flag: '🇧🇷'},
];

export const PREFERENCES_STORAGE_KEY = 'edhcounter:preferences:v1';
