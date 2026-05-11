import React, { useMemo, useState } from 'react';
import type { DayData } from '../types/jira';
import { intensityClass, intensityLevel } from '../utils/calendar';
import { toISODate } from '../utils/dateParser';

interface Props {
  byDay: Map<string, DayData>;
  onSelectDay: (iso: string) => void;
  selectedDay: string | null;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function ActivityCalendar({ byDay, onSelectDay, selectedDay }: Props) {
  // mês inicial: usar o último dia com atividade, senão hoje
  const initialMonth = useMemo(() => {
    let latest: Date | null = null;
    for (const k of byDay.keys()) {
      const [y, m, d] = k.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      if (!latest || dt.getTime() > latest.getTime()) latest = dt;
    }
    return latest ?? new Date();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [cursor, setCursor] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const startWeekday = monthStart.getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = cursor.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Calendário de atividades</h3>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost px-2 py-1 text-sm"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
          >
            ‹
          </button>
          <span className="text-sm font-medium capitalize min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            className="btn-ghost px-2 py-1 text-sm"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-xs text-textc-secondary mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const iso = toISODate(d);
          const data = byDay.get(iso);
          const completed = data?.completedCount ?? 0;
          const isSelected = iso === selectedDay;
          const isToday = iso === toISODate(new Date());
          return (
            <button
              key={iso}
              onClick={() => onSelectDay(iso)}
              className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs relative transition-all ${intensityClass(
                completed
              )} ${isSelected ? 'ring-2 ring-accent-blue' : ''} ${
                isToday ? 'outline outline-1 outline-accent-teal' : ''
              } hover:scale-[1.04]`}
              title={`${iso} — ${completed} concluídas`}
            >
              <span
                className={`font-medium ${
                  intensityLevel(completed) >= 2 ? 'text-white' : 'text-textc-primary'
                }`}
              >
                {d.getDate()}
              </span>
              {completed > 0 && (
                <span
                  className={`text-[10px] ${
                    intensityLevel(completed) >= 2
                      ? 'text-white/80'
                      : 'text-textc-secondary'
                  }`}
                >
                  {completed}
                </span>
              )}
              {data?.hasDiaryEntry && (
                <span
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-orange"
                  title="Tem entrada no diário"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-4 text-xs text-textc-secondary">
        <span>Menos</span>
        <span className={`w-4 h-4 rounded-sm ${intensityClass(0)}`} />
        <span className={`w-4 h-4 rounded-sm ${intensityClass(1)}`} />
        <span className={`w-4 h-4 rounded-sm ${intensityClass(3)}`} />
        <span className={`w-4 h-4 rounded-sm ${intensityClass(7)}`} />
        <span>Mais</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange inline-block" />
          Diário
        </span>
      </div>
    </div>
  );
}
