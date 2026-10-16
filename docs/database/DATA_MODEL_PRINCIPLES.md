# MusIQ Central — Data Model Principles

**Status:** Governing database engineering standards; logical schema and DDL require separate approval.  
**Updated:** 2026-10-15  
**Sources:** MusIQ Central architecture discussion and source inventory (`../specifications/SOURCE_CONTEXT_INVENTORY.md`).

## Governing principle

Design MusIQ Central as a platform rather than as a streaming-only application. Implement Streaming & Discovery first, while preserving a normalized foundation that can support artist CRM, commerce, events, education, services, rewards, recognition, and future portals without redefining core identities and relationships.

## Approved direction

1. Use a **normalized, role-aware party model**, not a `users` table as the universal business entity. People and organizations are parties; artist, fan, educator, promoter, venue, label, publisher, and other capacities are contextual roles and relationships. Roles and rights require explicit scope and lifecycle.
2. Target **Third Normal Form (3NF)** for authoritative relational business data. Use stable entities, explicit keys and relationships, referential integrity, and controlled history; avoid duplicated business facts across portal-specific tables.
3. Separate the internal party identity from application accounts, MusIQ Network's external permanent `sub`, profiles/channels, and wallet identities. SSO/membership authority remains subject to the agreed external interface and final product approval.
4. Treat songs/compositions, recordings, contributors, ownership assertions, published media assets, and rights as distinct concepts; do not infer identity or rights from song titles.
5. Prefer `BIGINT GENERATED ALWAYS AS IDENTITY` for internal surrogate primary keys, unless a documented entity-specific exception is justified. Globally exchanged event identifiers may require separate immutable UUIDs.
6. Specify `begin_date`, `end_date`, and `update_date` where their semantics match the entity lifecycle. Immutable activity/ledger records use event timestamps and append-only/correction patterns instead of artificial in-place updates.
7. Preserve authority boundaries: PostgreSQL owns consequential transactional state; high-volume activity, event transport, search projections, MongoDB documents, Pinecone embeddings, and GNODI/LYRIQ integration use domain-appropriate storage and explicit reconciliation.
8. Design future portal extension points around reusable party, relationship, offering, participation, authority, and evidence concepts; do not pre-build speculative tables for unratified business programs.

## To resolve before logical schema approval

- Define party subtypes, multi-role authorization scopes, person-to-organization authority, and changes of ownership over time.
- Reconcile MusIQ Network external `sub` with internal party identifiers, login accounts, memberships, privacy and fan/artist profiles.
- Confirm rights assertions, territorial restrictions, transfer/dispute workflows, and required evidence.
- Determine payment, merchant-of-record, LYRIQ, referral and reward authority; these are not approved economic rules.
- Set naming conventions, nullability and effective-date rules by entity class, retention, audit, migration, indexing, and partitioning policies.

**Do not execute CREATE TABLE statements until the source-grounded logical schema has been reviewed.**

## October 15, 2026 — Identity and implementation clarification

**Decided design boundary:** PostgreSQL business tables use the internal relational `party_id` only for party identity. They do **not** store MusIQ Network's external `sub` or the application `shadow_id`.

Two independently restricted, exact-match MongoDB mappings are planned:
1. Verified external MusIQ Network issuer + `sub` → persistent `shadow_id`.
2. Persistent `shadow_id` → internal PostgreSQL `party_id`.

Generate the shadow ID cryptographically once during first validated onboarding and persist it; subsequent login uses indexed deterministic **lookup**, not deterministic generation. Plan keyed HMAC indexes, unique keys, least-privilege access, encryption, idempotent onboarding and cross-store recovery. This design is approved as working architectural direction but is **not implemented**. External SSO authority/contract still requires partner confirmation.

**Confirmed PostgreSQL infrastructure:** Managed PostgreSQL 18 cluster `musiqcentral-pg` houses `musiqcentral_dev` and `musiqcentral_staging`, with distinct `musiqcentral_dev_app` and `musiqcentral_staging_app` roles. Database-level CONNECT isolation was checked successfully. Schema/object grants have **not** been verified and no logical party schema/tables have been created. Subsequently, the NYC3 cluster was relocated to NYC1; deployment of backend commit `fe02cf4` succeeded and its mandatory startup `SELECT 1` establishes verified DEV database connectivity with TLS.

**Implementation method:** Direct parameterized SQL using `pg`; shared pool/query/client support in `backend/src/db.ts` (commit `f21789f`). Dependencies were committed in `d6009de`. The local TypeScript build passed with Node 24.22.0. No ORM, throwaway test endpoints or unnecessary additional frameworks. Verify DB access when building an actual reusable domain feature.

## Database engineering standards — standing rules (October 15, 2026)

These govern all PostgreSQL schemas and SQL code. **Modular, scalable, maintainable, portable, secure, forward-thinking, with no unnecessary frameworks or operational overhead.** Prefer PostgreSQL-standard facilities and straightforward SQL over added runtime layers. Do not implement a new technology simply to comply with a theoretical pattern.

### 1. Domain boundaries and normalized ownership

- Separate identity/party, profile/channel, catalog/recording, rights, CRM, commerce, rewards and settlement into cohesive domain-owned structures. Define contracts between them and avoid circular ownership; a modular monolith with one database is acceptable.
- 3NF is the default for authoritative OLTP. One business fact has one authoritative storage location. Distinguish canonical state, derived projections, caches and immutable evidence.
- Choose entity boundaries by business meaning; do not use polymorphic catch-all tables, generic entity-attribute-value storage, JSON blobs or duplicate portal-specific copies as shortcuts around relational design.
- Preserve a reusable Party/person/organization/role/relationship core. Party roles are contextual and time/scope dependent, not hard-coded mutually exclusive identities.
- No implementation of unapproved business capabilities merely to prepare for possible future portals. Establish extension seams, not empty speculative modules.

### 2. Naming and structure

- Use **lowercase `snake_case`** unquoted SQL identifiers. Tables: descriptive singular entity nouns (e.g., `party`, `party_role`); junctions: meaningful named relationships. Columns: business-descriptive, avoid unexplained abbreviations.
- Primary key convention: `<table_name>_id` where sensible; foreign keys use referenced entity identifier (`party_id`), with explicit role qualifiers when multiple links reference the same entity (e.g., `created_by_party_id`).
- Name constraints and indexes predictably: `pk_<table>`, `fk_<table>_<relationship>`, `uq_<table>_<meaning>`, `ck_<table>_<rule>`, `idx_<table>_<access_pattern>`. PostgreSQL's generated names may be used for obvious PKs if the resulting convention remains consistent.
- Use schemas only when real ownership, access control or organizational boundaries justify them; do not introduce one schema per small module reflexively.
- No quoted mixed-case identifiers, needless prefixes, unnecessary synonyms or confusing overloaded columns.

### 3. Data types, identity and nullability

- Prefer `BIGINT GENERATED ALWAYS AS IDENTITY` surrogate keys for internal entities, with unique business keys when one exists. Distributed/external references can use immutable UUIDs or other explicitly reviewed types; never use titles, email or mutable labels as identities.
- Prefer `TEXT` for unrestricted textual attributes and `VARCHAR(n)` only when a meaningful limit is part of the domain contract; apply explicit validation at input boundaries.
- Use `NUMERIC(precision, scale)` for financial and exact-valued quantities; define currency units, rounding behavior, scale and constraints per domain. Never use binary floating point for money.
- Use `BOOLEAN` for genuinely binary facts. Use reference tables or reviewed check constraints for meaningful statuses that require lifecycle/governance; avoid magic numbers.
- Use `TIMESTAMPTZ` for instants (UTC application convention), `DATE` for actual calendar dates, and `TIMESTAMP` without zone only for justified wall-clock cases with specified timezone semantics.
- Specify `NOT NULL` for required attributes. Nullable fields require a defined meaning; distinguish unavailable, not applicable and not yet known when business logic requires it.
- Define safe defaults only when universal and semantically correct, not to conceal incomplete data. Use appropriate sizes and CHECK constraints, not arbitrarily huge types.

### 4. Temporal and historical truth

- Define `begin_date`, `end_date`, `update_date` according to the approved semantics of each entity; do not stamp them onto immutable records where they do not belong.
- Distinguish effective time from system creation, update, arrival and processing time. Use half-open effective intervals **[begin, end)** where appropriate and enforce non-overlap when required.
- Rights, organization authority, memberships, and other historical relationships must support changes without overwriting material history. Event/ledger evidence remains append-only with corrections/reversals rather than destructive rewrites.
- Timestamps must be generated consistently; never infer exact order or causality from client clock timestamps alone.

### 5. Referential integrity and constraints

- Implement validated primary keys, foreign keys, meaningful `UNIQUE` constraints, check constraints, and appropriate referential actions.
- Never rely solely on an API or UI to protect relational integrity. Define behavior for delete/restrict/cascade deliberately; avoid automatic cascades through financial, rights, audit or other consequential records.
- Use transaction-safe uniqueness to eliminate duplicate records under concurrency; review unique-index treatment of nullable and effective-dated relationships.
- Do not create unapproved tables or run irreversible DDL based on inference.

### 6. SQL access, transactions and boundaries

- Use `backend/src/db.ts` and the existing `pg` pool. Parameterize **all data values**. SQL identifiers cannot be parameterized: select them from an explicit allowlist if dynamic identifiers are genuinely required.
- Use explicit `BEGIN`/`COMMIT`/`ROLLBACK` on a **single checked-out client** for related writes. Never call pool-level `query()` to perform separate statements inside a transaction.
- Keep transaction duration short; do not hold relational locks while calling remote services. Use durable intent/outbox and reconciliation at cross-system boundaries when needed, subject to reviewed requirements.
- Use `RETURNING` for generated keys and updated values where appropriate. Check affected row counts for updates/deletes where optimistic concurrency or strict transitions apply.
- Specify statement/lock timeouts appropriate to workloads; bound retries, handle deadlock/serialization failures intentionally, and release clients in `finally`.
- Keep database errors internal and sanitized; diagnostics must not contain connection strings, query parameters, secrets or sensitive PII.

### 7. Indexes, access patterns and scale

- Every proposed index must serve a documented lookup, join, uniqueness or ordering requirement. Index foreign keys where access patterns warrant it; avoid redundant indexes that slow writes.
- Use bounded result sets and stable pagination; prefer keyset pagination for high-volume feeds where appropriate.
- Watch for N+1 query patterns and unbounded scans. Examine `EXPLAIN (ANALYZE, BUFFERS)` on safe representative test workloads before major performance changes.
- Normalize authoritative writes first. Add materialized projections, caches, partitions, read replicas or specialized search only when workload evidence and recovery plans justify the added complexity.
- Store large audio/video binaries outside PostgreSQL; only metadata, integrity references, rights, and publication state belong in core relational tables.
- For high-volume event streams, decide partition/retention and asynchronous ingestion from realistic volume projections, not assumed complexity.

### 8. Security, privileges and TLS

- Separate DEV, STAGING and PROD databases and least-privilege application roles; PROD must use separately approved resources. No application superuser, `CREATEDB`, `CREATEROLE` or schema ownership by default.
- Separate migration/DDL privileges from runtime DML roles. Grant only needed `CONNECT`, `USAGE`, table/view/sequence operations, and review default privileges for newly created objects.
- Enforce PostgreSQL TLS with a trusted CA and `rejectUnauthorized: true`. Keep credentials and certificates in environment secret management, not source control.
- Do not place network `sub`, `shadow_id`, JWTs, passwords or wallet private keys in the authoritative PostgreSQL Party schema; follow the approved two-stage mapping boundary.
- Define row/object-level access in backend authority logic. Use native database row-level security only after assessing actual trust boundaries and maintenance tradeoffs.
- Do not treat a private network, frontend login restriction, or TLS alone as sufficient authorization for sensitive data.

### 9. Migration and release control

- Migrations are reviewed, versioned SQL scripts in source control when migrations begin; choose the simplest maintainable execution method compatible with deployment and approvals. **No ORM or heavy migration framework by default.**
- Every migration proposal includes motivation, schema diff, data impact, privileges, expected lock/downtime behavior, validation SQL, deployment order and rollback/forward-fix.
- Prefer additive expand/migrate/contract changes; avoid dropping/renaming in-use columns without coordinated consumers and data preservation plans.
- Never run application-driven automatic DDL on server startup. Separate authorized schema deployment from ordinary API startup and connection verification.
- Apply to DEV first with representative data; validate constraints, indexes, privileges and real application queries. Later STAGING/PROD only through independently approved promotion.

### 10. Availability, recoverability and lifecycle

- Define backup retention, tested restore, recovery-point/recovery-time needs, integrity checks and disaster-recovery ownership before storing sensitive production data.
- For cross-system facts, record authoritative owners, reconciliation keys, event/result provenance and correction mechanisms. Never assume atomic transactions across PostgreSQL, MongoDB and blockchain systems.
- Plan retention, privacy erasure, archival, legal obligations and immutable evidence requirements explicitly, with owner approval.
- Avoid permanent connections per request and unnecessary polling. Size the pool for instance count, DB connection limits and workload rather than using arbitrary large defaults.

### 11. Review checklist for each new entity or SQL operation

Before approval, answer: **What business fact is stored? Who owns it? What identifier is immutable? What are the unique and foreign-key rules? What are nullable and temporal semantics? Which roles may read or write? What happens under retries and concurrency? What is the expected query shape and index? What transaction and error behavior apply? How will the change migrate, be verified, and be recovered?**

A passing build does not prove database integrity. A successful startup `SELECT 1` proves connection/authentication/TLS/query execution, **not** table grants, authorization, schema correctness, transactions or functional end-to-end behavior.

**Stop for architectural approval before executing the first Party schema DDL or introducing any database layer/framework.**

### 12. Authoritative Entity: billion-user forward scalability

**Governing rule: Build the foundation for a billion users. Deploy only what our first thousand users require.**

An **Authoritative Entity** is a domain entity whose canonical identity, business facts, lifecycle, or decision authority is owned by an identified source of truth. For **every Authoritative Entity**, the schema/design review **must define an eventual ownership and partitioning strategy before its data volume becomes a scaling limitation**. This is a design obligation, **not** authorization to deploy sharding, extra clusters, microservices, or a distributed database prematurely.

Before approving a new Authoritative Entity, document:

1. **Authority and ownership:** Which module and store own the canonical record and its permitted mutations? Which other stores hold projections only?
2. **Internal and external identity:** Define stable internal `BIGINT` keys for efficient relational operations where appropriate; separately define a globally unique opaque reference when cross-database, externally exchanged, or distributed identity requires one. Do not presume that a single database sequence generates globally unique identifiers across independently writable shards. Do not expose internal sequence IDs as universal distributed identity without explicit review.
3. **Projected scale:** Estimate entity cardinality, related record volume, write/read throughput, peak-to-average traffic, retention, indexing and expected growth. State the assumptions and revisit them using operational evidence.
4. **Future partition ownership:** Identify the likely partition/shard or workload boundary, routing/placement authority and rebalancing approach. Consider dominant query/transaction locality and avoid a design requiring routine distributed joins or transactions for core operations.
5. **Relationship locality:** Identify references that must remain transactionally co-located, and relationships that can safely cross partitions using stable references, async events, reconciliation and explicit consistency contracts.
6. **Evolution path:** Document how the initial normalized single-cluster design could evolve to partitioning, independent domain stores, replicas or services **without rewriting business identity and authority semantics**.
7. **Security and continuity:** Define how access policy, tenant/party isolation, provenance, audit, recovery, idempotency and ownership survive migration and rebalancing.
8. **Trigger and proof:** Specify measurable scaling signals (storage growth, index behavior, throughput, latency, pool/lock pressure) and migration test criteria. Partition only when evidence warrants the complexity.

**Design constraint:** Keep today's PostgreSQL implementation straightforward, normalized, modular, secure and portable. Avoid premature sharding, UUIDs on every table, unnecessary abstraction layers or vendor-specific infrastructure just to claim internet-scale readiness. Future partitioning is planned at the **Authoritative Entity** boundary and implemented only when justified and approved.

**Review checklist extension:** Every proposed authoritative entity must include an **Ownership + Partitioning Outlook** describing its likely growth, stable identity, partition boundary, migration path and the conditions that would trigger distribution.
