# MusIQ Central — Engineering Rules

**Status:** Governing working engineering rules, approved October 15, 2026.  
**Applies to:** All code, schemas, infrastructure, integrations, and technical documentation in this repository.  
**Authority:** Project architect approval takes precedence over implementation convenience.  
**Review:** Amend deliberately; do not silently change these rules.

## 1. Supreme engineering principle

**ALWAYS MODULAR. SCALABLE. MAINTAINABLE. PORTABLE. SECURE. FORWARD-THINKING.**

These qualities are simultaneous requirements, not alternatives:

- **Modular:** Clear responsibilities, cohesive components, explicit interfaces, low coupling, and reusable functionality. A modular monolith is preferred initially; modular does not mean unnecessary microservices.
- **Scalable:** Account for growth in audience, workload, event throughput, data size, and organization without foundational redesign. Scale individual workloads when measured need justifies it.
- **Maintainable:** Readable, consistent, typed, documented, and diagnosable code. Keep complexity proportionate to actual requirements.
- **Portable:** Keep business rules independent of hosting vendors, databases, delivery channels, and external network providers. Isolate provider-specific integration behind replaceable adapters.
- **Secure:** Authentication, authorization, least privilege, verified TLS, sensitive-data minimization, fail-closed authority checks, and auditable consequential operations from the beginning.
- **Forward-thinking:** Support future artist, fan, commerce, event, education, and other portals without pre-building unapproved functionality.

**No unnecessary complexity.** Do not confuse future-readiness with speculative services, dependencies, tables, patterns, or infrastructure.

## 2. Change authorization — mandatory

**Do not modify source code, schemas, settings, infrastructure, or published documents until the project architect understands and approves the change.** For every material change, first explain:

1. The requirement and intended behavior.
2. Which module owns it and the boundary to other modules.
3. The concrete runtime mechanism: call path, inputs, outputs, state transitions, and dependencies.
4. Data structures and authority, including identity and temporal semantics where relevant.
5. Authentication, authorization, validation, logging, failure behavior, and recovery.
6. Exact files and deployment surfaces to be modified.
7. Acceptance criteria and how actual behavior will be verified.

Wait for explicit approval before writing. Approval for one change is not blanket approval for adjacent features or an unreviewed schema. Do not commit or push to `main` or launch production without explicit authorization. Prefer `dev` for approved engineering changes. Report changed files, commit IDs, significant diffs, and tests actually run.

## 3. Implementation conventions

- TypeScript throughout application logic: `.tsx` for JSX UI, `.ts` for backend modules. Keep existing Next.js/React frontend and Fastify backend; do not introduce another framework without approval.
- Design around domain modules with explicit boundaries, reusable services, clear contracts, and separate persistence/integration adapters.
- Reuse established code before adding dependencies or abstraction layers. Avoid copy/paste business rules and ambiguous cross-module ownership.
- Favor small, production-reusable increments, not disposable endpoint scaffolds or unnecessary testing frameworks.
- Use environment variables for configuration and provider secret stores for sensitive values; never commit passwords, tokens, certificate private keys, or connection strings.
- Protect external side effects with explicit execution contracts, verification, authority, idempotency, recorded outcomes, and recovery.
- Avoid frontend or integration adapters issuing authoritative rights, money, rewards, identity, or settlement decisions.

## 4. Database access and schema design

- **PostgreSQL is authoritative for relational business and consequential transactional state.**
- Use direct, parameterized SQL through existing `pg` and `backend/src/db.ts`. **No ORM.** Use the shared connection pool, explicit transaction clients where needed, and bounded connections. Never concatenate untrusted values into SQL.
- Enforce TLS with certificate-chain verification using provider CA trust; do not disable `rejectUnauthorized`. Keep connection credentials and CA material in secret configuration. Handle conflicting URL SSL parameters deliberately.
- Design relational business data in **Third Normal Form** by default; define explicit primary keys, foreign keys, nullability, uniqueness, check constraints, indexes and accurate transactional boundaries.
- Use the **role-aware Party model**: persons and organizations as parties, multiple contextual roles, and internal `party_id`. Prefer `BIGINT GENERATED ALWAYS AS IDENTITY` where appropriate.
- Specify appropriate `begin_date`, `end_date`, `update_date` and event timestamps according to actual lifecycle meaning; use append-only evidence/corrections for immutable records. Financial amounts use appropriately scaled `NUMERIC`, not floating point.
- Separate compositions, recordings, contributors, rights, published media and provenance. Song titles are not unique keys.
- **Review logical schema and SQL migrations before executing DDL.** Version schema changes, identify rollback/forward-fix, and test constraints and permission scopes in DEV. No blanket app-role superuser privileges.
- Never infer a successful runtime database connection from TypeScript compilation alone.

## 5. Identity and sensitive-data separation

- Keep MusIQ Network's verified external issuer/`sub`, persistent random `shadow_id`, and internal PostgreSQL `party_id` distinct.
- PostgreSQL stores business identity by `party_id`; **do not store external `sub` or `shadow_id` in application PostgreSQL**.
- Proposed separate restricted Mongo mappings: verified external issuer/`sub` → once-generated cryptographically random persistent `shadow_id`; `shadow_id` → internal `party_id`. Subsequent identity resolution uses precise indexed lookups, not deterministically generated shadow IDs.
- Design unique/idempotent onboarding, least-privilege credentials, keyed/protected indexes, audited access and cross-store failure recovery before implementation.
- MUSIQ Network SSO/membership, wallet, LYRIQ rewards and GNODI protocol details remain subject to verified partner contracts and approvals; the under-review Litepaper is not ratified law.

## 6. Security and execution boundary

- Authenticate and authorize **at the backend**, independent of frontend access gates. Validate caller, permitted scope, object ownership/role, current state and rule version before sensitive actions.
- Treat secrets, cookies, tokens, personal data, financial state and rights data as restricted. Encrypt communication and apply least privilege.
- Fail closed on missing authority or failed verification. Use idempotency/replay controls, bounded retries, and durable evidence for consequential actions.
- Keep public responses free of internal stack traces, secret values and confidential context. Validate inputs at trust boundaries.
- An event reporting activity is **not** automatically qualified for rewards or settled on GNODI. Integration outcomes require authoritative validation and reconciliation.

## 7. Logging, diagnostics and audit

- Use the existing structured **Fastify/Pino logger**, with configurable `LOG_LEVEL` (`silent`, `fatal`, `error`, `warn`, `info`, `debug`, `trace`; default `error`).
- Log meaningful errors and important state transitions at API, validation, persistence, identity, execution and external integration boundaries. Add sufficient context to diagnose issues, without flooding logs or continuously logging routine requests.
- Logging levels control **diagnostics**, not security guarantees. Use temporary higher verbosity for troubleshooting and restore quieter levels afterward.
- Never deliberately log passwords, keys, connection strings, access tokens, PII, sensitive request bodies, full SQL statements or SQL parameter values. Scrub or constrain error-context fields as needed.
- Preserve correlation identifiers and stable error classifications when useful, while avoiding sensitive fields.
- **Permanent business/security audit evidence is distinct from optional diagnostic logging and must not be disabled through `LOG_LEVEL`.**

## 8. Reliability, verification and environments

- Design known failure paths: transaction rollback, provider outage, timeouts, retries with idempotency, and safe state recovery. Never silently swallow errors.
- Build/typecheck, then verify actual behavior and boundary cases, including authorization failures, real database queries, data constraints and integration responses as features are developed. Describe what was and was not tested.
- **DEV first.** Do not create or claim a STAGING application environment until DEV is end-to-end functional and approved to advance. PROD last, with separate cluster, credentials, permissions, release gates and rollout approval.
- Current architecture: GitHub `dev`, Vercel frontend and DigitalOcean App Platform backend, managed PostgreSQL. Service and data availability must be demonstrated, not inferred from deployment labels.
- Do not expose private endpoints or real user data merely to simplify tests.

## 9. Documentation and evidence discipline

- Engineering source of truth: repository `docs/`, especially:
  - `docs/architecture/ARCHITECTURE_DECISIONS.md`
  - `docs/database/DATA_MODEL_PRINCIPLES.md`
  - `docs/specifications/FUNCTIONAL_TECHNICAL_SPEC.md`
  - `docs/specifications/SOURCE_CONTEXT_INVENTORY.md`
- Keep documented design, implemented code, proven runtime behavior and external stakeholder approvals clearly distinguished.
- Update existing canonical documents and filenames when work changes them. Do not create unnecessary “Updated”/“Revised” duplicate files.
- Client-facing or meeting-ready documents belong in the private Google Drive working area until expressly approved for Client Shared. Preserve branded Word/table formatting and avoid silently circulating drafts.
- Never promote unapproved product proposals, network economics, marketing figures or provisional integration assumptions into hard-coded business rules.

## 10. Working method

**Discuss → Explain mechanisms → Approve → Implement on `dev` → Inspect differences → Build/test → Verify deployed behavior → Update documentation.**

The architect retains technical decision authority. The assistant implements agreed changes, explains them clearly, and does not change architecture quietly.
