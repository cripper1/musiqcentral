# MusIQ Central — Project Identity and Environment Contract

**Status:** Project architect directives, October 22, 2026. Read with [AGENTS.md](./AGENTS.md). This document records naming, application behavior, and environment intent; it does not override the authorization and security rules in AGENTS.md.

## Canonical names and boundaries

- **MusIQ Central** — the application, its user experience, accounts, and business functionality. Spell exactly **MusIQ Central**.
- **MusIQ Network** — the separate network and external identity/membership provider, subject to confirmed integration contracts.
- **GNODI** — the blockchain / settlement network name. Spell **GNODI**, never “Noty,” “Nody,” or similar substitutions.
- **LYRIQ** — the token name. Do not report tokens earned, credited, settled, or transferred without a real verified transaction.
- **Block Reign** — an implementation/partner organization, not a user-facing brand. Do not show it on registration or ordinary user pages.

## DEV is the real application

- `https://dev.musiqcentral.com` is the **DEV deployment of MusIQ Central**, not a mock, demo microsite, or separate developer UI.
- DEV has its **own PostgreSQL and MongoDB databases**. Use real DEV data and real persistence. Data may be created, inspected, corrected, deleted, and recreated during development.
- Implement features once as actual application features. DEV, staging, and production differ by configuration, deployment, data, and external connectivity—not by replacing registration with a simulation.
- Do not fabricate success, failure, authentication, cookie/session state, rewards, or provider responses. Unconnected integrations must report their actual unavailable/not-connected status.
- Do not expose database IDs, internal technical jargon, assertion-paste boxes, development secrets, environment toggles, or test controls on the **ordinary registration page**.
- Users navigate from the site and register through a normal, recognizable experience. Backend verification, identity resolution, Party/Account creation, and session handling are internal.
- Do not ask the architect to run local development servers or `npm install` for ordinary testing. DEV/staging/production are hosted deployments.

## Access and security

- The architect reports that the DEV Vercel deployment is protected by Vercel team access. **Verify the actual deployment protection configuration** before relying on it.
- Deployment protection is not a replacement for application authentication, authorization, session integrity, and backend trust-boundary checks.
- Do not introduce additional browser-visible developer keys or security ceremony without a concrete, approved requirement. Existing DEV-only access-key routes are temporary legacy work and **must not be confused with user registration**.

## Registration acceptance criteria

1. A person visits `/register` from normal MusIQ Central navigation and sees a user-facing registration experience.
2. Identity is authenticated through an actually available, verified mechanism; never treat an arbitrary browser-supplied identity as verified.
3. PostgreSQL Party/Account and MongoDB identity mappings are written in the appropriate DEV databases, with real validation and readback.
4. The application establishes and validates an actual session cookie and carries required state across requests.
5. Actual errors are visible to the user in appropriate language; internal diagnostics remain in backend logs.
6. Real failure and retry cases can be exercised; test data can be cleaned up safely.
7. GNODI integration and LYRIQ rewards are not claimed until actual authoritative endpoints and verification exist.

## Implementation discipline

- Read AGENTS.md and this file before changes. Prefer canonical filenames, small maintainable modules, and real deployed verification.
- Ask for only genuinely missing external configuration or partner contract details; do not invent endpoints, secrets, or success states.
- Report commits and distinguish **code committed**, **deployed**, and **runtime verified**. Never equate them.
- If requirements conflict, bring the concrete conflict to the architect rather than inventing an alternate workflow.
