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
- Developer needs to jump around the codebase for finding or adding translation strings
- Changing the application language is sluggish because the new (huge) translation file needs to be loaded first
- If the file is not present or loading it fails due to some other reason, your application is broken.

<!-- Locality of Behaviour (LoB) -->

## How we get to 0% translation runtime errors

Translation code is notorious for two error sources:

- Missing translation strings: You forgot to add a translation for a newly introduced string.
- Typos when specifying the translation key

Due to a lack of type-safety, both classes of errors go undetected until a customer complains about an empty string in your application (this is not good). It is quite easy to eliminate both error sources leveraging TypeScript. This has the useful side-effect of providing auto-completion for translation keys inside your IDE!

```ts

```
