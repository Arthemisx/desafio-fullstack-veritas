# Mini Kanban (React + Go)

Aplicação fullstack com três colunas fixas (A Fazer, Em Progresso, Concluídas), CRUD de tarefas, drag-and-drop entre colunas e persistência opcional em arquivo JSON no backend.

## Requisitos
- `Go 1.22+`
- `Node.js 18+` e `npm`

## Como rodar

### Backend (Go)
- No diretório do projeto:
  - `go mod tidy`
  - `go run ./backend`
- O servidor inicia em `http://localhost:8080`.
- Persistência opcional: tarefas são salvas em `backend/data/tasks.json` e carregadas na inicialização (arquivo é criado automaticamente e está no `.gitignore`).

### Frontend (React + Vite)
- Em outro terminal:
  - `cd frontend`
  - `npm install`
  - `npm run dev`
- Acesse `http://localhost:5173` (ou `5174` se a 5173 estiver ocupada).
- Em desenvolvimento, as chamadas ao backend usam caminho relativo (`/tasks`) e passam por proxy do Vite, evitando problemas de CORS.

## Decisões e tecnicas tomadas


## Limitações conhecidas
- Persistência simples em JSON local (sem banco de dados).
- Sem autenticação.
- UI básica, pensada para MVP.

## Melhorias futuras
- Adicionar banco de dados (PostgreSQL ou SQLite) para persistência robusta.
- Melhorar UX com toasts, animações de transição e feedbacks mais elaborados.
- Adicionar filtros e busca de tarefas.
- Implementar autenticação e multi-usuário.



