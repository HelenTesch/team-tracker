import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BurnupPoint } from '../utils/burnup';

interface Props {
  data: BurnupPoint[];
}

export function BurnupChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title mb-2">Burnup</h3>
        <p className="text-textc-secondary text-sm">Sem dados suficientes para o gráfico.</p>
      </div>
    );
  }
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title">Burnup</h3>
        <span className="text-xs text-textc-secondary">SP concluídos vs. escopo total</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="doneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F8EF7" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#4F8EF7" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="scopeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C9B1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00C9B1" stopOpacity={0.04} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="scope"
            name="Escopo total"
            stroke="#00C9B1"
            fill="url(#scopeGrad)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="done"
            name="Concluído"
            stroke="#4F8EF7"
            fill="url(#doneGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
