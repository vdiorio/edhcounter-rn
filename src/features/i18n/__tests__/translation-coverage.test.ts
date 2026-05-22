import en from '../locales/en.json';
import pt from '../locales/pt.json';

describe('translation coverage', () => {
  it('en and pt share the same set of keys', () => {
    const enKeys = Object.keys(en).sort();
    const ptKeys = Object.keys(pt).sort();
    expect(ptKeys).toEqual(enKeys);
  });

  it.each(Object.entries(en))('en.%s is non-empty', (_key, value) => {
    expect(value).not.toBe('');
  });

  it.each(Object.entries(pt))('pt.%s is non-empty', (_key, value) => {
    expect(value).not.toBe('');
  });
});
