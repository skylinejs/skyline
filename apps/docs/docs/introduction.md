---
sidebar_position: 1
---

# Introduction

SkylineJS is a collection of loosley coupled libraries for building efficient, secure and scalable Node.js server-side applications. It is a companion toolkit to your framework of choice (which should be NestJS), solving common tasks every server-side application has to perform such as parsing environment variables, performance monitoring or caching.

Instead of building these on your own, SkylineJS provides you with libraries that are:

- TypeScript native
- Zero or minimal dependency
- Full test coverage
- Production tested

You can use any library on its own so solve a particular problem.

## Framework versus library

If you are one of those developers that uses the words "Framework" and "Library" interchangeably, stop now. A framework operates under the Hollywood principle: "Don't call us - we call you". The framework takes over the flow of the application and calls your code as needed. NestJS is an example for an excellent framework that does all the heavy lifting to create an environment you can easily develop a web server in.

SkylineJS is intentionally designed as a collection of libraries, not a framework. An application can only run a single framework. However, once you have chosen your framework, you need several libraries to solve particular problems like hashing a password or handling file uploads. A library solves one problem without any assumptions about the rest of your application. A framework does the opposite, it takes all these building blocks and is responsible for composing them into an application that achieves a goal e.g., a web server that can authenticate users.
