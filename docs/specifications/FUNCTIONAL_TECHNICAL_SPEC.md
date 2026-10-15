# MusIQ Central — Functional + Technical Specification

**Canonical engineering Markdown transcribed from the October 13, 2026 living Word specification, with October 15, 2026 implementation addendum.**

**Source:** MUSIQ_Central_Functional_Technical_Spec_v0.1.docx (Drive version dated October 13, 2026). This transcription retains source text; source tables may be flattened and should be reformatted during document publication.

MUSIQ Central
Functional + Technical Specification
Living Working Draft — Updated October 13, 2026
Prepared for Phase 1 Architecture & Technical Discovery
Samirac Partners LLC
October 2026
## 1. Purpose of This Document
This is the living product and system specification for MUSIQ Central. It consolidates confirmed product direction, functional requirements, technical architecture, integration boundaries, implementation priorities, and unresolved decisions. It is intended to evolve as the Sunday product sessions, Block Reign integration work, infrastructure setup, and implementation produce new evidence.
The October 13 update incorporates the product and infrastructure direction established during the working call with Shawn, including the initial streaming/discovery launch path, artist-owned audience model, YBCS infrastructure ownership, marketplace concepts, affiliate and membership direction, and the first deployment plan.
## 1.1 Status Vocabulary
- Confirmed — supported by Shawn’s direct product statements, the signed SOW, supplied project materials, or demonstrated existing behavior.
- Working — current Samirac implementation or product direction suitable for design and iteration, but not yet a binding final business rule.
- Open — requires a direct product, legal, economic, or technical decision.
- Decision — explicitly agreed and suitable to drive implementation.
## 1.2 Source Hierarchy
Signed Professional Services Agreement / Statement of Work No. 1.
Direct product direction from Shawn and authorized MUSIQ / YBCS stakeholders.
Current MUSIQ Network / Block Reign documentation, running environments, APIs, and demonstrated capabilities.
Existing MUSIQ Central architecture, technical working documents, and project materials.
Product concept materials supplied by the MUSIQ team.
Samirac architecture recommendations created during Phase 1.
## 2. Working Product Definition
## 2.1 Product Thesis
MUSIQ Central is intended to become the decentralized place for “everything music”: a human-facing platform where artists publish and monetize music, own their audience relationships, fans discover and participate, commerce occurs directly around artists, and qualifying activity can connect to the LYRIQ economic layer and GNODI settlement infrastructure.
## 2.2 Strategic Product Principles
Artist ownership: artists should control their audience relationship and book of business rather than merely receive anonymous follower counts.
Artist-first economics: where practical, MUSIQ should favor economics that materially improve the artist’s share and create a reason to bring catalog and audience to the platform.
Participation creates value: listening, discovery, purchases, events, referrals, education, and other activity can become measurable events that may qualify for rewards.
Application first, blockchain underneath: users interact with MUSIQ Central; blockchain, wallets, nodes, rewards, and settlement support the experience rather than define the interface.
One ecosystem, many portals: streaming is the first portal, but the architecture must support additional artist business, direct-experience, education, booking, and future vertical portals without re-platforming.
Build one complete vertical slice first, then iterate outward.
## 2.3 Near-Term Launch Direction
Internal ambition: stand up at least one production-capable portal before year-end if the first end-to-end slice validates successfully.
No firm public launch date until the first complete slice is running, tested, and iteration risk is understood.
First portal: Streaming & Discovery.
First proof: artist signs in, establishes an artist presence, uploads/publishes music, fan discovers and streams it, activity is recorded, and the artist can see the beginning of an owned audience relationship.
## 3. Primary Actors
## 4. Functional Requirements — Working Baseline
## 4.1 Identity, Account & Access
## 4.2 Artist Identity, Profile & Channel
## 4.3 Music Upload, Catalog & Publishing
## 4.4 Streaming, Discovery & Fan Experience
## 4.5 Artist-Owned Audience / CRM
## 4.6 AI Marketing & External Distribution
## 4.7 Commerce, Tickets, Merchandise & Artist Experiences
## 4.8 Membership & Affiliate Program
## 4.9 LYRIQ Rewards & Marketplace Economics
## 4.10 YEES — Young Entertainers Education System
## 4.11 Administration & Operations
## 5. Initial Domain Model
This remains a working domain model rather than a finalized database schema. The October 13 update adds audience ownership, membership, affiliate and direct-experience concepts required by the emerging product direction.
## 6. Event Model
MUSIQ Central is expected to be event-heavy. Events should represent durable application facts. A recorded event does not itself imply LYRIQ qualification or blockchain settlement.
## 7. Technical Architecture — Updated Working Direction
## 7.1 Architectural Principle
MUSIQ Central is an application platform first. User-facing clients call MUSIQ Central application services. Those services own application state, authorization, catalog, audience, commerce and evidence. Block Reign / GNODI integrations remain behind explicit adapters so changes in network infrastructure do not destabilize the product.
Clients → MUSIQ Central Web/API → Domain Services → Event Backbone / Integration Adapters → Block Reign / GNODI
## 7.2 Infrastructure Ownership & Deployment
YBCS is the current umbrella entity and should own the production domains, DNS, cloud/hosting accounts, repositories, payment accounts and production platform assets.
Samirac should receive administrative/developer access required to build and operate MUSIQ Central.
Working deployment direction: Vercel for front-end/web delivery and DigitalOcean for backend/application infrastructure, subject to final environment validation.
A staging environment should be established first; production DNS can be attached after the final MUSIQ Central domain is secured and delegated.
Samirac requires direct or delegated DNS capability to make implementation changes without operational delays.
## 7.3 Recommended Application/Data Stack
## 7.4 Privacy / Identity Separation
Separate direct PII from broad application/event stores wherever practical.
Use internal opaque/pseudonymous subject identifiers for downstream state and event linkage rather than exposing PII as the primary join key.
Samirac’s “Shadow ID” pattern is a working implementation concept for pseudonymous linkage and should be formalized before production use.
Third-party social connections should use supported authorization tokens/scopes and encrypted secret storage; do not design around plaintext credential storage.
Wallet private keys should not enter MUSIQ Central.
## 8. Authority, Admissibility & Execution Boundary
Consequential actions — rights changes, reward qualification, wallet/network actions, administrative changes, campaign execution, refunds, or other material operations — must be evaluated against current identity, authority, state, policy and evidence before execution.
Request → Identity → Role/Authority → Current State → Policy/Evidence → Admissibility → Execute → Record Evidence
## 9. MUSIQ Network / Block Reign Integration
## 9.1 SSO & Membership Interface — Received
MUSIQ Network is the identity and membership system of record for the proposed shared-account model.
SSO uses a short-lived RS256 JWT verified against MUSIQ Network public keys (JWKS).
The MUSIQ Network `sub` value is the permanent external account key for cross-system mapping.
Membership lifecycle changes are pushed by signed webhooks; server-side membership lookup supports reconciliation.
MUSIQ Central must provide callback/ACS, webhook, allowed return-domain and staging URLs once infrastructure/domain decisions are implemented.
## 9.2 Reward / Activity Interface — Still Required
Canonical activity submission contract and accepted event types.
Required evidence fields / pre-validation expectations.
Validation lifecycle and status/reconciliation model.
Authoritative reward-rule source/versioning.
LYRIQ settlement/result contract and correction/reversal behavior.
Production status of relevant APIs/contracts: LIVE / TESTED / IN DEVELOPMENT / PLANNED.
## 10. Non-Functional Requirements
## 11. First Implementation Target — Streaming & Discovery Vertical Slice
The immediate implementation target is one complete, testable path rather than a broad collection of disconnected features.
## 1. User authenticates through the agreed identity path.
## 2. User establishes an artist profile/channel.
## 3. Artist uploads one track plus required metadata.
## 4. Track enters controlled publishing state and becomes discoverable/streamable.
## 5. Fan authenticates, discovers the artist/track and streams it.
## 6. Stream/activity is recorded as an application fact with idempotency/evidence.
## 7. Fan can follow the artist, creating the first owned audience relationship.
## 8. Where supported, qualifying activity is submitted through the Block Reign integration boundary.
## 9. Result/evidence is reconciled without making MUSIQ Central depend on synchronous blockchain success.
## 10. Entire path is observable and demonstrable in staging.
## 11.1 Success Criteria
One end-to-end behavior works in a real environment, not merely mock screens.
Artist can publish and fan can discover/stream.
Identity, state, permissions and event/evidence boundaries are explicit.
Block Reign integration can be attached through a narrow adapter without changing the core product model.
The slice provides a foundation for CRM, commerce, direct experiences and additional portals.
## 12. Product Decisions / Open Items
## 13. Product Governance & Ideation Process
Sunday 9 PM product sessions are the recurring ideation forum for Shawn, Samirac and designated MUSIQ stakeholders.
Ideas are captured in a Product Decision & Idea Log before they are treated as requirements.
Shawn is the primary business/product decision path for MUSIQ Central unless another authority is explicitly designated.
Samirac translates confirmed product direction into functional requirements, technical architecture and implementation backlog.
The executive summary, functional/technical specification and decision log remain living documents.
## 14. Decision Log
## 15. Change Log
CONFIRMED
Items supported by Shawn's direct product direction, project agreements/materials, or demonstrated current behavior.
WORKING
Current implementation/product direction that can guide design but remains subject to refinement.
OPEN
Items still requiring product, legal, economic, or integration decisions before they become binding requirements.
WORKING RULE
Ideas captured during product ideation do not automatically become requirements. They move into this specification when they are confirmed, adopted as working direction, or required to support an agreed implementation path.
CONFIRMED
The immediate wedge is music. The first implementation priority is a streaming/discovery portal that can become the foundation for additional artist, fan, commerce, education, and business portals.
ID
Actor
Role in MUSIQ Central
Status
ACT-001
Artist / creator
Creates and controls an artist presence, catalog, audience relationships, offers, events, and business activity.
Confirmed
ACT-002
Fan / listener
Discovers, streams, follows, purchases, participates, and may earn/use LYRIQ.
Confirmed
ACT-003
MUSIQ administrator
Operates user, artist, content, rights, reward, moderation, fraud, and platform controls.
Confirmed
ACT-004
Business / venue
May discover/book artists, host events, purchase services, and interact through future MUSIQ Central Live capability.
Working
ACT-005
Rights / contributor participant
Writer, producer, publisher, label, featured performer, collaborator, or other rights participant.
Confirmed
ACT-006
Affiliate / referrer
Refers members through the working two-level affiliate model.
Working
ACT-007
MUSIQ Network / Block Reign
Identity/membership source and network integration party for reward/LYRIQ/GNODI functions.
Confirmed
ACT-008
Node operator
Participates in the network infrastructure and node reward model; detailed application role remains to be integrated.
Confirmed / Open
ID
Requirement / Capability
Status
FR-I01
Support SSO using MUSIQ Network as the identity/membership provider for shared accounts.
Confirmed
FR-I02
Use MUSIQ Network subject identifier (`sub`) as the permanent external cross-system identity reference, while MUSIQ Central maintains its own internal account identifier.
Working
FR-I03
Maintain MUSIQ Central application roles/permissions separately from simple active-membership status.
Working
FR-I04
Support membership state synchronization through signed webhooks plus server-side reconciliation.
Confirmed
FR-I05
Define behavior for inactive/lapsed memberships and public/free access before launch.
Open
ID
Requirement / Capability
Status
FR-A01
Create an artist account/presence and establish an artist profile/channel.
Confirmed
FR-A02
Support artist verification/approval appropriate to the final business rules.
Working
FR-A03
Allow one account to participate in multiple roles where appropriate (for example artist and fan).
Working
FR-A04
Artist channel can present catalog, media, audience, offers, events, merchandise, and related activity.
Working
FR-A05
Define who may modify artist identity and under what authority.
Confirmed
ID
Requirement / Capability
Status
FR-M01
Artist can upload original music and associated metadata.
Confirmed
FR-M02
Each recording receives an immutable internal identifier independent of song title; duplicate titles by different artists are valid.
Decision
FR-M03
Catalog stores title, artist, release/version state, artwork/media references, contributors, identifiers and rights metadata as required.
Working
FR-M04
Support draft, submitted, reviewed, published, unpublished and removed states.
Working
FR-M05
Define distribution/licensing requirements, accepted formats, moderation and rights attestations before public upload opens.
Open
ID
Requirement / Capability
Status
FR-D01
Fans can stream/listen to published music through MUSIQ Central.
Confirmed
FR-D02
Search for artists, tracks, releases and content.
Confirmed
FR-D03
Support discovery beyond direct lookup, including emerging artists and recommendation experiences over time.
Confirmed / Working
FR-D04
Fans can follow artists and build playlists/saved collections.
Working
FR-D05
Listening and discovery activity is recorded as application events suitable for analytics and possible reward qualification.
Working
ID
Requirement / Capability
Status
FR-CRM01
Artists can see and manage the audience relationships they build on MUSIQ Central, subject to privacy/consent rules.
Confirmed direction
FR-CRM02
Support fan/customer segmentation based on permitted relationship, engagement, purchase, event, and campaign data.
Working
FR-CRM03
Support direct communication and campaigns to an artist’s eligible audience.
Working
FR-CRM04
Define artist data portability/export rules consistent with privacy, consent, platform safety, and legal obligations.
Open
FR-CRM05
Artist-facing analytics should explain audience growth, engagement, conversion, purchases, and campaign performance.
Working
ID
Requirement / Capability
Status
FR-AI01
AI can assist artists with campaign creation, audience segmentation, messaging, timing, offer selection, and follow-up.
Working
FR-AI02
Support “create once, distribute everywhere” workflows to authorized external social/media channels.
Working
FR-AI03
External channel integrations should use supported authorization/token mechanisms rather than storing third-party account passwords where avoidable.
Decision
FR-AI04
Automated outreach and campaign execution must respect user consent, platform permissions, rate limits, and explicit execution controls.
Working
ID
Requirement / Capability
Status
FR-C01
Fans can purchase merchandise through MUSIQ Central.
Confirmed
FR-C02
Fans can purchase tickets / event access.
Confirmed
FR-C03
Artists can create/host live or special events.
Confirmed
FR-C04
Support direct artist-fan paid experiences such as personalized messages/performances, lessons, mentoring, Q&A, livestreams, VIP access and similar offers.
Working
FR-C05
Define merchant-of-record, fulfillment, refunds, taxes, disputes, delivery and settlement responsibilities before production commerce.
Open
ID
Requirement / Capability
Status
FR-MEM01
Support a paid MUSIQ Central membership; $99/year is the current working price discussed, not yet final.
Working
FR-MEM02
Support a two-level affiliate model with current working commissions of 20% direct and 10% indirect on membership revenue.
Working
FR-MEM03
Define membership tiers, access rights, artist pricing and benefits before launch.
Open
FR-MEM04
Membership and affiliate events that affect rewards or blockchain state must have an explicit integration path to Block Reign.
Working
ID
Requirement / Capability
Status
FR-L01
MUSIQ experiences are intended to interact with LYRIQ.
Confirmed
FR-L02
Application activity must be recorded first; reward qualification occurs only after validation/rules are applied.
Decision
FR-L03
Working direction: annual membership may be paid in fiat/card while designated in-platform commerce may settle in LYRIQ.
Working
FR-L04
Current stated LYRIQ supply is 1 billion tokens; token economics remain external to this application specification and require authoritative network confirmation.
Working / Open
FR-L05
Define which purchases are LYRIQ-only, fiat-only, or either; also define pricing basis, conversion, on-ramp/off-ramp, refunds and artist settlement.
Open
ID
Requirement / Capability
Status
FR-Y01
Provide an education portal aimed at helping emerging entertainers understand the business side of a career.
Working
FR-Y02
Initial topics may include business formation, contracts, rights, royalties, taxes, bookkeeping, IP protection, audience ownership, marketing, touring economics and financial literacy.
Working
FR-Y03
Education can be contextual to artist milestones and platform activity rather than only a static course library.
Proposed
ID
Requirement / Capability
Status
FR-O01
User administration and artist verification.
Confirmed
FR-O02
Content/catalog moderation and takedown controls.
Confirmed
FR-O03
Fraud/abuse controls and reward administration.
Confirmed
FR-O04
Transaction visibility, audit history, analytics, monitoring and support.
Confirmed
FR-O05
Role/permission management with explicit authority boundaries.
Confirmed
ID
Entity
Purpose
DM-001
User
Internal MUSIQ Central account and application identity
DM-002
ExternalIdentity
Issuer + subject mapping to MUSIQ Network or other identity providers
DM-003
Membership
Membership state/tier synchronized from authoritative membership source
DM-004
Artist
Creator identity and artist-specific controls
DM-005
ArtistChannel
Artist-facing hub for catalog, audience, commerce, events and offers
DM-006
Track / Recording
Playable recorded content with immutable internal ID
DM-007
Composition / Work
Underlying authored work when rights model requires separation
DM-008
Contributor
Writer, producer, performer, publisher, label, collaborator
DM-009
RightsRecord
Ownership, splits, permissions, licenses and provenance
DM-010
AudienceRelationship
Artist-to-fan relationship and permitted engagement state
DM-011
Consent / CommunicationPermission
Communication and data-use permissions
DM-012
Campaign
Artist marketing/outreach campaign
DM-013
ExternalChannelConnection
Authorized social/media channel integration
DM-014
Playlist / Collection
Fan-curated music collection
DM-015
Offer / Experience
Artist service, personalized experience, lesson, VIP or other paid offer
DM-016
Event
Artist/live/special event
DM-017
Product / MerchandiseItem
Physical/digital commerce item
DM-018
Ticket / Admission
Event access entitlement
DM-019
Order / Payment
Commercial transaction and settlement state
DM-020
AffiliateRelationship
Direct/indirect referral relationship
DM-021
ParticipationEvent
Stream, follow, purchase, share, attendance, referral, campaign, etc.
DM-022
RewardEvent / LYRIQActivity
Qualified economic/reward outcome
DM-023
Wallet / BlockchainIdentity
External wallet/address linkage; private keys remain outside MUSIQ Central
DM-024
EvidenceRecord
Traceable evidence connecting application fact/decision to downstream action
DECISION
Song title is descriptive metadata, not identity. Two artists may publish tracks with the same title; recordings are distinguished by immutable internal IDs and applicable industry identifiers/metadata.
ID
Event
Meaning
EV-001
user.authenticated
User authenticated through approved identity path
EV-002
artist.created
Artist identity/channel established
EV-003
track.submitted
Music and metadata submitted
EV-004
track.published
Music made discoverable/streamable
EV-005
stream.recorded
Listening activity captured
EV-006
fan.followed_artist
Audience relationship created
EV-007
playlist.created
Fan/artist playlist created
EV-008
campaign.sent
Artist campaign dispatched through approved channels
EV-009
order.completed
Music/merch/ticket/service purchase completed
EV-010
experience.requested
Fan requests paid artist experience
EV-011
experience.completed
Artist experience delivered/completed
EV-012
event.attended
Fan attendance/participation recorded
EV-013
affiliate.referred
Referral relationship/activity recorded
EV-014
membership.changed
Membership state changed
EV-015
rights.changed
Consequential rights state change
EV-016
reward.qualified
Activity passed reward/admissibility rules
EV-017
gnodi.submitted
Approved action sent to network adapter
EV-018
gnodi.confirmed
Network evidence/finality received
ID
Technology / Pattern
Purpose
Status
TECH-01
Next.js + TypeScript
MUSIQ Central web experience
Working
TECH-02
Separate TypeScript API/application layer
Core domain and integration services
Working
TECH-03
PostgreSQL
Authoritative transactional/control data
Working
TECH-04
MongoDB / document store where justified
Document-shaped state/content that does not belong in relational core
Open / Working
TECH-05
Redis
Caching, rate limiting, ephemeral coordination and queue support
Working
TECH-06
Object storage + CDN
Audio, artwork and media delivery
Working
TECH-07
Vector store when needed
Semantic discovery/recommendation context
Open
TECH-08
Neo4j when graph requirements justify it
Relationship/graph workloads
Open
TECH-09
Durable event backbone when volume justifies it
Decouple activity, rewards, analytics and integration pipelines
Working
TECH-10
Dedicated Block Reign / GNODI adapter
Isolate external network concerns
Decision
ID
Requirement
Status
NFR-01
Scale horizontally without re-platforming the whole application.
Working
NFR-02
Media delivery scales independently from application/API compute.
Working
NFR-03
Consequential operations are auditable end-to-end.
Confirmed
NFR-04
Critical authorization/execution decisions are server-authoritative.
Working
NFR-05
External network outages must not corrupt authoritative MUSIQ Central state.
Working
NFR-06
Third-party integrations are isolated behind stable internal contracts.
Working
NFR-07
Observability includes logs, metrics, traces, event lineage and integration health.
Working
NFR-08
Secrets, keys and account ownership boundaries are explicitly assigned.
Confirmed
NFR-09
Architecture supports staged evolution from small team to multiple independently deployable domains.
Working
NFR-10
Privacy/consent state must be enforceable for audience data, marketing and external distribution.
Working
ID
Decision / Open Item
Owner
Needed By
PD-001
Final MUSIQ Central domain and DNS delegation/access.
Shawn / YBCS
Immediate
PD-002
Final production/staging account setup under YBCS ownership.
Shawn + Samirac
Immediate
PD-003
Initial membership tiers, benefits and access rules.
Shawn / Product group
Before launch
PD-004
Artist verification/onboarding model.
Product group
Before public artist onboarding
PD-005
Free vs paid artist upload/distribution model.
Product group
Before launch pricing
PD-006
Final streaming subscription price and family/other tiers.
Product group
Before launch pricing
PD-007
Which marketplace transactions require LYRIQ vs allow fiat.
Shawn + Cory + product/legal
Before commerce implementation
PD-008
LYRIQ pricing basis, conversion/on-ramp/off-ramp/refunds/artist settlement.
Cory + product/legal
Before LYRIQ commerce
PD-009
Authoritative reward rules and activity integration interface.
Cory / Block Reign
Before reward E2E test
PD-010
Artist data export/portability and consent policy.
Product/legal/architecture
Before CRM launch
PD-011
Merchant-of-record, tax, fulfillment and dispute responsibilities.
YBCS / legal / product
Before commerce launch
Date
Decision ID
Decision
Owner / Evidence
2026-10-13
DEC-001
YBCS is the current umbrella owner for MUSIQ Central production assets/infrastructure.
Shawn
2026-10-13
DEC-002
First implementation portal is Streaming & Discovery.
Shawn
2026-10-13
DEC-003
No firm public launch date until first end-to-end slice is running/tested.
Shawn + Samirac
2026-10-13
DEC-004
Working deployment direction is Vercel front end + DigitalOcean backend, with YBCS ownership/admin access for Samirac.
Shawn + Samirac
2026-10-13
DEC-005
Artist audience/database ownership is a core product differentiator.
Shawn
2026-10-13
DEC-006
Application activity is distinct from reward qualification.
Architecture
2026-10-13
DEC-007
Third-party social integrations should use authorization tokens/scopes rather than stored passwords where supported.
Architecture
2026-10-13
DEC-008
Song title is not a unique identifier; recordings use immutable internal IDs.
Architecture
Version
Date
Change
Author
0.1
October 2026
Initial functional + technical specification created before Phase 1 kickoff.
Samirac
0.1 — Oct 13 update
October 13, 2026
Integrated Shawn call direction: first streaming portal, artist-owned audience/CRM, AI marketing/distribution, direct experiences, membership/affiliate working model, LYRIQ commerce direction, YEES, YBCS infrastructure ownership, deployment plan, SSO state and open Block Reign reward interface.
Samirac
WORKING RULE
Update this specification as discovery and implementation produce evidence. Do not overwrite unknowns with assumptions. When an answer changes the architecture or product scope, record the decision and update the affected requirement.

---

## October 15, 2026 — Implementation and architecture reconciliation

**Status vocabulary:** `IMPLEMENTED` means code/infrastructure exists; `VERIFIED` means a specific demonstrated result; `DECIDED / WORKING DESIGN` means a technical direction without deployed implementation; `OPEN` requires further decisions or external evidence. These updates qualify superseded October 13 statements without implying final stakeholder ratification.

### Infrastructure and environments
- **DEV — IMPLEMENTED / PARTIALLY VERIFIED:** GitHub `dev`; Vercel `musiqcentral-dev` serving `https://dev.musiqcentral.com/preview` on HTTPS. Vercel All Deployments login protection enabled and user-confirmed. DigitalOcean `musiqcentral-backend` now deploys from `dev`, exposes `https://api-dev.musiqcentral.com/health`, and returned OK over HTTPS. The API's ordinary root returns an expected 404. Its business endpoints will require their own server-side authentication and authorization; frontend gating is not API security.
- **STAGING — DB PROVISIONED ONLY:** PostgreSQL database `musiqcentral_staging` and app role `musiqcentral_staging_app` exist. No staging app/frontend/API deployment, DNS, or end-to-end testing yet.
- **PROD — NOT DEPLOYED:** Production domain and production database/app infrastructure are not live. The GoDaddy apex remains unchanged; design production isolation and rollout only when approved.
- **Managed OLTP database — PARTIALLY VERIFIED:** DigitalOcean PostgreSQL 18 `musiqcentral-pg`, NYC3. Database `musiqcentral_dev` has dedicated app role `musiqcentral_dev_app`; database-level CONNECT separation from staging was verified. Schema-level permissions and live backend SQL calls are not yet proven. The operator saved a DEV-targeted private `DATABASE_URL` in DigitalOcean.
- **Runtime and database driver — IMPLEMENTED:** developer Node.js 24.22.0, npm 11.19.1; `pg` and `@types/pg` committed on `dev` at `d6009de`; reusable direct-PostgreSQL module `backend/src/db.ts` committed at `f21789f`. Local TypeScript build passed. Shared lazy connection pool, parameterized queries, checkout for transaction clients, and graceful pool shutdown. No ORM or second backend framework; no disposable database-test routes. Successful compilation is **not** evidence of a working DB connection.

### Identity isolation and normalized data architecture
- **DECIDED / WORKING DESIGN:** role-aware party model in PostgreSQL, people and organizations with multiple contextual roles; 3NF authoritative transactional facts and explicit FK/temporal rules as documented in `../database/DATA_MODEL_PRINCIPLES.md`. No application tables/migrations have been executed.
- PostgreSQL contains internal `party_id` and authorized business data; **it contains neither MusIQ Network `sub` nor `shadow_id`**. This supersedes any earlier references to storing/linking `sub` within the relational data model.
- Proposed restricted MongoDB mapping A: verified external MusIQ Network issuer + `sub` → persistent `shadow_id`. Separate protected mapping B: `shadow_id` → PostgreSQL `party_id`. Random cryptographic shadow ID issued once per external identity, persistent exact lookup afterward. Consider keyed HMAC index, unique/idempotent registration, encryption, credential separation and cross-store failure recovery. Neither mapping exists yet. Authentication contract with Block Reign is still proposed and must be confirmed.
- MongoDB provider remains open (DigitalOcean managed vs Atlas). Pinecone is preferred for eventual managed vector search, rather than committing to pgvector-first. No search/vector provisioned.

### Security and development gates
- **HIGH:** Backend application-level authentication, authorization and protection of sensitive API routes have NOT been implemented; public `/health` merely reports service readiness. Do not process real sensitive customer/rights/financial data or introduce privileged features until controls are enforced.
- **MEDIUM:** DEV database connection/permissions and frontend→API→DB communication still unverified; confirm by implementing the first actual persistent application operation using the reusable direct-SQL module.
- **MEDIUM:** STAGING/PROD require independent deployment targets, secrets, databases, access policies, evidence and release approvals.
- **LOW:** The `/` frontend route remains a starter page; branded preview is at `/preview`.

### Near-term implementation sequence
1. Complete the first reviewed normalized domain entity and durable backend operation using `pg`—verify actual DEV role connectivity and constraints during useful functionality.
2. Implement backend identity/access controls before exposing application-specific API routes.
3. Connect DEV frontend and authorized API routes; perform a real browser→API→database smoke path.
4. Establish and validate an isolated STAGING deployment after DEV is end to end.
5. Build Streaming & Discovery incrementally (artist party/profile, recordings/media metadata, controlled publication, fan discovery/engagement); external SSO, rewards and GNODI execution remain distinct gated integrations.

### Change control
This is an engineering implementation update, not client approval of unresolved economics, membership tiers, blockchain protocol details, rights, or monetization. The MusIQ Network Litepaper remains under review. Record client approvals against named decisions and retain historical requirements when superseded.
