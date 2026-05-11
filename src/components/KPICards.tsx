import React from 'react';
import type { SprintMetrics, StackFilter } from '../types/jira';

interface Props {
  metrics: SprintMetrics;
  stackFilter: StackFilter;
}

function Card({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
      {hint && <span className="text-xs text-textc-secondary">{hint}</span>}
    </div>
  );
}

export function KPICards({ metrics, stackFilter }: Props) {
  const fmt = (n: number) => Number.isFinite(n) ? n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <Card
        label="Story points planejados"
        value={fmt(metrics.totalSP)}
        hint={`${metrics.completedStories + metrics.inProgressStories + metrics.pendingStories} histórias`}
      />
      <Card
        label="Story points concluídos"
        value={fmt(metrics.completedSP)}
        accent="#00C9B1"
      />
      <Card
        label="% de conclusão"
        value={`${fmt(metrics.completionRate)}%`}
      />
      <Card label="Velocidade (SP/dia)" value={fmt(metrics.velocity)} hint={`${metrics.days} dias`} />
      <Card label="Histórias concluídas" value={metrics.completedStories} />
      <Card label="Em revisão" value={metrics.inProgressStories} accent="#FF8C42" />
      <Card label="Pendentes" value={metrics.pendingStories} />
      {stackFilter === 'all' && (
        <Card
          label="Backend / Frontend"
          value={
            <span className="text-base font-semibold">
              <span style={{ color: '#7C5CFC' }}>{fmt(metrics.backendCompletedSP)}</span>
              <span className="text-textc-secondary">/{fmt(metrics.backendSP)}</span>
              <span className="text-textc-secondary mx-2">·</span>
              <span style={{ color: '#4F8EF7' }}>{fmt(metrics.frontendCompletedSP)}</span>
              <span className="text-textc-secondary">/{fmt(metrics.frontendSP)}</span>
            </span>
          }
          hint="SP concluídos / total"
        />
      )}
    </div>
  );
}
