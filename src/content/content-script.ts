import { categories } from '../shared/config/categories';
import { matchCategory } from '../shared/urlMatcher';
import { findOptionElement, isSelected, selectionAttribute } from '../shared/domTargeting';
import { GET_CURRENT_CATEGORY } from '../shared/messages';
import { getPreferences, onPreferencesChanged } from '../shared/storage';
import { getSelectedOptionId, isCustomized } from '../shared/preferenceUtils';
import type { CategoryConfig, UiVersion } from '../shared/types';

const NAVIGATION_EVENT = 'ppmt:navigation';
const ELEMENT_WAIT_TIMEOUT_MS = 10_000;
const DEFEND_WINDOW_MS = 5_000;
const DEBOUNCE_MS = 50;
const MAX_DEFEND_CORRECTIONS = 10;

let runId = 0;

let activeCategoryId: string | null = null;

let activeDefendDispose: (() => void) | null = null;

function debounce<T extends (...args: never[]) => void>(fn: T, wait: number): T {
  let handle: number | undefined;
  return ((...args: Parameters<T>) => {
    if (handle !== undefined) window.clearTimeout(handle);
    handle = window.setTimeout(() => fn(...args), wait);
  }) as T;
}

function waitForBody(): Promise<void> {
  if (document.body) return Promise.resolve();
  return new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });
}

function waitForElement(
  uiVersion: UiVersion,
  label: string,
  timeoutMs: number,
  shouldAbort: () => boolean,
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = findOptionElement(uiVersion, label);
    if (existing) {
      resolve(existing);
      return;
    }

    let settled = false;
    const finish = (value: HTMLElement | null) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.clearTimeout(timer);
      resolve(value);
    };

    const observer = new MutationObserver(() => {
      if (shouldAbort()) {
        finish(null);
        return;
      }
      const found = findOptionElement(uiVersion, label);
      if (found) finish(found);
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    const timer = window.setTimeout(() => finish(null), timeoutMs);
  });
}

function clickIfNeeded(uiVersion: UiVersion, el: HTMLElement): void {
  if (!isSelected(uiVersion, el)) el.click();
}

function getCategoryOptionElements(category: CategoryConfig): HTMLElement[] {
  return category.options
    .map((option) => findOptionElement(category.uiVersion, option.label))
    .filter((el): el is HTMLElement => el !== null);
}

function defendSelection(category: CategoryConfig, desiredLabel: string, shouldAbort: () => boolean): void {
  activeDefendDispose?.();

  const attribute = selectionAttribute(category.uiVersion);
  let disposed = false;
  let safetyTimer = 0;
  let corrections = 0;
  let target: HTMLElement | null = null;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    mutationObserver.disconnect();
    document.removeEventListener('click', handleUserClick, true);
    window.clearTimeout(safetyTimer);
    if (activeDefendDispose === dispose) activeDefendDispose = null;
  };
  activeDefendDispose = dispose;

  const extendWindow = () => {
    window.clearTimeout(safetyTimer);
    safetyTimer = window.setTimeout(dispose, DEFEND_WINDOW_MS);
  };

  function handleUserClick(event: MouseEvent): void {
    if (!event.isTrusted || !(event.target instanceof Node)) return;
    const ownedElements = getCategoryOptionElements(category);
    const clickedOwnTab = ownedElements.some((el) => el.contains(event.target as Node));
    if (clickedOwnTab) dispose();
  }

  const mutationObserver = new MutationObserver(() => {
    if (shouldAbort()) {
      dispose();
      return;
    }
    if (!target?.isConnected) target = findOptionElement(category.uiVersion, desiredLabel);
    if (!target || isSelected(category.uiVersion, target)) return;
    if (++corrections > MAX_DEFEND_CORRECTIONS) {
      dispose();
      return;
    }
    target.click();
    extendWindow();
  });

  mutationObserver.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [attribute],
  });

  document.addEventListener('click', handleUserClick, true);
  extendWindow();
}

async function applyPreferenceForCategory(
  category: CategoryConfig,
  shouldAbort: () => boolean,
  { restoreDefault }: { restoreDefault: boolean },
): Promise<void> {
  const prefs = await getPreferences();
  if (shouldAbort()) return;

  const customized = isCustomized(category, prefs);

  if (!customized && !restoreDefault) return;

  const optionId = getSelectedOptionId(category, prefs);
  const option = category.options.find((o) => o.id === optionId);
  if (!option) return;

  const target = await waitForElement(category.uiVersion, option.label, ELEMENT_WAIT_TIMEOUT_MS, shouldAbort);
  if (shouldAbort() || !target) return;

  clickIfNeeded(category.uiVersion, target);
  if (customized) defendSelection(category, option.label, shouldAbort);
}

interface EvaluateOptions {
  force: boolean;
  restoreDefault?: boolean;
}

async function evaluateCurrentPage({ force, restoreDefault = false }: EvaluateOptions): Promise<void> {
  await waitForBody();

  const category = matchCategory(window.location.pathname, categories);
  const categoryId = category?.id ?? null;

  if (!force && categoryId === activeCategoryId) {
    return;
  }

  activeCategoryId = categoryId;
  activeDefendDispose?.();
  const thisRun = ++runId;
  const shouldAbort = () => thisRun !== runId;

  if (!category) return;
  await applyPreferenceForCategory(category, shouldAbort, { restoreDefault });
}

const debouncedNavigationSync = debounce(() => void evaluateCurrentPage({ force: false }), DEBOUNCE_MS);
const debouncedPreferenceSync = debounce(
  () => void evaluateCurrentPage({ force: true, restoreDefault: true }),
  DEBOUNCE_MS,
);

void evaluateCurrentPage({ force: true });

window.addEventListener(NAVIGATION_EVENT, () => debouncedNavigationSync());

window.addEventListener('popstate', () => debouncedNavigationSync());

onPreferencesChanged((prefs, previous) => {
  const category = matchCategory(window.location.pathname, categories);
  if (!category) return;
  if (getSelectedOptionId(category, previous) === getSelectedOptionId(category, prefs)) return;
  debouncedPreferenceSync();
});

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if ((message as { type?: string } | null)?.type !== GET_CURRENT_CATEGORY) return;
  sendResponse(matchCategory(window.location.pathname, categories)?.id ?? null);
});
