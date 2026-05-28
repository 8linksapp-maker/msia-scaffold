import type { APIRoute } from 'astro';
import { createSession } from '../../../lib/auth';

export const prerender = false;

const COOKIE_NAME = 'admin_session';
const EXPIRES_SEC = 7 * 24 * 60 * 60; // 7 dias

// ── Rate limit de login por IP (anti brute-force) ────────────────────────
// ATENÇÃO: este Map é resetado em cada cold start do Vercel (serverless).
// Mitiga o ataque na prática (a instância fica quente sob carga), mas para
// garantia forte use Redis/KV. Como ADMIN_SECRET pode ser um PIN curto, esta
// trava é a primeira linha de defesa contra força bruta no login.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function clientIp(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}

/** Retorna segundos restantes de bloqueio, ou 0 se ainda pode tentar. */
function blockedFor(ip: string): number {
    const entry = loginAttempts.get(ip);
    if (!entry || Date.now() > entry.resetAt) return 0;
    if (entry.count >= MAX_ATTEMPTS) return Math.ceil((entry.resetAt - Date.now()) / 1000);
    return 0;
}

function registerFailure(ip: string) {
    const now = Date.now();
    const entry = loginAttempts.get(ip);
    if (!entry || now > entry.resetAt) {
        loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
        entry.count++;
    }
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const ip = clientIp(request);
        const wait = blockedFor(ip);
        if (wait > 0) {
            return new Response(
                JSON.stringify({ error: `Muitas tentativas. Tente novamente em ${Math.ceil(wait / 60)} min.` }),
                { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(wait) } }
            );
        }

        const { password } = await request.json();
        if (!password) {
            return new Response(JSON.stringify({ error: 'Senha obrigatória.' }), { status: 400 });
        }

        const session = await createSession(password);
        if (!session) {
            registerFailure(ip);
            return new Response(JSON.stringify({ error: 'Senha incorreta.' }), { status: 401 });
        }

        // Login OK → zera o contador desse IP
        loginAttempts.delete(ip);

        const secure = import.meta.env.PROD ? ' Secure;' : '';
        const cookieValue = `${COOKIE_NAME}=${encodeURIComponent(session)}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${EXPIRES_SEC}`;

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookieValue,
            }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
