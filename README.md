# Mini Kanban (React + Go)

Aplicação fullstack com três colunas (A Fazer, Em Progresso, Concluídas), CRUD de tarefas, drag-and-drop entre colunas e persistência opcional em arquivo JSON no backend.

## Requisitos
- Go 1.22+
- Node.js 18+ e npm

## Como rodar

### Backend (Go)
1. No diretório do projeto:
   ```bash
   go mod tidy
   go run ./backend
   ```
2. O servidor sobe em `http://localhost:8080`.
3. Persistência: tarefas são salvas em `backend/data/tasks.json` e carregadas na inicialização.

### Frontend (React + Vite)
1. Em outro terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Acesse `http://localhost:5173`.

## Endpoints
- `GET /tasks` — lista tarefas
- `POST /tasks` — cria tarefa `{ title: string, description?: string, status?: "todo"|"in_progress"|"done" }`
- `PUT /tasks/{id}` — atualiza campos parciais (título, descrição ou status válido)
- `DELETE /tasks/{id}` — remove tarefa

## Decisões técnicas

### Backend
- **Go com Gorilla Mux**: Escolhido por simplicidade e performance para APIs REST.
- **Armazenamento**: Memória com persistência opcional em arquivo JSON (`backend/data/tasks.json`). Dados são salvos automaticamente após cada operação CRUD.
- **Concorrência**: Uso de `sync.Mutex` para proteger acesso concorrente ao slice de tarefas e ao contador de IDs.
- **Validações**: 
  - Título obrigatório no POST
  - Status válido (`todo`, `in_progress`, `done`) em POST e PUT
- **CORS**: Configurado para permitir requisições do frontend em `localhost:5173`.

### Frontend
- **Vite + React 18**: Build tool moderna e rápida para desenvolvimento.
- **Drag and Drop**: Implementado com HTML5 Drag and Drop API nativa (sem bibliotecas externas).
- **Estado**: Gerenciamento local com `useState` e `useEffect` para simplicidade.
- **Feedback visual**: Indicadores de loading, mensagens de erro e estados de salvamento.

## Limitações conhecidas
- **Sem testes automatizados**: Não há testes unitários ou de integração implementados.
- **Persistência simples**: Dados são salvos em JSON local; não há banco de dados real.
- **Sem autenticação**: Aplicação não possui sistema de usuários ou autenticação.
- **UI básica**: Interface funcional mas pode ser melhorada com mais animações e feedbacks visuais.

## Melhorias futuras
- Implementar testes automatizados (Go e React).
- Adicionar banco de dados (PostgreSQL ou SQLite) para persistência robusta.
- Melhorar UX com toasts, animações de transição e feedbacks mais elaborados.
- Adicionar filtros e busca de tarefas.
- Implementar autenticação e multi-usuário.

## Documentação
- `docs/user-flow.png` — fluxo de uso do usuário.

