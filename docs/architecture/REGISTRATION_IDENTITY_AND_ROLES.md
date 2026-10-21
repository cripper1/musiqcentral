# MusIQ Central — Registration, Identity, and Evolving Roles

**Status:** Approved architectural direction; external SSO and reward contracts remain pending confirmation  
**Audience:** Shawn, product stakeholders, architecture and engineering  
**Date:** October 21, 2026  
**Related:** [Functional & Technical Specification](../specifications/FUNCTIONAL_TECHNICAL_SPEC.md), [Data Model Principles](../database/DATA_MODEL_PRINCIPLES.md), [Migration 001](../../db/migrations/001_core_schemas.sql), [Migration 002](../../db/migrations/002_reference_data.sql)

## The idea in everyday terms

**Registering answers “Who is this person?” It does not answer “What does this person do?”**

A person may join MusIQ Central without knowing whether they want to listen to music, perform, manage artists, or sell products. We should not force them into one category at sign-up. Their account remains the same as their participation grows.

A listener can become an artist. An artist can also be a fan, songwriter, or manager. A band or label may be an organization that several individual people represent. These are different relationships and responsibilities, not reasons to create duplicate accounts.

## What happens when someone joins

1. **Verify identity.** MusIQ Central receives a validated sign-in result from the agreed identity provider. Until MusIQ Network SSO is available, DEV may simulate an approved or denied provider response behind a strictly DEV-only boundary.
2. **Find or establish the person.** The restricted identity mapping resolves the external identity to the same internal person every time. For a new person, MusIQ Central creates a Party of type `person` and an Account linked to it.
3. **Start without a business role.** The person does not have to declare `artist`, `fan`, or another role to register. A new `core.party_role` row is not automatically required.
4. **Add roles when appropriate.** As a person chooses activities, MusIQ Central can record relevant business roles and relationships, using explicit product rules. A listening event does not automatically establish a formal fan classification unless the product defines that behavior.
5. **Authorize sensitive actions separately.** Saying “I am an artist” does not prove ownership of recordings or authorize managing a band, collecting revenue, or controlling another person's channel.

## One identity, many roles

| Example | What changes | What stays the same |
| --- | --- | --- |
| Someone registers | Person Party and Account are established | — |
| They listen to a song | Listening/activity records are created when that feature exists | Their Party and Account |
| They choose to identify as an artist | An artist business role may be recorded | Their Party and Account |
| They create an artist channel | A distinct channel is created and linked through a reviewed relationship/authority flow | Their Party and Account |
| They publish or sell music | Catalog, rights, authorization, and commerce checks apply separately | Their Party and Account |
| They manage a band | The band is a separate organization Party; scoped management authority is granted only after validation | Their Party and Account |

**A role describes a capacity. A permission grants authority. A rights assertion is a claim, not proof.** Those concepts must remain separate.

## How the database represents this

- `core.party`: the enduring business identity of a person or organization.
- `core.party_type`: person versus organization.
- `iam.account`: application account associated with a person Party.
- `core.role` and `core.party_role`: evolving business classifications, including multiple concurrent roles.
- `iam.auth_role` and `iam.auth_grant`: separately scoped and effective-dated access authority; role labels alone do not implement permissions.
- `artist.artist_channel` and `artist.channel_party`: a channel as its own asset and its relationship to people/organizations.
- `catalog.*` and `rights.*`: works, recordings, contributors, and claims with their own authority and evidence.

The initial five PostgreSQL schemas and 16 tables are recorded in Migration 001; Migration 002 seeds the first reference values. They establish the foundation, **not** a completed registration, publishing, rights-verification, or reward workflow.

## Relationship to MusIQ Network, LYRIQ points, and GNODI

The application needs a stable way to associate a verified person with external membership, participation, and any eventual points/rewards. It should **not** assume that the blockchain needs to know whether someone is an artist, fan, manager, or seller. Those are MusIQ Central application roles unless a confirmed external contract explicitly requires otherwise.

**Proposed identity boundary:**

```text
MusIQ Network verified issuer + external sub
             |
             v
Restricted identity mapping (MongoDB)
external identity -> persistent random shadow_id -> internal party_id
             |
             v
MusIQ Central PostgreSQL
core.party -> iam.account -> optional business roles / permissions
             |
             v
Validated application activity and eligibility
             |
             v
Controlled integration adapter -> external reward / settlement system
```

PostgreSQL does not store the external `sub`, the `shadow_id`, passwords, or identity-provider tokens. The external system's own authoritative participant key and exact mapping/reconciliation requirements remain to be confirmed. An external membership ID, points account, wallet address, and blockchain identity **must not be assumed interchangeable**.

A person can have many application roles while remaining one recognized participant for external reconciliation. Whether an activity earns points, how much, and who settles them are separate policy decisions; registration alone awards nothing.

## Practical benefits

- **Simpler sign-up:** people can join without picking a permanent label.
- **No duplicate identities:** one person can participate in many ways over time.
- **Room to grow:** artist channels, fan relationships, organizations, sales, and events extend the existing model.
- **Safer authority:** self-declared roles cannot silently become ownership or payment permissions.
- **Cleaner external integration:** application-specific roles do not leak into blockchain or reward contracts unnecessarily.
- **Traceability:** roles, representation, and grants can change over time without replacing the person's identity.

## What is decided versus still open

**Decided:** role-neutral initial registration; person and organization Party model; Account separate from business identity; multi-role classification; separate scoped authorization; PostgreSQL privacy boundary.

**Still to confirm with MusIQ Network / Block Reign:** SSO issuer, audience, JWKS and `sub` semantics; whether membership must precede access; external participant/points identifier; webhook and reconciliation contract; LYRIQ eligibility and reward rules; GNODI settlement identifiers and finality.

**Implementation sequencing:** build verified identity resolution and idempotent Party/Account onboarding first. The temporary DEV approval/denial simulator replaces only the unavailable external sign-in response, not the real PostgreSQL creation, identity mapping, or authorization logic. Do not expose simulated sign-in in staging/production.

## Example to explain it in one sentence

**“MusIQ Central registers the person once, then learns what they do as they participate; the network can recognize the same person for membership or rewards without having to manage every role they play inside the music platform.”**
