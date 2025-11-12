# Mini Kanban (React + Go)

Aplicação fullstack com três colunas fixas (A Fazer, Em Progresso, Concluídas), CRUD de tarefas, drag-and-drop entre colunas e persistência opcional em arquivo JSON no backend. Projeto atende ao MVP solicitado: operações básicas, validações, CORS, documentação, estrutura de pastas e execução local.

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

## Endpoints (REST)
- `GET /tasks`
  - Retorna lista de tarefas (JSON).
  - Exemplo: `curl.exe http://localhost:8080/tasks`
- `POST /tasks`
  - Cria tarefa. Body esperado: `{ "title": string, "description"?: string, "status"?: "todo"|"in_progress"|"done" }`
  - Validações: título obrigatório; status (se fornecido) deve ser válido.
  - Exemplo: `curl.exe -X POST -H "Content-Type: application/json" -d "{\"title\":\"Nova\"}" http://localhost:8080/tasks`
- `PUT /tasks/{id}`
  - Atualiza parcialmente: `{ "title"?: string, "description"?: string, "status"?: "todo"|"in_progress"|"done" }`.
  - Exemplo: `curl.exe -X PUT -H "Content-Type: application/json" -d "{\"status\":\"in_progress\"}" http://localhost:8080/tasks/1`
- `DELETE /tasks/{id}`
  - Remove tarefa. Exemplo: `curl.exe -X DELETE http://localhost:8080/tasks/1`

### Códigos de retorno e erros
- Sucesso: `200` (GET/PUT), `201` (POST), `204` (DELETE sem corpo)
- Erros de validação: `400` com mensagem textual
- Não encontrado: `404`
- Erros internos: `500`

## Validações
- Título obrigatório no `POST /tasks`
- Status válido (`todo`, `in_progress`, `done`) no `POST` e `PUT`

## Persistência
- Dados mantidos em memória durante a execução.
- Persistência opcional em JSON: sempre que há `POST/PUT/DELETE`, o arquivo `backend/data/tasks.json` é atualizado.
- Na inicialização (`main.go`), tarefas são carregadas desse arquivo se existir; o contador de IDs é recalculado com base nos IDs do arquivo.

## CORS
- Middleware aplica cabeçalhos de CORS permitindo requisições do frontend local (`Access-Control-Allow-Origin` dinâmico). `OPTIONS` é tratado.
- Em desenvolvimento, o frontend usa proxy do Vite para `'/tasks'`, reduzindo atritos de CORS.

## Estrutura do projeto
```
backend/
  main.go        # rotas, CORS, inicialização do servidor e load das tarefas
  handlers.go    # handlers HTTP, validações, persistência JSON
  models.go      # definição do tipo Task
frontend/
  src/
    pages/App.jsx      # UI Kanban, drag-and-drop, CRUD
    services/api.js    # cliente HTTP para /tasks
    styles.css         # estilos e feedback visual
    main.jsx           # bootstrap React
  vite.config.js       # proxy e configuração do dev server
docs/
  user-flow.png        # fluxo de uso (obrigatório)
```

## Detalhes de implementação

### Backend (Go)
- `models.go`
  - Estrutura `Task { ID string, Title string, Description string, Status string }`.
- `handlers.go`
  - `tasks []Task`, `currentID int`, `mu sync.Mutex`, `allowedStatuses`.
  - Persistência:
    - `ensureDataDir()` cria `backend/data` se necessário.
    - `loadTasksFromDisk()` lê `tasks.json`, popula `tasks` e recalcula `currentID`.
    - `saveTasksToDisk()` salva o slice `tasks` em `tasks.json`.
  - Handlers:
    - `GetTasks`: retorna JSON das tarefas.
    - `CreateTask`: valida título, define `ID` e status padrão, salva em disco, retorna `201`.
    - `UpdateTask`: atualiza campos parciais, valida status, salva em disco, retorna tarefa atualizada.
    - `DeleteTask`: remove tarefa, salva em disco, retorna `204`.
- `main.go`
  - Chama `loadTasksFromDisk()` no start.
  - Configura rotas com Gorilla Mux.
  - Middleware `corsMiddleware` com cabeçalhos padrão e `OPTIONS`.
  - Sobe servidor em `:8080`.

### Frontend (React)
- `src/pages/App.jsx`
  - Três colunas fixas: `todo`, `in_progress`, `done`.
  - CRUD:
    - `onAddTask`: cria tarefa (`POST`) com título obrigatório.
    - `handleEdit`: atualiza título/descrição (`PUT`).
    - `handleMove`: atualiza status (`PUT`).
    - `handleDelete`: remove (`DELETE`).
  - Drag-and-drop:
    - `TaskCard` usa `draggable` e `onDragStart` com `dataTransfer`.
    - `Column` trata `onDragOver/onDragEnter/onDrop` e chama `handleDropTask` para mover e persistir.
  - Estado e carregamento:
    - `useEffect` inicial chama `fetchTasks` e popula o board.
    - `grouped` agrupa tarefas por status.
- `src/services/api.js`
  - Cliente HTTP com `fetch` e tratamento de erros.
  - Usa paths relativos (`/tasks`) para funcionar com proxy.
- `src/styles.css`
  - Estilos base e feedback visual mínimo (ex.: `.column.drag-over`, `cursor: grab/grabbing`).
- `vite.config.js`
  - `server.proxy` encaminha `'/tasks'` para `http://localhost:8080` em desenvolvimento.

## Dicas de desenvolvimento
- Se `:8080` estiver ocupado, libere a porta: `netstat -ano | findstr :8080` e `taskkill /F /PID <pid>`.
- Após alterar `vite.config.js`, reinicie `npm run dev`.
- Para testar rapidamente:
  - Listar: `curl.exe http://localhost:8080/tasks`
  - Atualizar status: `curl.exe -X PUT -H "Content-Type: application/json" -d "{\"status\":\"in_progress\"}" http://localhost:8080/tasks/1`

## Limitações conhecidas
- Persistência simples em JSON local (sem banco de dados).
- Sem autenticação.
- UI básica, pensada para MVP.

## Melhorias futuras
<<<<<<< HEAD
- Implementar testes automatizados (Go e React).
- Adicionar banco de dados (PostgreSQL ou SQLite) para persistência robusta.
- Melhorar UX com toasts, animações de transição e feedbacks mais elaborados.
- Adicionar filtros e busca de tarefas.
- Implementar autenticação e multi-usuário.

## Documentação
- `docs/user-flow.png` — fluxo de uso do usuário.
=======
- Banco de dados (PostgreSQL/SQLite).
- UX aprimorada (toasts, animações, feedbacks).
- Filtros e busca.
- Autenticação e multiusuário.
>>>>>>> 204fae1 (Adicionando o user-flow e detalhando o readme)

