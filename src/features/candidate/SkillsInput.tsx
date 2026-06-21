import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
}

/** Tag-style multi-entry input for skills. */
export function SkillsInput({ value, onChange }: SkillsInputProps) {
  const { t } = useTranslation('common');
  const [draft, setDraft] = useState('');

  function add() {
    const skill = draft.trim();
    if (skill && !value.includes(skill)) onChange([...value, skill]);
    setDraft('');
  }

  function remove(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          className="w-full rounded border border-border bg-surface px-3 py-2.5 focus-visible:outline-none focus-visible:ring focus-visible:ring-brand-600"
          aria-label={t('actions.add', { defaultValue: 'Add' })}
        />
        <button
          type="button"
          onClick={add}
          className="rounded border border-brand-700 px-3 font-medium text-brand-700 hover:bg-brand-50"
        >
          +
        </button>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <li
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => remove(skill)}
                aria-label={`${t('actions.remove')} ${skill}`}
                className="font-bold"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
