# MusIQ Central — Data Model Principles

**Status:** Approved structural direction; logical schema pending source reconciliation and review.  
**Date:** 2026-10-14  
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

**Confirmed PostgreSQL infrastructure:** Managed PostgreSQL 18 cluster `musiqcentral-pg` houses `musiqcentral_dev` and `musiqcentral_staging`, with distinct `musiqcentral_dev_app` and `musiqcentral_staging_app` roles. Database-level CONNECT isolation was checked successfully. Schema grants and a runtime connection from the backend have **not** been verified, and no logical party schema/tables have been created.

**Implementation method:** Direct parameterized SQL using `pg`; shared pool/query/client support in `backend/src/db.ts` (commit `f21789f`). Dependencies were committed in `d6009de`. The local TypeScript build passed with Node 24.22.0. No ORM, throwaway test endpoints or unnecessary additional frameworks. Verify DB access when building an actual reusable domain feature.
