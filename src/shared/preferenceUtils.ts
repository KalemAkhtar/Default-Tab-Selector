import type { CategoryConfig, PreferenceMap } from './types';

/** The tab the site opens on by default: always the first option. */
export function defaultOptionId(category: CategoryConfig): string {
  return category.options[0].id;
}

/**
 * The selected option for this category. A stored id the config no longer has
 * (e.g. an option renamed or removed in an update) counts as no choice at all.
 */
export function getSelectedOptionId(category: CategoryConfig, prefs: PreferenceMap): string {
  const stored = prefs[category.id];
  return category.options.some((option) => option.id === stored) ? stored : defaultOptionId(category);
}

/** True only when the user has chosen something other than the site's own default */
export function isCustomized(category: CategoryConfig, prefs: PreferenceMap): boolean {
  return getSelectedOptionId(category, prefs) !== defaultOptionId(category);
}
