# mailchannels-react-email

This package provides a simple interface for integrating MailChannels in your app, with optional support for [react-email](https://react.email/). It supports development mode logging and seamless DKIM signing.

## Features

- Full support for MailChannels features
- Optional integration for [react-email](https://react.email/)
- Development mode for fast testing (console)
- Environment-based or explicit DKIM configuration

## Installation

```bash
npm install mailchannels-react-email
```

## Quick Start

For how to set up Mailchannels with Cloudflare, see [their documentation](https://developers.cloudflare.com/pages/functions/plugins/mailchannels/#enable-mailchannels-for-your-account---domain-lockdown).

### Sending Basic Emails

```js
import sendEmail from "mailchannels-react-email";

try {
  await sendEmail({
    subject: "Test email",
    text: "This is a test email",
    from: { name: "John Doe", email: "john@example.com" },
    to: "smith@example.com",
  });
} catch (e) {
  console.error(`Error sending the mail: ${e.message}`);
}
```

### Using React Components for Emails

```js
import sendEmail from "mailchannels-react-email/react-email";
import TestEmail from "./testmail";

try {
  await sendEmail(<TestEmail />, {
    subject: "Test email",
    from: { name: "John Doe", email: "john@example.com" },
    to: { email: "smith@example.com" },
  });
} catch (e) {
  console.error(`Error sending the mail: ${e.message}`);
}
```

## API Reference

### DKIM

Mailchannels supports signing your emails using DKIM. You can either supply the dkim domain, selector and private key, or just provide them as environment variables `DKIM_DOMAIN`, `DKIM_SELECTOR`, `DKIM_PRIVATE_KEY`, which will be automatically picked up.

### Email options

```ts
type EmailOptions = {
  subject: string;
  text: string;
  html?: string;
  from: MailContact;
  to: MailContacts;
  cc?: MailContacts;
  bcc?: MailContacts;
  replyTo?: MailContact;
  dkim?: {
    domain: string;
    selector: string;
    privateKey: string;
  };
  attachments?: Array<Attachment>;
};

type MailContact = string | { name?: string; email: string };
type MailContacts = MailContact | Array<MailContact>;

type Attachment = {
  contentType: string;
  filename: string;
  content: Buffer | ArrayBuffer | string; // base64 encoded string
};
```
