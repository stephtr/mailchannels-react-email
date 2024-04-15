export type MailContact =
    | {
        name?: string;
        email: string;
    }
    | string;
export type MailContacts = MailContact | Array<MailContact>;

export type EmailOptions = {
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
}

function mailContactToType(contact: MailContact): {
    name?: string;
    email: string;
} {
    if (typeof contact === 'string') {
        return { email: contact };
    }
    return contact;
}

function mailContactsToType(contacts: MailContacts): Array<{
    name?: string;
    email: string;
}> {
    return Array.isArray(contacts)
        ? contacts.map(mailContactToType)
        : [mailContactToType(contacts)];
}

function sendDevMail(options: EmailOptions) {
    const { subject, to } = options;
    const toContact = mailContactsToType(to)
        .map((c) => (c.name ? `${c.name} <${c.email}>` : c.email))
        .join(', ');
    // eslint-disable-next-line no-console
    console.log(`\n📧 to ${toContact}: ${subject}\n${options.text}\n`);
}

export async function sendEmail(options: EmailOptions) {
    if (process.env.NODE_ENV === 'development') {
        return sendDevMail(options);
    }
    let { dkim } = options;
    if (
        !dkim &&
        process.env.DKIM_DOMAIN &&
        process.env.DKIM_SELECTOR &&
        process.env.DKIM_PRIVATE_KEY
    ) {
        dkim = {
            domain: process.env.DKIM_DOMAIN,
            selector: process.env.DKIM_SELECTOR,
            privateKey: process.env.DKIM_PRIVATE_KEY,
        };
    }
    const request = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: mailContactToType(options.from),
            subject: options.subject,
            personalizations: [
                {
                    to: mailContactsToType(options.to),
                    cc: options.cc ? mailContactsToType(options.cc) : undefined,
                    bcc: options.bcc
                        ? mailContactsToType(options.bcc)
                        : undefined,
                    reply_to: options.replyTo
                        ? mailContactToType(options.replyTo)
                        : undefined,
                    dkim_domain: dkim?.domain ?? undefined,
                    dkim_private_key: dkim?.privateKey ?? undefined,
                    dkim_selector: dkim?.selector ?? undefined,
                },
            ],
            content: [
                {
                    type: 'text/plain',
                    value: options.text,
                },
                ...(options.html
                    ? [
                        {
                            type: 'text/html',
                            value: options.html,
                        },
                    ]
                    : []),
            ],
        }),
    });
    if (request.status !== 202) {
        throw new Error(
            `Failed to send email: ${request.status} ${await request.text()}`,
        );
    }
}
