import { SkylineTranslation, configureSkylineTranslation } from './translate';

enum Language {
  EN = 'EN',
  DE = 'DE',
  ES = 'ES',
}

describe('translate', () => {
  it('should work', () => {
    const Registration = new SkylineTranslation({
      [Language.EN]: {
        headline: 'Register',
        greeting: 'Hello {{ username }}!',
        nested: {
          one: 'One',
        },
      },
      [Language.DE]: {
        headline: 'Registrieren',
        greeting: 'Hallo {{ username }}!',
        nested: {
          one: 'Eins',
        },
      },
    });

    const language: Language = Language.EN;
    expect(
      Registration.translate(Registration.key.headline, { language })
    ).toBe('Register');
    expect(
      Registration.translate(Registration.key.headline, {
        language: Language.DE,
      })
    ).toBe('Registrieren');

    expect(
      Registration.translate(Registration.key.greeting, {
        language: Language.EN,
      })
    ).toBe('Hello {{ username }}!');

    expect(
      Registration.translate(Registration.key.greeting, {
        language: Language.EN,
        params: { username: 'John' },
      })
    ).toBe('Hello John!');

    expect(
      Registration.translate(Registration.key.greeting, {
        language: Language.DE,
      })
    ).toBe('Hallo {{ username }}!');

    expect(
      Registration.translate(Registration.key.greeting, {
        language: Language.DE,
        params: { username: 'Johnny' },
      })
    ).toBe('Hallo Johnny!');

    expect(
      Registration.translate(Registration.key.nested.one, {
        language: Language.EN,
      })
    ).toBe('One');

    expect(
      Registration.translate(Registration.key.nested.one, {
        language: Language.DE,
      })
    ).toBe('Eins');
  });

  it('configureSkylineTranslation', () => {
    const SkylineTranslation = configureSkylineTranslation({
      throwOnMissingTranslation: true,
    });
    const Registration = new SkylineTranslation({
      [Language.EN]: {
        headline: 'Register',
        greeting: 'Hello {{ username }}!',
        nested: {
          one: 'One',
        },
      },
      [Language.DE]: {
        headline: 'Registrieren',
        greeting: 'Hallo {{ username }}!',
        nested: {
          one: 'Eins',
        },
      },
    });
  });
});
