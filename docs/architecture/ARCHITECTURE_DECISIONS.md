# MusIQ Central — Architecture Decisions and Technical Direction

**Status:** Working architecture baseline — subject to Phase 1 discovery and stakeholder approval  
**Owner:** MusIQ Central project  
**Architecture lead:** Samirac Partners LLC  
**Date:** October 14, 2026  
**Scope:** MusIQ Central application and integration boundaries; not a ratification of GNODI/lyriQ protocol details.

## 1. Purpose and governing decisions

MusIQ Central is being built as a large-scale artist-and-fan platform for music discovery, listening, video, artist channels, events, commerce, community, and participation/rewards. The architecture must support incremental launch and substantial future growth without imposing avoidable rewrites or operational complexity.

**Decisions:**

1. Optimize for scalability, maintainability, clear contracts, operational reliability, and cost discipline—not familiarity with a particular language.
2. **TypeScript is the primary application language:** `.tsx` for React UI, `.ts` for backend and other non-JSX TypeScript modules. TypeScript catches many contract and refactoring errors at build time, but does **not** inherently increase runtime throughput and does **not** replace runtime validation or tests.
3. Use **Next.js + React** for the web experience and a **separately deployed Node.js + Fastify API** initially.
4. Begin with a **modular monolith**, not many microservices. Keep explicit module and API boundaries so high-volume or independently evolving workloads can later be extracted.
5. Keep **PostgreSQL authoritative** for transactional identity, rights, permissions, orders, balances/ledgers, and consequential state. Introduce other stores only where justified by concrete access patterns.
6. Separate user-facing applications from blockchain execution. No UI component or ordinary domain handler should issue direct GNODI writes; consequential actions require backend authority, validation, idempotency, evidence, and receipt handling.
7. Deploy and test in cloud environments. **No local development server** is part of the user's requested workflow.
8. Material technology or architecture changes must be **explained and approved before implementation**, including tradeoffs and migration consequences.

## 2. Current repository and deployment boundaries

Canonical repository: `cripper1/musiqcentral`  
Planned production domains: `musiqcentral.com` for the website; `api.musiqcentral.com` for the backend when configured.

```text
musiqcentral/
├── frontend/       Next.js / React / TypeScript (.tsx, .ts) → Vercel
├── backend/        Node.js / Fastify / TypeScript (.ts) → DigitalOcean App Platform
├── docs/           Architecture, decisions, integration contracts
├── .gitignore
└── README.md
```

Both applications share source control but **not** runtime deployment, secrets, databases, or scaling settings. Each hosting platform uses its corresponding root/source directory. GitHub push-based deployments and cloud previews are the preferred workflow.

**Current setup as discussed (not an independently audited deployment inventory):** frontend generated via `create-next-app` with TypeScript; backend initialized with Fastify, `@fastify/cors`, `dotenv`, TypeScript, `tsx`, and Node types; GitHub repo and Vercel/DigitalOcean configurations are being established. No completed backend application integration or production database wiring is assumed.

## 3. Technology choices and reasons

| Concern | Working choice | Architectural rationale / limits |
| --- | --- | --- |
| Web frontend | Next.js + React + TypeScript | Component ecosystem, routing, web rendering, typed frontend contracts; independent Vercel deployment. |
| Backend runtime | Supported Node.js LTS, provisionally Node 24 after compatibility validation | Shared TypeScript tooling and mature I/O ecosystem. Pin a supported runtime in deployment; do not assume a default. |
| HTTP framework | Fastify | Lean API foundation with schema-based request/response validation; modular organization must be established in code. |
| Core transactional database | Managed PostgreSQL | Strong transactions, constraints, referential integrity, auditable records and authoritative state. |
| Document workloads | MongoDB Atlas, selectively | Flexible documents for content/metadata where justified; **not** a parallel source of truth for financial or rights state. |
| Cache / ephemeral state | Redis when needed | Cache, rate limits and transient coordination; never authoritative financial/reward ledger. |
| Async/event processing | Transactional outbox first; durable queue/event broker as volume demands | Reliable propagation of activity and state changes, retries, replay and idempotency. |
| Media | Object storage + CDN + media processing | Audio/video/artwork bytes must not be delivered through the transactional API/database. |
| Search / discovery | PostgreSQL search and optional pgvector first; specialized indexes/services later | Avoid premature infrastructure; retain replaceable search interfaces. |
| Relationships | PostgreSQL authoritative; graph projection later if justified | Music rights and collaboration are graph-shaped, but a second authoritative graph store creates reconciliation risks. |
| ML / recommendation | Python services where justified later | Use ML/audio-analysis ecosystem where it offers concrete benefits; keep transactional execution in typed application services. |
| Blockchain / settlement | Dedicated GNODI adapter and controlled execution boundary | Prevent direct UI/feature writes; preserve authority, idempotency, provenance and reconciliation. |
| Frontend hosting | Vercel | Independent builds, preview deployments and CDN delivery. |
| Backend hosting | DigitalOcean App Platform | Independently deployable application/API with managed cloud runtime. |

**Do not confuse technology selection with validated capacity.** Neither TypeScript nor Fastify guarantees any particular user volume. Scaling capacity must be established through load testing, workload modeling, service limits, and operational monitoring.

## 4. Application domains and ownership

Initially use separately organized modules in the backend (logical boundaries first, physical services later):

- Identity, authentication, and role/permission authority
- Artist identities, channels, catalog, and publishing workflow
- Compositions, recordings, contributors, rights assertions, and provenance
- Fan profiles, discovery, follows, and community
- Streaming sessions and validated activity ingestion
- Events, tickets, merchandise, commerce, orders, and refunds
- Participation eligibility, lyriQ-related rewards, and reconciliation
- Administration, moderation, fraud controls, support, and audit
- GNODI/wallet/node integration behind explicit execution contracts

Each module should own its domain interfaces and state transitions. Never allow frontend screens, analytics jobs, or external node services to become implicit authority for financial, rights, or reward state.

## 5. Scale and reliability strategy

**Phase A — Establish trustworthy foundations.** Create one structured API deployment; enforce request validation, authorization, environment separation, observability, idempotency, migrations, and transactional constraints. Use transactional outbox for reliable state/event publication.

**Phase B — Isolate variable-volume work.** Put media delivery on object storage/CDN. Process streams, plays, engagement, transcoding, analytics and notifications asynchronously. Backpressure, deduplication and durable processing are required before claiming validated reward events.

**Phase C — Extract demonstrated bottlenecks.** Split ingestion, search, recommendation, media jobs, or integration adapters only when actual throughput, latency, ownership, or change cadence justify separate deployment. Preserve existing contracts and reconciliation mechanisms.

A million listeners should not mean a million long-lived audio feeds running through the core API. Actual media is CDN-delivered; APIs coordinate access, sessions, validated events, and resulting state.

## 6. Data and execution rules

- **PostgreSQL** is the source of truth for consequential records: identity grants, rights, financial transactions, order status, reward ledger entries, audit references, and idempotency keys.
- **MongoDB** may hold suitable content-oriented documents or metadata, after a documented ownership and retention decision. Do not duplicate authoritative transactional state without a defined projection/reconciliation model.
- **Playback activity** is high-volume event data, not equivalent to verified unique human participation. Separate raw events, validation, qualified reward decisions and immutable settlement evidence.
- **GNODI and lyriQ** interfaces, exact token mechanics, nodes, wallet custody, confirmation/finality, and governance details require evidence from actual Block Reign/GNODI systems and authorized MusIQ decisions. Product drafts or a pending-ratification litepaper alone do not make these final.
- **Privacy:** Minimize personal information sent on-chain. Keep PII and customer operations off-chain unless a documented, authorized requirement states otherwise.
- **Execution boundary:** All consequential external effects must pass through authenticated authority, current policy/rule checks, validation, replay/idempotency controls, and reliable receipts/correction paths.

## 7. Engineering and deployment conventions

1. Single GitHub repository, separate `frontend/` and `backend/` package and deployment boundaries.
2. Frontend uses `.tsx` when rendering JSX; backend uses `.ts` for TypeScript modules. Avoid arbitrary language conversions solely for consistency with earlier JavaScript projects.
3. Keep credentials in hosting provider environment variables/secrets; never commit `.env` files or connection strings.
4. Use GitHub commits/pull requests and Vercel/DigitalOcean cloud deployments for development verification; do not require `npm run dev` locally.
5. Backend listen port should honor `process.env.PORT` (initial DigitalOcean HTTP port discussed: `8080`) and bind to `0.0.0.0` in its cloud container.
6. Pin and verify a supported Node.js version and compatible dependencies; the earlier local Node 20 engine warning indicates an incompatibility requiring resolution before deployment.
7. Investigate dependency vulnerability reports without blind force-upgrades that may break APIs.
8. Maintain schema migrations, automated tests, deployment logs, health/readiness checks, and rollback paths as the application matures.
9. Avoid premature autoscaling or multiple always-on containers while the initial workload is small; revisit capacity based on monitored demand.
10. Do not replace, restructure, rename, or restyle existing project components without review of their current structure and explicit approval.

## 8. Decisions still open / requiring verification

| Decision | Status / trigger |
| --- | --- |
| Final Node LTS major for both hosted applications | Provisional: Node 24; validate host support, package engines and CI/build compatibility before pinning. |
| Choice of backend module framework/organization beyond Fastify | Open until backend requirements and code structure are reviewed. |
| PostgreSQL service/provider and production region | Open; optimize latency, operations, resiliency and cost relative to deployed API. |
| MongoDB collections, event retention, index plan and exact necessity | Open; user has initiated Atlas setup, but workloads are not yet characterized. |
| CDN, object storage, transcode pipeline and rights enforcement | Open; requires catalog/traffic/licensing discovery. |
| Durable queue/broker selection | Open; transactional outbox baseline first. |
| SSO, wallet architecture, keys, GNODI capabilities, node event contracts, reward settlement | Open; require Block Reign/GNODI technical confirmation and authorized decisions. |
| SLA/SLO, disaster recovery, capacity tests and security/compliance scope | Open; define before production launch. |
| Exact page design/CSS implementation | Approved visual direction exists; implementation must honor existing file/layout conventions and client-approved MusIQ branding. |

## 9. Change-control rule

For any proposed framework, database, language, hosting, schema, or module-boundary change, document **what changes, why, alternatives considered, benefits, costs/risks, compatibility impact, and whether it has stakeholder approval** before writing code. If a choice is merely recommended, label it *provisional*; never present it as a ratified project decision.

---

**Related working references:** `MusiQ_Central_Phase_1_Kickoff_Working_Guide.docx`, `MusiQ_Central_Functional_Technical_Spec_v0.1.docx`, `Music_Central_Gnodi_Integration_Architecture_v0.1_Updated.docx`, and the under-review MusIQ Network Litepaper v1.0. The Litepaper remains pending ratification.

## 10. Verified development environment and implementation decisions (October 15, 2026)

**Confirmed in GitHub and through operator-verified deployment screenshots:**
- Branch `dev` is the development source; Vercel project `musiqcentral-dev` uses `dev` as its source branch and serves `https://dev.musiqcentral.com/preview`. Vercel **All Deployments** authentication was enabled and the user confirmed an unauthenticated browser was challenged. Vercel calls that project's branch deployment its internal "Production" environment; that is **not MusIQ's production environment**.
- DigitalOcean App Platform service `musiqcentral-backend` was switched to `dev` with autodeploy enabled; `https://api-dev.musiqcentral.com/health` returned `{"status":"ok","service":"musiqcentral-backend"}` over HTTPS. The bare API root returning HTTP 404 is expected. **Backend endpoints are not secured by Vercel frontend authentication**; sensitive routes require independent authentication and authorization.
- GoDaddy controls DNS. `dev` CNAME points to the Vercel-assigned domain; `api-dev` CNAME points to `musiqcentral-backend-6bya9.ondigitalocean.app`. No production apex/domain cutover was performed.
- Managed DigitalOcean PostgreSQL 18 cluster `musiqcentral-pg` in NYC3 hosts separate `musiqcentral_dev` and `musiqcentral_staging` databases. Separate login roles `musiqcentral_dev_app` and `musiqcentral_staging_app` passed database-level CONNECT permission cross-checks. Schema-level permissions and live service queries remain untested. Production must use a distinct cluster when approved.
- DigitalOcean backend `DATABASE_URL` was configured by the operator for the dedicated dev database/app role and private connection. **The runtime query is not yet verified.**
- Developer workstation uses Node 24.22.0/npm 11.19.1. `pg` and `@types/pg` were added at commit `d6009de`. Reusable direct PostgreSQL driver module `backend/src/db.ts` (lazy connection pool, parameterized queries, transaction client, graceful close) added at `f21789f`; developer pulled it and ran a successful TypeScript build. No ORM or additional backend framework is intended; retain existing Fastify.
- **DEV:** frontend and API domains working, frontend gated; app DB integration and API authorization outstanding. **STAGING:** separate database/role only; app deployment not started. **PROD:** not deployed.
- No throwaway test routes or redundant testing infrastructure. Test database connectivity by integrating first durable real application feature; keep normal build checks. Do not claim a database query succeeded because compilation succeeded.

**Explicit working design decision — identity privacy:** MusIQ Network's permanent externally verified JWT `sub` shall not be stored in application PostgreSQL. PostgreSQL holds only the internal `party_id` for core identity and relations. Separate access-restricted MongoDB mapping A resolves external (issuer, sub) to a cryptographically random, once-issued persistent `shadow_id`; separate mapping B resolves `shadow_id` to internal `party_id`. Subsequent logins resolve mappings exactly, optionally by keyed HMAC index for external lookup. No deterministic generation of shadow IDs from external identities, and no shadow ID in PostgreSQL. Design remains pending implementation, hardening, access boundaries, and authorization review.

**Correction to earlier provisional choices:** Do not assume pgvector-first search; Pinecone is preferred for managed vector search if a vector service is needed. Mongo provider is open (DigitalOcean managed MongoDB versus Atlas). Avoid describing identity mapping as link to external `sub` inside PostgreSQL.

**Next implementation gate:** integrate the first reviewed normalized data entity and a real authorized database operation using `backend/src/db.ts`, verify runtime dev credentials and privileges, and enforce backend endpoint authorization before any sensitive user or business data.

## October 15, 2026 — Runtime logging policy and implementation

**Implemented on GitHub `dev`:** Fastify's existing logger is the single backend logging facility; no extra logging dependency. `LOG_LEVEL` accepts `silent`, `fatal`, `error`, `warn`, `info`, `debug`, or `trace`; default `error` keeps normal operation quiet. `silent` disables logging. Automatic request completion logging is disabled even when log level is raised; add targeted domain diagnostics only where justified.

`backend/src/db.ts` delegates to the Fastify logger for unexpected idle pool faults, failed parameterized queries and failed pool client checkout. DB log calls do not deliberately include SQL text, query parameters or database connection strings. Standard Fastify/Pino redaction rules cover common authorization/cookie fields; treat arbitrary error objects and operational logs as privileged, not public data. The API's clean shutdown closes its database pool.

**Operations:** Set `LOG_LEVEL=error` for routine DEV; temporarily increase to `info` or `debug` to investigate a specific problem, then lower it. `LOG_LEVEL=silent` silences all logs and should only be used deliberately, since it suppresses error diagnosis too. Configure using hosting environment variables; never expose log level controls, logs or secrets to browser users. Log errors at meaningful authority, external integration and persistence boundaries, not every function call. Preserve correlation IDs and structured context when building new operations; avoid PII, tokens, request bodies, SQL parameters and excessive event volume. Future security audit events and mandatory operational evidence must be recorded separately from optional diagnostic logging.

**Verification:** Source commits `04e8f54` (DB) and `890a61b` (API) are in `dev`. New logging changes still require local build and cloud deployment verification; do not equate committed code with deployed behavior.
