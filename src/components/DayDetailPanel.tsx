import React from 'react';
import type { DayData, DiaryEntry, JiraTask } from '../types/jira';
import { STACK_COLORS, STACK_LABELS } from '../utils/stackDetection';
import { formatPtBR, fromISODate, startOfWeekMonday, toISODate } from '../utils/dateParser';

interface Props {
  iso: string | null;
  data: DayData | null;
  diary: DiaryEntry[];
  onClose: () => void;
  onOpenDiary: () => void;
}

function StackTag({ stack }: { stack: JiraTask['stack'] }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: STACK_COLORS[stack] + '33', color: STACK_COLORS[stack] }}
    >
      {STACK_LABELS[stack]}
    </span>
  );
}

function TaskRow({ task }: { task: JiraTask }) {
  return (
    <li className="bg-bg-tertiary rounded-lg p-3 flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <StackTag stack={task.stack} />
        <span className="text-sm font-medium flex-1">{task.summary}</span>
      </div>
      <div className="text-xs text-textc-secondary flex flex-wrap gap-x-3 gap-y-0.5">
        {task.parentSummary && <span>↳ {task.parentSummary}</span>}
        {task.assignee && <span>👤 {task.assignee}</span>}
        <span>· {task.status}</span>
        {task.sprint && <span>· {task.sprint}</span>}
      </div>
    </li>
  );
}

export function DayDetailPanel({ iso, data, diary, onClose, onOpenDiary }: Props) {
  if (!iso) return null;
  const date = fromISODate(iso);
  const monday = startOfWeekMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekIso = toISODate(monday);

  const weekDiary = diary.find((e) => {
    if (!e.week) return false;
    const ed = fromISODate(e.week);
    const m = toISODate(startOfWeekMonday(ed));
    return m === weekIso;
  });

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-bg-secondary border-l border-borderc z-50 overflow-y-auto">
        <div className="sticky top-0 bg-bg-secondary border-b border-borderc px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold capitalize">{formatPtBR(date)}</h3>
            <p className="text-xs text-textc-secondary">
              Semana de {monday.toLocaleDateString('pt-BR')} a{' '}
              {sunday.toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost px-2 py-1" aria-label="Fechar">
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Tarefas concluídas</h4>
              <span className="text-xs text-textc-secondary">
                {data?.tasksCompleted.length ?? 0} item(ns)
              </span>
            </div>
            {data && data.tasksCompleted.length > 0 ? (
              <ul className="space-y-2">
                {data.tasksCompleted.map((t) => (
                  <TaskRow key={t.id + 'c'} task={t} />
                ))}
              </ul>
            ) : (
              <p className="text-xs text-textc-secondary">Nenhuma tarefa concluída neste dia.</p>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Tarefas criadas</h4>
              <span className="text-xs text-textc-secondary">
                {data?.tasksCreated.length ?? 0} item(ns)
              </span>
            </div>
            {data && data.tasksCreated.length > 0 ? (
              <ul className="space-y-2">
                {data.tasksCreated.map((t) => (
                  <TaskRow key={t.id + 'cr'} task={t} />
                ))}
              </ul>
            ) : (
              <p className="text-xs text-textc-secondary">Nenhuma tarefa criada neste dia.</p>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Nota do diário</h4>
              <button onClick={onOpenDiary} className="text-xs text-accent-blue hover:underline">
                Abrir diário →
              </button>
            </div>
            {weekDiary ? (
              <div className="bg-bg-tertiary rounded-lg p-3 space-y-2 text-sm">
                <p>
                  <span className="text-xs text-textc-secondary uppercase">O que foi bem: </span>
                  {weekDiary.wentWell || <em className="text-textc-secondary">vazio</em>}
                </p>
                <p>
                  <span className="text-xs text-textc-secondary uppercase">A melhorar: </span>
                  {weekDiary.toImprove || <em className="text-textc-secondary">vazio</em>}
                </p>
                {weekDiary.general && (
                  <p>
                    <span className="text-xs text-textc-secondary uppercase">Geral: </span>
                    {weekDiary.general}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-textc-secondary">
                Nenhuma entrada para esta semana.
              </p>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}
