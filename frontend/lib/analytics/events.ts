/**
 * Analytics event taxonomy — frontend/lib/analytics/events.ts
 *
 * All 11 event functions from design §21. Each function:
 *   1. Guards with typeof window !== 'undefined' (server-safe).
 *   2. Checks hasConsent('analytics') before dispatching (Req 17.1).
 *   3. Pushes a GA4-compatible object onto window.dataLayer.
 *
 * window.dataLayer is typed via ambient declaration below so TypeScript
 * does not complain about its absence from the global Window type.
 */

import { hasConsent } from './consent';

// ─────────────────────────────────────────────────────────────────────────────
// Ambient type — window.dataLayer (GA4 / GTM pattern)
// ─────────────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal dispatch helper
// ─────────────────────────────────────────────────────────────────────────────

function dispatch(event: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!hasConsent('analytics')) return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

// ─────────────────────────────────────────────────────────────────────────────
// Event functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fired on every client-side route change (and on initial load).
 * Maps to GA4 `page_view`.
 */
export function trackPageView(url: string): void {
  dispatch('page_view', { page_location: url });
}

/**
 * Fired when a visitor clicks a call-to-action button.
 * Maps to GA4 `cta_click`.
 */
export function trackCtaClick(label: string, destination: string): void {
  dispatch('cta_click', { cta_label: label, cta_destination: destination });
}

/**
 * Fired the first time a visitor interacts with a form field (form_start).
 */
export function trackFormStart(formName: string): void {
  dispatch('form_start', { form_name: formName });
}

/**
 * Fired on successful form submission.
 * `data` carries sanitised, non-PII context (e.g. interest area, calculator inputs).
 */
export function trackFormSubmit(
  formName: string,
  data?: Record<string, unknown>,
): void {
  dispatch('form_submit', { form_name: formName, ...(data ?? {}) });
}

/**
 * Fired when a form submission fails validation.
 * `errors` is an array of field/error-message identifiers.
 */
export function trackFormError(formName: string, errors: string[]): void {
  dispatch('form_error', { form_name: formName, error_fields: errors });
}

/**
 * Fired when the backend confirms a lead was created.
 * `referenceCode` must be opaque (do NOT include PII).
 */
export function trackLeadCreated(
  referenceCode: string,
  source: string,
): void {
  dispatch('lead_created', { reference_code: referenceCode, lead_source: source });
}

/**
 * Fired when a consultation request is confirmed with HTTP 202.
 */
export function trackConsultationRequested(referenceCode: string): void {
  dispatch('consultation_requested', { reference_code: referenceCode });
}

/**
 * Fired when the solar calculator completes a computation.
 * `inputs` should contain only non-PII fields (state, connection_type, etc.).
 */
export function trackCalculatorRun(inputs: Record<string, unknown>): void {
  dispatch('calculator_run', { calculator_inputs: inputs });
}

/**
 * Fired when a calculator result leads to a lead being created.
 */
export function trackCalculatorLead(referenceCode: string): void {
  dispatch('calculator_lead', { reference_code: referenceCode });
}

/**
 * Fired after a newsletter subscription attempt.
 * `status` is one of: 'pending_confirmation' | 'already_subscribed' | 'error'.
 */
export function trackNewsletterSubscribe(status: string): void {
  dispatch('newsletter_subscribe', { subscription_status: status });
}

/**
 * Fired when a job listing detail page is viewed.
 */
export function trackJobView(slug: string, title: string): void {
  dispatch('job_view', { job_slug: slug, job_title: title });
}

/**
 * Fired after a job application is successfully submitted.
 */
export function trackApplicationSubmitted(
  jobSlug: string,
  referenceCode: string,
): void {
  dispatch('application_submitted', {
    job_slug: jobSlug,
    reference_code: referenceCode,
  });
}
