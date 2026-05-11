import type { JiraTask, StackFilter } from '../types/jira';
import { applyStackFilter, isCompleted, isStory } from './metrics';
import { dateRange, toISODate } from './dateParser';

export interface BurndownPoint {
  date: string; // ISO
  label: string;
  ideal: number;
  real: number;
}

export function computeBurndown(
  allTasks: JiraTask[],
  sprint: string | null,
  filter: StackFilter
): BurndownPoint[] {
  const scope = sprint ? allTasks.filter((t) => t.sprint === sprint) : allTasks;
  const stories = applyStackFilter(scope.filter(isStory), filter);

  if (stories.length === 0) return [];

  const createdDates = stories
    .map((t) => t.created)
    .filter((d): d is Date => d instanceof Date);
  const resolvedDates = stories
    .map((t) => t.resolved)
    .filter((d): d is Date => d instanceof Date);

  if (createdDates.length === 0) return [];

  const start = new Date(Math.min(...createdDates.map((d) => d.getTime())));
  const lastResolved =
    resolvedDates.length > 0
      ? new Date(Math.max(...resolvedDates.map((d) => d.getTime())))
      : null;
  const today = new Date();
  const end =
    lastResolved && lastResolved.getTime() > today.getTime() ? lastResolved : today;
  const finalEnd =
    lastResolved && lastResolved.getTime() > end.getTime() ? lastResolved : end;

  const days = dateRange(start, finalEnd);
  const totalSP = stories.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
  if (days.length === 0) return [];

  const idealStep = totalSP / Math.max(1, days.length - 1);

  return days.map((d, i) => {
    const iso = toISODate(d);
    const remaining = stories.reduce((sum, t) => {
      const sp = t.storyPoints ?? 0;
      // Já resolvida até este dia (inclusive)?
      if (
        t.resolved &&
        toISODate(t.resolved) <= iso &&
        isCompleted(t)
      ) {
        return sum;
      }
      // Já foi criada até este dia? Se ainda não foi criada, não está "no escopo" deste dia.
      if (t.created && toISODate(t.created) > iso) return sum;
      return sum + sp;
    }, 0);

    return {
      date: iso,
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      ideal: Math.max(0, totalSP - idealStep * i),
      real: remaining,
    };
  });
}
