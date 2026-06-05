/**
 * Vault deep cuts — the "after dark" layer unlocked by the cipher gate.
 *
 * This is inline data, not a public route. No sitemap entry, no SSR surface,
 * no SEO exposure. The content only renders inside the locked Vault overlay.
 * That's intentional for v1: the vault earns its name.
 */

export type DeepCut = {
  id: string;
  title: string;
  dek: string;
  body: string[];
};

export const DEEP_CUTS: DeepCut[] = [
  {
    id: "00-why-this-exists",
    title: "00 · why this exists",
    dek: "The unlisted preface. What the public essays don't say about why any of this gets written down.",
    body: [
      "Most of this started as something to hand a junior engineer so I wouldn't have to say the same thing twice. Then I said it again. Then I wrote it down. Then I noticed the writing was better than the conversation had ever been.",
      "The public essays are the cleaned-up version — the argument after it survived two rounds of being wrong. This vault is the margin notes: the draft that got killed, the sentence I cut because it sounded too much like a confession, the number I almost didn't include.",
      "It exists because some things are only worth saying to the people who looked for them.",
    ],
  },
  {
    id: "directors-cut-taste-is-the-last-moat",
    title: "director's cut · taste is the last moat",
    dek: "The 1,400 words I cut, the three drafts that were wrong, and the footnote that became the thesis.",
    body: [
      "The first draft opened with a paragraph about Dieter Rams. I cut it. Not because it was wrong — Rams is worth quoting — but because every third essay about taste opens with a paragraph about Dieter Rams, and the whole point of the piece was that defaults are the enemy.",
      "Draft two had a section on taste in music, which I also cut. The analogy was clean, but it let the reader stay abstract. The version that shipped forces you to think about software specifically. That friction is the point.",
      "The footnote that became the thesis: 'Taste is the deploy gate you run before the deploy gate.' That line was going to be a throwaway. I almost deleted it in the third pass. Then I read it again and realized it was the only sentence in the whole draft that was actually true.",
    ],
  },
  {
    id: "raw-notes-2025",
    title: "the raw notes · 2025",
    dek: "Unedited. The margin scrawl behind the annual letter, timestamps intact.",
    body: [
      "Jan 14 · Shipped the paywall. Spent two hours debugging a Stripe webhook that was fine. The bug was a missing semicolon in a curl command I was using to test it. Filed that under: the build is not the problem.",
      "Mar 3 · Read back through six months of commits. The ratio of 'add feature' to 'remove wrong feature' is about 1:2. That used to bother me. Now I think it's just the actual job.",
      "Nov 22 · Wrote something honest. Sent it. The response rate on honest things is higher than on smart things. I keep forgetting this and then remembering it the same way every year.",
    ],
  },
];
