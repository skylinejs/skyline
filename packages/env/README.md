<p align="center">
  <a href="https://skylinejs.com/docs/environment" target="blank"><img src="https://raw.githubusercontent.com/skylinejs/skyline/main/apps/docs/static/img/skylinejs-social.png" width="100%" alt="Skyline" /></a>
</p>

<p align="center">
Type safe, simple environment variable parsing with runtime validation.
</p>

Parsing environment variables does not have to be chaotic. The `@skyline-js/env` package provides a clean API for parsing and validating environment variables as well as setting deafults for different environments (e.g., development, CI/CD, production). The question "What value does this environment variable have in production?" should be easy to answer without having to go through deployment scripts. Rely on each environment variable to be parsed and validated at the start-up of your application, so a missing authentication token is immediately spotted on deployment and not afterwards when the authentication token is needed to fullfill a request.

The `@skyline-js/env` package allows you to:

- Parse environment variables of any data type (`boolean`, `number`, `string`, ...), an array of a basic data type or as an JSON object.
- Validate the value of an environment variable such has minimum and maximum for numbers, regular expression matching for strings and so on.
- Provide default values for different environments (development, CI/CD, production, ...)
- Encryption and decryption of sensitive content with a master key (secrets vault pattern)

# Getting started

Install `@skyline-js/env` using your preferred package manager:

```sh
npm install @skyline-js/env
```

This is a minimal example of how to parse an environment variable:

```ts
const parser = new SkylineEnv();

export const env = {
  dbHost: parser.parseString('SERVER_DB_HOST'),
  dbPassword: parser.parseString('SERVER_DB_PASS'),
  dbSecureConnection: parser.parseBoolean('SERVER_DB_SECURE_CONNECTION'),
};
```
