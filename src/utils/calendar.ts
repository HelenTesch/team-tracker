import type { DayData, DiaryEntry, JiraTask, StackFilter } from '../types/jira';
import { applyStackFilter, isCompleted } from './metrics';
import { startOfWeekMonday, toISODate } from './dateParser';

export function aggregateByDay(
  tasks: JiraTask[],
  filter: StackFilter,
  diary: DiaryEntry[]
): Map<string, DayData> {
  const map = new Map<string, DayData>();
  const filtered = applyStackFilter(tasks, filter);

  const ensure = (iso: string): DayData => {
    let d = map.get(iso);
    if (!d) {
      d = {
        date: iso,
        tasksCompleted: [],
        tasksCreated: [],
        hasDiaryEntry: false,
        completedCount: 0,
        backendCount: 0,
        frontendCount: 0,
      };
      map.set(iso, d);
    }
    return d;
  };

  for (const t of filtered) {
    if (t.created) {
      const iso = toISODate(t.created);
      ensure(iso).tasksCreated.push(t);
    }
    if (t.resolved && isCompleted(t)) {
      const iso = toISODate(t.resolved);
      const d = ensure(iso);
      d.tasksCompleted.push(t);
      d.completedCount += 1;
      if (t.stack === 'backend') d.backendCount += 1;
      if (t.stack === 'frontend') d.frontendCount += 1;
    }
  }

  // marcar dias com diário (semana inteira → marca todos os dias da semana)
  for (const entry of diary) {
    if (!entry.week) continue;
    const [y, m, d] = entry.week.split('-').map(Number);
    if (!y || !m || !d) continue;
    const monday = startOfWeekMonday(new Date(y, m - 1, d));
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      ensure(toISODate(day)).hasDiaryEntry = true;
    }
  }

  return map;
}

export function intensityClass(count: number): string {
  if (count === 0) return 'bg-bg-tertiary/40';
  if (count <= 2) return 'bg-accent-blue/25';
  if (count <= 5) return 'bg-accent-blue/55';
  return 'bg-accent-blue';
}

export function intensityLevel(count: number): 0 | 1 | 2 | 3 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}
