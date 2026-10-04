import { RotateCcw } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { getSelectedOptionId, isCustomized } from '../../shared/preferenceUtils';
import type { CategoryConfig, PreferenceMap } from '../../shared/types';

interface CategoryRowProps {
  category: CategoryConfig;
  preferences: PreferenceMap;
  /** The page open in the active tab. */
  isCurrent: boolean;
  onSelect: (category: CategoryConfig, optionId: string) => void;
}

export function CategoryRow({ category, preferences, isCurrent, onSelect }: CategoryRowProps) {
  const selectedOptionId = getSelectedOptionId(category, preferences);
  const customized = isCustomized(category, preferences);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = optionRefs.current.indexOf(event.target as HTMLButtonElement);
    if (index === -1) return;
    const last = category.options.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;

    event.preventDefault();
    if (event.repeat) return;
    optionRefs.current[next]?.focus();
    if (next !== index) onSelect(category, category.options[next].id);
  };

  return (
    <div className={`category-row${isCurrent ? ' category-row--current' : ''}`} aria-current={isCurrent ? 'page' : undefined}>
      <div className="category-row__label">
        <span>
          {category.name}
          {customized && <span className="visually-hidden"> (customised)</span>}
          {isCurrent && <span className="visually-hidden"> (current page)</span>}
        </span>
      </div>

      <div className="segmented" role="radiogroup" aria-label={`Default tab for ${category.name}`} onKeyDown={onKeyDown}>
        {category.options.map((option, index) => {
          const selected = option.id === selectedOptionId;
          const isSiteDefault = index === 0;
          return (
            <button
              key={option.id}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              className={`segment${isSiteDefault ? ' segment--default' : ''}${selected ? ' segment--selected' : ''}`}
              onClick={() => !selected && onSelect(category, option.id)}
            >
              {isSiteDefault && customized && <RotateCcw size={11} strokeWidth={2.25} aria-hidden="true" />}
              <span className="segment__label" data-label={option.label}>
                {option.label}
              </span>
              {isSiteDefault && <span className="visually-hidden"> (portal default)</span>}
              {isSiteDefault && (
                <span className="segment__tip" aria-hidden="true">
                  {customized ? 'Portal default. Select to reset' : 'Portal default'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
