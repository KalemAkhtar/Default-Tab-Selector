import { defaultOptionId } from './preferenceUtils';
import type { CategoryConfig, PreferenceMap } from './types';

const STORAGE_KEY = 'tabDefaults.v1';

// Writes run one at a time. setPreference reads, changes and writes the whole map,
// so two overlapping calls could otherwise both read the old map and the second
// would silently undo the first.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(write: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(write);
  // A failed write must not block the ones behind it; the caller still sees the error.
  writeQueue = run.catch(() => undefined);
  return run;
}

export async function getPreferences(): Promise<PreferenceMap> {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as PreferenceMap | undefined) ?? {};
}

/**
 * Saves the user's choice for one category. Choosing the site's own default
 * removes the override entirely rather than storing it, so "no entry" is the
 * only way a category can be uncustomised.
 */
export function setPreference(category: CategoryConfig, optionId: string): Promise<void> {
  return enqueueWrite(async () => {
    const prefs = await getPreferences();
    if (optionId === defaultOptionId(category)) {
      delete prefs[category.id];
    } else {
      prefs[category.id] = optionId;
    }
    await chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
  });
}

/** Overwrites every preference at once, e.g. `{}` to reset everything. */
export function replaceAllPreferences(prefs: PreferenceMap): Promise<void> {
  return enqueueWrite(() => chrome.storage.sync.set({ [STORAGE_KEY]: prefs }));
}

/**
 * Notifies a callback whenever preferences change, from any extension context
 * (including the one that made the change). Used by the popup to stay in sync
 * and by the content script to re-apply a setting on the open tab.
 */
export function onPreferencesChanged(
  callback: (prefs: PreferenceMap, previous: PreferenceMap) => void,
): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
    const change = changes[STORAGE_KEY];
    if (area !== 'sync' || !change) return;
    callback(
      (change.newValue as PreferenceMap | undefined) ?? {},
      (change.oldValue as PreferenceMap | undefined) ?? {},
    );
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
