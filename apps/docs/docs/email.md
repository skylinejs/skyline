---
sidebar_position: 4
slug: email
draft: true
---

# Email

:::caution In development

This part of SkylineJS is still in development.

:::

Despite the yearly announcement that "email is dead", every server application continues to send out emails.

<!--
## MJML

Mjml is a good balance in complexity and power, does all the email legacy and responsive stuff
Preview in VSCode / Standalone which is nice
Simple imoprt system for sharing components like header/ footer

# Compile and type-safety

Do NOT copile mjml to html at runtime. This process is very compute intensive, complex and error prone. There is no benefit of doing this every time you send an email.
So you want to compile this and then use the result for sending emails.

How to we prevent tokens not being filled?
Everyone received such an email i nthe past" Hello {{username}}". How do we guarantuee that this does not happen?

The email package compiles the mjml to html. Then it parses the template syntax e.g., handlebars and transforms the html to a functoin that takes those as parameters. THis way we achieve type-safety.

Note:

- keep your .mjml file inside the module that it is being used. Otherwise if you delete the module the template will still be there, this is more coherent.

- Register post-processing routines
- html to text for better deliverability

## Testing

email has a lot of steps and components/ infra in between you sending and the user receiving. Most of the time, it is ciritcal to the application (.e.g, registraiotn email)

Therefore paramount to test emails.
You can use mailhog for this as a local SMTP server for DEV/ CI.
However, mailhog api is not good for reliable tests, so this package provides you with the necessary utilities.

-->
