/**
 * search.ts — typed API client for Search_Service.
 *
 * Endpoint: GET /api/v1/search
 *
 * Requirements: 13.7, 13.9
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SearchHit {
  id: string;
  type: 'article' | 'knowledge' | 'faq' | 'job';
  title: string;
  slug: string;
  excerpt: string;
  publishedAt?: string;
  url: string;
}

export interface SearchMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  requestId: string;
  timestamp: string;
}

export interface SearchResult {
  data: SearchHit[];
  meta: SearchMeta;
}

// ── API function ──────────────────────────────────────────────────────────────

/**
 * Search across article, knowledge, faq, and job content types.
 *
 * @param q       - Search query (trimmed length must be 2–200 chars)
 * @param page    - Page number (default 1)
 * @param pageSize - Results per page (1–50, default 20)
 * @param types   - Optional filter by content type
 * @throws        - On non-2xx response or network error
 */
export async function searchContent(
  q: string,
  page?: number,
  pageSize?: number,
  types?: string[],
): Promise<SearchResult> {
  const params = new URLSearchParams();
  params.set('q', q);
  if (page !== undefined) params.set('page', String(page));
  if (pageSize !== undefined) params.set('page_size', String(pageSize));
  if (types && types.length > 0) {
    types.forEach((t) => params.append('types', t));
  }

  const res = await fetch(
    `${API_BASE}/api/v1/search?${params.toString()}`,
    { cache: 'no-store' },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Search request failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`);
  }

  const envelope = await res.json() as {
    data: Array<{
      id: string;
      type: 'article' | 'knowledge' | 'faq' | 'job';
      title: string;
      slug: string;
      excerpt: string;
      published_at?: string;
      url?: string;
    }>;
    meta: {
      page: number;
      page_size: number;
      total: number;
      total_pages: number;
      request_id: string;
      timestamp: string;
    };
  };

  // Normalise snake_case from backend to camelCase for frontend
  const data: SearchHit[] = (envelope.data ?? []).map((hit) => ({
    id: hit.id,
    type: hit.type,
    title: hit.title,
    slug: hit.slug,
    excerpt: hit.excerpt,
    publishedAt: hit.published_at,
    url: hit.url ?? buildUrl(hit.type, hit.slug),
  }));

  const rawMeta = envelope.meta ?? {};
  const meta: SearchMeta = {
    page: rawMeta.page ?? 1,
    pageSize: rawMeta.page_size ?? 20,
    total: rawMeta.total ?? 0,
    totalPages: rawMeta.total_pages ?? 0,
    requestId: rawMeta.request_id ?? '',
    timestamp: rawMeta.timestamp ?? new Date().toISOString(),
  };

  return { data, meta };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildUrl(type: SearchHit['type'], slug: string): string {
  switch (type) {
    case 'article':   return `/blog/${slug}`;
    case 'knowledge': return `/knowledge/${slug}`;
    case 'faq':       return `/support/faq#${slug}`;
    case 'job':       return `/careers/${slug}`;
  }
}
