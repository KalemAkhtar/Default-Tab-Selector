import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CircleAlert, RotateCcw } from 'lucide-react';
import { SECTION_PANEL_ID, SectionTabs, sectionTabId } from './components/SectionTabs';
import { CategoryRow } from './components/CategoryRow';
import { GitHubMark } from './components/GitHubMark';
import { useCurrentCategory } from './hooks/useCurrentCategory';
import { usePreferences } from './hooks/usePreferences';
import { categories, sections } from '../shared/config/categories';
import { isCustomized } from '../shared/preferenceUtils';
import { replaceAllPreferences, setPreference } from '../shared/storage';
import type { CategoryConfig, SectionId } from '../shared/types';

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

const HELP_URL = 'https://github.com/KalemAkhtar/Default-Tab-Selector#readme';

const saveErrorMessage = (error: unknown, failed: string) =>
  /MAX_WRITE_OPERATIONS/.test(String(error))
    ? 'Too many changes in a short time. Wait a minute, then try again.'
    : `Couldn't ${failed}. Try again.`;

interface SaveError {
  id: number;
  message: string;
}

export function Popup() {
  const { preferences, loadFailed } = usePreferences();
  const currentCategory = useCurrentCategory();
  const [chosenSection, setChosenSection] = useState<SectionId | null>(null);
  const activeSection = chosenSection ?? currentCategory?.section ?? sections[0].id;
  const ready = preferences !== null && currentCategory !== undefined;
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const resettingRef = useRef(false);
  const [saveError, setSaveError] = useState<SaveError | null>(null);
  const recordSuccess = () => setSaveError(null);
  const recordFailure = (message: string) =>
    setSaveError((previous) => ({ id: (previous?.id ?? 0) + 1, message }));
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusToReset = useRef(false);

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.section === activeSection),
    [activeSection],
  );

  const { customizedCounts, customizedTotal } = useMemo(() => {
    const counts = new Map<SectionId, number>();
    let total = 0;
    for (const category of categories) {
      if (preferences && isCustomized(category, preferences)) {
        counts.set(category.section, (counts.get(category.section) ?? 0) + 1);
        total += 1;
      }
    }
    return { customizedCounts: counts, customizedTotal: total };
  }, [preferences]);
  const showResetConfirm = confirmingReset && customizedTotal > 0;

  useEffect(() => {
    if (customizedTotal === 0) setConfirmingReset(false);
  }, [customizedTotal]);

  useEffect(() => {
    if (showResetConfirm) {
      cancelButtonRef.current?.focus();
    } else if (returnFocusToReset.current) {
      returnFocusToReset.current = false;
      resetButtonRef.current?.focus();
    }
  }, [showResetConfirm]);

  const cancelReset = () => {
    if (resettingRef.current) return;
    returnFocusToReset.current = true;
    setConfirmingReset(false);
  };

  const confirmReset = async () => {
    if (resettingRef.current) return;
    resettingRef.current = true;
    setResetting(true);
    try {
      await replaceAllPreferences({});
      recordSuccess();
      document.getElementById(sectionTabId(activeSection))?.focus();
    } catch (error) {
      recordFailure(saveErrorMessage(error, 'reset your customisations'));
    } finally {
      resettingRef.current = false;
      setResetting(false);
    }
  };

  const handleFooterKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (showResetConfirm && event.key === 'Escape') {
      event.preventDefault();
      cancelReset();
    }
  };

  const handleSelect = (category: CategoryConfig, optionId: string) => {
    setConfirmingReset(false);
    const label = category.options.find((option) => option.id === optionId)?.label ?? optionId;
    setPreference(category, optionId).then(recordSuccess, (error) =>
      recordFailure(saveErrorMessage(error, `save ${category.name} → ${label}`)),
    );
  };

  const changeSection = (section: SectionId) => {
    setSaveError(null);
    setChosenSection(section);
  };

  const status = showResetConfirm
    ? 'Reset all customisations?'
    : customizedTotal > 0
      ? `${plural(customizedTotal, 'page')} customised`
      : 'Using portal defaults';

  return (
    <div className="popup">
      <aside className="rail">
        <header className="rail__brand">
          <h1>Default Tab Selector</h1>
          <p>Customise Power Apps maker portal default tabs</p>
        </header>

        {ready && (
          <SectionTabs
            activeSection={activeSection}
            customizedCounts={customizedCounts}
            onChange={changeSection}
          />
        )}

        <div className="rail__footer" onKeyDown={handleFooterKeyDown}>
          <p className="rail__status" aria-live="polite">
            {ready ? status : ''}
          </p>
          {showResetConfirm ? (
            <div className="rail__actions">
              <button
                ref={cancelButtonRef}
                type="button"
                className="text-button text-button--centred"
                aria-disabled={resetting}
                onClick={cancelReset}
              >
                Cancel
              </button>
              <button
                type="button"
                className="text-button text-button--centred text-button--solid"
                aria-disabled={resetting}
                onClick={() => void confirmReset()}
              >
                Reset
              </button>
            </div>
          ) : (
            customizedTotal > 0 && (
              <button
                ref={resetButtonRef}
                type="button"
                className="text-button text-button--inset"
                onClick={() => setConfirmingReset(true)}
              >
                <RotateCcw size={13} strokeWidth={2} />
                Reset all
              </button>
            )
          )}
        </div>
      </aside>

      <main className="pane" id={SECTION_PANEL_ID} role="tabpanel" aria-labelledby={sectionTabId(activeSection)}>
        <div className="pane__columns">
          <span aria-hidden="true">Page</span>
          <span aria-hidden="true">Opens on</span>
          <a
            className="pane__help"
            href={HELP_URL}
            target="_blank"
            rel="noreferrer"
            title="Help and source code on GitHub"
            aria-label="Help and source code on GitHub (opens in a new tab)"
          >
            <GitHubMark />
          </a>
        </div>
        <div className="pane__list">
          {!ready ? (
            !loadFailed && <p className="pane__loading">Loading…</p>
          ) : (
            visibleCategories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                preferences={preferences}
                isCurrent={category.id === currentCategory?.id}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
        {(loadFailed && !ready) || saveError ? (
          <div key={saveError?.id ?? 'load'} className="pane__bar" role="alert">
            <CircleAlert size={13} strokeWidth={2} aria-hidden="true" />
            {saveError ? saveError.message : "Couldn't load your settings. Close the popup and open it again."}
          </div>
        ) : null}
      </main>
    </div>
  );
}
