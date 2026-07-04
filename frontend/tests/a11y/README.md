# Manual Accessibility Testing Checklist

This document covers manual assistive-technology tests that cannot be automated with axe-core alone. Complete this checklist with **NVDA on Windows** and **VoiceOver on macOS/iOS** before each release.

---

## 1. Skip Link

**Route:** All pages (start with `/`)

| Step | Expected behaviour | Pass? |
|------|-------------------|-------|
| Tab to the very first interactive element on the page | The **"Skip to main content"** link becomes visible (slides down from above the header) | |
| Press **Enter** | Focus moves to `#main-content`; the next Tab moves to the first interactive element inside `<main>` | |
| Screen reader announces the skip link | VoiceOver/NVDA reads "Skip to main content, link" | |

---

## 2. Navigation Drawer (Mobile — viewport < 768 px)

**Route:** Any page at mobile breakpoint

| Step | Expected behaviour | Pass? |
|------|-------------------|-------|
| Tab to the **menu / hamburger** trigger button | Screen reader announces "Open navigation menu, button" (or equivalent) | |
| Press **Enter** or **Space** | Drawer opens; focus moves to the first item inside the drawer | |
| Tab through all drawer links | Focus is **trapped** inside the drawer; no element outside the drawer receives focus | |
| Press **Escape** | Drawer closes; focus returns to the menu trigger button | |
| Click/tap the close (✕) button instead | Drawer closes; focus returns to the menu trigger button | |
| Shift-Tab from first item in drawer | Focus stays inside the drawer (wraps to last focusable item) | |

---

## 3. All Form Fields

**Routes:** `/consultation`, `/contact`, and Footer newsletter signup

| Step | Expected behaviour | Pass? |
|------|-------------------|-------|
| Tab to any form field | Screen reader announces the **label** and whether it is **required** | |
| Tab to a required field without filling it; Tab away | Inline error message appears; screen reader announces it via `aria-describedby` | |
| Error `<p>` element | Has an `id` attribute; the corresponding `<input>` / `<select>` / `<textarea>` has `aria-describedby` pointing to that `id` | |
| Required indicator (`*`) | Marked `aria-hidden="true"`; requirement is conveyed through the label text or `aria-required="true"` instead | |
| Submit button while form is processing | Screen reader announces "Submitting…" or equivalent; button has `aria-busy="true"` | |

---

## 4. Solar Calculator — `aria-live` Result Announcement

**Route:** `/solar/calculator`

| Step | Expected behaviour | Pass? |
|------|-------------------|-------|
| Fill in all calculator inputs and submit | After the result loads, the screen reader **announces** the results region without the user moving focus (polite live region) | |
| `aria-live="polite"` region | Exists in the DOM at page load (not injected dynamically); content updates trigger an announcement | |
| Result content | Includes system size, annual generation, estimated savings, payback period, and CO₂ offset | |

---

## 5. Heading Structure

**Routes:** All critical routes (`/`, `/about`, `/solar/calculator`, `/consultation`, `/contact`, `/blog`, `/search`, `/careers`, `/support/faq`, `/legal/privacy`)

| Step | Expected behaviour | Pass? |
|------|-------------------|-------|
| Open the **Headings** list in NVDA (Insert + F7) or VoiceOver rotor | Exactly **one H1** is present on each page | |
| Navigate headings in order | Heading levels are **logically nested** (H1 → H2 → H3); no heading levels are skipped | |
| Page title announced on load | `<title>` (set via `generateMetadata`) matches the visible H1 or page purpose | |

---

## 6. Focus Visibility

| Step | Expected behaviour | Pass? |
|------|-------------------|-------|
| Tab through the entire page | Every focusable element shows a **visible focus ring** (2 px gold ring, `--ring` token) | |
| No element has `outline: none` without a visible custom focus indicator | — | |
| Focus ring contrast ratio | The gold ring (`#C9A227`) on white (`#FEFDFB`) achieves ≥ 3:1 contrast against the adjacent background | |

---

## 7. Colour and Contrast

All contrast ratios are documented in `frontend/app/globals.css`. Re-verify after any colour-token change using a tool such as the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

| Token | Ratio (light) | Ratio (dark) | WCAG level |
|-------|--------------|-------------|------------|
| `--fg` on `--bg` | ≈ 18.9:1 | ≈ 16.8:1 | AAA |
| `--fg-muted` on `--bg` | ≈ 8.1:1 | ≈ 8.4:1 | AA |
| `--fg-subtle` on `--bg` | ≈ 4.6:1 | ≈ 4.5:1 | AA |
| `--accent` on `--bg` | ≈ 4.5:1 | ≈ 6.1:1 | AA |
| `--btn-primary-fg` on `--btn-primary-bg` | ≈ 4.5:1 | ≈ 6.1:1 | AA |
| Error red on `--bg` | ≈ 5.9:1 | ≈ 5.0:1 | AA |

---

## Running the automated axe-core suite

```bash
# From frontend/
npm run test:a11y
```

The automated suite covers all critical routes using Playwright + `@axe-core/playwright` with `prefers-reduced-motion: reduce` set in the browser context. Results are written to `playwright-report/` and `playwright-results/`.
