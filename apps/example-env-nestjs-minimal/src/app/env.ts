import { SkylineEnv } from '@skylinejs/env';

export enum RuntimeEnvironment {
  DEV = 'DEV',
  CI = 'CI',
  PRD = 'PRD',
}

const parser = new SkylineEnv({
  runtime: process.env.NODE_ENV,
  runtimes: RuntimeEnvironment,
});

export const env = {
  /** Server runtime environment */
  runtime: parser.runtime,

  api: {
    /** Hostname of the API server */
    host: parser.parseString('SERVER_API_HOST', {
      default: 'localhost',
    }),

    /** What port to use for the API server */
    port: parser.parseNumber('SERVER_API_PORT', {
      default: 3000,
    }),
  },

  mail: {
    /** Hostname of the mail server */
    host: parser.parseString('SERVER_MAIL_HOST', {
      default: 'skyline_mailhog',
    }),

    /** What port to use for sending emails */
    port: parser.parseNumber('SERVER_MAIL_PORT', {
      default: 1025,
    }),

    /** Whether to use secure connection for sending emails */
    secure: parser.parseBoolean('SERVER_MAIL_SECURE', {
      default: false,
      PRD: true,
    }),

    /** What email address to use as the sender of emails */
    from: parser.parseString('SERVER_MAIL_FROM', {
      default: 'hello@skylinejs.com',
    }),
  },

  registration: {
    /** What email addresses are allowed to register */
    emailPattern: parser.parseString('SERVER_REGISTRATION_EMAIL_PATTERN', {
      default: '^registrationd+@skylinejs.com$',
      CI: '^registrationd+@skylinejs.com$',
    }),
  },
};
