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

While this documentation can neither change the mind nor the language of your application's users, it can provide you with tools and implementation patterns to make translating things less cumbersome.

A quick word on server-side translations. Do not translate your API responses unless you have a good reason to. Let this be the concern of the API consumer. This document is more focused on the comman server-side translation use-cases, such as sending emails or mobile push notifications in multiple languages. Furthermore, `@skyline-js/translate` is not platform dependent so you can use it in your client applications for translation as well.

## How to get to 0% translation runtime errors

Translation code is notorious for two error sources:

- Missing translation strings: You forgot to add a translation for a newly introduced string
- Typos when specifying the translation key: Due to a lack of type-safety, errors in the the translation key go undetected until a customer complains about an empty string in your application (this is not good).
