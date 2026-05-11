import React from 'react';
import type { StackFilter as StackFilterT } from '../types/jira';

interface Props {
  value: StackFilterT;
  onChange: (v: StackFilterT) => void;
}

export function StackFilter({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs text-textc-secondary uppercase tracking-wide">Stack</span>
      <div className="inline-flex bg-bg-tertiary rounded-lg p-1">
        <button
          onClick={() => onChange('all')}
          className={value === 'all' ? 'btn-toggle-on' : 'btn-toggle-off'}
        >
          Todas
        </button>
        <button
          onClick={() => onChange('backend')}
          className={value === 'backend' ? 'btn-toggle-on' : 'btn-toggle-off'}
          style={value === 'backend' ? { backgroundColor: '#7C5CFC' } : undefined}
        >
          Back-end
        </button>
        <button
          onClick={() => onChange('frontend')}
          className={value === 'frontend' ? 'btn-toggle-on' : 'btn-toggle-off'}
          style={value === 'frontend' ? { backgroundColor: '#4F8EF7' } : undefined}
        >
          Front-end
        </button>
      </div>
    </div>
  );
}
