---
slug: best-of-typescript-compiler-options
title: Best of TypeScript compiler options
authors: lucy
tags: [typescript, tooling]
---

# Best of TypeScript compiler options

Let's have a look at the the TypeScript compiler options you can set inside your `tsconfig.json`. While workspace management tools such as Nx free us developers from setting up the TypeScript toolchain (which can be a real time sink), it is still worth it to go through the multitude of compiler options to get the most out of your tooling. However, there are a crapton of options and turning on _everything_ might feel good in the moment but will only get you a bunch of `// @ts-ignore` and snarky comments from your teammates :wink: That's why the SkylineJS team assembled the most valuable compiler options in this blog post. Each option has proven over many years to increase code quality and developer productivity while not getting in the way or forcing certain patterns on the developer that have no tangible benefits.

## Motivation

<br />

```mermaid
flowchart TB
    req([HTTP request]) -- validate --> api
    sql([SQL query]) -- validate ---> da
    env([Environment variable]) -- validate ---> bl
    env([Environment variable]) -- validate --> da

    subgraph "Application"
      api[API layer]
      bl[Business logic layer]
      da[Data access layer]
      api === bl
      bl === api
      bl === da
      da === bl
    end

    linkStyle 0 stroke:orange;
    linkStyle 1 stroke:orange;
    linkStyle 2 stroke:orange;
    linkStyle 3 stroke:orange;
    linkStyle 4 stroke:green;
    linkStyle 5 stroke:green;
    linkStyle 6 stroke:green;
    linkStyle 7 stroke:green;
```

<br />

While TypeScript can ensure that no runtime errors happen when passing data between the type-safe components of your application, the data might still have an "unsafe" origin. An example for an origin that cannot be validated by the TypeScript compiler is the result of an SQL query. While you can specify an interface for the result data, the SQL query might still return totally different data at runtime. This can lead to issues that are difficult to debug, so we should fix the root cause by validating that the result of the SQL query machtes the TypeScript interface. We can accomplish this by using JSON schema validation without introducing any real performance penalty (e.g., by using the `ajv` library). The same approach can and should be taken for all other unsafe sources of runtime values such as environment variables or HTTP requests.

I call this approach "end-to-end type safety". If you can rely on the runtime values to match their TypeScript interface - because you validate them when they enter your application boundary - and your application ensures the correct accessing and passing of such values using TypeScript, you pretty much eliminate all runtime errors. Of course there are always edge-cases that slip through, but you should be able to reduce the time you spend inside a debugger by 90+ percent.

## Compiler options that are worth your time

These compile options are pretty cool and should be used in every TypeScript project! They are ordered by most to least important. You can check out the complete list of options here: https://www.typescriptlang.org/tsconfig

### `strictNullChecks`

Strict null checks are not merely a convenient way to reduce the number of `cannot read property of undefined` errors, they are a way of living!<!-- walking through life --> Developers with `strictNullChecks` enabled have a certain spring in their step, they ooze with confidence and are generally

### `noImplicitReturns`
