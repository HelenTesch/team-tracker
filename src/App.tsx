import React, { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { CSVUpload } from './components/CSVUpload';
import { SprintSelector } from './components/SprintSelector';
import { StackFilter } from './components/StackFilter';
import { KPICards } from './components/KPICards';
import { BurndownChart } from './components/BurndownChart';
import { BurnupChart } from './components/BurnupChart';
import { ContributionChart } from './components/ContributionChart';
import { StackDistributionChart } from './components/StackDistributionChart';
import { ActivityCalendar } from './components/ActivityCalendar';
import { DayDetailPanel } from './components/DayDetailPanel';
import { WeeklyDiary } from './components/WeeklyDiary';
import { TaskTable } from './components/TaskTable';
import { useJiraData } from './hooks/useJiraData';
import { useDiary } from './hooks/useDiary';
import { computeSprintMetrics } from './utils/metrics';
import { computeBurndown } from './utils/burndown';
import { computeBurnup } from './utils/burnup';
import { aggregateByDay } from './utils/calendar';

type Tab = 'overview' | 'calendar' | 'diary' | 'tasks';

export default function App() {
  const data = useJiraData();
  const diary = useDiary();
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [forceUpload, setForceUpload] = useState(false);

  const metrics = useMemo(
    () => computeSprintMetrics(data.tasks, data.effectiveSprint, data.stackFilter),
    [data.tasks, data.effectiveSprint, data.stackFilter]
  );

  const burndown = useMemo(
    () => computeBurndown(data.tasks, data.effectiveSprint, data.stackFilter),
    [data.tasks, data.effectiveSprint, data.stackFilter]
  );

  const burnup = useMemo(
    () => computeBurnup(data.tasks, data.effectiveSprint, data.stackFilter),
    [data.tasks, data.effectiveSprint, data.stackFilter]
  );

  const byDay = useMemo(
    () =>
      aggregateByDay(
        data.effectiveSprint
          ? data.tasks.filter((t) => t.sprint === data.effectiveSprint)
          : data.tasks,
        data.stackFilter,
        diary.entries
      ),
    [data.tasks, data.effectiveSprint, data.stackFilter, diary.entries]
  );

  useEffect(() => {
    if (data.hasData) setForceUpload(false);
  }, [data.hasData]);

  if (!data.loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-textc-secondary">
        Carregando…
      </div>
    );
  }

  if (!data.hasData || forceUpload) {
    return (
      <div className="min-h-screen">
        <Header
          taskCount={data.tasks.length}
          onReimport={() => setForceUpload(true)}
          onReset={data.reset}
        />
        <CSVUpload onFile={data.importCSV} />
      </div>
    );
  }

  const dayData = selectedDay ? byDay.get(selectedDay) ?? null : null;

  return (
    <div className="min-h-screen">
      <Header
        taskCount={data.tasks.length}
        onReimport={() => setForceUpload(true)}
        onReset={() => {
          if (confirm('Limpar todos os dados carregados?')) {
            data.reset();
            setForceUpload(true);
          }
        }}
      />

      <main className="max-w-[1280px] mx-auto px-6 py-6 space-y-6">
        {/* Controles */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <SprintSelector
            sprints={data.sprints}
            selected={data.selectedSprint}
            view={data.view}
            onSelect={data.setSelectedSprint}
            onView={data.setView}
          />
          <StackFilter value={data.stackFilter} onChange={data.setStackFilter} />
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 border-b border-borderc">
          {[
            { id: 'overview' as Tab, label: 'Visão geral' },
            { id: 'calendar' as Tab, label: 'Calendário' },
            { id: 'diary' as Tab, label: 'Diário' },
            { id: 'tasks' as Tab, label: 'Tarefas' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? 'border-accent-blue text-textc-primary'
                  : 'border-transparent text-textc-secondary hover:text-textc-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <>
            <KPICards metrics={metrics} stackFilter={data.stackFilter} />
            <div className="grid lg:grid-cols-2 gap-4">
              <BurndownChart data={burndown} />
              <BurnupChart data={burnup} />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <ContributionChart
                tasks={data.tasks}
                sprint={data.effectiveSprint}
                filter={data.stackFilter}
              />
              <StackDistributionChart metrics={metrics} />
            </div>
          </>
        )}

        {tab === 'calendar' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ActivityCalendar
                byDay={byDay}
                onSelectDay={setSelectedDay}
                selectedDay={selectedDay}
              />
            </div>
            <div className="space-y-4">
              <KPICards metrics={metrics} stackFilter={data.stackFilter} />
            </div>
          </div>
        )}

        {tab === 'diary' && (
          <WeeklyDiary
            entries={diary.entries}
            sprints={data.sprints}
            defaultSprint={data.effectiveSprint}
            onAdd={diary.add}
            onUpdate={diary.update}
            onRemove={diary.remove}
            onExport={diary.exportText}
          />
        )}

        {tab === 'tasks' && <TaskTable tasks={data.tasks} stackFilter={data.stackFilter} />}
      </main>

      <DayDetailPanel
        iso={selectedDay}
        data={dayData}
        diary={diary.entries}
        onClose={() => setSelectedDay(null)}
        onOpenDiary={() => {
          setSelectedDay(null);
          setTab('diary');
        }}
      />

      <footer className="max-w-[1280px] mx-auto px-6 py-8 text-xs text-textc-secondary">
        Team Evolution Tracker · I-Móveis · roda localmente, dados persistem no navegador.
      </footer>
    </div>
  );
}
