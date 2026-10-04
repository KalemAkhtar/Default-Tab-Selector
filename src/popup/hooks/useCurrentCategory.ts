import { useEffect, useState } from 'react';
import { categories } from '../../shared/config/categories';
import { GET_CURRENT_CATEGORY } from '../../shared/messages';
import type { CategoryConfig } from '../../shared/types';

/** Give up waiting after this long; a tab without our content script never answers. */
const REPLY_TIMEOUT_MS = 300;

/**
 * The category for the page in the active tab: `undefined` while asking, then the
 * category, or `null` when the tab isn't a supported maker portal page.
 */
export function useCurrentCategory(): CategoryConfig | null | undefined {
  const [current, setCurrent] = useState<CategoryConfig | null | undefined>(undefined);

  useEffect(() => {
    let settled = false;
    const settle = (category: CategoryConfig | null) => {
      if (settled) return;
      settled = true;
      setCurrent(category);
    };
    const timer = window.setTimeout(() => settle(null), REPLY_TIMEOUT_MS);

    // Starting from a resolved promise turns any synchronous throw into a rejection.
    Promise.resolve()
      .then(() => chrome.tabs.query({ active: true, currentWindow: true }))
      .then(([tab]) =>
        tab?.id === undefined ? null : chrome.tabs.sendMessage<unknown, string | null>(tab.id, { type: GET_CURRENT_CATEGORY }),
      )
      .then((id) => settle(categories.find((category) => category.id === id) ?? null))
      // Other sites and browser pages have no receiver, so sendMessage rejects.
      .catch(() => settle(null));

    return () => {
      settled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return current;
}
