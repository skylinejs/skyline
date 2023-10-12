---
sidebar_position: 5
slug: /translation
title: Translation
draft: true
---

# Translation

:::info

This page describes the guiding principles of the Skyline translation approach. <br />
The API reference of the `@skyline-js/translate` package can be found here: [@skyline-js/translate](/docs/api-reference/translate)

:::

## Introduction

Translating things is a task that causes the utmost annoyance to a developer. After all, why do people bother speaking any language other than english? We do not translate code and it works just fine. So why do we have to put up with this layer of indirection for every single string in our application?

While this documentation can neither change the mind of your product manager nor the language of your application's users, it can provide you with tools and implementation patterns to make translating things less cumbersome.

A quick word on server-side translations. Do not translate your API responses unless you have a good reason to. Let this be the concern of the API consumer. This document is focused on common client-side as well as server-side translation use-cases, such as sending emails or mobile push notifications in multiple languages. Furthermore, `@skyline-js/translate` is not platform dependent so you can use it in your client applications for translation as well.

## Basic concepts

As usual, we do things a little different around here. First, we vehemently reject the notion of translation files. Such files are usually created for each language (`en.json`, `de.json`, `es.json`, ...) and are lazy loaded when that language is required by the application. This approach has the following flaws:

- One giant translation file per language gets hard to maintain
- Lazy loading is only possible on a language basis, not on a feature basis
- No guarantuee that your translation keys are present in every translation file
- No compiler or IDE support for misspelling translation keys
- No compiler or IDE support for misspelling translation template parameters
- Developer needs to jump around the codebase to find or add translation strings
- Changing the application language is sluggish because the new (huge) translation file needs to be loaded first
- If the file is not present or loading it fails due to some reason, your application is broken.

Instead, we have small translation objects for each feature that are imported like any other code, so they are part of the regular compilation process.

A translation object looks like this:

```ts
import { SkylineTranslate } from '@skyline-js/translate';

export const RegistrationEmail = new SkylineTranslate({
  EN: {
    subject: 'Please confirm your email address',
    body: 'Thanks for signing up. Confirm your email address here: {{ link }}',
  },
  DE: {
    subject: 'Bitte bestätige deine E-Mail Adresse',
    body: 'Danke für deine Anmeldung. Bestätige deine E-Mail Adressse hier: {{ link }}',
  },
});
```

The translation object can be used like this:

```ts
import { randomUUID } from 'crypto';
import { RegistrationEmail } from './registration-email.translation';

// ...

const lang = 'EN';
const token = randomUUID();
const link = `https://skylinejs.com/signup?auth=${token}`;

await email.send({
  subject: RegistrationEmail.translate(lang, RegistrationEmail.key.subject),
  body: RegistrationEmail.translate(lang, RegistrationEmail.key.body, { link }),
});

// ...
```

<!-- Locality of Behaviour (LoB) -->

<!--
## How we get to 0% translation runtime errors

Translation code is notorious for two error sources:

- Missing translation strings: You forgot to add a translation for a newly introduced string.
- Typos when specifying the translation key

Due to a lack of type-safety, both classes of errors go undetected until a customer complains about an empty string in your application (this is not good). It is quite easy to eliminate both error sources leveraging TypeScript. This has the useful side-effect of providing auto-completion for translation keys inside your IDE!

```ts

```

Concern: "This adds huge bundle size to application!"
Answer: Well having an additional translation file side-by-side to the rest of the code of that feature does not make a difference. If you have a lot of features you need to lazy load their code anyways, one more file hardly makes the difference. on the contrary, you do not need 2 lazy loading mechanisms but only one because the translation file is now the same as the rest of the feature's code.

-->

# Code example walkthrough

<Tabs path="apps/example-translate-nestjs-minimal/src/app/" order="app.controller.ts, translations.ts">
<TabItem value="app.controller" label="app.controller.ts">

```ts
import { Body, Controller, Post, Req } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { Translations } from './translations';
import type { Request } from 'express';
import { parseHttpHeaderAcceptLanguages } from '@skyline-js/translate';

@Controller()
export class AppController {
  private readonly transporter = createTransport({
    host: 'skyline_mailhog',
    port: 1025,
    secure: false,
  });

  @Post('register')
  async sendRegistrationEmail(@Req() req: Request, @Body() input: { email: string }) {
    const language = parseHttpHeaderAcceptLanguages(req.headers)[0];

    // Translate email subject
    const subject = Translations.translate(Translations.key.registrationEmail.subject, {
      params: { email: input.email },
      language,
    });

    // Translate email body
    const body = Translations.translate(Translations.key.registrationEmail.body, {
      params: { email: input.email },
      language,
    });

    // Send email
    await this.transporter.sendMail({
      from: 'info@skylinejs.com',
      to: input.email,
      subject,
      text: body,
    });

    return { success: true };
  }
}
```

</TabItem>
<TabItem value="translations" label="translations.ts">

```ts
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
```

</TabItem>
<TabItem value="app.module" label="app.module.ts">

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({ controllers: [AppController] })
export class AppModule {}
```

</TabItem>
</Tabs>
