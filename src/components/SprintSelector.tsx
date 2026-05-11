import React from 'react';
import type { ViewMode } from '../hooks/useJiraData';

interface Props {
  sprints: string[];
  selected: string | null;
  view: ViewMode;
  onSelect: (s: string) => void;
  onView: (v: ViewMode) => void;
}

export function SprintSelector({ sprints, selected, view, onSelect, onView }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex bg-bg-tertiary rounded-lg p-1">
        <button
          className={view === 'sprint' ? 'btn-toggle-on' : 'btn-toggle-off'}
          onClick={() => onView('sprint')}
        >
          Por Sprint
        </button>
        <button
          className={view === 'total' ? 'btn-toggle-on' : 'btn-toggle-off'}
          onClick={() => onView('total')}
        >
          Projeto Total
        </button>
      </div>

      {view === 'sprint' && (
        <div className="flex flex-wrap gap-2">
          {sprints.map((s) => (
            <button
              key={s}
              onClick={() => onSelect(s)}
              className={selected === s ? 'btn-toggle-on' : 'btn-toggle-off'}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
