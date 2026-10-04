import { Database, LayoutGrid, Sparkles, type LucideIcon } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { sections } from '../../shared/config/categories';
import type { SectionId } from '../../shared/types';

const ICONS: Record<SectionId, LucideIcon> = {
  general: LayoutGrid,
  data: Database,
  ai: Sparkles,
};

export const sectionTabId = (section: SectionId) => `section-tab-${section}`;
export const SECTION_PANEL_ID = 'section-panel';

interface SectionTabsProps {
  activeSection: SectionId;
  /** Number of customised pages in each section. */
  customizedCounts: ReadonlyMap<SectionId, number>;
  onChange: (section: SectionId) => void;
}

export function SectionTabs({ activeSection, customizedCounts, onChange }: SectionTabsProps) {
  const tabRefs = useRef<Partial<Record<SectionId, HTMLButtonElement | null>>>({});

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = sections.findIndex((section) => section.id === activeSection);
    const last = sections.length - 1;
    const next = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;

    event.preventDefault();
    const section = sections[next].id;
    onChange(section);
    tabRefs.current[section]?.focus();
  };

  return (
    <div
      className="section-tabs"
      role="tablist"
      aria-label="Category section"
      aria-orientation="vertical"
      onKeyDown={onKeyDown}
    >
      {sections.map((section) => {
        const Icon = ICONS[section.id];
        const isActive = section.id === activeSection;
        const count = customizedCounts.get(section.id) ?? 0;
        return (
          <button
            key={section.id}
            ref={(el) => {
              tabRefs.current[section.id] = el;
            }}
            id={sectionTabId(section.id)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={SECTION_PANEL_ID}
            tabIndex={isActive ? 0 : -1}
            className={`section-tab${isActive ? ' section-tab--active' : ''}`}
            onClick={() => onChange(section.id)}
          >
            <Icon size={15} strokeWidth={2} />
            <span className="section-tab__label">{section.label}</span>
            {count > 0 && (
              <span className="section-tab__count">
                {count}
                <span className="visually-hidden"> customised</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
