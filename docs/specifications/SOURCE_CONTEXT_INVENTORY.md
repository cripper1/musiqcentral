# MusIQ Central — Source Context & Requirements Inventory

**Status:** Working source reconciliation; **not** a database schema or approval of open product decisions.  
**Review date:** 2026-10-14  
**Purpose:** Establish what is documented, what has been decided, what is proposed, and what is missing **before** PostgreSQL schema design or migrations.

## Evidence and authority rules

1. Signed agreement/SOW controls contractual scope; it does not automatically approve every aspirational product feature.
2. Direct dated decisions from Shawn/YBCS govern product direction, subject to later changes.
3. Demonstrated interfaces and current Block Reign documents govern what can actually integrate; a working interface proposal is not a deployed contract.
4. Updated October 13 functional specification supersedes older working drafts on changed product direction, but unresolved issues remain open.
5. The MusIQ Network Litepaper v1.0 explicitly states **under review and pending ratification**. LYRIQ rewards, points, allocations, governance, and economic assertions must not become hard-coded design facts.
6. Status vocabulary: **DECIDED**, **DOCUMENTED INTERFACE**, **WORKING**, **OPEN**, **EXISTING INFRASTRUCTURE (user-verified)**.
7. Requirements should reference sources, owner, effective date, and decision status before becoming tables, constraints, or integrations.

## Source register — Google Drive (live reviewed)

- [October 13 updated Functional + Technical Specification](https://docs.google.com/document/d/13bPXwM6iKAvqVx0nSApSb6RSdLx9sqWg/edit): principal living product/technical document; dated status definitions, decisions, initial domains and first slice.
- [October 13 Call Summary & Decision Record](https://docs.google.com/document/d/19qoqGjYb-N3PFhPDdM155aAWIKE1eSUB/edit): Shawn’s latest direction, scope tiers, priorities, open commercial models.
- [October 11 Musiq Network ↔ Musiq Central SSO & Membership Integration](https://docs.google.com/document/d/15KANacu1ggCl5V4NoarVUCHpxfJ51JBj/edit): Block Reign/Cory interface proposal; particularly significant for identity ownership and identifiers.
- [October 7 Block Reign Integration Working Note](https://docs.google.com/document/d/14jWQUds8wX0cHyQmSsIqTDDjO10bRVpC/edit): application activity, evidence, reward boundaries, proposed event envelope and integration asks.
- [October 9 Weekly Status Report](https://docs.google.com/document/d/1pnOcUICpEmAljwG88UgyOJc2s3sPwE-u/edit): at-the-time dependencies, infrastructure and authority questions; superseded where later decisions exist.
- [Phase 1 Kickoff Working Guide](https://docs.google.com/document/d/1sSGQbxX5TFkBEf3Ppqk_X_ml3AiBh-ET/edit): architecture validation questions, Phase 1 flow, gaps and verification checklist.
- [Phase 1 Technical Interface & Information Request](https://docs.google.com/document/d/17T1dFAgm6EPG_paACndsQOM4p5JLlFIB/edit): explicitly requested GNODI APIs, wallet/node interfaces, reward results, idempotency and test evidence.
- [MusIQ Google Drive project root](https://drive.google.com/drive/folders/13GDnAat0lcDaA3HvGqr2rBdObQVujPmj): child folders include Agreement & SOW, Client Inputs, Samirac Private Working, Client Shared, Meetings & Notes, Billing. Top-level and known nested source folders were inventoried, including Technical & Architecture, Weekly Status Reports, Reference, Product Concepts & Marketing and the empty Deliverables folder. Historical revisions and any materials outside these folders remain outside this audit.

## Source register — supplied project files (local reviewed)

- `Under-Review_Musiq-Network.pdf` — network litepaper, **not ratified**.
- `MusiQ_Central_Functional_Technical_Spec_v0.1.docx` — earlier working specification; **not** the latest October 13 Drive revision.
- `Music_Central_Gnodi_Integration_Architecture_v0.1_Updated.docx` — distinct application, nodes, participation/LYRIQ, and settlement/GNODI boundaries.
- `MusiQ_Central_Phase_1_Kickoff_Working_Guide.docx` — technical discovery questions and initial functional spine.
- `MusIQ Initial RFP.odt`, `Samirac_MusiQ_Preliminary_Product_Architecture_Delivery_Proposal.*` — proposal stage, do not elevate automatically to requirements.
- `Samirac_MusiQ_Professional_Services_Agreement_Branded.docx`, `Samirac_MusiQ_Professional_Services_Agreement_YBCS_Adobe_Sign.pdf`, `Samirac_MusiQ_Professional_Services_Agreement_Fillable.pdf` — SOW copies/variants; execution evidence needs independent confirmation if relied on contractually.
- Other ODT, duplicated SOW, and branded variants were inventoried; avoid treating copies as separate decisions.
- Current conversation shows the new GitHub `cripper1/musiqcentral`, Next.js `frontend/`, Fastify/TypeScript `backend/`, Vercel frontend deployment workflow, DigitalOcean backend health response, and managed PostgreSQL setup. These are **user-reported and screenshot-supported**, not verified directly against live source repositories.

## Product concept marketing material — reviewed, **NOT ratified product rules**

The Drive `04 Client Shared/Reference/Product Concepts & Marketing` folder contains ten separate concept PDFs: **Spotlight Awards**, **Live Business Portal**, **Fan Stage**, **Fan Marketing**, **Fan Legends**, **Artist Marketing**, **Artist Legends**, **Artist Earning Opportunities**, **Artist Dollars and LYRIQ**, and **LYRIQ Digital Rewards Marketing Pages**. These supply significant future scope (recognition/badges/genre ladders, karaoke and fan performances, booking/venue sourcing, services/lessons, creator earnings, fiat/LYRIQ payout mixes, and reward catalogs), but each is labeled proposed/development/subject to final rules.

**Do not implement promotional figures as approved business logic.** Examples include a fan reward flyer offering a 10% discount at 100 points/month, several activity point values, and an Artist Dollars/LYRIQ flyer suggesting 100% dollars, 75/25, 50/50 and 100% token payouts. These **may conflict with the under-review Litepaper's LYRIQ non-fiat-redemption framing** and must receive explicit legal/product/economic reconciliation before schema or settlement code.

Source folder: [Product Concepts & Marketing](https://drive.google.com/drive/folders/1-PaUBtZwxOy1ejKEuX7_T_raPEKmmUbw).

## Established product direction

| Topic | Evidence-based position | Status |
|---|---|---|
| Mission | Artist-first place for 'everything music'; fans discover and participate; artists own audience relationships | DECIDED / product direction (Oct 13) |
| First portal | **Streaming & Discovery** | DECIDED |
| First complete user path | SSO/auth → artist profile/channel → upload metadata/media → controlled publication → fan discovery/stream → app activity fact → follow/owned audience; reward adapter later | DECIDED as implementation priority |
| Artist audience | Artist-controlled book of business, audience relationships and eventual CRM portability subject to policy/consent | DECIDED principle; data rights operational rules OPEN |
| Additional modules | CRM, AI marketing/distribution, commerce/ticketing/merch, direct experiences, memberships/affiliates, YEES, booking/events, future portals | WORKING concepts; module-level rules OPEN |
| Frontend/backend | Next.js/TypeScript on Vercel; TypeScript/Fastify backend on DigitalOcean | EXISTING INFRASTRUCTURE / current choice |
| Contract & delivery | Discovery baseline; separate implementation authorization, demonstrate first complete slice | Signed SOW governs if executed |
| Network chain | Application ≠ reward authority; node/protocol validates; GNODI finalizes settlement | DOCUMENTED architectural boundary; contract specifics OPEN |

## Identity and access — highest-priority source correction

Block Reign's October 11 SSO document states **Musiq Network is the identity and membership system of record for shared accounts**; this is a **proposed shared-account integration** and confirmation is requested from MUSIQ Central. Thus **do not assume MusIQ Central owns membership truth or credential/password authentication**.

- External stable account identifier is JWT **`sub`**; never key cross-system records by mutable email or wallet address.
- Proposed authentication handoff: short-lived **RS256 JWT** (~60-second expiry), remote **JWKS** verification, issuer/audience validation, `kid` key rotation, reject reused `jti` (retention at least 2 minutes), limited skew.
- Membership changes: signed webhook events `membership.activated`, `.renewed`, `.canceled`, `.resumed`, `.ended`; HMAC signature verification, delivery id dedupe, retries, reconciliation against membership status API.
- Signed-in membership state and local application-specific profile, artist role and preferences must be modeled separately from the remote authority.
- Ownership issue: whether SSO will be the only identity mode or whether separate identities coexist is explicitly **OPEN** until acknowledged by Shawn/Block Reign. Avoid an irreversible local login/account schema assumption.
- **Security:** never store JWTs, API keys, or webhook shared secrets in project source or this document.

## Core domain context — candidates only, NOT table definitions

**Actors:** external member/user, artist, fan/listener, collaborator/contributor, rights holder, label/publisher/distributor, administrator/operator, partner and network participant (distinct actor roles may overlap).

**First-slice facts:** application account mapping, artist profile and channel, sound recording, musical composition distinction, contributors/roles, uploads and immutable media identity, catalog/publication state, stream/playback facts and evidence, follow/artist audience association, searchable discovery metadata.

**Adjacent business domains under consideration:** playlists; audience/CRM and consent; events, livestreams and tickets; merchandise and digital products; orders, payments, payouts and refunds; subscriptions and affiliate/referral relationships; direct artist experiences; education/YEES; rights splits/disputes and provenance; administration and moderation; notifications and external campaign integrations.

**Network bridge:** canonical application event, event payload version, actor/subject, occurred/received times, idempotency key, evidence references, submission and response correlation, status transitions, protocol rule version, reward outcome and later settlement reference.

**Important music identity requirement:** the October 13 specification explicitly says song title is **not** a unique key; recordings require immutable internal identifiers. Composition ≠ sound recording. Rights ownership and temporal changes need domain review before normalization.

## Service ownership and data authority (proposed boundaries)

- **PostgreSQL managed at DigitalOcean:** local authoritative application business data (profiles, artist/content/rights state, consent, commerce **only where MUSIQ Central is merchant/system of record**), link to stable network `sub`, immutable event/evidence references. Planned 3NF/OLTP design. Current DO cluster/user screenshots show PostgreSQL 18 in NYC3, database `musiqcentral`.
- **Musiq Network/Block Reign:** proposed external authentication and membership system of record, Musiq Node sales and network rewards, LYRIQ economics, smart-contract interfaces; rights of authority must be validated before schema.
- **GNODI blockchain:** on-chain settlement, transaction receipts and network state; never pretend off-chain application events are settled until external proof returns.
- **MongoDB:** document workload boundary is not yet fully specified; DO Managed MongoDB under evaluation versus Shawn's Atlas cluster.
- **Pinecone:** preferred dedicated managed semantic/vector retrieval (user's operating preference); embeddings and vector IDs derive from source-of-truth objects, not a second authority.
- **Media storage/CDN:** audio/video/artwork binaries outside relational/document stores; object references, integrity, publication status and access rights in application records.
- **Valkey/Kafka/search/graph:** planned separation based on workloads and benchmarked necessity; their schemas and event retention need separate evaluation.

## Database design policies supplied by project architect (NOT YET complete)

- Standard surrogate primary keys: `BIGINT GENERATED ALWAYS AS IDENTITY`, unless a clear exception is documented.
- Temporal fields usually `begin_date`, `end_date`, `update_date`; confirm timestamp/date precision and timezone, update semantics, and whether additional creation/audit columns are mandatory before DDL.
- **Third Normal Form** for transactional domains by default; explicit foreign keys, unique constraints, referential integrity, financial `NUMERIC`, immutable audit/event identifiers, index strategy governed by real query shapes.
- High-volume playback events, protocol events, and reporting should be handled with deliberate partition/ingestion/retention patterns, rather than degrading authoritative OLTP.
- These are *partial house rules*. Obtain/review the complete user standards/rules files before drafting migrations.

## Conflicts and design blockers requiring decisions

1. **Identity:** shared Musiq Network SSO is documented and actionable, but the 10/11 integration note explicitly requests confirmation. Do not assume a local password system or independent membership authority.
2. **Membership/affiliate economics:** 10/13 working idea of $99 annual membership and 20%/10% affiliate splits is not a ratified economic model; system of record and refund implications OPEN.
3. **LYRIQ:** litepaper reward points/economic values are provisional and in places inconsistent; marketing concepts also propose fiat/LYRIQ mixed payout and token conversion that may contradict the litepaper non-fiat-redemption language. Obtain legal/economic signoff; do not hard-code these into schema constraints, UI, or payout logic.
4. **Rewards/events:** application event is not reward qualification; Block Reign interface/payload lifecycle and evidence semantics still pending.
5. **Rights:** composition/recording ownership, split versions, validations, jurisdiction/territory, dispute and amendment policy unresolved.
6. **Commerce:** merchant of record, payout processor, tax/chargeback, fulfillment and settlement authority not resolved.
7. **Media:** delivery provider, upload/transcoding/copy-protection, track formats, licensing territory and retention need confirmation.
8. **Artist-owned audience:** consent, portability, suppression, privacy and business ownership controls need explicit product/legal agreement.
9. **Operational capacity:** expected users, peak playback, writes/sec, event retention, recovery RPO/RTO, DR and access policies not specified sufficiently for final index/partition plan.
10. **Database home rules:** user has more naming, temporal and transaction conventions than currently documented.
11. **Brand/name:** documentation alternates Music Central, MUSIQ Central, MusiQ Central, MusIQ Network, LYRIQ/Lyric; preserve distinct system boundaries and confirm canonical naming in formal specs.

## Gate before schema design

- Complete current Google Drive folder/revision inventory, including signed source of truth and any newly received Block Reign responses.
- Confirm identity system of record and local/external user key mapping.
- Finalize first-slice artist/track/composition/rights model and audience consent ownership.
- Obtain complete schema rules/naming/type/temporal conventions from project architect.
- Approve initial transactional domain boundaries and event ingestion/retention stance.
- Mark each proposed business entity **Confirmed / Working / Open**, with reference and decision owner.
- **No DDL or migrations until explicit schema review.**
