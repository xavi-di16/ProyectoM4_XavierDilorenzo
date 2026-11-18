import {
    SESv2Client,
    SendEmailCommand,
} from '@aws-sdk/client-sesv2';

import type { Task } from '../src/types/task.types.js';

export function escapeHtml(value: string): string {
    const replacements: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };

    return value.replace(
        /[&<>"']/g,
        character => replacements[character] ?? character,
    );
}

export function buildTaskSummary(tasks: Task[]) {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    const summary =
        `Total: ${tasks.length} | ` +
        `Completadas: ${completed} | ` +
        `Pendientes: ${pending}`;

    const lines = tasks.map(task => {
        const state = task.completed
            ? '[Completada]'
            : '[Pendiente]';

        return (
            `${state} ${task.title}` +
            (task.description ? ` — ${task.description}` : '')
        );
    });

    return {
        subject: `MateCode: resumen de tareas (${pending} pendientes)`,

        text:
            `${summary}\n\n` +
            (lines.join('\n') || 'No tenés tareas cargadas.'),

        html:
            '<h1>Tu resumen de MateCode</h1>' +
            `<p>${summary}</p>` +
            '<ul>' +
            lines
                .map(line => `<li>${escapeHtml(line)}</li>`)
                .join('') +
            '</ul>' +
            (tasks.length
                ? ''
                : '<p>No tenés tareas cargadas.</p>'),
    };
}

export async function sendSummaryEmail(
    recipient: string,
    tasks: Task[],
): Promise<string | undefined> {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const fromEmail = process.env.AWS_SES_FROM_EMAIL;

    if (
        !region ||
        !accessKeyId ||
        !secretAccessKey ||
        !fromEmail
    ) {
        throw new Error(
            'Faltan variables de entorno de AWS SES.',
        );
    }

    const client = new SESv2Client({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    const content = buildTaskSummary(tasks);

    const result = await client.send(
        new SendEmailCommand({
            FromEmailAddress: fromEmail,
            Destination: {
                ToAddresses: [recipient],
            },
            Content: {
                Simple: {
                    Subject: {
                        Data: content.subject,
                        Charset: 'UTF-8',
                    },
                    Body: {
                        Text: {
                            Data: content.text,
                            Charset: 'UTF-8',
                        },
                        Html: {
                            Data: content.html,
                            Charset: 'UTF-8',
                        },
                    },
                },
            },
        }),
    );

    return result.MessageId;
}