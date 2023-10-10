import { SkylineTranslation } from './translate';

enum Language {
  EN = 'EN',
  DE = 'DE',
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

    expect(Registration.translate(Language.EN, Registration.key.headline)).toBe(
      'Register'
    );
    expect(Registration.translate(Language.DE, Registration.key.headline)).toBe(
      'Registrieren'
    );

    expect(Registration.translate(Language.EN, Registration.key.greeting)).toBe(
      'Hello {{ username }}!'
    );

    expect(
      Registration.translate(Language.EN, {
        key: Registration.key.greeting,
        params: { username: 'John' },
      })
    ).toBe('Hello John!');

    expect(Registration.translate(Language.DE, Registration.key.greeting)).toBe(
      'Hallo {{ username }}!'
    );

    expect(
      Registration.translate(Language.DE, {
        key: Registration.key.greeting,
        params: { username: 'Johnny' },
      })
    ).toBe('Hallo Johnny!');

    expect(
      Registration.translate(Language.EN, Registration.key.nested.one)
    ).toBe('One');

    expect(
      Registration.translate(Language.DE, Registration.key.nested.one)
    ).toBe('Eins');
  });
});
