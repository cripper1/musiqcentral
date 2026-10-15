# MusIQ Central — Project Documentation

GitHub is the authoritative working source for technical Markdown. Client-facing DOCX/PDF documents are generated and published to the approved Google Drive areas after review.

- `architecture/ARCHITECTURE_DECISIONS.md` — engineering direction and architecture decisions (working, not blanket stakeholder ratification).
- `specifications/SOURCE_CONTEXT_INVENTORY.md` — reviewed source documents, approved versus proposed requirements, and gaps.
- `database/DATA_MODEL_PRINCIPLES.md` — approved role-aware party and 3NF design direction; no schema yet.
- `integrations/` — future canonical interface contracts.

**Pending:** Bring the October 13 current Functional + Technical Specification from Drive into canonical Markdown without losing its newer content, and bring the complete GNODI integration architecture into canonical Markdown. The older local DOCX is not a substitute for the newer Drive specification.

Do not treat a working proposal or pending-ratification Litepaper as a final requirement. Update canonical Markdown via normal Git review, then generate complete client-facing DOCX and PDF, keeping published versions distinguishable from working drafts.

## October 15, 2026 — Infrastructure and development checkpoint

- Active development branch: `dev` in `cripper1/musiqcentral`. Use `dev` for ongoing commits.
- DEV frontend: `https://dev.musiqcentral.com/preview`, Vercel project `musiqcentral-dev`; all-deployment authentication enabled and confirmed.
- DEV API: `https://api-dev.musiqcentral.com/health`, DigitalOcean service `musiqcentral-backend`, deploying from `dev`; successful HTTPS health response. Frontend authentication does **not** protect API routes.
- DEV DB: `musiqcentral_dev` / `musiqcentral_dev_app`. Runtime DATABASE_URL was saved by the operator, but application database queries remain unverified.
- STAGING: `musiqcentral_staging` and `musiqcentral_staging_app` exist; no staging app deployments. PROD: not deployed; no production DNS cutover.
- Direct PostgreSQL driver `pg` and types committed at `d6009de`. Shared database pool in `backend/src/db.ts` committed at `f21789f`; local TypeScript build passed.
- User's implementation preference: incremental durable functionality, direct SQL, minimal dependencies, no throwaway database connectivity test routes.
- [October 15 progress and risk status](https://docs.google.com/document/d/1vb9dQRuOFAP9dGaRzXUsUu9kGVijKvkc4124TvGG_TY/edit) records detailed checkpoints. Client DOCX/PDF specification must reflect these canonical decisions while distinguishing built from planned.
