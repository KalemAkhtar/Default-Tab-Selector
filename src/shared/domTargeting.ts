import type { UiVersion } from './types';

function normalize(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function accessibleName(el: Element): string {
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return normalize(ariaLabel);
  return normalize(el.textContent);
}

function candidateSelector(uiVersion: UiVersion): string {
  return uiVersion === 'v8' ? '[role="tab"]' : 'button[type="button"]';
}

export function selectionAttribute(uiVersion: UiVersion): 'aria-selected' | 'aria-pressed' {
  return uiVersion === 'v8' ? 'aria-selected' : 'aria-pressed';
}

/**
 * Locates the clickable element for a given option label. Tries an exact
 * accessible-name match first, then falls back to "contains" in case the
 * rendered label carries extra decoration that an exact match would miss.
 */
export function findOptionElement(uiVersion: UiVersion, label: string): HTMLElement | null {
  const target = normalize(label);
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(candidateSelector(uiVersion)));

  const exact = candidates.find((el) => accessibleName(el) === target);
  if (exact) return exact;

  return candidates.find((el) => accessibleName(el).includes(target)) ?? null;
}

export function isSelected(uiVersion: UiVersion, el: HTMLElement): boolean {
  return el.getAttribute(selectionAttribute(uiVersion)) === 'true';
}
