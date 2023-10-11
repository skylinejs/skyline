import { SkylineTranslate, configureSkylineTranslate } from './translate';

enum Language {
  EN = 'EN',
  DE = 'DE',
  ES = 'ES',
}

describe('SkylineTranslate', () => {
  it('Simple translation', () => {
    const Registration = new SkylineTranslate({
      [Language.EN]: {
        headline: 'Register',
        greeting: 'Hello {{ username }}!',
        greeting2: 'Hello {{{ username }}}!',
        nested: {
          one: 'One',
        },
      },
      [Language.DE]: {
        headline: 'Registrieren',
        greeting: 'Hallo {{ username }}!',
        greeting2: 'Hallo {{{ username }}}!',
        nested: {
          one: 'Eins',
        },
      },
    });

    const language: Language = Language.EN;
    expect(Registration.translate(Registration.key.headline, { language })).toBe('Register');
    expect(
      Registration.translate(Registration.key.headline, {
        language: Language.DE,
      }),
    ).toBe('Registrieren');

    expect(
      Registration.translate(Registration.key.greeting, {
        language: Language.EN,
        handleMissingParam: 'keep',
      }),
    ).toBe('Hello {{ username }}!');

    expect(
      Registration.translate(Registration.key.greeting, {
        language: Language.EN,
        params: { username: 'John' },
      }),
    ).toBe('Hello John!');

    expect(
      Registration.translate(Registration.key.greeting, {
        language: Language.DE,
      }),
    ).toBe('Hallo {{ username }}!');

    expect(
      Registration.translate(Registration.key.greeting, {
        language: Language.DE,
        params: { username: 'Johnny' },
      }),
    ).toBe('Hallo Johnny!');

    expect(
      Registration.translate(Registration.key.greeting2, {
        language: Language.DE,
        params: { username: 'Johnny' },
      }),
    ).toBe('Hallo {Johnny}!');

    expect(
      Registration.translate(Registration.key.nested.one, {
        language: Language.EN,
      }),
    ).toBe('One');

    expect(
      Registration.translate(Registration.key.nested.one, {
        language: Language.DE,
      }),
    ).toBe('Eins');
  });

  it('Translate with parameters', () => {
    const Registration = new SkylineTranslate({
      en: {
        subject: 'Hello {{ username }}!',
      },
      de: {
        subject: 'Hallo {{ username }}!',
      },
    });

    expect(Registration.translate(Registration.key.subject)).toBe('');

    expect(
      Registration.translate(Registration.key.subject, {
        language: 'en',
        params: { username: 'John' },
      }),
    ).toBe('Hello John!');

    expect(
      Registration.translate(Registration.key.subject, {
        fallbackLanguage: 'en',
        params: { username: 'John' },
      }),
    ).toBe('Hello John!');

    expect(
      Registration.translate(Registration.key.subject, {
        language: 'de',
        fallbackLanguage: 'en',
        params: { username: 'John' },
      }),
    ).toBe('Hallo John!');
  });

  it('Interpolation with object params', () => {
    const Registration = new SkylineTranslate({
      en: {
        subject: 'Hello {{ user.name }}!',
      },
      de: {
        subject: 'Hallo {{ user.name }}!',
      },
    });

    expect(
      Registration.translate(Registration.key.subject, {
        language: 'en',
        params: { user: { name: 'John' } },
      }),
    ).toBe('Hello John!');
  });

  it('Custom interpolation', () => {
    const Registration = new SkylineTranslate({
      en: {
        subject: 'Hello [[ username ]]!',
      },
      de: {
        subject: 'Hallo [[ username ]]!',
      },
    });

    expect(
      Registration.translate(Registration.key.subject, {
        language: 'en',
        params: { username: 'John' },
      }),
    ).toBe('Hello [[ username ]]!');

    expect(
      Registration.translate(Registration.key.subject, {
        language: 'en',
        interpolation: /\[\[([^}]+)\]\]/g,
        params: { username: 'John' },
      }),
    ).toBe('Hello John!');

    expect(
      Registration.translate(Registration.key.subject, {
        language: 'en',
        interpolation: { prefix: '[[', suffix: ']]' },
        params: { username: 'Johnny' },
      }),
    ).toBe('Hello Johnny!');

    expect(
      Registration.translate(Registration.key.subject, {
        language: 'en',
        interpolation: { prefix: '[', suffix: ']' },
        params: { username: 'Johnny' },
      }),
    ).toBe('Hello [Johnny]!');
  });

  it('configureSkylineTranslate', () => {
    const SkylineTranslate = configureSkylineTranslate({});

    const Registration = new SkylineTranslate({
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
