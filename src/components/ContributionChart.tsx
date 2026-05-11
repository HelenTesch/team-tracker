import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { JiraTask, StackFilter } from '../types/jira';
import { contributionByMember, uniqueSprints } from '../utils/metrics';

interface Props {
  tasks: JiraTask[];
  sprint: string | null; // null = projeto total
  filter: StackFilter;
}

const SPRINT_COLORS = ['#4F8EF7', '#7C5CFC', '#00C9B1', '#FF8C42', '#F7B538', '#E36588', '#8B93B0'];

export function ContributionChart({ tasks, sprint, filter }: Props) {
  const sprints = useMemo(() => uniqueSprints(tasks), [tasks]);
  const data = useMemo(() => {
    const rows = contributionByMember(tasks, sprint, filter);
    return rows.map((r) => ({ member: r.member, total: r.total, ...r.bySprint }));
  }, [tasks, sprint, filter]);

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title mb-2">Contribuição por membro</h3>
        <p className="text-textc-secondary text-sm">Sem subtarefas concluídas no recorte atual.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Contribuição por membro</h3>
        <span className="text-xs text-textc-secondary">subtarefas concluídas</span>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(220, data.length * 38)}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#2E3248" strokeDasharray="3 3" />
          <XAxis type="number" stroke="#8B93B0" fontSize={11} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="member"
            stroke="#8B93B0"
            fontSize={11}
            width={130}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1D27',
              border: '1px solid #2E3248',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {sprint ? (
            <Bar dataKey="total" name="Subtarefas" fill="#4F8EF7" radius={[0, 4, 4, 0]} />
          ) : (
            sprints.map((s, i) => (
              <Bar
                key={s}
                dataKey={s}
                name={s}
                stackId="a"
                fill={SPRINT_COLORS[i % SPRINT_COLORS.length]}
              />
            ))
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
