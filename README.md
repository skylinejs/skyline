<p align="center">
  <a href="https://skylinejs.com/" target="blank"><img src="https://raw.githubusercontent.com/skylinejs/skyline/main/apps/docs/static/img/skylinejs-social.png" width="100%" alt="Skyline" /></a>
</p>

SkylineJS is a collection of libraries for building efficient, secure and scalable Node.js server-side applications. It is a companion toolkit to your framework of choice (e.g., NestJS), solving common tasks every server-side application has to perform such as parsing environment variables, performance monitoring or caching.

SkylineJS contributes two major pieces to solving common server-side problems:

1. **Education**: an in-depth explanation of why you should do something a certain way.
2. **Code**: provide you with the necessary code to act on the knowledge you just gained.

## Publishable library

- https://nx.dev/concepts/more-concepts/buildable-and-publishable-libraries

```
nx generate @nx/js:library --publishable --directory packages/example --importPath @skyline-js/example example
```

## Nx commands

```
nx generate @nx/workspace:move --project cache --destination packages/cache
nx generate @nx/node:application cache-example-nestjs-minimal
```
