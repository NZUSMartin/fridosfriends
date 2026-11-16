// Newsletter sign-up (double opt-in) — shared by the sign-up field, the Geschenk flow and the membership form.
// Posts to the Netlify Function `newsletter`, which e-mails a confirmation link; nothing is on the list before the click.
export type NlResult = 'sent' | 'bad' | 'notready' | 'rate' | 'fail';
export const NL_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function nlMsg(lang: string) {
  return lang === 'en'
    ? { sending: 'Sending …', sent: 'Almost done: we have sent you an e-mail. Please confirm your sign-up with the link in it.',
        bad: 'Please enter a valid e-mail address.', rate: 'Too many attempts — please try again later.',
        fail: 'Sorry, the sign-up did not work. Please write to us at vorstand@fridosfriends.de.' }
    : { sending: 'Wird gesendet …', sent: 'Fast geschafft: Wir haben Ihnen eine E-Mail geschickt. Bitte bestätigen Sie Ihre Anmeldung über den Link darin.',
        bad: 'Bitte eine gültige E-Mail-Adresse eingeben.', rate: 'Zu viele Versuche – bitte versuchen Sie es später noch einmal.',
        fail: 'Die Anmeldung hat leider nicht funktioniert. Bitte schreiben Sie uns an vorstand@fridosfriends.de.' };
}

export async function nlSubscribe(email: string, lang: string, source: string, honeypot = ''): Promise<NlResult> {
  const addr = (email || '').trim();
  if (!NL_EMAIL_RE.test(addr)) return 'bad';
  try {
    const res = await fetch('/.netlify/functions/newsletter', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'subscribe', email: addr, lang: lang === 'en' ? 'en' : 'de', source, website: honeypot }) });
    const j: any = await res.json().catch(() => ({}));
    if (res.ok && j.ok) return 'sent';
    if (res.status === 400 && j.error === 'email') return 'bad';
    if (res.status === 429) return 'rate';
    if (res.status === 503) return 'notready';
    return 'fail';
  } catch { return 'fail'; }
}
