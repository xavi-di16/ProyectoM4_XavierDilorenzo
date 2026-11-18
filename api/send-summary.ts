import type {
    VercelRequest,
    VercelResponse,
} from '@vercel/node';

import { getAdminServices } from '../server/firebaseAdmin.js';
import { sendSummaryEmail } from '../server/email.js';
import { parseTask } from '../src/utils/taskParser.js';

class RateLimitError extends Error { }

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');

        return res.status(405).json({
            message: 'Usá POST para solicitar el resumen.',
        });
    }

    const contentType = req.headers['content-type']
        ?.split(';')[0]
        ?.trim()
        .toLowerCase();

    if (contentType !== 'application/json') {
        return res.status(415).json({
            message: 'La solicitud debe usar application/json.',
        });
    }

    const authorization = req.headers.authorization;

    if (
        !authorization?.startsWith('Bearer ') ||
        !authorization.slice(7).trim()
    ) {
        return res.status(401).json({
            message: 'Necesitás iniciar sesión.',
        });
    }

    let body: unknown = req.body;

    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return res.status(400).json({
                message: 'El JSON recibido es inválido.',
            });
        }
    }

    if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body) ||
        Object.keys(body).length !== 0
    ) {
        return res.status(400).json({
            message: 'El cuerpo de la solicitud debe ser {}.',
        });
    }

    try {
        const { auth, db } = getAdminServices();

        const token = authorization.slice(7).trim();

        const decoded = await auth
            .verifyIdToken(token)
            .catch(() => null);

        if (!decoded) {
            return res.status(401).json({
                message: 'La sesión es inválida o está vencida.',
            });
        }

        if (!decoded.email || !decoded.email_verified) {
            return res.status(403).json({
                message:
                    'Verificá tu correo en Firebase antes de enviar el resumen.',
            });
        }

        // Admin SDK omite las reglas de Firestore.
        // Este filtro por el UID verificado es obligatorio.
        const snapshot = await db
            .collection('tasks')
            .where('userId', '==', decoded.uid)
            .get();

        const tasks = snapshot.docs.map(document =>
            parseTask(document.id, document.data()),
        );

        if (tasks.some(task => task.userId !== decoded.uid)) {
            throw new Error('Se encontró un propietario inválido.');
        }

        tasks.sort((a, b) => b.createdAt - a.createdAt);

        const limitReference = db
            .collection('_emailLimits')
            .doc(decoded.uid);

        await db.runTransaction(async transaction => {
            const previous = await transaction.get(limitReference);

            const lastAttempt: unknown =
                previous.data()?.lastAttempt;

            const now = Date.now();

            if (
                typeof lastAttempt === 'number' &&
                now - lastAttempt < 60_000
            ) {
                throw new RateLimitError();
            }

            transaction.set(limitReference, {
                lastAttempt: now,
            });
        });

        const messageId = await sendSummaryEmail(
            decoded.email,
            tasks,
        );

        return res.status(200).json({
            message:
                'AWS SES aceptó el resumen. Revisá tu bandeja de entrada y spam.',
            messageId,
        });
    } catch (error) {
        if (error instanceof RateLimitError) {
            res.setHeader('Retry-After', '60');

            return res.status(429).json({
                message:
                    'Esperá un minuto entre intentos de envío.',
            });
        }

        console.error('Error en send-summary:', {
            name: error instanceof Error
                ? error.name
                : 'UnknownError',
            message: error instanceof Error
                ? error.message
                : 'Error desconocido',
        });

        if (
            error instanceof Error &&
            error.name === 'MessageRejected'
        ) {
            return res.status(422).json({
                message:
                    'SES rechazó el envío. Revisá las identidades verificadas y la región de AWS.',
            });
        }

        return res.status(500).json({
            message:
                'No se pudo enviar el resumen. Revisá la terminal del servidor.',
        });
    }
}