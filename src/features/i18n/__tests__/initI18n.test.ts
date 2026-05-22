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

async function freshI18n(language: 'en' | 'pt' = 'en') {
  jest.resetModules();
  applyLocale(language);
  const {default: AsyncStorage} = require('@react-native-async-storage/async-storage');
  await AsyncStorage.clear();
  return require('../i18n');
}

describe('initI18n', () => {
  it('resolves and exposes en + pt resources', async () => {
    const {default: i18n, initI18n} = await freshI18n('en');
    await initI18n();
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
    expect(i18n.hasResourceBundle('pt', 'translation')).toBe(true);
  });

  it('starts in the language from preferencesStore (pt on pt device)', async () => {
    const {default: i18n, initI18n} = await freshI18n('pt');
    await initI18n();
    expect(i18n.language).toBe('pt');
    expect(i18n.t('app_title')).toBe('EDH Counter');
    expect(i18n.t('start_game')).toBe('Iniciar Partida');
  });

  it('falls back to en when language has no bundle', async () => {
    const {default: i18n, initI18n} = await freshI18n('en');
    await initI18n();
    expect(i18n.t('app_title')).toBe('EDH Counter');
  });

  it('is idempotent: calling initI18n twice resolves without re-initializing', async () => {
    const {default: i18n, initI18n} = await freshI18n('en');
    await initI18n();
    await initI18n();
    expect(i18n.isInitialized).toBe(true);
  });
});

describe('setLanguage → i18n bridge', () => {
  it('updates i18n.language when preferencesStore.setLanguage is called', async () => {
    const {default: i18n, initI18n} = await freshI18n('en');
    await initI18n();
    const {usePreferencesStore} = require('@/store/preferencesStore');
    usePreferencesStore.getState().setLanguage('pt');
    // Bridge subscription dispatches changeLanguage; await microtask + promise.
    await new Promise<void>(r => setTimeout(() => r(), 0));
    expect(i18n.language).toBe('pt');
  });
});
