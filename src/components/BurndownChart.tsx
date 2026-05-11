import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BurndownPoint } from '../utils/burndown';

interface Props {
  data: BurndownPoint[];
}

export function BurndownChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title mb-2">Burndown</h3>
        <p className="text-textc-secondary text-sm">Sem dados suficientes para o gráfico.</p>
      </div>
    );
  }
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Burndown</h3>
        <span className="text-xs text-textc-secondary">SP restantes ao longo do tempo</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#2E3248" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#8B93B0" fontSize={11} tickMargin={8} />
          <YAxis stroke="#8B93B0" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1D27',
              border: '1px solid #2E3248',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#F0F2F8' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="ideal"
            name="Ideal"
            stroke="#00C9B1"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="real"
            name="Real"
            stroke="#4F8EF7"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
