import React, { useMemo, useState } from 'react';
import type { JiraTask, StackFilter } from '../types/jira';
import { applyStackFilter } from '../utils/metrics';
import { STACK_COLORS, STACK_LABELS } from '../utils/stackDetection';

interface Props {
  tasks: JiraTask[];
  stackFilter: StackFilter;
}

type SortKey =
  | 'summary'
  | 'type'
  | 'assignee'
  | 'status'
  | 'sprint'
  | 'storyPoints'
  | 'resolved';

export function TaskTable({ tasks, stackFilter }: Props) {
  const [sprintFilter, setSprintFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [stackLocal, setStackLocal] = useState<StackFilter | 'inherit'>('inherit');
  const [sortKey, setSortKey] = useState<SortKey>('resolved');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [collapsed, setCollapsed] = useState(false);

  const effectiveStack = stackLocal === 'inherit' ? stackFilter : stackLocal;

  const sprints = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.sprint).filter(Boolean))).sort(),
    [tasks]
  );
  const statuses = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.status).filter(Boolean))).sort(),
    [tasks]
  );
  const assignees = useMemo(
    () =>
      Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean))).sort() as string[],
    [tasks]
  );

  const filtered = useMemo(() => {
    let out = applyStackFilter(tasks, effectiveStack);
    if (sprintFilter !== 'all') out = out.filter((t) => t.sprint === sprintFilter);
    if (statusFilter !== 'all') out = out.filter((t) => t.status === statusFilter);
    if (assigneeFilter !== 'all') out = out.filter((t) => t.assignee === assigneeFilter);

    out = [...out].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const va = sortKey === 'resolved' ? a.resolved?.getTime() ?? 0 : (a as any)[sortKey] ?? '';
      const vb = sortKey === 'resolved' ? b.resolved?.getTime() ?? 0 : (b as any)[sortKey] ?? '';
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return out;
  }, [tasks, effectiveStack, sprintFilter, statusFilter, assigneeFilter, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(k);
      setSortDir('asc');
    }
  };

  const Th = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th
      onClick={() => toggleSort(k)}
      className="px-3 py-2 text-left text-xs font-semibold text-textc-secondary uppercase tracking-wide cursor-pointer select-none hover:text-textc-primary"
    >
      {children} {sortKey === k && (sortDir === 'asc' ? '▲' : '▼')}
    </th>
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Tabela de tarefas</h3>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="btn-ghost text-sm"
        >
          {collapsed ? 'Expandir' : 'Recolher'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="flex flex-wrap gap-3 mb-4 text-sm">
            <select
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
              className="bg-bg-tertiary border border-borderc rounded-lg px-2 py-1.5"
            >
              <option value="all">Todas as Sprints</option>
              {sprints.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg-tertiary border border-borderc rounded-lg px-2 py-1.5"
            >
              <option value="all">Todos os status</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-bg-tertiary border border-borderc rounded-lg px-2 py-1.5"
            >
              <option value="all">Todos os responsáveis</option>
              {assignees.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={stackLocal}
              onChange={(e) => setStackLocal(e.target.value as any)}
              className="bg-bg-tertiary border border-borderc rounded-lg px-2 py-1.5"
            >
              <option value="inherit">Stack: filtro global</option>
              <option value="all">Stack: todas</option>
              <option value="backend">Stack: Back-end</option>
              <option value="frontend">Stack: Front-end</option>
            </select>
            <span className="text-xs text-textc-secondary self-center ml-auto">
              {filtered.length} de {tasks.length}
            </span>
          </div>

          <div className="overflow-auto max-h-[480px] rounded-lg border border-borderc">
            <table className="w-full text-sm">
              <thead className="bg-bg-tertiary sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-textc-secondary uppercase">
                    Stack
                  </th>
                  <Th k="summary">Resumo</Th>
                  <Th k="type">Tipo</Th>
                  <Th k="assignee">Responsável</Th>
                  <Th k="status">Status</Th>
                  <Th k="sprint">Sprint</Th>
                  <Th k="storyPoints">SP</Th>
                  <Th k="resolved">Resolvido</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-t border-borderc hover:bg-bg-tertiary/40">
                    <td className="px-3 py-2">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase"
                        style={{
                          backgroundColor: STACK_COLORS[t.stack] + '33',
                          color: STACK_COLORS[t.stack],
                        }}
                      >
                        {STACK_LABELS[t.stack]}
                      </span>
                    </td>
                    <td className="px-3 py-2 max-w-[420px] truncate" title={t.summary}>
                      {t.summary}
                    </td>
                    <td className="px-3 py-2">{t.type}</td>
                    <td className="px-3 py-2">{t.assignee || '—'}</td>
                    <td className="px-3 py-2">{t.status}</td>
                    <td className="px-3 py-2">{t.sprint}</td>
                    <td className="px-3 py-2">{t.storyPoints ?? '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {t.resolved ? t.resolved.toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-textc-secondary">
                      Nenhuma tarefa no recorte atual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
