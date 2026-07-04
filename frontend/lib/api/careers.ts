/**
 * careers.ts — typed API client for the Career and Upload endpoints.
 *
 * Functions:
 *   fetchJobs(params)         — GET /api/v1/jobs with optional filters
 *   fetchJob(slug)            — GET /api/v1/jobs/{slug}
 *   presignUpload(...)        — POST /api/v1/uploads/presign
 *   submitApplication(...)    — POST /api/v1/jobs/{slug}/applications
 *
 * Requirements: 11.1, 11.2, 11.4, 12.1, 12.4
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Types ─────────────────────────────────────────────────────────────────────

export type JobStatus = 'open' | 'closed' | 'filled';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship';

export interface Job {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  status: JobStatus;
  summary: string;
  postedAt: string; // ISO 8601
  updatedAt: string;
}

export interface JobDetail extends Job {
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  } | null;
  applicationDeadline?: string | null;
}

export interface JobFilterParams {
  department?: string;
  location?: string;
  type?: EmploymentType;
}

export interface ApplicationRequest {
  fullName: string;
  email: string;
  phone?: string;
  coverNote?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeKey: string; // object_key from presign response
  consentDataProcessing: boolean;
}

export interface ApplicationResponse {
  id: string;
  referenceCode: string;
  status: string;
  createdAt: string;
}

export interface PresignResponse {
  uploadUrl: string;  // presigned S3 PUT URL
  objectKey: string;  // final object key to submit with application
  expiresAt: string;  // ISO 8601 — 15 minutes from issuance
}

export interface FieldError {
  field: string;
  message: string;
}

// ── API error ─────────────────────────────────────────────────────────────────

export class CareersApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    public readonly fields?: FieldError[],
  ) {
    super(detail);
    this.name = 'CareersApiError';
  }
}

// ── Helper: parse error body ──────────────────────────────────────────────────

async function parseErrorBody(response: Response): Promise<{ detail: string; fields?: FieldError[] }> {
  let detail = `Request failed with status ${response.status}`;
  let fields: FieldError[] | undefined;

  try {
    const body = await response.json();
    if (body?.error?.detail) detail = body.error.detail;
    else if (typeof body?.detail === 'string') detail = body.detail;

    if (Array.isArray(body?.error?.fields)) {
      fields = body.error.fields as FieldError[];
    } else if (Array.isArray(body?.detail)) {
      // FastAPI default validation error format
      fields = (body.detail as Array<{ loc: string[]; msg: string }>).map((e) => ({
        field: e.loc?.[e.loc.length - 1] ?? 'unknown',
        message: e.msg,
      }));
    }
  } catch {
    // ignore JSON parse errors
  }

  return { detail, fields };
}

// ── fetchJobs ─────────────────────────────────────────────────────────────────

/**
 * Fetch open job listings with optional filters.
 * Returns Job[] (empty array if no open jobs).
 */
export async function fetchJobs(params?: JobFilterParams): Promise<Job[]> {
  const url = new URL(`${API_BASE}/api/v1/jobs`);
  if (params?.department) url.searchParams.set('department', params.department);
  if (params?.location) url.searchParams.set('location', params.location);
  if (params?.type) url.searchParams.set('type', params.type);

  const response = await fetch(url.toString(), {
    next: { revalidate: 900 }, // match ISR revalidate
  });

  if (!response.ok) {
    const { detail, fields } = await parseErrorBody(response);
    throw new CareersApiError(response.status, detail, fields);
  }

  const envelope = await response.json() as { data: Job[] };
  return envelope.data ?? [];
}

// ── fetchJob ──────────────────────────────────────────────────────────────────

/**
 * Fetch a single job by slug.
 * Returns null for 404 (closed/filled/unknown).
 * Throws CareersApiError for other errors.
 */
export async function fetchJob(slug: string): Promise<JobDetail | null> {
  const response = await fetch(`${API_BASE}/api/v1/jobs/${encodeURIComponent(slug)}`, {
    next: { revalidate: 900 },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    const { detail, fields } = await parseErrorBody(response);
    throw new CareersApiError(response.status, detail, fields);
  }

  const envelope = await response.json() as { data: JobDetail };
  return envelope.data;
}

// ── presignUpload ─────────────────────────────────────────────────────────────

/**
 * Request a presigned S3 PUT URL for resume upload.
 * Validates file type (pdf/doc/docx) and size (1–5 MB) server-side.
 * Throws CareersApiError on validation failure (422) or server error.
 *
 * Requirements: 12.1, 12.2, 12.3
 */
export async function presignUpload(
  fileType: string,
  fileSize: number,
): Promise<PresignResponse> {
  const response = await fetch(`${API_BASE}/api/v1/uploads/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_type: fileType, file_size: fileSize }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const { detail, fields } = await parseErrorBody(response);
    throw new CareersApiError(response.status, detail, fields);
  }

  const envelope = await response.json() as { data: PresignResponse };
  return envelope.data;
}

// ── submitApplication ─────────────────────────────────────────────────────────

/**
 * Submit a job application for the given slug.
 * Returns ApplicationResponse with referenceCode on success.
 * Throws CareersApiError on validation or server errors.
 *
 * Requirements: 11.4, 12.4
 */
export async function submitApplication(
  slug: string,
  req: ApplicationRequest,
): Promise<ApplicationResponse> {
  const response = await fetch(`${API_BASE}/api/v1/jobs/${encodeURIComponent(slug)}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: req.fullName,
      email: req.email,
      phone: req.phone ?? null,
      cover_note: req.coverNote ?? null,
      linkedin_url: req.linkedinUrl ?? null,
      portfolio_url: req.portfolioUrl ?? null,
      resume_key: req.resumeKey,
      consent_data_processing: req.consentDataProcessing,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const { detail, fields } = await parseErrorBody(response);
    throw new CareersApiError(response.status, detail, fields);
  }

  const envelope = await response.json() as { data: ApplicationResponse };
  return envelope.data;
}
