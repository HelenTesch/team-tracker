import React, { useCallback, useRef, useState } from 'react';

interface Props {
  onFile: (file: File) => Promise<number>;
  variant?: 'full' | 'inline';
}

export function CSVUpload({ onFile, variant = 'full' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!/\.csv$/i.test(file.name)) {
        setError('Por favor, envie um arquivo .csv');
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const count = await onFile(file);
        if (count === 0) setError('Nenhuma tarefa válida encontrada no CSV.');
      } catch (e: any) {
        setError(e?.message ?? 'Falha ao ler CSV.');
      } finally {
        setBusy(false);
      }
    },
    [onFile]
  );

  if (variant === 'inline') {
    return (
      <>
        <button onClick={() => inputRef.current?.click()} className="btn-primary" disabled={busy}>
          {busy ? 'Importando...' : 'Importar CSV'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {error && <p className="text-xs text-accent-orange mt-2">{error}</p>}
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-20 px-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Importe os dados do Jira</h2>
        <p className="text-textc-secondary">
          Faça upload do CSV exportado do Jira para visualizar a evolução da equipe.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`card cursor-pointer text-center py-16 border-2 border-dashed transition-colors ${
          dragOver ? 'border-accent-blue bg-bg-tertiary' : 'border-borderc'
        }`}
      >
        <div className="text-5xl mb-4">📊</div>
        <p className="font-medium mb-1">Arraste o CSV aqui ou clique para selecionar</p>
        <p className="text-xs text-textc-secondary">
          Aceita exports do Jira nos formatos Jira.csv / Jira (1).csv
        </p>
        {busy && <p className="text-xs text-accent-blue mt-4">Processando…</p>}
        {error && <p className="text-xs text-accent-orange mt-4">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
