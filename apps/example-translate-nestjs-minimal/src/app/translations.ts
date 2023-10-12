import { SkylineTranslate } from '@skyline-js/translate';

export const Translations = new SkylineTranslate(
  {
    en: {
      registrationEmail: {
        subject: 'Welcome to SkylineJS, {{ email }}',
        body: 'Hello {{ email }},\n\nWelcome to SkylineJS! We are happy to have you on board.\n\nBest regards,\nSkylineJS Team',
      },
    },
    de: {
      registrationEmail: {
        subject: 'Willkommen bei SkylineJS, {{ email }}',
        body: 'Hallo {{ email }},\n\nWillkommen bei SkylineJS! Wir freuen uns, dich an Bord zu haben.\n\nBeste Grüße,\nSkylineJS Team',
      },
    },
  },
  {
    fallbackLanguage: 'en',
  },
);
