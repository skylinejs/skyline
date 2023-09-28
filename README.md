# @skyline-js

<p align="center">
  <a href="https://skylinejs.com/" target="blank"><img src="https://raw.githubusercontent.com/skylinejs/skylinejs.github.io/main/img/logo-skyline-wide.png" width="100%" alt="Skyline" /></a>
</p>

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
