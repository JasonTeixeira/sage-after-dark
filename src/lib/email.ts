/**
 * Email — transactional sends via Resend REST API.
 *
 * No SDK; just a fetch wrapper. Templates rendered as terminal-style HTML
 * inline (no MJML build step required). Plain-text alternative included.
 */

// Sender address. Override with EMAIL_FROM in the environment, e.g.
// "Sage After Dark <sage@sageideas.org>". Required to be a domain verified
// in Resend; otherwise Resend returns 403 and every send fails.
const FROM_DEFAULT =
  process.env.EMAIL_FROM ?? "Sage After Dark <sage@sageafterdark.com>";

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set; skipping send");
    return;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: args.from ?? FROM_DEFAULT,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
    cache: "no-store",
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`resend_${r.status}: ${t}`);
  }
}

/* ---- audience contacts ---- */

/**
 * Add (or upsert) a contact to the configured Resend audience.
 * Best-effort: never throws on missing config; logs and returns false on failure.
 */
export async function addToAudience(args: {
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    console.warn("[email] RESEND_API_KEY or RESEND_AUDIENCE_ID not set; skipping audience add");
    return false;
  }
  const r = await fetch(
    `https://api.resend.com/audiences/${audienceId}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: args.email,
        first_name: args.firstName,
        last_name: args.lastName,
        unsubscribed: args.unsubscribed ?? false,
      }),
      cache: "no-store",
    },
  );
  if (!r.ok) {
    const t = await r.text();
    // Resend returns 422 if the contact already exists — treat as success.
    if (r.status === 422 && /already exists/i.test(t)) return true;
    console.warn(`[email] addToAudience failed ${r.status}: ${t}`);
    return false;
  }
  return true;
}

/* ---- templates ---- */

const SHELL = (inner: string, footerText: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sage After Dark</title>
    <style>
      body{margin:0;background:#05070A;color:#E8E6E0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Inter",Helvetica,Arial,sans-serif;line-height:1.65}
      .wrap{max-width:560px;margin:0 auto;padding:48px 24px}
      .frame{border:1px solid #1C232E;background:#0A0E14;padding:32px}
      .tag{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#00E5FF}
      h1{font-size:24px;margin:16px 0 12px;color:#E8E6E0;line-height:1.25;font-weight:600}
      p{margin:0 0 16px;color:#E8E6E0}
      .mute{color:#8A8F98;font-size:14px}
      a.btn{display:inline-block;background:#00E5FF;color:#05070A !important;padding:12px 18px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border-radius:0}
      a.lnk{color:#00E5FF;text-decoration:underline;text-decoration-color:rgba(0,229,255,.4);text-underline-offset:2px}
      hr{border:0;border-top:1px solid #1C232E;margin:24px 0}
      .footer{margin-top:24px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#4F5563}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="frame">
        ${inner}
      </div>
      <div class="footer">${footerText}</div>
    </div>
  </body>
</html>`;

export function welcomeEmail(opts: { unsubscribeUrl?: string } = {}): { html: string; text: string; subject: string } {
  const subject = "Welcome to Sage After Dark";
  const inner = `
    <span class="tag">▸ TRANSMISSION 001</span>
    <h1>You're on the list.</h1>
    <p>You'll get a late-night dispatch when something is worth saying — essays, tutorials, the occasional field note. No filler. No drip sequence. No webinar.</p>
    <hr/>
    <p class="mute">Reply directly if you want to talk. I read every reply.</p>
    <p class="mute">— Jason</p>
  `;
  const footer = `// SENT FROM SAGE@SAGEAFTERDARK.COM · ${opts.unsubscribeUrl ? `<a class="lnk" href="${opts.unsubscribeUrl}">UNSUBSCRIBE</a>` : "REPLY STOP TO UNSUB"}`;
  const html = SHELL(inner, footer);
  const text = [
    "▸ TRANSMISSION 001",
    "",
    "You're on the list.",
    "",
    "You'll get a late-night dispatch when something is worth saying — essays, tutorials, the occasional field note. No filler. No drip sequence. No webinar.",
    "",
    "Reply directly if you want to talk. I read every reply.",
    "— Jason",
  ].join("\n");
  return { html, text, subject };
}

export function magicLinkEmail(args: { url: string }): {
  html: string;
  text: string;
  subject: string;
} {
  const subject = "Your sign-in link · Sage After Dark";
  const inner = `
    <span class="tag">▸ AUTH · ONE-TIME LINK</span>
    <h1>Sign in to your account.</h1>
    <p>Click the button below within 15 minutes to access your member dashboard. The link is single-use.</p>
    <p><a class="btn" href="${args.url}">▸ Open dashboard</a></p>
    <p class="mute">Or paste this into your browser:</p>
    <p class="mute"><a class="lnk" href="${args.url}">${args.url}</a></p>
    <hr/>
    <p class="mute">If you didn't request this, ignore the email — the link expires on its own.</p>
  `;
  const footer = `// AUTH GENERATED ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;
  return { html: SHELL(inner, footer), text: `Sign in: ${args.url}\n\nLink expires in 15 minutes.`, subject };
}

export function passwordResetEmail(args: { url: string }): {
  html: string;
  text: string;
  subject: string;
} {
  const subject = "Reset your password · Sage After Dark";
  const inner = `
    <span class="tag">▸ AUTH · PASSWORD RESET</span>
    <h1>Reset your password.</h1>
    <p>Click the button below within 60 minutes to choose a new password. The link is single-use.</p>
    <p><a class="btn" href="${args.url}">▸ Reset password</a></p>
    <p class="mute">Or paste this into your browser:</p>
    <p class="mute"><a class="lnk" href="${args.url}">${args.url}</a></p>
    <hr/>
    <p class="mute">If you didn't request this, ignore the email — your current password still works and the link expires on its own.</p>
  `;
  const footer = `// AUTH GENERATED ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;
  return {
    html: SHELL(inner, footer),
    text: `Reset your password: ${args.url}\n\nLink expires in 60 minutes.`,
    subject,
  };
}

export function setPasswordEmail(args: {
  url: string;
  audience: "admin" | "member";
}): { html: string; text: string; subject: string } {
  const role = args.audience === "admin" ? "administrator" : "member";
  const subject =
    args.audience === "admin"
      ? "Set your admin password · Sage After Dark"
      : "Set your password · Sage After Dark";
  const inner = `
    <span class="tag">▸ AUTH · INITIAL PASSWORD</span>
    <h1>Choose your password.</h1>
    <p>Your ${role} account is ready. Click the button below within 2 hours to set your password and sign in.</p>
    <p><a class="btn" href="${args.url}">▸ Set password</a></p>
    <p class="mute">Or paste this into your browser:</p>
    <p class="mute"><a class="lnk" href="${args.url}">${args.url}</a></p>
    <hr/>
    <p class="mute">After setting your password you'll be signed in automatically — no email round-trips on future logins.</p>
  `;
  const footer = `// AUTH GENERATED ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;
  return {
    html: SHELL(inner, footer),
    text: `Set your password: ${args.url}\n\nLink expires in 2 hours.`,
    subject,
  };
}

