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
