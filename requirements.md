# Requirements Document

## Introduction

This document specifies the requirements for the **Tribhuban Parent Website**, the public-facing digital headquarters for Tribhuban Concepts (an Indian technology and engineering company). It is a marketing, education, and lead-generation platform (MVP) — not an application with authenticated end-user accounts.

The system is a decoupled, content-driven web platform: a Next.js (TypeScript, App Router) frontend renders premium, SEO-optimized, accessible pages using a mix of static generation (SSG), incremental static regeneration (ISR), and server rendering; a FastAPI (Python) backend exposes versioned REST APIs for dynamic surfaces (lead capture, consultation booking, newsletter, career applications, the solar savings calculator, and content queries). PostgreSQL is the system of record, Redis provides caching and rate limiting, and AWS S3 stores media and uploaded documents.

These requirements are derived from the approved design document (`design.md`) and are organized around the capability clusters in the design's traceability anchors (§25). Requirements are written to be consistent with the design's static-first rendering strategy, integration-ready core (stable public contracts, event-emission seam, canonical IDs), and its non-functional priorities: WCAG 2.1 AA accessibility, SEO, performance, DPDP/GDPR-aligned consent handling, and future integration-readiness.

**Explicitly out of scope** (per design §2.2): employee/workplace portal, CRM UI, ERP UI, HRMS, Partner Dashboard, Customer Dashboard, any authenticated end-user login, billing, and internal operational tooling. These are future compatibility targets, not deliverables of this spec.

## Glossary

- **Website**: The Next.js frontend that renders all public pages and hosts client-side interactive islands (forms, calculator, navigation, search).
- **Public_API**: The FastAPI modular-monolith backend exposing versioned REST endpoints under `/api/v1`.
- **Solar_Calculator**: The interactive client feature plus the authoritative server compute endpoint (`POST /v1/solar/estimate`) that estimates rooftop solar savings.
- **Lead_Service**: The Public_API module that creates and scores leads from contact, calculator, product-interest, newsletter, and career-interest sources.
- **Consultation_Service**: The Public_API module that accepts and tracks consultation booking requests.
- **Newsletter_Service**: The Public_API module that manages double opt-in newsletter subscriptions.
- **Career_Service**: The Public_API module that serves job listings and accepts job applications.
- **Content_Service**: The Public_API module that serves blog articles, knowledge items, categories, tags, and FAQs.
- **Search_Service**: The Public_API module that performs site-wide full-text search across articles, knowledge items, FAQs, and jobs.
- **Upload_Service**: The Public_API module that issues presigned S3 URLs and validates uploaded resume files.
- **Consent_Manager**: The frontend subsystem that presents the consent banner and gates analytics, replay, and marketing scripts.
- **Rate_Limiter**: The Redis-backed sliding-window limiter that enforces per-endpoint request limits.
- **Spam_Filter**: The layered spam/abuse detection (honeypot, time-to-submit heuristic, Turnstile verification, content heuristics).
- **Outbox_Relay**: The background worker that reliably publishes domain events recorded in the transactional outbox.
- **Email_Worker**: The background worker that sends transactional emails via AWS SES.
- **SEO_System**: The frontend subsystem producing per-route metadata, JSON-LD structured data, sitemap, robots, and canonical/redirect handling.
- **Idempotency_Handler**: The Public_API mechanism that dedupes write operations by `Idempotency-Key` within a TTL window.
- **Reference_Code**: A short, unique, human-readable code returned to a user for a created lead, consultation, or job application.
- **UTM_Attribution**: The captured marketing attribution data (utm_source/medium/campaign/term/content, referrer, landing page, gclid, fbclid).
- **Public_Content**: Content whose status is publishable to visitors (article `published`, job `open`, and non-`deleted_at` rows).
- **Consent_Marketing**: A visitor's recorded boolean agreement to marketing use of their submitted data, stored with timestamp and IP.

## Requirements

### Requirement 1: Corporate Presence and Global Navigation

**User Story:** As a prospective customer, I want a trustworthy home, about, and global navigation experience, so that I can understand who Tribhuban Concepts is and quickly reach solar, education, and consultation.

#### Acceptance Criteria

1. WHEN a visitor requests the Home page (`/`), THE Website SHALL render, in top-to-bottom order, a hero section, a trust band, a solar highlight, a future-technologies teaser, a feature grid, a featured-content section, and a final call-to-action section.
2. WHEN a visitor requests the About page (`/about`), THE Website SHALL render, in top-to-bottom order, a brand story, a mission-and-values section, a timeline, a leadership grid, a sustainability commitment, and a careers call-to-action.
3. THE Website SHALL display, on every page and remaining visible while the visitor scrolls, a primary "Book Consultation" call-to-action and a secondary "Contact" link within the global navigation.
4. THE Website SHALL provide primary navigation containing exactly the Solar, Products, Future Technologies, Knowledge, Blog, and Company sections.
5. IF the Home page featured-content fetch returns an error or does not complete within 5 seconds, THEN THE Website SHALL render all remaining sections of the page and omit the featured-content section, without displaying any error indication to the visitor.
6. WHILE the viewport width is below 768 pixels, WHEN the visitor activates the navigation menu control, THE Website SHALL present navigation as a full-screen drawer that confines keyboard focus to elements within the drawer.
7. WHILE the navigation drawer is open, IF the visitor presses the Escape key, THEN THE Website SHALL close the drawer and return keyboard focus to the navigation menu control.
8. THE Website SHALL render, on every page, a footer containing exactly the Company, Solutions, Resources, and Legal-and-Social sections plus a newsletter signup control.

### Requirement 2: URL Strategy and Reserved Namespaces

**User Story:** As an SEO stakeholder, I want a consistent, canonical URL scheme with reserved future namespaces, so that link equity is preserved and future systems can mount subpaths without collisions.

#### Acceptance Criteria

1. THE Website SHALL generate content URLs that are lowercase, hyphenated, without trailing slash, and without file extensions.
2. THE Website SHALL use path-based taxonomy URLs for categories in the form `/blog/category/[category]`.
3. WHEN a request targets a paginated or filtered collection variant, THE SEO_System SHALL set the canonical link to the base collection URL unless the variant is independently indexable.
4. THE Website SHALL NOT assign any MVP page to the reserved namespaces `/app`, `/dashboard`, `/portal`, `/partner`, `/customer`, or `/api/internal`.
5. WHEN a requested path matches an entry in the redirect map, THE Website SHALL redirect to the mapped target path using the configured status code (301 or 302).
6. THE Website SHALL redirect any non-canonical host or non-HTTPS request to the canonical HTTPS host.

### Requirement 3: Rendering Strategy and Resilience

**User Story:** As a visitor, I want fast pages that stay available even when the backend is degraded, so that I can always access core information.

#### Acceptance Criteria

1. THE Website SHALL render static-first pages (Home, About, Solar, Future Technologies, Products, Learning Hub, legal pages) using static generation with incremental static regeneration according to the per-route revalidation policy.
2. WHEN the backend publishes a content-change event, THE Public_API SHALL trigger on-demand revalidation of the affected content routes.
3. IF an API fetch fails during server rendering or regeneration of a content page, THEN THE Website SHALL serve the last successfully generated cached version of that page.
4. THE Website SHALL render the 500 error page (`error.tsx`) without any backend or data-layer dependency.
5. THE Website SHALL render content pages as fully-rendered HTML without requiring client-side JavaScript to display indexable content.

### Requirement 4: Solar Education Content

**User Story:** As a visitor researching solar, I want an overview page and a learning hub with topics, so that I can build understanding and be guided toward the calculator and consultation.

#### Acceptance Criteria

1. THE Website SHALL render the Solar overview page (`/solar`) with sections explaining how solar works, benefits, process steps, proof statistics, and links to the Learning Hub and Calculator.
2. THE Website SHALL render the Solar Learning Hub (`/solar/learn`) listing topics grouped by theme.
3. WHEN a visitor requests a Learning Hub topic (`/solar/learn/[topic]`), THE Website SHALL render the topic body, table of contents, breadcrumb trail, related topics, and a contextual consultation or calculator call-to-action.
4. IF a requested topic slug does not correspond to a published topic, THEN THE Website SHALL respond with the 404 page.
5. WHILE the Learning Hub has no published topics, THE Website SHALL display an editorial placeholder instead of an empty list.

### Requirement 5: Solar Savings Calculator

**User Story:** As a homeowner or business, I want to estimate my rooftop solar savings, so that I can understand the value before requesting a quote.

#### Acceptance Criteria

1. WHEN a visitor submits calculator inputs with exactly one of monthly bill amount (from 0.01 to 9,999,999.99 in the applicable currency) or monthly consumption (from 1 to 1,000,000 kWh) provided and greater than zero, a state matching one entry in the supported states list, and a connection type matching one entry in the supported connection types list, THE Solar_Calculator SHALL return a recommended system size, estimated annual generation, estimated annual savings, payback period, and CO₂ offset.
2. THE Solar_Calculator SHALL compute the authoritative estimate server-side via `POST /v1/solar/estimate`.
3. THE Solar_Calculator SHALL return an `estimated_annual_savings_minor` that is greater than or equal to zero and less than or equal to annual consumption multiplied by the applicable tariff.
4. THE Solar_Calculator SHALL return a `recommended_size_kw` greater than zero and a `payback_years` greater than zero.
5. WHERE a roof area greater than zero is provided, THE Solar_Calculator SHALL cap the recommended system size so that `recommended_size_kw` does not exceed roof area divided by the area-per-kW constant.
6. WHEN two requests contain identical calculator input values, THE Solar_Calculator SHALL return numerically identical values for every output field.
7. THE Solar_Calculator SHALL return the assumptions used (tariff per kWh, sun hours per day, performance ratio, cost per kW) with each estimate.
8. IF the submitted calculator inputs violate an input constraint (neither or both of monthly bill amount and monthly consumption provided, a non-positive value, a state not in the supported states list, or a connection type not in the supported connection types list), THEN THE Solar_Calculator SHALL return a validation error identifying each invalid field and SHALL NOT return an estimate.
9. WHEN a result is produced, THE Website SHALL announce the result to assistive technologies via an `aria-live` polite region.
10. WHEN valid calculator inputs are submitted, THE Solar_Calculator SHALL return the estimate within 3 seconds measured from request receipt to response dispatch.
11. IF a dependency required to compute the estimate is unavailable, THEN THE Solar_Calculator SHALL return an error indicating the estimate could not be produced and SHALL NOT return a partial estimate.

### Requirement 6: Lead Creation, Scoring, and Attribution

**User Story:** As a sales/marketing stakeholder, I want every inbound interest captured as a scored, attributed lead, so that qualified pipeline is portable to future systems.

#### Acceptance Criteria

1. WHEN a visitor submits a contact or interest form in which all required fields are present and valid, THE Lead_Service SHALL create a lead record capturing source, contact details, interest area, consent flag, and context, and SHALL return within 2 seconds a Reference_Code, status, score, and quality band.
2. THE Lead_Service SHALL compute a lead score in the inclusive range 0 to 100 using the deterministic scoring rules defined in the design.
3. THE Lead_Service SHALL assign quality band `hot` when score is greater than or equal to 70, `warm` when score is from 40 to 69 inclusive, and `cold` when score is below 40.
4. WHEN computing a lead score, adding a positive signal SHALL NOT decrease the resulting score, and a disposable email address SHALL NOT increase the resulting score.
5. WHEN a form is submitted, THE Website SHALL attach captured UTM_Attribution data (utm parameters, referrer, landing page, gclid, fbclid) to the submission payload, and WHERE any of these attribution fields is absent, THE Website SHALL record that field as null.
6. THE Lead_Service SHALL store the first-touch attribution timestamp on lead creation and update the last-touch timestamp on conversion.
7. WHEN a lead is created, THE Lead_Service SHALL emit a `lead.created` domain event via the transactional outbox.
8. IF the visitor submits a form with a missing required field, an email address not matching a valid email format, or any single text field exceeding 255 characters, THEN THE Lead_Service SHALL reject the submission without creating a lead record and SHALL return an error response indicating which validation failed.
9. IF emitting the `lead.created` event via the transactional outbox fails, THEN THE Lead_Service SHALL retain the event in the outbox and retry delivery until the event is delivered at least once.
10. THE Public_API SHALL expose lead status only via the admin API and SHALL NOT expose lead status through any public endpoint, and IF a request to the admin API for lead status is not authenticated as an authorized admin user, THEN THE Public_API SHALL deny the request and SHALL NOT return lead status.

### Requirement 7: Consultation Booking

**User Story:** As a prospect, I want to book a consultation with my preferred date and time window, so that I can speak with the company about my needs.

#### Acceptance Criteria

1. WHEN a visitor submits a consultation request via `POST /v1/consultations` that passes all field validations, THE Consultation_Service SHALL create a consultation record, link the request to an existing lead matched by email or create a new lead when no match exists, and respond within 2 seconds (95th percentile) with HTTP 202 and a unique Reference_Code that is 8 to 32 alphanumeric characters in length.
2. THE Consultation_Service SHALL require, on a consultation request, a full name of 1 to 100 characters, an email conforming to RFC 5322 format of at most 254 characters, a phone number of 7 to 15 digits, an interest area selected from the defined set of interest areas, a preferred date, and a preferred time window selected from the defined set of time windows.
3. IF a consultation request contains a missing required field, a field exceeding its length bounds, or a field failing its format validation, THEN THE Consultation_Service SHALL reject the request with HTTP 422 and a field-level error identifying each invalid field, and SHALL NOT create a consultation record.
4. IF a consultation request specifies a preferred date that is not later than the current server date (UTC) or is more than 365 days after the current server date (UTC), THEN THE Consultation_Service SHALL reject the request with HTTP 422 and a field-level error indicating the preferred date is out of range.
5. WHEN a consultation record is created, THE Consultation_Service SHALL emit a `consultation.requested` domain event via the transactional outbox within the same database transaction that persists the consultation record.
6. WHERE UTM_Attribution or calculator context is present on the request, THE Consultation_Service SHALL capture it in the consultation context.
7. WHEN a visitor requests `GET /v1/consultations/{referenceCode}` with a Reference_Code that matches an existing consultation record, THE Consultation_Service SHALL respond with HTTP 200 and the consultation status, and SHALL NOT include personally identifiable information in the response.
8. IF a visitor requests `GET /v1/consultations/{referenceCode}` with a Reference_Code that does not match any existing consultation record, THEN THE Consultation_Service SHALL respond with HTTP 404 and an error indicating the consultation was not found.
9. WHEN a consultation submission returns HTTP 202, THE Website SHALL display a success confirmation state containing the Reference_Code and move keyboard focus to the success heading.

### Requirement 8: Contact Inquiries

**User Story:** As a visitor with a general inquiry, I want a contact form and direct channels, so that I can reach the company.

#### Acceptance Criteria

1. THE Website SHALL render the Contact page (`/contact`) with a contact form (name, email, optional phone, subject/topic, message, consent) and direct contact channels.
2. WHEN a visitor submits a valid contact form via `POST /v1/contact`, THE Lead_Service SHALL create a lead of type `contact` and emit a `lead.created` domain event.
3. WHEN a contact submission succeeds, THE Website SHALL display a success state, and IF the submission fails, THEN THE Website SHALL display field-level and form-level errors while preserving the visitor's input.

### Requirement 9: Newsletter Subscription (Double Opt-In)

**User Story:** As a visitor, I want to subscribe to the newsletter with confirmation, so that I only receive email I explicitly opted into.

#### Acceptance Criteria

1. WHEN a visitor submits an email address of 1 to 254 characters conforming to the RFC 5322 addr-spec format to `POST /v1/newsletter/subscribe` and no `confirmed` or `pending` subscriber exists for that email within the organization, THE Newsletter_Service SHALL create a subscriber in `pending` status, generate a confirmation token that expires 72 hours after creation, queue a confirmation email containing that token, and return a success response within 2 seconds.
2. IF a visitor submits an email address to `POST /v1/newsletter/subscribe` that is empty, exceeds 254 characters, or does not conform to the RFC 5322 addr-spec format, THEN THE Newsletter_Service SHALL reject the request, return an error response indicating the email is invalid, and create no subscriber record.
3. IF a visitor submits an email to `POST /v1/newsletter/subscribe` that already matches a `pending` or `confirmed` subscriber within the organization, THEN THE Newsletter_Service SHALL not create a duplicate record, not change the existing subscriber's status, and return a response indicating the email is already subscribed or pending confirmation.
4. WHEN a visitor requests `GET /v1/newsletter/confirm?token=` with a token that matches a `pending` subscriber and has not passed its 72-hour expiry, THE Newsletter_Service SHALL transition the subscriber to `confirmed` status and return a success response within 2 seconds.
5. IF a visitor requests `GET /v1/newsletter/confirm?token=` with a token that is missing, does not match any subscriber, has already been used, or has passed its 72-hour expiry, THEN THE Newsletter_Service SHALL leave all subscriber statuses unchanged and return an error response indicating the token is invalid or expired.
6. WHEN a subscriber requests `POST /v1/newsletter/unsubscribe` with an identifier matching an existing `pending` or `confirmed` subscriber, THE Newsletter_Service SHALL transition the subscriber to `unsubscribed` status and return a success response within 2 seconds.
7. THE Newsletter_Service SHALL enforce that no two subscriber records share the same email address within a single organization.

### Requirement 10: Blog and Knowledge Center

**User Story:** As a reader, I want a blog and a knowledge center with lists, categories, and articles, so that I can find timely and evergreen content.

#### Acceptance Criteria

1. THE Content_Service SHALL serve blog article lists via `GET /v1/articles` supporting page (integer, minimum 1, default 1), page size (integer, 1 to 50, default 20), category, tag, and sort (one of newest, oldest, most-relevant; default newest) query parameters, returning results in the specified sort order.
2. IF a request to `GET /v1/articles` supplies a query parameter value outside its defined range or an unsupported sort value, THEN THE Content_Service SHALL reject the request without returning a list and SHALL return an error response indicating the invalid parameter.
3. WHEN a visitor requests a blog article (`/blog/[slug]`) that maps to a published article, THE Website SHALL render its title, metadata, hero image, body, table of contents, tags, author bio, and related articles.
4. IF a requested article slug does not correspond to a published article, THEN THE Website SHALL respond with the 404 page.
5. THE Content_Service SHALL serve knowledge items via `GET /v1/knowledge` and `GET /v1/knowledge/{slug}`.
6. WHEN selecting related articles for an article, THE Content_Service SHALL return no more than the requested count (integer, 0 to 20, default 3), ordered by descending relevance, excluding the article itself, breaking ties by descending publish date and then by ascending slug.
7. THE Content_Service SHALL return only Public_Content from public content endpoints.
8. WHILE a blog list has zero published posts, THE Website SHALL display an empty-state message indicating no articles are available rather than a broken or partial list.
9. IF a public content endpoint fails to return data due to an unavailable dependency, THEN THE Website SHALL display an error state indicating content could not be loaded and SHALL preserve navigation to other pages.

### Requirement 11: Careers Listing and Application

**User Story:** As a job seeker, I want to browse open roles and apply with my resume, so that I can join the company.

#### Acceptance Criteria

1. THE Career_Service SHALL serve open jobs via `GET /v1/jobs` supporting department, location, and type filters, and job details via `GET /v1/jobs/{slug}`.
2. WHEN a visitor requests a job detail page for an open job, THE Website SHALL render the role summary, responsibilities, requirements, benefits, and an application form.
3. IF a requested job is closed, filled, or unknown, THEN THE Website SHALL respond with the 404 page or a "position filled" state.
4. WHEN an applicant submits a valid application via `POST /v1/jobs/{slug}/applications`, THE Career_Service SHALL create an application record, return a unique Reference_Code, and emit a `career.application.submitted` domain event.
5. WHILE no jobs are open, THE Website SHALL display a talent-pool call-to-action instead of an empty list.

### Requirement 12: Resume File Upload

**User Story:** As an applicant, I want to upload my resume securely, so that my application includes my documents without failing on large files.

#### Acceptance Criteria

1. WHEN a client requests `POST /v1/uploads/presign` for a file whose declared type is PDF, DOC, or DOCX and whose declared size is between 1 byte and 5,242,880 bytes (5 MB) inclusive, THE Upload_Service SHALL return a presigned S3 PUT URL that expires 900 seconds (15 minutes) after issuance and a unique final object key.
2. IF a presign request specifies a file type other than PDF, DOC, or DOCX, THEN THE Upload_Service SHALL reject the request without issuing a presigned URL and return a validation error indicating the file type is unsupported.
3. IF a presign request specifies a declared size of 0 bytes or a size exceeding 5,242,880 bytes (5 MB), THEN THE Upload_Service SHALL reject the request without issuing a presigned URL and return a validation error indicating the size limit was exceeded.
4. WHEN an application is submitted with a resume key, THE Upload_Service SHALL verify that the key originates from a presign issued within the preceding 3,600 seconds (60 minutes) and re-validate that the stored object's content-type is PDF, DOC, or DOCX and its size is between 1 byte and 5,242,880 bytes (5 MB) inclusive before accepting the application.
5. IF the resume key does not originate from a presign issued within the preceding 3,600 seconds (60 minutes), or the stored object's content-type or size fails re-validation, THEN THE Upload_Service SHALL reject the application without persisting it and return an error indicating the resume could not be validated.

### Requirement 13: Site Search

**User Story:** As a visitor, I want to search across blog, knowledge, FAQ, and careers content, so that I can find relevant information quickly.

#### Acceptance Criteria

1. WHEN a visitor submits a query with a trimmed length between 2 and 200 characters inclusive to `GET /v1/search`, THE Search_Service SHALL return matching results across article, knowledge, faq, and job content types within 2 seconds.
2. IF a submitted query has a trimmed length less than 2 characters or greater than 200 characters, or the query parameter is absent, THEN THE Search_Service SHALL reject the request without performing a search and return a validation error response indicating the query length requirement.
3. THE Search_Service SHALL return only Public_Content (records that are non-deleted and have a publicly visible status) in search results.
4. THE Search_Service SHALL order results by descending text-rank, then by descending published date, then by ascending identifier as a deterministic tie-break.
5. THE Search_Service SHALL return at most `page_size` results per page, where `page_size` is an integer between 1 and 50 inclusive, defaulting to 20 when not supplied, and SHALL default to page 1 when no page number is supplied.
6. IF a supplied `page_size` is outside the range 1 to 50 inclusive, or is not a valid integer, THEN THE Search_Service SHALL reject the request without performing a search and return a validation error response indicating the accepted `page_size` range.
7. WHEN a search yields zero matching results, THE Search_Service SHALL return an empty result set with HTTP 200, and THE Website SHALL display at least 1 and at most 5 alternative content suggestions drawn from Public_Content.
8. WHERE a query contains SQL metacharacters, HTML or script fragments, or unicode characters, THE Search_Service SHALL treat the query as literal search text, execute without injection or script execution, and return only results drawn from Public_Content.
9. THE SEO_System SHALL mark every search result page with a `noindex` directive.

### Requirement 14: FAQ and Support

**User Story:** As a visitor needing help, I want support pages and a searchable FAQ, so that I can self-serve answers or find how to contact the company.

#### Acceptance Criteria

1. THE Website SHALL render the Support page (`/support`) with search, help categories, popular articles, and contact channels.
2. THE Content_Service SHALL serve FAQ entries grouped by category via `GET /v1/faqs`.
3. THE Website SHALL render the FAQ page (`/support/faq`) as a searchable, filterable accordion grouped by category.

### Requirement 15: Future Product Showcase and Future Technologies

**User Story:** As a visitor, I want to see what the company is building, so that I can register interest without being misled about availability.

#### Acceptance Criteria

1. THE Website SHALL render the Products page (`/products`) with product concept cards carrying maturity or "coming soon" badges and a register-interest call-to-action.
2. THE SEO_System SHALL mark individual future products as `noindex` until they are launched.
3. THE Website SHALL render the Future Technologies page (`/future-technologies`) with a vision statement, focus areas, and R&D philosophy.
4. WHILE the Products page has no product concepts to display, THE Website SHALL show curated fallback copy.

### Requirement 16: Legal and Error Pages

**User Story:** As a visitor, I want legal pages and helpful error pages, so that I have compliance information and clear recovery paths.

#### Acceptance Criteria

1. THE Website SHALL render legal pages (`/legal/privacy`, `/legal/terms`, `/legal/cookies`) with a "last updated" date.
2. WHEN a visitor requests an unknown route, THE Website SHALL render a branded 404 page containing a search box, top links, and a consultation call-to-action, marked `noindex`.
3. WHEN an unhandled rendering error occurs, THE Website SHALL render the branded 500 page with reassurance, a retry option, contact information, and a logged error identifier for correlation.

### Requirement 17: Consent Management and Privacy

**User Story:** As a privacy-conscious visitor, I want analytics and marketing to require my consent, so that my data is only used with my agreement in line with DPDP/GDPR.

#### Acceptance Criteria

1. WHILE the visitor has not granted explicit consent, THE Consent_Manager SHALL prevent loading of any analytics, session-replay, or marketing script.
2. WHEN a visitor grants or denies consent, THE Consent_Manager SHALL persist the consent state (including category, granted/denied value, and timestamp) within 1 second of the action.
3. WHEN a visitor with a previously persisted consent state loads any page, THE Consent_Manager SHALL apply that stored consent state before loading any analytics, session-replay, or marketing script.
4. IF a persisted consent state is older than 365 days, THEN THE Consent_Manager SHALL treat consent as not granted and re-prompt the visitor for consent.
5. WHEN a lead is stored for marketing use, THE Lead_Service SHALL record Consent_Marketing as true together with a consent timestamp in ISO 8601 UTC format and the consent IP address.
6. IF a lead submission for marketing use does not include a valid consent timestamp and consent IP, THEN THE Lead_Service SHALL reject the submission, return an error response indicating missing consent data, and SHALL NOT store the lead.
7. THE Public_API SHALL exclude all personally identifiable field values (including name, email, phone number, and IP address) from application logs, substituting a redaction placeholder in their place.
8. WHEN a visitor's browser sends a Do-Not-Track signal with a value of 1, THE Consent_Manager SHALL treat analytics, session-replay, and marketing consent as denied unless the visitor subsequently grants explicit consent.

### Requirement 18: API Standards, Validation, and Idempotency

**User Story:** As a future integrator, I want a stable, versioned, well-validated API with idempotent writes, so that clients (mobile, portals, CRM) can consume it reliably.

#### Acceptance Criteria

1. THE Public_API SHALL expose all endpoints under the version prefix `/api/v1`.
2. WHEN the Public_API returns a success response, THE Public_API SHALL include a non-empty `requestId` in the `meta` object, and WHEN it returns an error response, THE Public_API SHALL include a non-empty `requestId` in the problem-detail body.
3. IF a request body or query parameter fails syntactic validation (type, format, or value-range constraint), THEN THE Public_API SHALL respond with HTTP 422 and a problem-detail response listing each invalid field by name and the reason it failed.
4. WHEN a request satisfies all schema, type, and value-range constraints, THE Public_API SHALL NOT reject it for validation reasons.
5. WHEN a write request includes an `Idempotency-Key` and one or more requests carrying the same key and an identical request body are received within the 24-hour (86,400-second) TTL window, THE Idempotency_Handler SHALL persist exactly one record, emit exactly one domain event, and return the first stored result for every duplicate.
6. IF a write request reuses an `Idempotency-Key` within the TTL window with a request body that differs from the original, THEN THE Idempotency_Handler SHALL respond with an idempotency-key conflict problem-detail and SHALL NOT persist a new record or emit a domain event.
7. IF an `Idempotency-Key` header is empty or exceeds 255 characters, THEN THE Public_API SHALL reject the request with HTTP 400 and a problem-detail indicating the invalid key.
8. IF a write operation fails, THEN THE Idempotency_Handler SHALL NOT cache a result for that key, and a subsequent request reusing that key SHALL be processed as a new operation.
9. IF a request to a filtered collection endpoint supplies an unknown query parameter, THEN THE Public_API SHALL reject the request with HTTP 400 and a problem-detail identifying the unknown parameter.
10. THE Public_API SHALL apply a collection page size default of 20 and a maximum of 50.
11. IF a request supplies a page size greater than 50, THEN THE Public_API SHALL reject the request with HTTP 400 and a problem-detail indicating the maximum page size.

### Requirement 19: Rate Limiting and Spam Prevention

**User Story:** As an operator, I want forms protected against spam and abuse, so that lead data quality and system cost are protected.

#### Acceptance Criteria

1. WHEN write/form requests from a single client identifier exceed the configured per-endpoint sliding-window limit of 10 requests per 60-second window, THE Rate_Limiter SHALL reject the request with HTTP 429 and include a `Retry-After` header specifying the number of seconds until the window resets.
2. THE Rate_Limiter SHALL apply a write/form endpoint limit that is at most 20 percent of the public read endpoint limit measured over the same sliding-window duration.
3. WHEN a public write is received, THE Spam_Filter SHALL verify the Cloudflare Turnstile token server-side within 5 seconds before accepting the submission.
4. IF the Cloudflare Turnstile token is missing, expired, or fails server-side verification, THEN THE Spam_Filter SHALL reject the submission, not persist it as a valid lead, and return a response indicating the verification failed.
5. IF a submission fills the honeypot field or is submitted less than 3 seconds after the form was rendered, THEN THE Spam_Filter SHALL store the submission with status `spam` and respond with HTTP 200 without indicating rejection.
6. WHEN server-side content heuristics flag a submission, THE Spam_Filter SHALL store the submission with status `spam` and retain it for operator review rather than blocking or discarding it.

### Requirement 20: Reliable Event Emission (Transactional Outbox)

**User Story:** As a future CRM/downstream consumer, I want guaranteed delivery of domain events, so that no lead, consultation, or application is ever lost.

#### Acceptance Criteria

1. WHEN a business write is committed, THE Public_API SHALL commit the corresponding outbox event row in the same database transaction as the business write, such that either both the business write and the outbox row persist together or neither persists.
2. IF the business write transaction is rolled back or fails to commit, THEN THE Public_API SHALL NOT persist the corresponding outbox event row.
3. WHEN an outbox event row has status `pending`, THE Outbox_Relay SHALL attempt to deliver it within 60 seconds of its creation and process events in batches of at most 100 events per polling cycle.
4. WHEN delivery of a pending event succeeds, THE Outbox_Relay SHALL mark that event `published` and record a publish timestamp, delivering every event at least once.
5. THE Outbox_Relay SHALL process events in ascending order of occurrence timestamp and SHALL preserve delivery ordering for all events sharing the same aggregate identifier.
6. IF delivery of an event fails, THEN THE Outbox_Relay SHALL increment that event's attempt count by 1 and continue processing the remaining events in the batch without blocking them.
7. IF an event's attempt count reaches the maximum of 5 attempts, THEN THE Outbox_Relay SHALL mark that event `failed`.
8. THE Outbox_Relay SHALL ensure that every processed event terminates in either `published` or `failed` status and SHALL never leave a processed event in `pending` status indefinitely or remove it without recording a terminal status.

### Requirement 21: Email Notifications

**User Story:** As a visitor who submitted a form, I want a confirmation email with my reference, so that I have a record of my submission.

#### Acceptance Criteria

1. WHEN a contact, consultation, or application submission is accepted, THE Email_Worker SHALL queue a transactional confirmation email containing the Reference_Code.
2. THE Public_API SHALL respond with success (201 or 202) for an accepted submission even when the confirmation email has not yet been sent.
3. IF an email send fails, THEN THE Email_Worker SHALL retry with backoff and, after exhausting retries, record the failure in the outbox as `failed` for inspection.

### Requirement 22: Data Integrity and Soft Delete

**User Story:** As a data steward, I want canonical identifiers, uniqueness guarantees, and non-destructive deletion, so that data remains auditable and portable to future systems.

#### Acceptance Criteria

1. WHEN an entity is persisted, THE Public_API SHALL assign it a time-ordered UUID that is unique across all persisted entities, such that no two entities ever share the same primary identifier.
2. WHEN a lead, consultation, or job application is created, THE Public_API SHALL assign it a Reference_Code that is unique across all records of that type.
3. IF a Reference_Code generation attempt collides with an existing Reference_Code, THEN THE Public_API SHALL generate a new Reference_Code and SHALL NOT persist the record with a duplicate value.
4. WHEN a content item is published, THE Content_Service SHALL enforce that its slug is unique among all published items of the same content type.
5. IF a create or update request would assign a published content item a slug that already exists for the same content type, THEN THE Content_Service SHALL reject the request, return an error response indicating a slug conflict, and leave existing stored data unchanged.
6. WHEN a published content item's slug changes, THE SEO_System SHALL require a registered redirect mapping the previous canonical URL to the new canonical URL before the change is committed.
7. IF a request attempts to change a published content item's slug without a registered redirect from the previous canonical URL, THEN THE SEO_System SHALL reject the change, return an error response indicating the missing redirect, and retain the previous slug.
8. THE Public_API SHALL exclude any row with a non-null `deleted_at` value or a non-public status from every public read endpoint response.
9. WHILE iterating all pages of a collection under a sort order that is deterministic and total (ties broken by the entity's primary identifier), THE Public_API SHALL return every non-excluded item exactly once with no item appearing on more than one page.

### Requirement 23: SEO and Structured Data

**User Story:** As a growth stakeholder, I want SEO-complete pages with structured data, so that the site ranks well and is citable by AI search.

#### Acceptance Criteria

1. THE SEO_System SHALL export per-route metadata including title (templated `%s — Tribhuban Concepts`), description, canonical URL, OpenGraph tags, Twitter card, and robots directives.
2. THE SEO_System SHALL inject JSON-LD structured data appropriate to each page type (`Organization` and `WebSite` sitewide; `Article`/`BlogPosting`/`TechArticle` on content; `BreadcrumbList` on nested pages; `FAQPage` on FAQ; `JobPosting` on careers; `Product`/`Service` on solar/products).
3. THE SEO_System SHALL generate `sitemap.xml` from Public_Content with `lastmod` derived from each item's updated timestamp.
4. THE SEO_System SHALL generate `robots.txt` that allows crawling of public pages, disallows `/search`, `/api`, and reserved namespaces, and declares the sitemap.
5. THE Website SHALL render a `BreadcrumbList`-backed breadcrumb trail on every content page below depth 1.

### Requirement 24: Accessibility (WCAG 2.1 AA)

**User Story:** As a visitor using assistive technology, I want an accessible site, so that I can use every feature regardless of ability.

#### Acceptance Criteria

1. THE Website SHALL render exactly one H1 per page, semantic landmark regions, logical heading order, and a skip-to-content link.
2. THE Website SHALL make all interactive elements operable by keyboard with a visible focus indicator.
3. WHEN a dialog or drawer opens, THE Website SHALL trap focus within it, close it on the Escape key, and restore focus to the triggering element on close.
4. THE Website SHALL associate form fields with programmatic labels and link validation errors to their fields via `aria-describedby`.
5. THE Website SHALL maintain a text contrast ratio of at least 4.5:1 and a large-text/UI contrast ratio of at least 3:1 in both light and dark themes.
6. WHILE the visitor's system requests reduced motion, THE Website SHALL reduce animations to opacity or instant transitions.
7. THE Website SHALL NOT convey essential information through color alone.

### Requirement 25: Performance

**User Story:** As a visitor, I want fast-loading pages, so that I have a smooth experience and the site ranks well on Core Web Vitals.

#### Acceptance Criteria

1. THE Website SHALL serve every image through the image optimizer with AVIF/WebP formats, responsive sizing, and explicit width and height to prevent layout shift.
2. THE Website SHALL restrict client-side JavaScript to interactive islands, keeping page shells server-rendered.
3. THE Public_API SHALL send `Cache-Control` and `ETag` headers on cacheable read endpoints and `no-store` on write and query-dependent endpoints.
4. THE Website SHALL enforce an initial per-route JavaScript budget of approximately 130 KB gzipped in the continuous-integration pipeline.

### Requirement 26: Security

**User Story:** As a security stakeholder, I want the platform hardened against common web attacks, so that visitor data and the system are protected.

#### Acceptance Criteria

1. THE Website SHALL send security headers including `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and `Permissions-Policy`.
2. THE Public_API SHALL execute all database access via parameterized queries and SHALL NOT construct SQL from unescaped input.
3. THE Public_API SHALL accept cross-origin requests only from the allowlisted website origins.
4. WHERE rich HTML content is rendered, THE Website SHALL sanitize it before insertion into the DOM.
5. THE Public_API SHALL load secrets from a secrets manager or environment at runtime and SHALL NOT embed secrets in source code.
6. THE Public_API SHALL require operator authentication for all `/admin` endpoints and SHALL NOT expose the admin content API publicly without operator authentication enabled.

### Requirement 27: Future Compatibility Readiness

**User Story:** As an architect, I want the MVP to be integration-ready, so that future CRM, ERP, Workplace, portals, mobile, and AI systems can consume its data without an architectural rewrite.

#### Acceptance Criteria

1. THE Public_API SHALL publish an OpenAPI contract at `/api/v1/openapi.json` that serves as the source of truth for generated typed clients.
2. THE Public_API SHALL serialize JSON responses using `camelCase` field names.
3. THE Public_API SHALL represent monetary values as an integer amount in minor units together with a currency code.
4. THE Public_API SHALL include an `org_id` tenant field on every stored entity to allow future multi-brand data to coexist without migration.
5. THE Public_API SHALL emit `lead.created`, `consultation.requested`, and `career.application.submitted` domain events as the downstream integration contract.
