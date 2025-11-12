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
- Arquitetura fullstack simples: backend em Go e frontend em React com Vite, focada em rapidez de desenvolvimento e baixa complexidade.
- Fluxo de usuário documentado em docs/user-flow.png para alinhar expectativas de uso do mini-kanban.

Backend
- Framework: net/http com github.com/gorilla/mux para roteamento claro e leve.
- Persistência: armazenamento em arquivo JSON backend/data/tasks.json para evitar dependência de banco e facilitar execução local.
- IDs: sequenciais gerados no servidor e convertidos para string, garantindo compatibilidade com JSON e frontend.
- CORS: middleware próprio permitindo origem dinâmica e pré-flight OPTIONS, viabilizando o desenvolvimento com servidor de frontend separado.

Frontend
- Stack: React 18 com Vite para boot rápido, HMR e build simples.
- Estado e UI: useState , useEffect e useMemo para gerenciar tarefas, loading e erros sem Redux; agrupamento por status é memorizado.
- Estilos: CSS único ( src/styles.css ) com variáveis e componentes mínimos, priorizando legibilidade e leveza.
- UX: ações de editar, mover e excluir com feedback (loading/erro) e prompts nativos para simplicidade.

## Limitações conhecidas
- Persistência simples em JSON local (sem banco de dados).
- Sem autenticação.
- UI básica, pensada para MVP.

## Melhorias futuras
- Adicionar banco de dados (PostgreSQL ou SQLite) para persistência robusta.
- Melhorar UX com toasts, animações de transição e feedbacks mais elaborados.
- Adicionar filtros e busca de tarefas.
- Implementar autenticação e multi-usuário.



