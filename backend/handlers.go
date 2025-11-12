package main

import (
    "encoding/json"
    "errors"
    "net/http"
    "os"
    "path/filepath"
    "strconv"
    "sync"
    "github.com/gorilla/mux"
)

var (
	tasks         = []Task{}
	currentID     = 1
	mu            sync.Mutex
	allowedStatuses = map[string]bool{
		"todo":        true,
		"in_progress": true,
		"done":        true,
	}
	dataFile = filepath.Join("backend", "data", "tasks.json")
)

func ensureDataDir() error {
	dir := filepath.Dir(dataFile)
	return os.MkdirAll(dir, 0755)
}

func loadTasksFromDisk() error {
	if err := ensureDataDir(); err != nil {
		return err
	}
	b, err := os.ReadFile(dataFile)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}
		return err
	}
	var loaded []Task
	if len(b) > 0 {
		if err := json.Unmarshal(b, &loaded); err != nil {
			return err
		}
	}
	mu.Lock()
	tasks = loaded
	// Recalcula currentID com base nos IDs existentes
	maxID := 0
	for _, t := range tasks {
		if id, err := strconv.Atoi(t.ID); err == nil && id > maxID {
			maxID = id
		}
	}
	currentID = maxID + 1
	mu.Unlock()
	return nil
}

func saveTasksToDisk() error {
	if err := ensureDataDir(); err != nil {
		return err
	}
	b, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(dataFile, b, 0644)
}

func isValidStatus(status string) bool {
	return allowedStatuses[status]
}

func GetTasks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	mu.Lock()
	defer mu.Unlock()
	if err := json.NewEncoder(w).Encode(tasks); err != nil {
		http.Error(w, "Erro ao serializar tarefas", http.StatusInternalServerError)
	}
}

func CreateTask(w http.ResponseWriter, r *http.Request) {
	var task Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validação básica
	if task.Title == "" {
		http.Error(w, "Título é obrigatório", http.StatusBadRequest)
		return
	}

	// Define ID e status padrão
	mu.Lock()
	task.ID = strconv.Itoa(currentID)
	currentID++
	if task.Status == "" {
		task.Status = "todo"
	} else if !isValidStatus(task.Status) {
		mu.Unlock()
		http.Error(w, "Status inválido. Use: todo, in_progress, done", http.StatusBadRequest)
		return
	}

	tasks = append(tasks, task)
	if err := saveTasksToDisk(); err != nil {
		mu.Unlock()
		http.Error(w, "Falha ao salvar em disco: "+err.Error(), http.StatusInternalServerError)
		return
	}
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(task); err != nil {
		http.Error(w, "Erro ao serializar tarefa", http.StatusInternalServerError)
	}
}

func UpdateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var incoming Task
	if err := json.NewDecoder(r.Body).Decode(&incoming); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	for i := range tasks {
		if tasks[i].ID == id {
			// Preserva o ID original
			if incoming.Title != "" {
				tasks[i].Title = incoming.Title
			}
			if incoming.Description != "" {
				tasks[i].Description = incoming.Description
			}
			if incoming.Status != "" {
				if !isValidStatus(incoming.Status) {
					http.Error(w, "Status inválido. Use: todo, in_progress, done", http.StatusBadRequest)
					return
				}
				tasks[i].Status = incoming.Status
			}
			if err := saveTasksToDisk(); err != nil {
				http.Error(w, "Falha ao salvar em disco: "+err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			if err := json.NewEncoder(w).Encode(tasks[i]); err != nil {
				http.Error(w, "Erro ao serializar tarefa", http.StatusInternalServerError)
			}
			return
		}
	}

	http.Error(w, "Task não encontrada", http.StatusNotFound)
}

func DeleteTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	mu.Lock()
	defer mu.Unlock()

	for i := range tasks {
		if tasks[i].ID == id {
			// Remove mantendo a ordem simples
			tasks = append(tasks[:i], tasks[i+1:]...)
			if err := saveTasksToDisk(); err != nil {
				http.Error(w, "Falha ao salvar em disco: "+err.Error(), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	http.Error(w, "Task não encontrada", http.StatusNotFound)
}