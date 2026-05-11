import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JiraTask, StackFilter } from '../types/jira';
import { parseCSVText } from '../utils/csvParser';
import { uniqueSprints } from '../utils/metrics';

const STORAGE_KEY = 'tet:jiraTasks';
const FILTER_KEY = 'tet:stackFilter';
const SPRINT_KEY = 'tet:selectedSprint';
const VIEW_KEY = 'tet:view';

export type ViewMode = 'sprint' | 'total';

interface SerializedTask extends Omit<JiraTask, 'created' | 'resolved'> {
  created: string | null;
  resolved: string | null;
}

function serialize(tasks: JiraTask[]): SerializedTask[] {
  return tasks.map((t) => ({
    ...t,
    created: t.created ? t.created.toISOString() : null,
    resolved: t.resolved ? t.resolved.toISOString() : null,
  }));
}

function deserialize(raw: SerializedTask[]): JiraTask[] {
  return raw.map((t) => ({
    ...t,
    created: t.created ? new Date(t.created) : null,
    resolved: t.resolved ? new Date(t.resolved) : null,
  }));
}

export function useJiraData() {
  const [tasks, setTasks] = useState<JiraTask[]>([]);
  const [stackFilter, setStackFilter] = useState<StackFilter>('all');
  const [view, setView] = useState<ViewMode>('sprint');
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // hidratação
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SerializedTask[];
        setTasks(deserialize(parsed));
      }
      const f = localStorage.getItem(FILTER_KEY) as StackFilter | null;
      if (f === 'all' || f === 'backend' || f === 'frontend') setStackFilter(f);
      const v = localStorage.getItem(VIEW_KEY) as ViewMode | null;
      if (v === 'sprint' || v === 'total') setView(v);
      const sp = localStorage.getItem(SPRINT_KEY);
      if (sp) setSelectedSprint(sp);
    } catch (e) {
      console.warn('Falha ao carregar dados do localStorage:', e);
    }
    setLoaded(true);
  }, []);

  // persistência
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(tasks)));
    } catch (e) {
      console.warn('localStorage cheio?', e);
    }
  }, [tasks, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(FILTER_KEY, stackFilter);
  }, [stackFilter, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(VIEW_KEY, view);
  }, [view, loaded]);

  useEffect(() => {
    if (!loaded) return;
    if (selectedSprint) localStorage.setItem(SPRINT_KEY, selectedSprint);
    else localStorage.removeItem(SPRINT_KEY);
  }, [selectedSprint, loaded]);

  const sprints = useMemo(() => uniqueSprints(tasks), [tasks]);

  // garantir sprint selecionada válida
  useEffect(() => {
    if (sprints.length === 0) return;
    if (!selectedSprint || !sprints.includes(selectedSprint)) {
      setSelectedSprint(sprints[sprints.length - 1]);
    }
  }, [sprints, selectedSprint]);

  const importCSV = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = parseCSVText(text);
    setTasks(parsed);
    return parsed.length;
  }, []);

  const importCSVText = useCallback((text: string) => {
    const parsed = parseCSVText(text);
    setTasks(parsed);
    return parsed.length;
  }, []);

  const reset = useCallback(() => {
    setTasks([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const effectiveSprint = view === 'total' ? null : selectedSprint;

  return {
    tasks,
    sprints,
    stackFilter,
    setStackFilter,
    view,
    setView,
    selectedSprint,
    setSelectedSprint,
    effectiveSprint,
    importCSV,
    importCSVText,
    reset,
    loaded,
    hasData: tasks.length > 0,
  };
}
