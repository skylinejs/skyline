import { SkylineTranslate } from '@skyline-js/translate';

export const Translations = new SkylineTranslate(
  {
    en: {
      registrationEmail: {
        subject: 'Welcome to SkylineJS, {{ email }}',
        body: `
        Hello {{ email }},
        Welcome to SkylineJS! We are happy to have you on board.

        Best regards,
        SkylineJS Team',
        `,
      },
    },
    de: {
      registrationEmail: {
        subject: 'Willkommen bei SkylineJS, {{ email }}',
        body: `
        Hallo {{ email }},
        Willkommen bei SkylineJS! Wir freuen uns, dich an Bord zu haben.

        Beste Grüße,
        SkylineJS Team
        `,
      },
    },
  },
  {
    fallbackLanguage: 'en',
    languageFuzzyMatching: true,
  },
);
