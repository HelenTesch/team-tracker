export type Stack = 'backend' | 'frontend' | 'geral';

export interface JiraTask {
  id: string;
  summary: string;
  type: string; // 'História' | 'Subtarefa' | 'Bug' | ...
  status: string;
  statusCategory: string;
  sprint: string;
  storyPoints: number | null;
  assignee: string | null;
  reporter: string;
  created: Date | null;
  resolved: Date | null;
  parentKey: string | null;
  parentSummary: string | null;
  stack: Stack;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  tasksCompleted: JiraTask[];
  tasksCreated: JiraTask[];
  hasDiaryEntry: boolean;
  completedCount: number;
  backendCount: number;
  frontendCount: number;
}

export interface SprintMetrics {
  sprint: string;
  totalSP: number;
  completedSP: number;
  completionRate: number;
  completedStories: number;
  inProgressStories: number;
  pendingStories: number;
  velocity: number;
  backendSP: number;
  frontendSP: number;
  generalSP: number;
  backendCompletedSP: number;
  frontendCompletedSP: number;
  generalCompletedSP: number;
  startDate: Date | null;
  endDate: Date | null;
  days: number;
}

export interface DiaryEntry {
  id: string;
  sprint: string;
  week: string; // ISO date YYYY-MM-DD (segunda-feira da semana)
  wentWell: string;
  toImprove: string;
  general: string;
  createdAt: string;
}

export type StackFilter = 'all' | 'backend' | 'frontend';
