// Shared SMTP transport for the Netlify Functions (send-geschenk, newsletter).
// Why the detour through dns.lookup: nodemailer resolves the host name with its own resolver, and inside
// the function runtime that lookup stalled for ~20 s per mail (measured 2026-11-16: 21–22 s per send, one
// 504). getaddrinfo answers at once, so we resolve the name ourselves, hand nodemailer the IP and keep the
// name for the TLS certificate check. Timeouts keep a hanging server from eating the whole function time.
import nodemailer from 'nodemailer';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export const smtpConfigured = (env) => env.MAIL_DRYRUN === '1' || !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

export async function makeTransport(env) {
  if (env.MAIL_DRYRUN === '1') return nodemailer.createTransport({ jsonTransport: true });
  const port = Number(env.SMTP_PORT || 465);
  let host = env.SMTP_HOST; const tls = {};
  if (!isIP(host)) {
    try { const { address } = await lookup(host, { family: 4 }); tls.servername = host; host = address; }
    catch { /* fall back to nodemailer's own resolution */ }
  }
  return nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }, tls,
    dnsTimeout: 5000, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
  });
}
