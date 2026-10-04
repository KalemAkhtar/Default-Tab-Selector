/**
 * The two Fluent UI generations used across the maker portal. They expose
 * selection state differently, so categories must declare thier type:
 *  - v8 tabs: `[role="tab"]`, selection via `aria-selected`.
 *  - v9 buttons: `button[type="button"]`, selection via `aria-pressed`.
 */
export type UiVersion = 'v8' | 'v9';

export type SectionId = 'general' | 'data' | 'ai';

export interface SectionMeta {
  id: SectionId;
  label: string;
}

export interface TabOption {
  /** Stable identifier used in storage. */
  id: string;
  /** Visible/accessible text the extension matches against the DOM. */
  label: string;
}

export interface CategoryConfig {
  /** Stable identifier used as the storage key for this category. */
  id: string;
  section: SectionId;
  /** Display name shown in the popup ("Plans", "Columns", ...). */
  name: string;
  uiVersion: UiVersion;
  /**
   * Path-segment pattern e.g. "/entities" or "/entities/*\/fields". 
   * "*" matches exactly one path segment. See `shared/urlMatcher.ts`.
   */
  urlPattern: string;
  options: TabOption[];
}

/** categoryId -> optionId, for every category the user has customised. */
export type PreferenceMap = Record<string, string>;
