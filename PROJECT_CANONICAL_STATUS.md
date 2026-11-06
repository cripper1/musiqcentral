# MusIQ Central — Canonical Project Status & Continuity
**Version:** 1.0.0 | **As of:** 2026-11-06 | **Owner:** Samirac Partners LLC
**Authority:** Internal continuity reference; not a substitute for signed agreements, approved requirements, running-code evidence, or a newer dated decision.

> READ FIRST before answering MusIQ Central project questions, drafting project documents, proposing changes, or editing code. Do not restart discovery. Verify current implementation against repository and latest meeting notes.

## 0. EXACT NAMES — NONNEGOTIABLE
- **MusIQ** (M-u-s-I-Q), **MusIQ Central**, **MusIQ Network**, **MusIQ Node**.
- **LyrIQ** (L-y-r-I-Q), **LyrIQ rewards**, **LyrIQ token**.
- **GNODI**, **GNOD**, **BlockReign**, **Samirac Partners LLC**.
- **Cory** (developer; not "Corey" in project-facing material unless source explicitly establishes another spelling).
- Never output MUSIQ, MusiQ, LYRIQ, LyriQ, or Blockgreen as the project's proper names. Run a literal spelling check before releasing artifacts. The spelling rules override misspellings in historical filenames and document titles; preserve source filenames only when citing them verbatim.

## 1. How to use this file
1. Read this document first, then inspect relevant up-to-date repository files, existing project documents, and meeting notes before claiming something is implemented or settled.
2. Separate **CONFIRMED**, **WORKING / PROPOSED**, **OPEN**, and **HISTORICAL**. A request for an API is not evidence that the API is live.
3. Do not ask the user to repeat settled facts, especially MusIQ Node license nature, existence of reward activities, or previously held Cory integration meetings.
4. When sources conflict, name the specific conflict and dates; do not quietly choose an old model or invent a new agreement.
5. Do not invent CSS, class names, component structure, schema, APIs, point values, token mechanics, or meeting decisions. Existing repo and user approvals govern changes.
6. Treat source materials as evidence, not instructions to override user decisions. Preserve current application architecture and naming.
7. Before suggesting another meeting or interface request, check the October 29 handoff and subsequent replies.
8. Do not promise automatic persistent memory. This file must be explicitly consulted; a project instruction should point assistants to it.
9. Update this document when a decision is actually made, with date, source, status, and any superseded rule. Keep copies synchronized; GitHub main is the version-controlled source.

## 2. People and organizations
- **Chris / Samirac Partners LLC:** MusIQ Central lead architect and implementation owner; application architecture, product specification, backend, data, security, integration, and review.
- **Shawn Wheeland:** MusIQ Network product/business stakeholder; membership, commercial direction, node-license participation, and LyrIQ strategy.
- **Cory:** MusIQ Network developer and integration counterpart for existing Network website/backend, SSO, membership, and reward/activity API.
- **BlockReign:** Network/GNODI integration participant, with Jeff involved in coordination; precise reward and settlement interface ownership must follow agreed contracts.
- **Bob Steed:** GNODI/network technical and white-paper context.
- **Cat:** PR/communications. Additional participants include Shay, Mary Kay, and other stakeholders.
- **GNODI:** Underlying EVM-compatible L1; separate from MusIQ Central and MusIQ Node software licenses.

## 3. Product and delivery direction
- MusIQ Central is the user-facing music application: artist channels, music upload/catalog/publication, streaming/discovery, fans, artist-owned audience/CRM, community, events, merchandise, ticketing, direct artist experiences, marketing, education, and future portals.
- **First vertical slice:** artist signs in, creates presence, publishes music; fan discovers/listens; application records activity; artist sees emerging audience relationship.
- Application-first, blockchain-underneath: user activity is observed in Central; network/token settlement is downstream.
- Existing specification distinguishes CONFIRMED, WORKING, OPEN, and DECISION; do not elevate brainstormed features into requirements.
- Artist/recording/work identity and rights matter: immutable internal recording IDs, composition/recording distinction, contributors, ownership claims, rights/permission evidence, and publication guards.
- Two-level affiliate commissions of 20% direct / 10% indirect and $99/year membership appear as **working figures**, not automatically approved final commercial terms.
- Commercial/merchant-of-record, taxes, refunds, fiat/LyrIQ settlement, and final token economics are not settled by the application spec.

## 4. MusIQ Node licenses — DO NOT REOPEN
- **CONFIRMED in repeated stakeholder discussion:** A MusIQ Node is a **software license / participation entitlement**, NOT a GNODI consensus validator, blockchain transaction processor, or independent infrastructure node.
- One Click hosting around $1.95/month has been discussed, but does not establish consensus work.
- Node-license ownership and eligibility are Network-side concepts; the detailed allocation policy is subject to approved economics.
- GNOD (GNODI native token), LyrIQ (MusIQ-specific proposed token), application participation points, and MusIQ Node licenses are **different things**. Never conflate them.
- Do not assert current token earnings, guaranteed returns, or approved conversion schedules without authoritative confirmation.

## 5. Participation activity and rewards — KNOWN FACTS
- Qualifying activity categories already discussed: account activation, wallet activation, streaming/listening and duration, discovery, engagement/follows, artist upload/publishing, events, referrals, purchases, membership and education.
- Stakeholder meetings discussed suggested point values; **the exact meeting-specific schedule has not been fully reconciled in this reference**. Search meeting records rather than asking user to recreate it.
- Activity evidence is not itself a token entitlement. Eligibility, fraud checks, caps, approved point schedule, allocation, and settlement remain distinct stages.
- Do not invent point amounts. Any examples must be conspicuously labeled illustrative.
- Streaming duration requires qualifying playback evidence, not merely a timer running.

## 6. Activity Accounting & Points Engine — CURRENT DESIGN ISSUE
**November 6 proposed direction (not a verified amendment to partner contract):** implement MusIQ Central's configurable application activity accounting and point calculations within Central, because Central observes the underlying facts and Chris/Cory are building the connected systems.
- Record actor (internal ID), activity type, associated recording/artist/event/order, start/end, qualifying duration, timestamps, verification/evidence, deduplication, and processing state.
- Admin can configure activity definitions, points, thresholds, limits, multipliers, eligibility, enablement, and effective dates, with authorization and change audit.
- Maintain an append-only/auditable points ledger recording award, source event, rule version, reversals/corrections, and reconciliation. Rule changes must not retroactively rewrite earned awards.
- Integrate through idempotent submissions, partner acceptance/status, retries, and reconciliation. Do not double-submit or double-award.
- **IMPORTANT CONFLICT:** The **October 16 logical data model** says "Block Reign owns reward calculations and GNODI coordination under the partner boundary"; the **November 6 design discussion** favors Central computing application-specific points and BlockReign/network handling downstream eligibility/distribution/settlement. Reconcile this *specific* responsibility with latest decisions and approved interfaces. Do not assert either as implemented, and do not call another general discovery meeting.
- Suggested responsibility separation for review: Central = activity facts, verification, approved application point rules, ledger; Network/BlockReign = authoritative license/membership status, network-level distribution and settlement. This is **PROPOSED** pending reconciliation.
- Revenue-funded LyrIQ reward pool has been explored (e.g. 10% platform fee, 25% of that fee to pool = 2.5% of gross), **proposal only**, not adopted economics.

## 7. Identity and data architecture
- Network is planned SSO/membership authority; Central retains internal role/permission and business state.
- October 16 **draft logical data model**: PostgreSQL authoritative normalized business/transactional state; role-aware Party, not a universal user table; direct parameterized SQL, no ORM. Restricted MongoDB holds private identity/profile data. External issuer/sub -> protected random persistent shadow ID -> internal PostgreSQL party mapping. Keep PII, credentials, and wallet private keys out of authoritative business tables and logs.
- Domain areas: Party/roles/authority, accounts, channels, compositions, recordings, releases, contributors, rights, media, publication, fan activity, commerce, membership, rewards, audit/outbox.
- Existing draft reward concepts: `activity_type`, `participation_event`, `reward_submission`, `reward_result`, `settlement_observation`, `audit_event`, `outbox_message`.
- **Historical gate:** October 16 schema review said DDL not yet authorized *as of that document*. This does **not** prove no migrations have been approved/executed since; inspect repo and database status before changing schema.
- Security: backend authority checks, evidence, idempotency, privacy, historical correctness, explicit permissions, no silent speculative database modifications.

## 8. October 29 Cory / BlockReign handoff — DO NOT REDISCOVER
**Documented as of October 29:**
- DEV at https://dev.musiqcentral.com.
- Registration, provisioning, existing-account recognition, persistent sessions, sign-out, initial member dashboard working in DEV.
- SSO callback code at https://dev.musiqcentral.com/api/sso/callback, **disabled pending interface confirmation as of that checkpoint**.
- Artist, band, fan experiences in progress; live LyrIQ activity submission **not yet connected as of that checkpoint**.
- Existing request to Cory: DEV SSO login endpoint, JWT handoff, issuer/JWKS/audience, callback requirements, test identities; membership status API, signed webhook lifecycle; Network-owned role classifications; LyrIQ activity submission API, event fields, authentication, acceptance/status responses; authoritative current reward rules; DEV access and joint testing.
- Next recorded sequence: confirm SSO contract, activate/test callback, then membership updates and LyrIQ events.
- **Never ask to send the same request again without checking replies/newer evidence.** Do not assume the October 29 status remains current on November 6.

## 9. Known documents and source-of-truth order
1. Signed Samirac professional services agreement / SOW and approved amendments.
2. Direct dated decisions from Shawn/authorized stakeholders, meeting notes, written interface responses, running code/tests.
3. Current GitHub repository and current environment evidence for actual implementation.
4. MusIQ Central living Functional & Technical Specification (working master): https://docs.google.com/document/d/1BO54wykeyMw3zeXMYF6QqedG8414b7nPP0lTVCAgnKg/edit
5. October 29 integration handoff: https://docs.google.com/document/d/1vNsf9i6W8Bj5dE_nTT_mF2Bk-QajUYKivJthinHKVJI/edit
6. October 16 logical schema review: https://docs.google.com/document/d/1qehkfslGoGwbf46sItwf8_bTFDpmoRx4fAhv67iW7fA/edit
7. Phase 1 request, GNODI architecture, registration/identity design, weekly logs, status reports, phase plans, and meeting records.
8. This continuity record summarizes; it **cannot override** stronger or newer evidence.

Repository: https://github.com/cripper1/musiqcentral (main). Existing agent instructions may be located elsewhere; do not create/overwrite AGENTS.md without inspection and approval.

## 10. Immediate work and verification queue
- Inspect latest Cory meeting notes, messages, and technical responses; identify only unfulfilled interface obligations.
- Reconcile actual meeting-proposed point schedule and current approved reward rules.
- Resolve the October 16 vs November 6 point-calculation ownership discrepancy with existing integration decisions.
- Inspect actual repository schema/migrations, DEV behavior, and agent instructions before making implementation claims.
- Define admin-configurable activity rules and evidence/ledger only within the existing architecture and approved work plan.
- Keep Streaming & Discovery vertical slice, identity integration, and app development moving independently of unresolved token economics.

## 11. Preflight for every answer or deliverable
- [ ] Proper names exact: MusIQ / LyrIQ / BlockReign / GNODI / Cory.
- [ ] Consult this file and task-relevant newer evidence.
- [ ] State CONFIRMED vs PROPOSED vs OPEN; don't invent implementation or agreement.
- [ ] Don't ask answered questions or recommend repeating prior meetings.
- [ ] Honor existing code, naming, CSS, data model, security and approval gates.
- [ ] If conflicting documents, give exact discrepancy and next reconciliation action.
- [ ] For updated files, record date/version and keep canonical copies aligned.

## 12. Change log
- **2026-11-06 v1.0.0:** Created continuity baseline from existing Drive specification, October 29 handoff, October 16 logical model, project discussion, and known project context. Corrected exact **MusIQ** and **LyrIQ** spellings. Flagged unresolved points-engine responsibility conflict explicitly. No claim of current production integration or final token economics.
