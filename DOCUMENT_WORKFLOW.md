# MusIQ Central — Documentation Workflow

**Status:** Working procedure approved by project architect, October 16, 2026.
**Scope:** Documents and delivery records, not an authorization to modify code, schemas, infrastructure or sharing permissions.
**Read with:** `AGENTS.md`, which governs approvals and engineering authority.

## Keep it simple

- Maintain **one canonical living source** for each substantive document in **03 Working — Samirac Private** on Google Drive. Prefer editable Google Docs for routine review and change history.
- Use Google Docs **Version history** for earlier revisions. For native Word/DOCX files on Drive, **Manage versions** exists, but keep significant prior versions explicitly if retention matters.
- Preserve canonical filenames. Do not accumulate `Updated`, `Revised`, `Final`, `v2`, etc. copies for routine edits. Distinct historical weekly reports are correctly separate dated files.
- Generate presentation-ready **DOCX and PDF release artifacts** from the living master when needed. These are intentional output formats, not competing working sources.
- For client-facing releases use approved Samirac / MusIQ Central branding: logo, cover, document-control/approval table, contents where useful, section heading hierarchy, readable technical/risk tables, header/footer, pagination and clear status. **No filler or gratuitous images.**
- Keep the authoritative engineering Markdown in GitHub `dev/docs/` reconciled with the high-level Drive documents. Cite commits, tested behavior, design decisions and open partner requirements accurately. Do not turn a design proposal into an implemented or approved claim.
- **Never move or share private working files into Client Shared without the architect's explicit approval.** Published deliverables may include corresponding polished DOCX/PDF copies once approved.
- Do not delete or overwrite historically unique information in cleanup. Distinguish document families, prior baseline material, exported copies and dated records.
- Never make unnecessary platform migrations. Google Drive plus GitHub version history is sufficient for now.

## Weekly reporting

- Every Friday: **new dated** MusIQ Central Weekly Status & Risk Report; daily work notes are its supporting evidence.
- Fixed five sections, in order:
  1. Executive Summary
  2. Weekly Accomplishments — Against Planned Goals
  3. Status by Workstream
  4. HIGH / MEDIUM / LOW Risks
  5. Next Week's Goals to Accomplish
- Show planned versus achieved, verified evidence, owned mitigation actions and checkpoints. HIGH risks are addressed immediately; unaffected work continues.
- Keep money, invoicing, Phase 2 commercial authorization and lengthy planning **out of weekly status reports**.

## Living specifications and handoff

- Canonical document families:
  - **MusIQ Central — System Architecture & Integration Specification**
  - **MusIQ Central — Functional & Technical Specification**
- Format in the same professional Samirac style as the weekly report. Explain the intended baseline, accomplished/verified work, current unresolved decisions, and planned next work. They are living controlled documents during Phase 2.
- Phase 1 closeout: checklist maps all eight signed SOW §4 deliverables to actual evidence, exceptions and status.
- Phase 2: a **separate** four-week sprint plan with week-by-week objectives, deliverables, dependencies, owners and acceptance tests; written client authorization and prepayment according to signed SOW.
- No change to approved contracts or governance through this file.

## Working habit

Before creating a new document: **find the existing canonical one first**. Update that file or its master, preserve version history, and create separate output copies only when the release format or reporting period genuinely requires it.
