// Company-email check shared by the waitlist, demo video gate and demo request forms.
// Runs on the client for instant feedback and on the server for enforcement.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Free / personal mailbox providers.
const PERSONAL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com", "passport.com",
  "yahoo.com", "ymail.com", "rocketmail.com", "aol.com", "aim.com", "icloud.com", "me.com", "mac.com",
  "protonmail.com", "proton.me", "pm.me", "protonmail.ch", "tutanota.com", "tutanota.de", "tuta.io", "tutamail.com",
  "zoho.com", "zohomail.com", "yandex.com", "yandex.ru", "ya.ru", "mail.com", "email.com", "usa.com",
  "gmx.com", "gmx.net", "gmx.de", "web.de", "t-online.de", "freenet.de", "mail.ru", "inbox.ru", "list.ru", "bk.ru",
  "qq.com", "foxmail.com", "163.com", "126.com", "yeah.net", "sina.com", "sohu.com", "aliyun.com",
  "naver.com", "daum.net", "hanmail.net", "rediffmail.com", "fastmail.com", "fastmail.fm", "hushmail.com",
  "hey.com", "duck.com", "skiff.com", "mailfence.com", "posteo.de", "posteo.net", "runbox.com", "startmail.com",
  "orange.fr", "wanadoo.fr", "free.fr", "laposte.net", "sfr.fr", "libero.it", "virgilio.it", "tiscali.it",
  "btinternet.com", "sky.com", "virginmedia.com", "ntlworld.com", "talktalk.net",
  "comcast.net", "verizon.net", "att.net", "sbcglobal.net", "bellsouth.net", "cox.net", "charter.net", "earthlink.net",
  "optonline.net", "frontier.com", "windstream.net", "juno.com", "netzero.net",
  "bigpond.com", "bigpond.net.au", "optusnet.com.au", "iinet.net.au", "xtra.co.nz", "shaw.ca", "rogers.com", "sympatico.ca",
  "seznam.cz", "wp.pl", "o2.pl", "onet.pl", "interia.pl", "uol.com.br", "bol.com.br", "terra.com.br",
]);

// Providers that use many country domains (yahoo.co.uk, hotmail.fr, outlook.de, ...).
const PERSONAL_BRANDS = /^(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|aol|icloud|gmx|yandex|protonmail|zoho)\./;

// Disposable / throwaway inbox services.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "sharklasers.com", "10minutemail.com", "10minutemail.net",
  "tempmail.com", "temp-mail.org", "tempmail.net", "tempmailo.com", "throwawaymail.com", "yopmail.com", "yopmail.net",
  "getnada.com", "nada.email", "maildrop.cc", "dispostable.com", "trashmail.com", "fakeinbox.com", "mintemail.com",
  "mohmal.com", "emailondeck.com", "burnermail.io", "spamgourmet.com", "mailnesia.com", "mytemp.email", "tempr.email",
  "discard.email", "getairmail.com", "moakt.com", "mailcatch.com", "inboxkitten.com", "1secmail.com", "tmpmail.org",
]);

/** Returns an error message if `email` is not a valid company email, otherwise null. */
export function companyEmailError(email: string): string | null {
  const e = email.trim().toLowerCase();
  if (e.length > 254 || !EMAIL_RE.test(e)) return "Please enter a valid company email.";
  const domain = e.slice(e.lastIndexOf("@") + 1);
  if (PERSONAL_DOMAINS.has(domain) || PERSONAL_BRANDS.test(domain) || DISPOSABLE_DOMAINS.has(domain)) {
    return "Please use your company email. Personal emails like Gmail or Outlook aren't accepted.";
  }
  return null;
}
