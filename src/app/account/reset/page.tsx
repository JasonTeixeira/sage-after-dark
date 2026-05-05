/**
 * /account/reset — landing for ?token=xxx links.
 *
 * Used for both the "forgot password" reset flow and the admin-seeded
 * "set initial password" flow. The API route handles both purposes
 * transparently.
 */

import {
  Page,
  Container,
  Display,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
} from "@/components";
import { ResetForm } from "./reset-form";

export const metadata = {
  title: "Set new password · Sage After Dark",
  description: "Choose a new password for your Sage After Dark account.",
};

export const dynamic = "force-dynamic";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = (sp?.token ?? "").trim();
  const valid = /^[a-f0-9]{40,}$/i.test(token);

  return (
    <Page>
      <Container size="narrow" className="pt-10 pb-24">
        <TacticalStrip variant="muted">
          <TerminalPrompt path="~/account/reset" mode="breadcrumb" />
          <StripSep />
          <span>AUTH · NEW PASSWORD</span>
        </TacticalStrip>

        <header className="mt-10 mb-10">
          <Tactical className="text-cyan mb-4 block">// new password</Tactical>
          <Display className="mb-6">Choose a new password.</Display>
          <Lead>
            Pick something at least 8 characters with a mix of letters and
            numbers. After you save it, you&apos;ll be signed in.
          </Lead>
        </header>

        {!valid ? (
          <div
            role="alert"
            className="border border-ember/40 bg-ember/5 px-5 py-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember mb-2">
              ▸ invalid link
            </p>
            <p className="text-bone leading-relaxed">
              This reset link is missing or malformed. Request a fresh one
              from the{" "}
              <a
                className="text-cyan underline decoration-cyan/40 underline-offset-2"
                href="/account/forgot"
              >
                forgot-password page
              </a>
              .
            </p>
          </div>
        ) : (
          <ResetForm token={token} />
        )}
      </Container>
    </Page>
  );
}
