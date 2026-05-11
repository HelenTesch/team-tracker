import React from 'react';

interface Props {
  taskCount: number;
  onReimport: () => void;
  onReset: () => void;
}

export function Header({ taskCount, onReimport, onReset }: Props) {
  return (
    <header className="border-b border-borderc bg-bg-secondary/60 backdrop-blur sticky top-0 z-30">
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-blue to-accent-petrol flex items-center justify-center font-bold text-white">
            i
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Team Evolution Tracker</h1>
            <p className="text-xs text-textc-secondary">I-Móveis · acompanhamento de Sprints</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {taskCount > 0 && (
            <span className="text-xs text-textc-secondary">{taskCount} tarefas carregadas</span>
          )}
          <button onClick={onReimport} className="btn-ghost">
            Atualizar dados
          </button>
          {taskCount > 0 && (
            <button
              onClick={onReset}
              className="btn-ghost text-accent-orange hover:text-accent-orange"
              title="Limpar dados carregados"
            >
              Limpar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
