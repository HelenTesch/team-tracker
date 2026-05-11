import { useCallback, useEffect, useState } from 'react';
import type { DiaryEntry } from '../types/jira';

const KEY = 'tet:diary';

export function useDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setEntries(JSON.parse(raw) as DiaryEntry[]);
    } catch (e) {
      console.warn('Falha ao ler diário:', e);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(entries));
  }, [entries, loaded]);

  const add = useCallback((entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
    const e: DiaryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [e, ...prev]);
    return e;
  }, []);

  const update = useCallback((id: string, patch: Partial<DiaryEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const exportText = useCallback(() => {
    const sorted = [...entries].sort((a, b) =>
      a.createdAt > b.createdAt ? -1 : 1
    );
    const lines: string[] = ['# Diário Semanal — I-Móveis', ''];
    for (const e of sorted) {
      lines.push(`## ${e.sprint} — Semana de ${e.week}`);
      lines.push(`*Registrado em ${new Date(e.createdAt).toLocaleString('pt-BR')}*`);
      lines.push('');
      lines.push('### O que foi bem');
      lines.push(e.wentWell || '_(vazio)_');
      lines.push('');
      lines.push('### O que poderia melhorar');
      lines.push(e.toImprove || '_(vazio)_');
      lines.push('');
      lines.push('### Observações gerais');
      lines.push(e.general || '_(vazio)_');
      lines.push('');
      lines.push('---');
      lines.push('');
    }
    return lines.join('\n');
  }, [entries]);

  return { entries, add, update, remove, exportText };
}
