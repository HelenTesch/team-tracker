import React, { useState } from 'react';
import type { DiaryEntry } from '../types/jira';
import { startOfWeekMonday, toISODate } from '../utils/dateParser';

interface Props {
  entries: DiaryEntry[];
  sprints: string[];
  defaultSprint: string | null;
  onAdd: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, patch: Partial<DiaryEntry>) => void;
  onRemove: (id: string) => void;
  onExport: () => string;
}

function todayWeekISO() {
  return toISODate(startOfWeekMonday(new Date()));
}

export function WeeklyDiary({
  entries,
  sprints,
  defaultSprint,
  onAdd,
  onUpdate,
  onRemove,
  onExport,
}: Props) {
  const [sprint, setSprint] = useState(defaultSprint ?? sprints[0] ?? '');
  const [week, setWeek] = useState(todayWeekISO());
  const [wentWell, setWentWell] = useState('');
  const [toImprove, setToImprove] = useState('');
  const [general, setGeneral] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (e: DiaryEntry) => {
    setEditingId(e.id);
    setSprint(e.sprint);
    setWeek(e.week);
    setWentWell(e.wentWell);
    setToImprove(e.toImprove);
    setGeneral(e.general);
  };

  const reset = () => {
    setEditingId(null);
    setWentWell('');
    setToImprove('');
    setGeneral('');
    setWeek(todayWeekISO());
    setSprint(defaultSprint ?? sprints[0] ?? '');
  };

  const submit = () => {
    if (!sprint) return;
    if (editingId) {
      onUpdate(editingId, { sprint, week, wentWell, toImprove, general });
    } else {
      onAdd({ sprint, week, wentWell, toImprove, general });
    }
    reset();
  };

  const downloadDiary = () => {
    const text = onExport();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diario-i-moveis-${toISODate(new Date())}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Diário semanal</h3>
            <p className="text-xs text-textc-secondary">
              Registre observações qualitativas da semana.
            </p>
          </div>
          <button onClick={downloadDiary} className="btn-ghost text-sm">
            Exportar diário
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-textc-secondary uppercase">Sprint</span>
            <select
              value={sprint}
              onChange={(e) => setSprint(e.target.value)}
              className="bg-bg-tertiary border border-borderc rounded-lg px-3 py-2 text-sm"
            >
              {sprints.length === 0 && <option value="">—</option>}
              {sprints.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-textc-secondary uppercase">Semana (segunda-feira)</span>
            <input
              type="date"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="bg-bg-tertiary border border-borderc rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs text-textc-secondary uppercase">O que foi bem</span>
            <textarea
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              rows={2}
              className="bg-bg-tertiary border border-borderc rounded-lg px-3 py-2 text-sm resize-y"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs text-textc-secondary uppercase">O que poderia melhorar</span>
            <textarea
              value={toImprove}
              onChange={(e) => setToImprove(e.target.value)}
              rows={2}
              className="bg-bg-tertiary border border-borderc rounded-lg px-3 py-2 text-sm resize-y"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs text-textc-secondary uppercase">Observações gerais</span>
            <textarea
              value={general}
              onChange={(e) => setGeneral(e.target.value)}
              rows={2}
              className="bg-bg-tertiary border border-borderc rounded-lg px-3 py-2 text-sm resize-y"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button onClick={submit} className="btn-primary">
            {editingId ? 'Salvar alterações' : 'Adicionar entrada'}
          </button>
          {editingId && (
            <button onClick={reset} className="btn-ghost">
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-textc-secondary uppercase tracking-wide">
          Histórico ({entries.length})
        </h4>
        {entries.length === 0 && (
          <p className="text-sm text-textc-secondary">
            Nenhuma entrada ainda. Use o formulário acima para registrar a primeira.
          </p>
        )}
        {entries.map((e) => (
          <article key={e.id} className="card">
            <header className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-semibold">{e.sprint}</span>
                <span className="text-xs text-textc-secondary ml-2">
                  Semana de {new Date(e.week).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(e)}
                  className="text-xs text-accent-blue hover:underline"
                >
                  editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('Remover esta entrada?')) onRemove(e.id);
                  }}
                  className="text-xs text-accent-orange hover:underline ml-2"
                >
                  remover
                </button>
              </div>
            </header>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-textc-secondary uppercase">Foi bem</span>
                <p className="mt-1">{e.wentWell || <em className="text-textc-secondary">vazio</em>}</p>
              </div>
              <div>
                <span className="text-xs text-textc-secondary uppercase">A melhorar</span>
                <p className="mt-1">{e.toImprove || <em className="text-textc-secondary">vazio</em>}</p>
              </div>
              <div>
                <span className="text-xs text-textc-secondary uppercase">Geral</span>
                <p className="mt-1">{e.general || <em className="text-textc-secondary">vazio</em>}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
