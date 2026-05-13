# Contributing to SAHARA ERP landing

This repository powers https://forgesaroj.github.io/ — the public
marketing site for SAHARA ERP by SAHARA Labs.

## Change-control policy

**The landing page does not change without explicit approval from
@Forgesaroj.** This is enforced three ways:

1. **Branch protection** on `main` — force-pushes and deletions blocked.
   PRs cannot bypass review.
2. **CODEOWNERS** designates `@Forgesaroj` as the required reviewer for
   every file. No PR merges without their approval.
3. **AI-assistant policy** — automated agents (Claude, Copilot, etc.)
   working with this repo must NOT push or merge without an explicit
   instruction from @Forgesaroj for that specific change.

If you're an outside contributor:
- Fork the repo
- Open a PR with a clear description of what + why
- Wait for @Forgesaroj to review

If you're @Forgesaroj reviewing AI-generated changes:
- The AI should describe exactly what it will change and wait for "go".
- Never let an AI push speculatively. If unclear, ask.

## Built from

The landing is built from `Forgesaroj/Standlone-Lumora-ERP/client/src/landing`
as an isolated marketing-only bundle (no ERP authed-route code in the JS).
Production deploy pipeline lives there, not here — this repo is the
deploy target only.

## Security disclosure

For SAHARA ERP security issues:
- security@saharaerp.com (sales@/support@/dpo@ also forward here)
- For this landing site specifically — open an issue or PR.
