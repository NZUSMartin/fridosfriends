/**
 * Central, board-editable configuration.
 * Edit these values (and re-deploy) to update the site — or, for the funding
 * figure, set FUNDING.sheetUrl to a published Google-Sheet CSV link and the
 * thermometer updates live on every visit with NO rebuild needed.
 */
export const FUNDING = {
  raised: 2285,         // EUR raised in the current year (fallback if no live sheet)
  goal: 30000,          // EUR target for the year
  year: 2026,
  asof: 'Juli 2026',    // "as of" stamp (fallback; the live sheet's "Stand" column overrides it)
  // Published Google-Sheet CSV link (File → Share → Publish to web → CSV).
  // Columns: "Bisher gesammelt", "Ziel", "Jahr", "Stand", …  — one row per year; a header row is fine.
  // German number format ("2.285,06") is fine. The row whose "Jahr" equals `year` above drives the bar.
  // Leave '' to use the fixed numbers above.
  sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkXKBVSF_b8GISfrET7J01Ym7i6kJfBZ5tLXfBLxI-r6RtFb1kau-XTmwH0hyoEpZ7AzwV1zZP82CH/pub?output=csv',
};

export const BETTERPLACE =
  'https://www.betterplace.org/de/projects/165916-schulstipendien-fuer-maedchen-in-uganda-bildung-ist-ihre-zukunft';
export const BETTERPLACE_SHORT = 'https://www.betterplace.org/de/projects/165916';
export const PAYPAL_DONATE =
  'https://www.paypal.com/donate/?hosted_button_id=R94VT44NWJ7QY'; // one-time
export const PAYPAL_SUBSCRIBE = '';

// Social: the Frido's Friends e.V. LinkedIn company page (organisation id 128463972).
export const LINKEDIN = 'https://www.linkedin.com/company/128463972/'; // paste the PayPal *subscription* button link here once created

// Photo credit + AI-modification disclosure. Used as the figcaption under every
// sensitive photo that was AI-modified for privacy (faces are synthetic stand-ins).
// Unmodified images (e.g. the hands close-up, Pater Frido) keep the plain credit.
export const CREDIT_AI_DE =
  'Foto: JRS Uganda · Sensible Bilder mit KI modifiziert – abgebildete Personen sind nicht real.';
export const CREDIT_AI_EN =
  'Foto: JRS Uganda · Sensitive images modified with AI – the people shown are not real.';

// ---------------------------------------------------------------------------
// Geschenk occasions + season switch
// ---------------------------------------------------------------------------
// The occasions a visitor can pick today (each has its own card artwork in /public/voucher).
export const GIFT_OCCASIONS = [
  {
    id: 'geburtstag', thumb: '/voucher/thumb-geburtstag.jpg', featured: false,
    de: { title: 'Zum Geburtstag', text: 'Ein Glückwunsch, der weit über den Tag hinaus wirkt.', cta: 'Zum Geburtstag verschenken', alt: 'Geschenk-Karte zum Geburtstag' },
    en: { title: 'For a birthday', text: 'A greeting that reaches far beyond the day itself.', cta: 'Give for a birthday', alt: 'Gift card for a birthday' },
  },
  {
    id: 'weihnachten', thumb: '/voucher/thumb-weihnachten.jpg', featured: true, // home hero button filled gold in season
    de: { title: 'Zu Weihnachten', text: 'Ein Geschenk, das Hoffnung schenkt und Zukunft schafft.', cta: 'Zu Weihnachten verschenken', alt: 'Geschenk-Karte zu Weihnachten' },
    en: { title: 'For Christmas', text: 'A gift that gives hope and builds a future.', cta: 'Give for Christmas', alt: 'Gift card for Christmas' },
  },
] as const;
// Listed in the "Weitere Anlässe" pull-down as "in Kürze" until their card artwork arrives.
export const GIFT_OCCASIONS_SOON = [
  { de: 'Hochzeit', en: 'Wedding' },
  { de: 'Geburt', en: 'Birth' },
  { de: 'Jubiläum', en: 'Anniversary' },
  { de: 'Trauer', en: 'In memoriam' },
] as const;
// Season switch: which occasion the home-page gift button (and the tile order) leads with.
// Dates are MM-DD, inclusive, in the visitor's local time — the site flips on its own, no re-deploy.
// A window may wrap the new year (from '12-27', to '01-06'). Outside every window the default applies.
export const GIFT_DEFAULT_OCCASION = 'geburtstag';
export const GIFT_SEASONS = [
  { occasion: 'weihnachten', from: '11-01', to: '12-26' },
];
