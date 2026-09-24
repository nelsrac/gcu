import type { APIRoute } from 'astro';
import { mkdir, appendFile } from 'node:fs/promises';
import { join } from 'node:path';

// This endpoint is the only part of the site that needs a live server;
// every other page is static. See astro.config.mjs (Node adapter).
export const prerender = false;

// v1: submissions are appended to a JSON-lines file on disk (mounted as a
// Docker volume, see docker-compose.yml) instead of being emailed. Wiring up
// real SMTP delivery is a planned fast-follow — see README.md.
const DATA_DIR = process.env.CONTACT_DATA_DIR ?? './data';
const DATA_FILE = join(DATA_DIR, 'contact-submissions.jsonl');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function wantsJson(request: Request) {
  const accept = request.headers.get('accept') ?? '';
  const requestedWith = request.headers.get('x-requested-with') ?? '';
  return accept.includes('application/json') || requestedWith === 'XMLHttpRequest';
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const jsonResponse = wantsJson(request);
  const formData = await request.formData();

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  const honeypot = String(formData.get('company') ?? '').trim();

  // Silently "succeed" on honeypot hits so bots don't learn anything.
  if (honeypot !== '') {
    return jsonResponse
      ? new Response(JSON.stringify({ ok: true }), { status: 200 })
      : redirect('/kontakt?success=1', 303);
  }

  const isValid = name.length > 0 && EMAIL_RE.test(email) && message.length > 0;

  if (!isValid) {
    return jsonResponse
      ? new Response(JSON.stringify({ ok: false, error: 'invalid' }), { status: 400 })
      : redirect('/kontakt?error=1', 303);
  }

  const entry = {
    receivedAt: new Date().toISOString(),
    name,
    email,
    message,
  };

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(DATA_FILE, `${JSON.stringify(entry)}\n`, 'utf-8');
  } catch (err) {
    console.error('Failed to store contact submission', err);
    return jsonResponse
      ? new Response(JSON.stringify({ ok: false, error: 'storage' }), { status: 500 })
      : redirect('/kontakt?error=1', 303);
  }

  return jsonResponse
    ? new Response(JSON.stringify({ ok: true }), { status: 200 })
    : redirect('/kontakt?success=1', 303);
};
