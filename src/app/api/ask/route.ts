/**
 * /api/ask — receives a reader question and emails it to me via Resend.
 *
 * - Honeypot field `website` must be empty
 * - Question is required, max 5000 chars
 * - Email is optional but validated when present
 */

import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TO = "sage@sageideas.org";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // honeypot — silently succeed to confuse bots
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true }, { status: 200 });
  }

  const question = String(body.question ?? "").trim();
  const from = String(body.from ?? "").trim();
  const anonymous = Boolean(body.anonymous);

  if (!question) {
    return Response.json({ error: "Question is required." }, { status: 400 });
  }
  if (question.length > 5000) {
    return Response.json({ error: "Question too long." }, { status: 400 });
  }
  if (from && !EMAIL_RE.test(from)) {
    return Response.json({ error: "Invalid email." }, { status: 400 });
  }

  try {
    const text = `Question:\n\n${question}\n\n---\nFrom: ${from || "(no email provided)"}\nAnonymous: ${anonymous ? "yes" : "no"}\nReceived: ${new Date().toISOString()}\n`;
    const escapedQ = question.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    const escapedFrom = (from || "(no email provided)").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `<!doctype html><html><body style="font-family:ui-monospace,Menlo,monospace;background:#05070A;color:#E8E6E0;padding:24px"><div style="border:1px solid #1C232E;padding:24px;max-width:640px"><div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#00E5FF;margin-bottom:16px">// /ask submission</div><div style="font-size:15px;line-height:1.65">${escapedQ}</div><hr style="border:0;border-top:1px solid #1C232E;margin:24px 0"><div style="font-size:12px;color:#8A8F98">From: ${escapedFrom}<br>Anonymous: ${anonymous ? "yes" : "no"}<br>Received: ${new Date().toISOString()}</div></div></body></html>`;
    await sendEmail({
      to: TO,
      subject: `[ask] ${question.slice(0, 80)}${question.length > 80 ? "…" : ""}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[ask] send failed", err);
    return Response.json(
      { error: "Failed to send. Try again or email sage@sageideas.org directly." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
