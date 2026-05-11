import type { Stack } from '../types/jira';

export function detectStack(summary: string | null | undefined): Stack {
  if (!summary) return 'geral';
  const upper = summary.toUpperCase().trim();
  if (upper.startsWith('BACK-END:') || upper.startsWith('BACK END:')) return 'backend';
  if (upper.startsWith('FRONT-END:') || upper.startsWith('FRONT END:')) return 'frontend';
  return 'geral';
}

export const STACK_COLORS: Record<Stack, string> = {
  backend: '#7C5CFC',
  frontend: '#4F8EF7',
  geral: '#8B93B0',
};

export const STACK_LABELS: Record<Stack, string> = {
  backend: 'Back-end',
  frontend: 'Front-end',
  geral: 'Geral',
};
