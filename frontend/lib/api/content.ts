/**
 * content.ts — typed API client for Content_Service endpoints.
 *
 * Endpoints:
 *   GET /api/v1/articles        → PaginatedResponse<ArticleSummary>
 *   GET /api/v1/articles/{slug} → ArticleDetail | null
 *   GET /api/v1/categories      → Category[]
 *   GET /api/v1/knowledge       → PaginatedResponse<KnowledgeItemSummary>
 *   GET /api/v1/knowledge/{slug}→ KnowledgeItemDetail | null
 *   GET /api/v1/faqs            → FAQ[]
 *
 * Requirements: 10.1, 10.3, 10.5
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Shared ────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ── Article types ─────────────────────────────────────────────────────────────

export interface ArticleAuthor {
  name: string;
  bio?: string;
  avatar_url?: string;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  hero_image_url?: string;
  category: Category;
  tags: Tag[];
  author: ArticleAuthor;
  reading_time_minutes: number;
  published_at: string;
}

export interface ArticleDetail extends ArticleSummary {
  body: unknown; // Rich JSON body — rendered as text for MVP
  toc?: TocEntry[];
  related_articles?: ArticleSummary[];
  meta_title?: string;
  meta_description?: string;
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

// ── Category / Tag ────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

// ── Knowledge types ───────────────────────────────────────────────────────────

export type KnowledgeDocType = 'guide' | 'reference' | 'research';

export interface KnowledgeItemSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  doc_type: KnowledgeDocType;
  category?: Category;
  tags: Tag[];
  reading_time_minutes: number;
  published_at: string;
}

export interface KnowledgeItemDetail extends KnowledgeItemSummary {
  body: unknown;
  toc?: TocEntry[];
  related_items?: KnowledgeItemSummary[];
  meta_title?: string;
  meta_description?: string;
}

// ── FAQ types ─────────────────────────────────────────────────────────────────

export interface FaqCategory {
  id: string;
  slug: string;
  name: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  order: number;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface ArticleListParams {
  page?: number;
  page_size?: number;
  category?: string;
  tag?: string;
  sort?: 'newest' | 'oldest' | 'most-relevant';
}

export interface KnowledgeListParams {
  page?: number;
  page_size?: number;
  category?: string;
  doc_type?: KnowledgeDocType;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') {
      q.set(key, String(val));
    }
  }
  const str = q.toString();
  return str ? `?${str}` : '';
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated list of published articles.
 * Returns null on error so pages can show error state (Req 10.9).
 */
export async function fetchArticles(
  params: ArticleListParams = {},
): Promise<PaginatedResponse<ArticleSummary> | null> {
  try {
    const query = buildQuery({
      page: params.page,
      page_size: params.page_size,
      category: params.category,
      tag: params.tag,
      sort: params.sort,
    });
    const res = await fetch(`${API_BASE}/api/v1/articles${query}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const envelope = await res.json() as { data: PaginatedResponse<ArticleSummary> };
    return envelope.data;
  } catch {
    return null;
  }
}

/**
 * Fetch a single article by slug.
 * Returns null when not found or on error.
 */
export async function fetchArticle(slug: string): Promise<ArticleDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/articles/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const envelope = await res.json() as { data: ArticleDetail };
    return envelope.data;
  } catch {
    return null;
  }
}

/**
 * Fetch all published categories.
 * Returns empty array on error.
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const envelope = await res.json() as { data: Category[] };
    return envelope.data ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch paginated list of published knowledge items.
 * Returns null on error.
 */
export async function fetchKnowledgeItems(
  params: KnowledgeListParams = {},
): Promise<PaginatedResponse<KnowledgeItemSummary> | null> {
  try {
    const query = buildQuery({
      page: params.page,
      page_size: params.page_size,
      category: params.category,
      doc_type: params.doc_type,
    });
    const res = await fetch(`${API_BASE}/api/v1/knowledge${query}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const envelope = await res.json() as { data: PaginatedResponse<KnowledgeItemSummary> };
    return envelope.data;
  } catch {
    return null;
  }
}

/**
 * Fetch a single knowledge item by slug.
 * Returns null when not found or on error.
 */
export async function fetchKnowledgeItem(slug: string): Promise<KnowledgeItemDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/knowledge/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const envelope = await res.json() as { data: KnowledgeItemDetail };
    return envelope.data;
  } catch {
    return null;
  }
}

/**
 * Fetch all FAQs.
 * Returns empty array on error.
 */
export async function fetchFaqs(): Promise<FAQ[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/faqs`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const envelope = await res.json() as { data: FAQ[] };
    return envelope.data ?? [];
  } catch {
    return [];
  }
}
