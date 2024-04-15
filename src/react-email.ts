import * as React from 'react';
import { renderAsync } from '@react-email/render';
import { EmailOptions, sendEmail as sendMailchannelsEmail } from './index.js';

export async function sendEmail(
    email: React.ReactElement,
    options: Omit<EmailOptions, 'text' | 'html'>,
) {
    const [html, text] = await Promise.all([
        renderAsync(email),
        renderAsync(email, { plainText: true }),
    ]);

    return sendMailchannelsEmail({
        text,
        html,
        ...options,
    });
}
