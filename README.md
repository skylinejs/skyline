<p align="center">
  <a href="https://skylinejs.com/" target="blank"><img src="https://raw.githubusercontent.com/skylinejs/skyline/main/apps/docs/static/img/skylinejs-social.png" width="100%" alt="Skyline" /></a>
</p>

SkylineJS is a collection of open source libraries for building efficient, secure and scalable web applications. It is a companion toolkit to your framework of choice (e.g., NestJS, Angular), solving common tasks every web application has to perform such as parsing environment variables, translating, logging, performance monitoring or caching.

# Philosophy

To create a great web application, it's not enough to know _how_ to do something - you need to understand _why_. This knowledge is often scatters across blog posts and StackOverflow threads, leading to conflicting guidelines and philosophies. The result? A patchwork of libraries, each with its own API style, implementation pattern, and architectural decisions. It can be a frustrating experience for developers trying to maintain consistency and clarity in their applications.

SkylineJS brings two essential elements to the table:

1. **Education**: an in-depth explanation of why you should do something a certain way.
2. **Code**: provide you with the necessary code to act on the knowledge you just gained.

# Getting started

Please check out the documentation for the SkylineJS library that you want to get started with:

- [@skyline-js/env](https://skylinejs.com/docs/environment)
- [@skyline-js/cache](https://skylinejs.com/docs/caching)
- [@skyline-js/translate](https://skylinejs.com/docs/translation)

# Repository structure

The SkylineJS collection of libraries is developed inside this monorepo. The `packages/` directory contains all SkylineJS libraries:

- `packages/env`: The source code of the `@skyline-js/env` library.
- `packages/cli`: The source code of the `@skyline-js/cli` library.
- `packages/cache`: The source code of the `@skyline-js/cache` library.
- `packages/translate`: The source code of the `@skyline-js/translate` library.

The `apps/` directory contains applications that are complimentary to the libraries, such as:

- `apps/docs`: Docusaurus application that powers the documentation at https://skylinejs.com
- `apps/dev-cli`: CLI application that is used to facilitate the handling and development of the SkylineJS monorepo.
- `apps/cache-e2e`: End-to-end testing application for the `@skyline-js/cache` package to test the Redis storage engine with a real Redis instance.
- `apps/cache-example-nestjs-minimal`: Minimal usage example for the `@skyline-js/cache` package with NestJS and TypeORM.
- `apps/cache-example-nestjs-minimal-e2e`: End-to-end testing application for the `apps/cache-example-nestjs-minimal` application.

The `tools/` directory contains some scripts to facilitate local development inside a Docker container. You can simply execute `./start-development` to spin up a local setup.

# Issues

Please submit bugs, feature requests and other issues to this GitHub repository: https://github.com/skylinejs/skyline/issues

# Support

If you find value in the SkylineJS library collection, feel free to reach out!

<!--
## Publishable library

- https://nx.dev/concepts/more-concepts/buildable-and-publishable-libraries

```
nx generate @nx/js:library --publishable --directory packages/example --importPath @skyline-js/example example
```

## Nx commands

```
nx generate @nx/workspace:move --project cache --destination packages/cache
nx generate @nx/node:application example-cache-nestjs-minimal
```
-->
