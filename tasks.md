# Implementation Plan: Tribhuban Parent Website

## Overview

This plan implements the Tribhuban Concepts public-facing website as a decoupled, content-driven platform: a Next.js (TypeScript, App Router) frontend and a FastAPI (Python) backend. Tasks are ordered so each step builds on the last, with no orphaned code, and every component is wired before the epic closes.

## Tasks

- [x] 1. Project scaffolding and shared foundations
  - [x] 1.1 Scaffold frontend (Next.js App Router, TypeScript, Tailwind) and backend (FastAPI, Python) directory structures per design §5.6 and §8.10
    - Create `frontend/` with route groups `(marketing)`, `(content)`, `(conversion)` and `backend/app/` with `api/v1/`, `domain/`, `services/`, `repositories/`, `schemas/`, `infra/`, `workers/`, `migrations/` directories
    - Install and configure shadcn/ui, Radix, React Hook Form, Zod, Framer Motion on the frontend; FastAPI, SQLAlchemy, Alembic, Pydantic-settings, Redis (redis-py), Boto3 on the backend
    - Add `frontend/styles/tokens.ts` with the full copper/gold/ivory/stone design token set (§6.1)
    - Configure Tailwind theme extension from `tokens.ts`; add `globals.css` with CSS variable light/dark theme; add pre-hydration inline script in `layout.tsx` to apply stored theme before paint (prevents flash)
    - _Requirements: 25.2, 26.5_

  - [x] 1.2 Set up database, migrations, and shared config
    - Configure Alembic; write initial migration creating all tables from §9 (lead, utm_attribution, consultation, newsletter_subscriber, article, category, tag, article_tag, article_version, author, knowledge_category, knowledge_item, faq_category, faq, department, job, job_application, outbox_event, redirect, admin_user)
    - Add `org_id UUID`, `deleted_at TIMESTAMPTZ NULL`, `version INT`, and full audit fields to every table per §9.2 conventions; add DB unique constraints for `reference_code` on lead/consultation/job_application and `slug` (per content type) on article/knowledge_item/job
    - Configure `pydantic-settings` in `backend/app/config.py` for all environment variables (DB URL, Redis URL, S3, SES, secrets); add startup validation that all required secrets are present
    - Add `backend/app/infra/db.py` (SQLAlchemy async engine + session factory) and `backend/app/infra/cache.py` (Redis async client)
    - _Requirements: 22.1, 22.4, 27.4_

  - [x] 1.3 Implement shared API envelope, error handling, and request-ID middleware
    - Write FastAPI middleware that generates a `requestId` (UUIDv4) per request and attaches it to response headers
    - Implement success envelope `{"data":…,"meta":{"requestId":…}}` and paginated variant; implement RFC 7807 error envelope in `backend/app/schemas/envelope.py`
    - Add global exception handler converting `ValidationError` → HTTP 422 with field-level detail; unhandled exceptions → 500 with `requestId`; configure structured-JSON request logging middleware that redacts PII fields (name, email, phone, IP) with a placeholder
    - Implement `GET /api/v1/health` and `GET /api/v1/ready` liveness/readiness endpoints
    - _Requirements: 17.7, 18.2, 18.3_

  - [x] 1.4 Implement root Next.js layout, design system primitives, and navigation shell
    - Create `frontend/app/layout.tsx` (root layout: fonts via `next/font`, theme provider, `ConsentBanner` placeholder, `Header`, `Footer`, skip-to-content link, single landmark regions)
    - Implement `Header`, `Footer` (4-column + utility row with newsletter signup), and `Nav` components in `frontend/components/layout/`; wire primary nav items (Solar, Products, Future Technologies, Knowledge, Blog, Company) with a persistent "Book Consultation" CTA and "Contact" link
    - Implement `MobileDrawer` (full-screen, focus-trapped, Esc-closable, focus restored to trigger on close) for viewports < 768 px
    - Add `MegaMenu` for the Solar nav item (Overview, Learning Hub, Calculator, Consultation sub-links)
    - _Requirements: 1.3, 1.4, 1.6, 1.7, 1.8, 24.1, 24.2, 24.3_

  - [x]* 1.5 Write unit tests for layout components
    - Test drawer opens/closes on trigger and Escape key; focus is trapped while open and returns to trigger on close
    - Test footer renders all 4 required sections; nav contains exactly the 6 primary items and the persistent CTA
    - _Requirements: 1.3, 1.4, 1.6, 1.7, 1.8_

- [x] 2. Checkpoint — verify scaffolding and layout
  - Ensure migration runs cleanly, `/health` and `/ready` return 200, root layout renders without errors, and the nav drawer opens and closes correctly. Ask the user if anything is unclear.


- [x] 3. Solar savings calculator (backend algorithm + frontend UI)
  - [x] 3.1 Implement `estimate_solar` pure function and `POST /api/v1/solar/estimate` endpoint
    - Write `backend/app/services/solar.py::estimate_solar(req, tariffs)` exactly following the algorithm in §14.1 (annual_kwh derivation, ideal_kw sizing, roof-area cap, quarter-kW rounding, gen/savings/payback/CO₂ formulas)
    - Load the tariff table from config/DB; implement `SolarEstimateRequest` and `SolarEstimateResponse` Pydantic models (§10 data models)
    - Wire `POST /api/v1/solar/estimate` in `backend/app/api/v1/solar.py`; apply rate limiting (20 req/min) and Turnstile verification
    - Return all assumption values in the response; reject requests failing preconditions with HTTP 422 + field detail
    - _Requirements: 5.1, 5.2, 5.6, 5.7, 5.8, 5.10, 5.11_

  - [x]* 3.2 Write property tests for solar estimate (Hypothesis)
    - **Property 1: Solar estimate never over-promises** — ∀ valid req: `savings_minor ≤ annual_consumption_kwh × tariff`, `payback_years > 0`, `size_kw > 0`
    - **Property 2: Solar roof cap respected** — ∀ req with `roof_area_sqm`: `size_kw ≤ roof_area_sqm / AREA_PER_KW + ε`
    - **Property 3: Solar determinism** — ∀ req: `estimate_solar(req) == estimate_solar(req)` (same inputs → identical outputs)
    - **Validates: Requirements 5.1, 5.3, 5.4, 5.5, 5.6**

  - [x] 3.3 Implement `SolarCalculator` client component and `ResultPanel`
    - Create `frontend/components/solar/SolarCalculator.tsx` (`"use client"`) with input fields: monthly bill OR monthly consumption (exactly one required), state dropdown, connection type, optional roof area
    - Show instant client-side optimistic estimate using cached tariff snapshot; call `POST /api/v1/solar/estimate` for the authoritative result
    - Render `ResultPanel` (system size, generation, savings, payback, CO₂ offset) and `AssumptionsDisclosure`
    - Announce results via `aria-live="polite"` region; all inputs have accessible labels and a text-input alternative for the slider
    - _Requirements: 5.1, 5.9, 24.4_

  - [x] 3.4 Create `/solar/calculator` page and wire calculator island
    - Create `frontend/app/(marketing)/solar/calculator/page.tsx` as a static shell with `generateMetadata` (WebApplication JSON-LD, canonical, noindex for result variants)
    - Mount `SolarCalculator` as a client island; add "Get exact quote → consultation" link that prefills consultation form with calculator context
    - _Requirements: 5.2, 23.1, 23.2_

- [x] 4. Lead service, scoring, and UTM capture
  - [x] 4.1 Implement `score_lead` pure function
    - Write `backend/app/services/leads.py::score_lead(lead)` exactly per the algorithm in §14.2 (source weight, phone/company/interest/context/consent bonuses, disposable-email penalty, CLAMP to 0–100, band derivation)
    - _Requirements: 6.2, 6.3, 6.4_

  - [x]* 4.2 Write property tests for lead scoring (Hypothesis)
    - **Property 4: Lead score bounded and banded** — ∀ lead: `0 ≤ score ≤ 100`, band matches thresholds exactly (hot ≥ 70, warm 40–69, cold < 40)
    - **Property 5: Score monotonicity** — adding phone/company/consent never decreases score; disposable email never increases score
    - **Validates: Requirements 6.2, 6.3, 6.4**

  - [x] 4.3 Implement `Lead` repository, UTM capture, and `POST /api/v1/leads` + `POST /api/v1/contact` endpoints
    - Write `backend/app/repositories/leads.py` (create, find-by-email, update-status) using SQLAlchemy async
    - Implement `LeadService.create_lead`: validate → score_lead → persist lead + utm_attribution (same transaction) → write outbox event `lead.created`
    - Wire `POST /api/v1/leads` and `POST /api/v1/contact` in `backend/app/api/v1/leads.py`; apply rate limiting, Turnstile, and honeypot/time-to-submit checks (honeypot fill or submit < 3 s → store as `spam`, return HTTP 200 silently; content heuristics flag → store as `spam`, retain for review)
    - Ensure `consentMarketing=true` leads record consent_timestamp (ISO 8601 UTC) and consent_ip; reject marketing leads missing these fields
    - Return `referenceCode`, `status`, `score`, `quality` within 2 s; never expose lead status on public endpoints
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 6.7, 6.8, 6.10, 17.5, 17.6, 19.3, 19.4, 19.5, 19.6_

  - [x]* 4.4 Write unit tests for lead creation and validation
    - Test all required-field rejections (missing name, bad email format, >255 char fields) return 422 with field detail
    - Test marketing lead without consent_timestamp/IP is rejected; test honeypot-filled submission is stored as `spam` and returns 200
    - Test duplicate `Idempotency-Key` returns stored result without creating a second lead
    - _Requirements: 6.1, 6.8, 17.6, 18.5, 19.5_


- [x] 5. Idempotency handler and rate limiter
  - [x] 5.1 Implement `handle_idempotent_write` and Redis-backed rate limiter
    - Write `backend/app/infra/idempotency.py::handle_idempotent_write(key, op)` per algorithm §14.5 (Redis lock + setex with 86,400 s TTL; no-cache on failure; 409 on key conflict with differing body)
    - Implement sliding-window rate limiter in `backend/app/infra/ratelimit.py` (per-IP + per-fingerprint); apply write endpoint limit ≤ 20 % of read limit over the same window; return 429 + `Retry-After` on breach
    - Validate `Idempotency-Key` header: reject empty or >255-char keys with HTTP 400
    - _Requirements: 18.5, 18.6, 18.7, 18.8, 19.1, 19.2_

  - [x]* 5.2 Write property tests for idempotency (Hypothesis)
    - **Property 6: Idempotency** — ∀ key k, N ≥ 1 identical requests produce exactly one persisted record and one outbox event; duplicate requests return the first result
    - **Validates: Requirements 18.5, 18.6**

- [x] 6. Checkpoint — verify backend write services
  - Run all backend tests; confirm leads, scoring, idempotency, and rate limiting pass. Ask the user if anything is unclear.

- [x] 7. Consultation booking service and frontend form
  - [x] 7.1 Implement `ConsultationService` and `POST /api/v1/consultations` endpoint
    - Write `backend/app/services/consultations.py`: validate fields per §7.2 requirements (name 1–100 chars, RFC 5322 email ≤ 254 chars, phone 7–15 digits, interest_area enum, preferred_date > today UTC and ≤ 365 days out, time_window enum); link/create lead by email
    - Persist consultation + outbox event `consultation.requested` in a single DB transaction; return HTTP 202 + `referenceCode` (8–32 alphanumeric) within 2 s
    - Implement `GET /api/v1/consultations/{referenceCode}` returning status only (no PII); 404 on unknown code
    - Capture UTM_Attribution and calculator context in `context JSONB`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 7.2 Implement `ConsultationForm` client component and `/consultation` page
    - Create `frontend/components/forms/ConsultationForm.tsx` (`"use client"`) using React Hook Form + Zod; include all required fields; prefill from calculator context if present
    - Show `submitting` → `success` (referenceCode displayed, focus moved to success heading) / `error` (field-level + form-level, input preserved) states
    - Create `frontend/app/(conversion)/consultation/page.tsx` as a static shell with the form island; add `generateMetadata`
    - _Requirements: 7.2, 7.9, 24.4_

  - [x]* 7.3 Write unit tests for consultation validation
    - Test past date, date > 365 days, missing required fields, phone < 7 / > 15 digits all return 422 with correct field detail
    - Test duplicate Idempotency-Key returns original 202 result
    - _Requirements: 7.2, 7.3, 7.4_

  - [x]* 7.4 Write property test for consultation date validation (Hypothesis)
    - **Property 12: Consultation date is future** — ∀ accepted consultation: `preferred_date > today` (server clock, UTC)
    - **Validates: Requirements 7.4**

- [x] 8. Newsletter service (double opt-in)
  - [x] 8.1 Implement `NewsletterService`, confirmation tokens, and all newsletter endpoints
    - Implement `POST /api/v1/newsletter/subscribe`: validate RFC 5322 email ≤ 254 chars; deduplicate against `pending`/`confirmed` rows (per org); create `pending` subscriber, generate confirmation token (hashed, 72 h expiry), queue confirmation email; return success within 2 s
    - Implement `GET /api/v1/newsletter/confirm?token=`: verify token not expired and not already used; transition to `confirmed`; return error on missing/expired/used token
    - Implement `POST /api/v1/newsletter/unsubscribe`: transition `pending`/`confirmed` to `unsubscribed`; return success within 2 s
    - Enforce per-org email uniqueness per requirement 9.7
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 8.2 Implement `NewsletterForm` component and wire it into Footer and Home page CTA
    - Create `frontend/components/forms/NewsletterForm.tsx` (`"use client"`); wire to `POST /api/v1/newsletter/subscribe`; show success/error states
    - Mount in `Footer` utility row and Home final-CTA section
    - _Requirements: 1.8, 9.1_

- [x] 9. Transactional outbox relay and email worker
  - [x] 9.1 Implement transactional outbox writer (used by all write services)
    - Write `backend/app/infra/outbox.py::write_outbox_event(session, aggregate_type, aggregate_id, event_type, payload)` that inserts an `outbox_event` row within the caller's DB transaction
    - Ensure all existing services (leads, consultations, newsletter, careers) call `write_outbox_event` inside the same `session` transaction that persists the business entity
    - _Requirements: 6.7, 7.5, 11.4, 20.1, 20.2_

  - [x] 9.2 Implement `relay_outbox` background worker and email worker
    - Write `backend/app/workers/outbox_relay.py::relay_outbox(batch=100)` per algorithm §14.6 (`FOR UPDATE SKIP LOCKED`, ordered by `occurred_at ASC`); mark `published` with `published_at` on success; increment `attempts` on failure; mark `failed` after 5 attempts; fire ISR revalidation webhook on content publish events
    - Implement `backend/app/workers/email_worker.py`: dequeue transactional emails (newsletter confirmation, submission confirmation with referenceCode) and send via AWS SES; retry with backoff; dead-letter after max retries
    - _Requirements: 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 21.1, 21.2, 21.3_

  - [x]* 9.3 Write property tests for outbox relay (Hypothesis)
    - **Property 7: Outbox no-loss** — ∀ committed business write: exactly one `outbox_event` row exists; every event eventually reaches `published` or `failed`; no event is silently dropped or stays `pending` indefinitely
    - **Validates: Requirements 6.9, 20.1, 20.4, 20.8**


- [x] 10. Content service (blog, knowledge center, FAQs)
  - [x] 10.1 Implement `ContentService` repositories and read endpoints
    - Write repositories for `article`, `category`, `tag`, `knowledge_item`, `knowledge_category`, `faq`, `faq_category`; all queries filter `deleted_at IS NULL` and public `status` only
    - Implement `GET /api/v1/articles` with page (min 1, default 1), page_size (1–50, default 20), category, tag, sort (newest/oldest/most-relevant) query params; reject unknown params with HTTP 400; reject out-of-range values with 422
    - Implement `GET /api/v1/articles/{slug}`, `GET /api/v1/categories`, `GET /api/v1/knowledge`, `GET /api/v1/knowledge/{slug}`, `GET /api/v1/faqs`
    - Implement related-article selection per algorithm §14.4 (category + tag-overlap score + recency bonus; ≤ k results; stable sort by score DESC, published_at DESC, id ASC)
    - Add `Cache-Control` and `ETag` headers on all read endpoints; return `no-store` on writes
    - _Requirements: 10.1, 10.2, 10.5, 10.6, 10.7, 25.3_

  - [x]* 10.2 Write property tests for content pagination and soft-delete (Hypothesis)
    - **Property 9: Pagination consistency** — ∀ collection iterated across all pages (stable sort with id tie-break): every item appears exactly once with no overlap
    - **Property 10: Soft-delete invisibility** — ∀ public read endpoint: no row with `deleted_at != NULL` or non-public status is ever returned
    - **Validates: Requirements 10.7, 22.8, 22.9**

  - [x] 10.3 Implement blog and knowledge center Next.js pages
    - Create `frontend/app/(content)/blog/page.tsx` (ISR 10 m, skeleton loading, empty-state message, filter/category bar, paginated `ArticleCard` grid, `NewsletterForm` CTA)
    - Create `frontend/app/(content)/blog/category/[category]/page.tsx` (same pattern, self-canonical)
    - Create `frontend/app/(content)/blog/[slug]/page.tsx` (SSG+ISR+on-demand; renders title/meta/hero/body/TOC/tags/author bio/related articles; 404 for unknown slug)
    - Create `frontend/app/(content)/knowledge/page.tsx` and `knowledge/[slug]/page.tsx` with same article pattern; use `TechArticle` JSON-LD
    - Add `generateMetadata` with `Article`/`BlogPosting`/`TechArticle` + `BreadcrumbList` JSON-LD per §17; breadcrumb trail on all nested pages
    - _Requirements: 3.2, 10.3, 10.4, 10.8, 10.9, 23.2, 23.5_

- [x] 11. Careers service and resume upload
  - [x] 11.1 Implement `CareerService`, `UploadService`, and career endpoints
    - Write `GET /api/v1/jobs` (department, location, type filters; unknown params → 400); `GET /api/v1/jobs/{slug}` (open jobs only; closed/unknown → 404)
    - Implement `POST /api/v1/uploads/presign`: validate type ∈ {pdf, doc, docx} and size 1 byte–5,242,880 bytes; return presigned S3 PUT URL (expires 900 s) + final object key; reject invalid type/size with 422
    - Implement `POST /api/v1/jobs/{slug}/applications`: validate fields; verify resume key originates from a presign issued within 3,600 s and re-validate content-type/size from S3 metadata; persist application + outbox event `career.application.submitted`; return unique `referenceCode`
    - _Requirements: 11.1, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 11.2 Implement careers Next.js pages and `CareerApplicationForm`
    - Create `frontend/app/(content)/careers/page.tsx` (ISR 15 m, FilterBar, `JobCard` list, talent-pool CTA when no openings, `EmptyState`)
    - Create `frontend/app/(content)/careers/[slug]/page.tsx` (`JobPosting` JSON-LD; application form with presigned S3 resume upload; success state with `referenceCode`; 404/position-filled for closed jobs)
    - Create `frontend/components/forms/CareerApplicationForm.tsx` (`"use client"`, file picker with type/size validation, presign + direct S3 PUT flow)
    - _Requirements: 11.2, 11.3, 11.5, 23.2_

  - [x]* 11.3 Write unit tests for upload validation and career application
    - Test presign rejects unsupported file type and size = 0 and size > 5 MB with 422
    - Test application with stale resume key (> 3,600 s) is rejected
    - Test closed job returns 404 / position-filled state
    - _Requirements: 12.1, 12.2, 12.3, 12.5_

- [x] 12. Site search
  - [x] 12.1 Implement `SearchService` and `GET /api/v1/search` endpoint
    - Write `backend/app/services/search.py::search(q, types, page, page_size)` per algorithm §14.3: parameterized `websearch_to_tsquery`; UNION across article/knowledge/faq/job tables; filter `status = public_status AND deleted_at IS NULL`; sort by `ts_rank DESC, published_at DESC, id ASC`; paginate with page/page_size (1–50, default 20); return empty `data: []` + HTTP 200 on zero results
    - Validate query trimmed length 2–200 chars; reject missing/out-of-range query or page_size with 422; reject unknown params with 400
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x]* 12.2 Write property tests for search safety and pagination (Hypothesis)
    - **Property 8: Search safety** — ∀ query q (including SQL metacharacters, `<script>`, unicode): no injection, results are only public non-deleted items, `len(results) ≤ page_size`
    - **Property 11: Validation rejects the invalid** — ∀ request violating a Pydantic constraint (bad page_size, short/long query) → 4xx with field detail; ∀ valid request → not rejected
    - **Validates: Requirements 13.2, 13.8, 18.3, 18.4**

  - [x] 12.3 Implement `/search` Next.js page
    - Create `frontend/app/search/page.tsx` (dynamic, `no-store`; `SearchBox`, `SearchResults`, `FilterBar`, `Pagination`, `EmptyState` with ≥ 1 and ≤ 5 Public_Content suggestions on zero results)
    - Mark page `noindex` in `generateMetadata`
    - _Requirements: 13.7, 13.9_

- [x] 13. Checkpoint — verify content, careers, and search
  - Run all backend tests; confirm content and search endpoints pass; check careers apply flow end-to-end. Ask the user if anything is unclear.


- [x] 14. Marketing pages (Home, About, Solar, Products, Future Technologies)
  - [x] 14.1 Implement Home (`/`) and About (`/about`) pages
    - Create `frontend/app/(marketing)/page.tsx` (SSG+ISR 1 h): render Hero, StatBand, solar highlight, future-tech teaser, FeatureGrid, featured content section (skeleton → ready; omit + no error if fetch fails/times out after 5 s), Testimonial, CTASection, NewsletterForm
    - Create `frontend/app/(marketing)/about/page.tsx` (SSG): brand story, mission/values, Timeline, leadership PersonCard grid, sustainability, careers CTA
    - Add `Organization` + `WebSite` (with `SearchAction`) JSON-LD to Home; `AboutPage` + `Organization` JSON-LD to About; `generateMetadata` on both pages
    - _Requirements: 1.1, 1.2, 1.5, 23.1, 23.2_

  - [x] 14.2 Implement Solar overview, Learning Hub, Products, and Future Technologies pages
    - Create `frontend/app/(marketing)/solar/page.tsx` (SSG+ISR 6 h): Hero, how-solar-works, benefits, ProcessSteps, StatBand, links to Hub/Calculator, Consultation CTA; `Service` JSON-LD
    - Create `frontend/app/(marketing)/solar/learn/page.tsx` (SSG+ISR 1 h) and `solar/learn/[topic]/page.tsx` (SSG+ISR 1 h + on-demand): topic body, TOC, Breadcrumbs, RelatedList, contextual CTA; 404 for unknown topic slug; editorial placeholder when no topics; `LearningResource` + `BreadcrumbList` JSON-LD
    - Create `frontend/app/(marketing)/products/page.tsx` (SSG+ISR): ProductCard grid with maturity badges, register-interest CTA, curated fallback when no products; mark individual future products `noindex`
    - Create `frontend/app/(marketing)/future-technologies/page.tsx` (SSG+ISR 6 h): vision, focus areas FeatureGrid, R&D philosophy, CTA
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 15.1, 15.2, 15.3, 15.4, 23.2_

- [x] 15. Contact page and support/FAQ pages
  - [x] 15.1 Implement Contact page and `ContactForm`
    - Create `frontend/components/forms/ContactForm.tsx` (`"use client"`): name, email, optional phone, subject/topic, message, consent; React Hook Form + Zod; wire to `POST /api/v1/contact`; success state / error state (preserve input on error)
    - Create `frontend/app/(conversion)/contact/page.tsx` (static shell + form island): direct channels, office address
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 15.2 Implement Support and FAQ pages
    - Create `frontend/app/(content)/support/page.tsx` (ISR 1 h): search box, help categories, popular articles, contact channels
    - Create `frontend/app/(content)/support/faq/page.tsx` (ISR 1 h): `FAQAccordion` (searchable, filterable, grouped by category); `FAQPage` JSON-LD; empty/error states
    - _Requirements: 14.1, 14.2, 14.3, 23.2_

- [x] 16. Legal and error pages
  - [x] 16.1 Implement legal pages and error pages
    - Create MDX files in `frontend/content/` for Privacy, Terms, Cookies; render at `frontend/app/legal/{privacy,terms,cookies}/page.tsx` (SSG) each showing a "last updated" date
    - Implement `frontend/app/not-found.tsx` (branded 404: search box, top links, Consultation CTA, `noindex`, single H1)
    - Implement `frontend/app/error.tsx` (fully static 500: reassurance, retry button, contact info, Sentry error id for correlation; no backend dependency; `noindex`)
    - _Requirements: 3.4, 16.1, 16.2, 16.3_

- [x] 17. SEO system, sitemap, robots, and Edge middleware
  - [x] 17.1 Implement SEO system, sitemap, robots, and Edge middleware
    - Create `frontend/lib/seo/metadata.ts` and `frontend/lib/seo/jsonld.ts` helpers; export `generateMetadata` factories covering all JSON-LD types (Organization, WebSite+SearchAction, Article, BlogPosting, TechArticle, BreadcrumbList, FAQPage, JobPosting, Product/Service, WebApplication)
    - Implement `frontend/app/sitemap.ts` generating `sitemap.xml` from Public_Content with `lastmod` from `updated_at`
    - Implement `frontend/app/robots.ts` allowing public pages; disallowing `/search`, `/api`, and reserved namespaces; declaring sitemap; explicitly allowing configured AI crawlers
    - Implement Edge middleware (`frontend/middleware.ts`): HTTPS + canonical-host redirect, trailing-slash normalization, `redirect` table lookups (301/302), security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy), correlation-ID header; enforce reserved namespaces unreachable by any MVP route
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 22.6, 22.7, 23.1, 23.2, 23.3, 23.4, 23.5, 26.1_

  - [x]* 17.2 Write property tests for slug uniqueness and URL stability (Hypothesis)
    - **Property 14: Slug uniqueness and URL stability** — ∀ published content: slug unique per type; a published slug's canonical URL does not change without a registered redirect mapping the old path
    - **Validates: Requirements 22.4, 22.5, 22.6, 22.7**

  - [x]* 17.3 Write property tests for reference-code uniqueness (Hypothesis)
    - **Property 13: Reference codes unique** — ∀ two created leads/consultations/applications: their referenceCodes differ
    - **Validates: Requirements 22.2, 22.3**

- [x] 18. Consent management and analytics gating
  - [x] 18.1 Implement `ConsentBanner` and `Consent_Manager` analytics gate
    - Create `frontend/components/layout/ConsentBanner.tsx` (`"use client"`): present on first visit; persist consent state (category, granted/denied, timestamp) within 1 s to `localStorage`; re-prompt if stored consent is >365 days old; honour `Do-Not-Track: 1` header as denied unless visitor subsequently grants
    - Create `frontend/lib/analytics/consent.ts`: gate GA4, PostHog, and Clarity scripts behind consent; honour `prefers-reduced-motion` for motion
    - Create `frontend/lib/analytics/events.ts`: implement the full event taxonomy (page_view, cta_click, form_start, form_submit, form_error, lead_created, consultation_requested, calculator_run, calculator_lead, newsletter_subscribe, job_view, application_submitted) dispatching only after consent and carrying `referenceCode`/`leadId` where relevant
    - Ensure no third-party analytics/marketing script loads before explicit consent
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.8_

  - [x]* 18.2 Write property tests for consent gating (fast-check)
    - **Property 15: Consent gating** — no analytics/marketing cookie or third-party script loads before consent; ∀ lead stored with marketing use has `consentMarketing=true` recorded with timestamp+IP
    - **Validates: Requirements 17.1, 17.5, 17.6**


- [x] 19. Data integrity, soft delete, and unique identifier guarantees
  - [x] 19.1 Implement soft-delete filtering, unique identifier guarantees, and admin API stubs across all repositories
    - Audit all repository query methods to ensure `deleted_at IS NULL` filter is applied; add `get_or_404` helper that raises 404 on soft-deleted rows
    - Implement `generate_reference_code()` with collision retry (max 3 attempts, then error) in `backend/app/domain/identifiers.py`; assign UUIDv7 primary keys on creation
    - Implement `POST /api/v1/revalidate` (internal, signed) for ISR on-demand revalidation; stub all `/admin/*` content authoring routes returning 401 unless `ADMIN_AUTH_ENABLED` env flag is true (operator auth guard per requirement 26.6)
    - Configure FastAPI CORS middleware with explicit allowlist of website origins only
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.8, 26.3, 26.6_

  - [x]* 19.2 Write unit tests for API standards and validation (Hypothesis / Pydantic)
    - **Property 11 (shared):** ∀ syntactically invalid request → 422 with field detail; ∀ syntactically valid request → not rejected for validation reasons
    - Test unknown query param returns 400; page_size > 50 returns 400; empty `Idempotency-Key` returns 400; key > 255 chars returns 400
    - _Requirements: 18.3, 18.4, 18.7, 18.9, 18.10, 18.11_

- [x] 20. Security hardening, observability, and image optimization
  - [x] 20.1 Implement security controls: parameterized queries, sanitization, secrets, and structured logging
    - Verify all SQLAlchemy queries use bound parameters; add a linting/CI check that no raw SQL string construction exists
    - Add DOMPurify sanitization in `frontend/lib/utils/sanitize.ts`; wrap any `dangerouslySetInnerHTML` usage in the sanitize helper
    - Configure secrets loading from AWS Secrets Manager / environment at startup; add startup validation that required secrets are present (do not embed in source)
    - Add OpenTelemetry instrumentation across FastAPI router → service → repository → DB and outbound calls (SES/S3/Redis); add Sentry exception capture (backend + frontend) with `requestId` breadcrumb and release tags
    - _Requirements: 17.7, 26.2, 26.4, 26.5_

  - [x] 20.2 Implement performance budget CI check and image optimization
    - Add a CI step (`frontend/tests/perf-budget.test.ts`) that builds a production Next.js bundle and asserts per-route JS ≤ 130 KB gzipped
    - Audit all raster images to use `next/image` with `width`/`height` (or `fill` + sized container), AVIF/WebP, blur placeholders, and responsive `sizes`
    - Replace decorative raster motifs with optimized inline SVG per §5.5
    - _Requirements: 25.1, 25.2, 25.4_

- [x] 21. OpenAPI contract and typed client generation
  - [x] 21.1 Configure OpenAPI export and generate typed frontend client
    - Verify FastAPI auto-generates `GET /api/v1/openapi.json` with all routes; confirm all DTOs use `camelCase` serialization via alias generators; monetary values as `amount_minor BIGINT` + `currency CHAR(3)`; confirm `org_id` tenant field present on all entity schemas
    - Add a CI script that runs `openapi-typescript` (or equivalent) against `/api/v1/openapi.json` and writes the typed client to `frontend/lib/api/__generated__/`; fail CI if the generated types differ from committed types
    - Add Schemathesis contract fuzzing step in CI: fuzz all `/api/v1` endpoints against the OpenAPI spec and fail on unexpected 5xx responses
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

- [x] 22. Accessibility audit, motion/reduced-motion, and axe CI
  - [x] 22.1 Implement accessibility requirements across all components and wire axe-core CI
    - Audit every page for exactly one H1, semantic landmark regions (`<header>`, `<main>`, `<footer>`, `<nav>`), logical heading order, and a skip-to-content link in `RootLayout`
    - Verify all interactive elements are keyboard-operable with a visible focus indicator (Tailwind `focus-visible:ring` on all Button/Link/Input primitives); verify all form fields have programmatic labels and validation errors linked via `aria-describedby`
    - Add WCAG AA contrast checks to design token CSS variables for both light and dark themes; ensure color is never the sole conveyor of information
    - Implement `prefers-reduced-motion` media query in all Framer Motion components: reduce to opacity-only or instant transitions
    - Add `axe-core` automated accessibility checks to the CI pipeline (Playwright + axe on all critical routes); add NVDA/VoiceOver manual testing checklist in `tests/a11y/README.md`
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7_

- [x] 23. Playwright E2E tests for critical conversion journeys
  - [x] 23.1 Write Playwright E2E tests for all conversion paths
    - Test: submit contact form → receive referenceCode; book consultation → receive 202 + referenceCode; run calculator → view results → follow "Get quote" link; apply to job (with resume) → receive referenceCode; subscribe to newsletter → receive pending confirmation
    - Test: site search (type query, see results, empty state suggestions); navigate via mobile drawer (open, Esc close, focus restored); navigate mega-menu keyboard and mouse paths
    - Include axe assertions on each critical page and test reduced-motion behaviour (set `prefers-reduced-motion: reduce` in Playwright context)
    - _Requirements: 1.6, 1.7, 5.1, 6.1, 7.9, 9.1, 11.4, 13.7, 24.3_

- [x] 24. Final checkpoint — full stack integration
  - Run the full test suite (backend pytest + frontend vitest + Playwright E2E); verify all property-based tests pass, all API contracts match the OpenAPI spec, Schemathesis finds no unexpected 5xx, axe reports no violations on critical routes, and all pages render without errors. Ask the user if anything is unclear.


## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; they cover property-based and unit tests.
- Every task references specific requirements for traceability.
- Languages: **TypeScript** (Next.js App Router) for the frontend; **Python** (FastAPI) for the backend — exactly as specified in the design document.
- Property-based tests use **Hypothesis** (Python/backend) and **fast-check** (TypeScript/frontend).
- Checkpoints (tasks 2, 6, 13, 24) validate incremental progress before moving to the next cluster.
- The outbox relay (task 9) must be completed before any downstream CRM/event integration is possible.
- The OpenAPI contract (task 21) is the source of truth for the generated typed client; always regenerate after backend schema changes.
- Schemathesis (task 21.1) provides contract-level fuzzing on top of unit and property tests.
- Playwright E2E tests (task 23) cover every conversion path and must pass before the final checkpoint.
- The admin auth guard stub (task 19.1) is a launch gate: the `/admin` API must not be exposed without `ADMIN_AUTH_ENABLED=true` and a real auth provider configured.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4"] },
    { "id": 3, "tasks": ["1.5", "3.1", "4.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "4.2", "4.3", "5.1"] },
    { "id": 5, "tasks": ["3.4", "4.4", "5.2", "7.1", "8.1", "9.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "7.4", "8.2", "9.2"] },
    { "id": 7, "tasks": ["9.3", "10.1", "11.1"] },
    { "id": 8, "tasks": ["10.2", "10.3", "11.2", "12.1"] },
    { "id": 9, "tasks": ["11.3", "12.2", "12.3", "14.1", "15.1"] },
    { "id": 10, "tasks": ["14.2", "15.2", "16.1"] },
    { "id": 11, "tasks": ["17.1", "18.1", "19.1"] },
    { "id": 12, "tasks": ["17.2", "17.3", "18.2", "19.2", "20.1"] },
    { "id": 13, "tasks": ["20.2", "21.1"] },
    { "id": 14, "tasks": ["22.1"] },
    { "id": 15, "tasks": ["23.1"] }
  ]
}
```
