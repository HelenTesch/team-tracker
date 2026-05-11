import type { JiraTask, SprintMetrics, StackFilter } from '../types/jira';

export function isCompleted(task: JiraTask): boolean {
  return task.statusCategory === 'Itens concluídos' || task.status === 'Concluído';
}

export function isStory(task: JiraTask): boolean {
  return task.type === 'História';
}

export function isSubtask(task: JiraTask): boolean {
  return task.type === 'Subtarefa';
}

export function applyStackFilter(tasks: JiraTask[], filter: StackFilter): JiraTask[] {
  if (filter === 'all') return tasks;
  return tasks.filter((t) => t.stack === filter);
}

export function uniqueSprints(tasks: JiraTask[]): string[] {
  const set = new Set<string>();
  for (const t of tasks) if (t.sprint) set.add(t.sprint);
  return Array.from(set).sort((a, b) => {
    const na = parseInt(a.match(/\d+/)?.[0] ?? '0', 10);
    const nb = parseInt(b.match(/\d+/)?.[0] ?? '0', 10);
    return na - nb;
  });
}

export function computeSprintMetrics(
  allTasks: JiraTask[],
  sprint: string | null,
  filter: StackFilter
): SprintMetrics {
  const filtered = applyStackFilter(
    sprint ? allTasks.filter((t) => t.sprint === sprint) : allTasks,
    filter
  );

  const stories = filtered.filter(isStory);
  const completedStoriesArr = stories.filter(isCompleted);

  const totalSP = stories.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  const completedSP = completedStoriesArr.reduce((s, t) => s + (t.storyPoints ?? 0), 0);

  const inProgressStories = stories.filter((t) => /revis/i.test(t.status)).length;
  const pendingStories = stories.filter((t) => /pendent/i.test(t.status)).length;

  const dates = filtered
    .map((t) => t.created)
    .filter((d): d is Date => d instanceof Date);
  const resolvedDates = filtered
    .map((t) => t.resolved)
    .filter((d): d is Date => d instanceof Date);

  const startDate =
    dates.length > 0
      ? new Date(Math.min(...dates.map((d) => d.getTime())))
      : null;
  const endDate =
    resolvedDates.length > 0
      ? new Date(Math.max(...resolvedDates.map((d) => d.getTime())))
      : null;

  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1
        )
      : 1;

  // Para o breakdown por stack, usamos sempre os totais (sem filtro).
  const baseStories = (sprint ? allTasks.filter((t) => t.sprint === sprint) : allTasks).filter(
    isStory
  );

  const sumByStack = (s: 'backend' | 'frontend' | 'geral', onlyCompleted = false) =>
    baseStories
      .filter((t) => t.stack === s && (!onlyCompleted || isCompleted(t)))
      .reduce((acc, t) => acc + (t.storyPoints ?? 0), 0);

  return {
    sprint: sprint ?? 'Projeto Total',
    totalSP,
    completedSP,
    completionRate: totalSP > 0 ? (completedSP / totalSP) * 100 : 0,
    completedStories: completedStoriesArr.length,
    inProgressStories,
    pendingStories,
    velocity: days > 0 ? completedSP / days : 0,
    backendSP: sumByStack('backend'),
    frontendSP: sumByStack('frontend'),
    generalSP: sumByStack('geral'),
    backendCompletedSP: sumByStack('backend', true),
    frontendCompletedSP: sumByStack('frontend', true),
    generalCompletedSP: sumByStack('geral', true),
    startDate,
    endDate,
    days,
  };
}

export function contributionBySprint(
  tasks: JiraTask[],
  filter: StackFilter
): { sprint: string; data: Record<string, number> }[] {
  const sprints = uniqueSprints(tasks);
  return sprints.map((sprint) => {
    const subs = applyStackFilter(
      tasks.filter((t) => t.sprint === sprint && isSubtask(t) && isCompleted(t)),
      filter
    );
    const data: Record<string, number> = {};
    for (const t of subs) {
      const k = t.assignee || 'Sem responsável';
      data[k] = (data[k] || 0) + 1;
    }
    return { sprint, data };
  });
}

export function contributionByMember(
  tasks: JiraTask[],
  sprint: string | null,
  filter: StackFilter
): { member: string; total: number; bySprint: Record<string, number> }[] {
  const sprints = uniqueSprints(tasks);
  const targetSprints = sprint ? [sprint] : sprints;
  const map = new Map<string, { total: number; bySprint: Record<string, number> }>();

  for (const sp of targetSprints) {
    const subs = applyStackFilter(
      tasks.filter((t) => t.sprint === sp && isSubtask(t) && isCompleted(t)),
      filter
    );
    for (const t of subs) {
      const k = t.assignee || 'Sem responsável';
      if (!map.has(k)) map.set(k, { total: 0, bySprint: {} });
      const entry = map.get(k)!;
      entry.total += 1;
      entry.bySprint[sp] = (entry.bySprint[sp] || 0) + 1;
    }
  }

  return Array.from(map.entries())
    .map(([member, v]) => ({ member, total: v.total, bySprint: v.bySprint }))
    .sort((a, b) => b.total - a.total);
}
