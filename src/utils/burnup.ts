import type { JiraTask, StackFilter } from '../types/jira';
import { applyStackFilter, isCompleted, isStory } from './metrics';
import { dateRange, toISODate } from './dateParser';

export interface BurnupPoint {
  date: string;
  label: string;
  scope: number;
  done: number;
}

export function computeBurnup(
  allTasks: JiraTask[],
  sprint: string | null,
  filter: StackFilter
): BurnupPoint[] {
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

  return days.map((d) => {
    const iso = toISODate(d);
    let scopeSP = 0;
    let doneSP = 0;
    for (const t of stories) {
      const sp = t.storyPoints ?? 0;
      if (t.created && toISODate(t.created) <= iso) scopeSP += sp;
      if (t.resolved && toISODate(t.resolved) <= iso && isCompleted(t)) doneSP += sp;
    }
    return {
      date: iso,
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      scope: scopeSP,
      done: doneSP,
    };
  });
}
