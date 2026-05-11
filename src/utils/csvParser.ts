import Papa from 'papaparse';
import type { JiraTask, Stack } from '../types/jira';
import { detectStack } from './stackDetection';
import { parseJiraDate } from './dateParser';

interface RawRow {
  [key: string]: string;
}

function pickFirst(row: RawRow, names: string[]): string {
  for (const n of names) {
    const v = row[n];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

function getAllColumnsByName(row: RawRow, name: string): string[] {
  // Em CSVs do Jira, a coluna "Sprint" pode aparecer múltiplas vezes (PapaParse usa _1, _2, ...).
  const out: string[] = [];
  for (const key of Object.keys(row)) {
    if (key === name || key.startsWith(`${name}_`)) {
      const v = row[key];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        out.push(String(v).trim());
      }
    }
  }
  return out;
}

export function parseCSVText(text: string): JiraTask[] {
  const result = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    dynamicTyping: false,
  });

  const rows = result.data || [];
  const tasks: JiraTask[] = [];

  // Primeiro passo: extrair tarefas brutas
  const rawTasks = rows.map((row) => {
    const summary = pickFirst(row, ['Resumo']);
    const id = pickFirst(row, ['Chave da item', 'Chave do item', 'ID da item']);
    const type = pickFirst(row, ['Tipo de item']);
    const status = pickFirst(row, ['Status']);
    const statusCategory = pickFirst(row, ['Categoria do status']);
    const sprintCols = getAllColumnsByName(row, 'Sprint');
    const sprint = sprintCols[0] || '';
    const spRaw = pickFirst(row, [
      'Campo personalizado (Story Points)',
      'Campo personalizado (Story point estimate)',
    ]);
    const sp = spRaw ? Number(spRaw.replace(',', '.')) : NaN;
    const assignee = pickFirst(row, ['Responsável']) || null;
    const reporter = pickFirst(row, ['Relator']);
    const created = parseJiraDate(pickFirst(row, ['Criado']));
    const resolved = parseJiraDate(pickFirst(row, ['Resolvido']));
    const parentKey = pickFirst(row, ['Chave pai']) || null;
    const parentSummary = pickFirst(row, ['Parent summary']) || null;

    return {
      id: id || `${summary}-${created?.getTime() ?? Math.random()}`,
      summary,
      type,
      status,
      statusCategory,
      sprint,
      storyPoints: isFinite(sp) ? sp : null,
      assignee,
      reporter,
      created,
      resolved,
      parentKey,
      parentSummary,
    };
  });

  // Segundo passo: mapear chave → resumo de história para herança de stack pelas subtarefas
  const summaryByKey = new Map<string, string>();
  for (const t of rawTasks) {
    if (t.id) summaryByKey.set(t.id, t.summary);
  }

  for (const t of rawTasks) {
    let stack: Stack = detectStack(t.summary);
    if (stack === 'geral') {
      // Tenta usar parentSummary do CSV
      if (t.parentSummary) {
        stack = detectStack(t.parentSummary);
      }
      // Fallback: lookup pela chave pai
      if (stack === 'geral' && t.parentKey) {
        const ps = summaryByKey.get(t.parentKey);
        if (ps) stack = detectStack(ps);
      }
    }

    tasks.push({
      id: t.id,
      summary: t.summary,
      type: t.type,
      status: t.status,
      statusCategory: t.statusCategory,
      sprint: t.sprint,
      storyPoints: t.storyPoints,
      assignee: t.assignee,
      reporter: t.reporter,
      created: t.created,
      resolved: t.resolved,
      parentKey: t.parentKey,
      parentSummary: t.parentSummary,
      stack,
    });
  }

  return tasks.filter((t) => t.summary);
}
