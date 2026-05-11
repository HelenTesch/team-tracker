# Team Evolution Tracker — I-Móveis

Aplicação web standalone para acompanhamento das Sprints do projeto I-Móveis a partir de exports CSV do Jira.

## Funcionalidades

- Upload e parsing local de CSV exportado do Jira (sem backend).
- KPIs por Sprint e visão "Projeto Total".
- Filtro de stack (Todas / Back-end / Front-end) detectado pelo prefixo do título da história.
- Gráficos: Burndown, Burnup, Contribuição por membro, Distribuição por Stack (donut).
- Calendário mensal com intensidade de cor por volume de tarefas concluídas.
- Drill-down ao clicar num dia: tarefas concluídas, criadas e nota do diário da semana.
- Diário Semanal com persistência em `localStorage` e exportação em Markdown.
- Tabela de tarefas com filtros e ordenação.

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- PapaParse

## Como rodar

```bash
cd team-tracker
npm install
npm run dev
```

Acesse `http://localhost:5173`. Na primeira vez, importe o CSV exportado do Jira (`Jira.csv` ou `Jira (1).csv`).

## Build

```bash
npm run build
npm run preview
```

A pasta `dist/` resultante pode ser servida estaticamente em qualquer host.

## Estrutura

```
team-tracker/
├── src/
│   ├── components/   # UI (cards, charts, calendário, diário, tabela)
│   ├── hooks/        # useJiraData, useDiary
│   ├── types/        # tipos da aplicação
│   ├── utils/        # parsing, métricas, burndown, burnup, calendário
│   ├── App.tsx
│   └── main.tsx
└── ...
```

## Persistência

- Tarefas e preferências (filtro de stack, sprint selecionada, modo de visão) ficam em `localStorage`.
- Entradas do diário também ficam em `localStorage`.
- Use o botão "Limpar" no header para zerar tudo.

## Detecção de stack

A stack é detectada pelo prefixo do `Resumo` da história pai:

- `BACK-END:` → backend
- `FRONT-END:` → frontend
- demais casos → geral

Subtarefas herdam a stack pelo `parentSummary` ou `Chave pai`.
