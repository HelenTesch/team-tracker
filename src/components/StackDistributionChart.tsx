import React from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { SprintMetrics } from '../types/jira';

interface Props {
  metrics: SprintMetrics;
}

export function StackDistributionChart({ metrics }: Props) {
  const data = [
    { name: 'Back-end', value: metrics.backendSP, color: '#7C5CFC', completed: metrics.backendCompletedSP },
    { name: 'Front-end', value: metrics.frontendSP, color: '#4F8EF7', completed: metrics.frontendCompletedSP },
    { name: 'Geral', value: metrics.generalSP, color: '#8B93B0', completed: metrics.generalCompletedSP },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="card">
        <h3 className="section-title mb-2">Distribuição por Stack</h3>
        <p className="text-textc-secondary text-sm">Sem story points para exibir.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Distribuição por Stack</h3>
        <span className="text-xs text-textc-secondary">Story points planejados</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4 items-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="#0F1117" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1D27',
                border: '1px solid #2E3248',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="space-y-2 text-sm">
          {data.map((d) => {
            const pct = d.value > 0 ? (d.completed / d.value) * 100 : 0;
            return (
              <li key={d.name} className="bg-bg-tertiary rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm inline-block"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="font-medium">{d.name}</span>
                  </span>
                  <span className="text-xs text-textc-secondary">
                    {d.completed} / {d.value} SP
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-borderc overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: d.color,
                      width: `${Math.min(100, pct)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-textc-secondary mt-1 inline-block">
                  {pct.toFixed(0)}% concluído
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
