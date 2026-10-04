import { useEffect, useState } from 'react';
import { getPreferences, onPreferencesChanged } from '../../shared/storage';
import type { PreferenceMap } from '../../shared/types';

/**
 * Live view of the stored preferences: `null` until the first read resolves.
 * `loadFailed` is set if that read fails; a later change event still recovers it.
 * Writes go straight through `shared/storage` and come back via the change event.
 */
export function usePreferences(): { preferences: PreferenceMap | null; loadFailed: boolean } {
  const [preferences, setPreferences] = useState<PreferenceMap | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    getPreferences().then(
      (prefs) => mounted && setPreferences(prefs),
      () => mounted && setLoadFailed(true),
    );
    const unsubscribe = onPreferencesChanged((prefs) => {
      if (!mounted) return;
      setPreferences(prefs);
      setLoadFailed(false);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { preferences, loadFailed };
}
