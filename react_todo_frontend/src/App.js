import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App - Main Todo application component with Ocean Professional theme.
 * Features:
 * - Create, read, update, delete todos
 * - Toggle complete/incomplete
 * - Filter: all/active/completed
 * - Local state with persistence in localStorage
 * - Accessible controls and keyboard-friendly interactions
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [todos, setTodos] = useState(() => {
    // Initialize from localStorage to persist across refreshes
    try {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Apply theme to document (light only for now to match Ocean Professional; keep toggle for future)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Persist todos on change
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch {
      // ignore storage errors
    }
  }, [todos]);

  const remainingCount = useMemo(
    () => todos.filter(t => !t.completed).length,
    [todos]
  );

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // PUBLIC_INTERFACE
  const addTodo = () => {
    const title = input.trim();
    if (!title) return;
    const newTodo = {
      id: cryptoRandomId(),
      title,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
    setInput('');
  };

  // PUBLIC_INTERFACE
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
  };

  // PUBLIC_INTERFACE
  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // PUBLIC_INTERFACE
  const startEditing = (id, currentTitle) => {
    setEditingId(id);
    setEditingText(currentTitle);
  };

  // PUBLIC_INTERFACE
  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  // PUBLIC_INTERFACE
  const saveEditing = (id) => {
    const text = editingText.trim();
    if (!text) {
      // if empty after trim, delete the todo for convenience
      deleteTodo(id);
      return;
    }
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, title: text } : t)));
    setEditingId(null);
    setEditingText('');
  };

  // PUBLIC_INTERFACE
  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  // PUBLIC_INTERFACE
  const setFilterAll = () => setFilter('all');

  // PUBLIC_INTERFACE
  const setFilterActive = () => setFilter('active');

  // PUBLIC_INTERFACE
  const setFilterCompleted = () => setFilter('completed');

  // Keyboard handlers
  const handleAddKeyDown = (e) => {
    if (e.key === 'Enter') addTodo();
  };
  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') saveEditing(id);
    if (e.key === 'Escape') cancelEditing();
  };

  return (
    <div className="ocean-app">
      <div className="ocean-header">
        <div className="brand">
          <span aria-hidden="true" className="brand-bubble" />
          <h1 className="brand-title">Todo</h1>
          <span className="brand-accent">• Ocean</span>
        </div>
        <button
          className="theme-switch"
          onClick={toggleTheme}
          type="button"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <main className="ocean-container" role="main">
        {/* Input area */}
        <div className="input-row">
          <input
            type="text"
            className="input"
            placeholder="Add a new task..."
            aria-label="Add a new task"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleAddKeyDown}
            autoFocus
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={addTodo}
            disabled={!input.trim()}
            aria-disabled={!input.trim()}
            title="Add task"
          >
            Add
          </button>
        </div>

        {/* List */}
        <ul className="todo-list" aria-live="polite">
          {filteredTodos.length === 0 && (
            <li className="empty">
              <span className="empty-emoji" role="img" aria-label="waves">🌊</span>
              <div className="empty-text">
                {todos.length === 0
                  ? 'Your list is clear. Add something to get started!'
                  : filter === 'active'
                  ? 'All caught up! No active tasks.'
                  : 'No completed tasks yet.'}
              </div>
            </li>
          )}
          {filteredTodos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
              <label className="checkbox-wrap">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  aria-label={todo.completed ? 'Mark as not completed' : 'Mark as completed'}
                />
                <span className="checkbox-custom" aria-hidden="true" />
              </label>

              {editingId === todo.id ? (
                <input
                  className="edit-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                  onBlur={() => saveEditing(todo.id)}
                  aria-label="Edit task"
                />
              ) : (
                <span
                  className="title"
                  onDoubleClick={() => startEditing(todo.id, todo.title)}
                  title="Double click to edit"
                >
                  {todo.title}
                </span>
              )}

              <div className="actions">
                {editingId === todo.id ? (
                  <>
                    <button
                      className="btn btn-ghost"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => saveEditing(todo.id)}
                      title="Save"
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-ghost danger"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={cancelEditing}
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-ghost"
                      onClick={() => startEditing(todo.id, todo.title)}
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost danger"
                      onClick={() => deleteTodo(todo.id)}
                      title="Delete"
                      aria-label="Delete task"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Footer / Filters */}
        <div className="footer">
          <div className="status">
            <span className="dot" aria-hidden="true" />
            {remainingCount} {remainingCount === 1 ? 'task' : 'tasks'} left
          </div>
          <div className="filters" role="tablist" aria-label="Todo filters">
            <button
              className={`chip ${filter === 'all' ? 'active' : ''}`}
              onClick={setFilterAll}
              role="tab"
              aria-selected={filter === 'all'}
            >
              All
            </button>
            <button
              className={`chip ${filter === 'active' ? 'active' : ''}`}
              onClick={setFilterActive}
              role="tab"
              aria-selected={filter === 'active'}
            >
              Active
            </button>
            <button
              className={`chip ${filter === 'completed' ? 'active' : ''}`}
              onClick={setFilterCompleted}
              role="tab"
              aria-selected={filter === 'completed'}
            >
              Completed
            </button>
          </div>
          <button
            className="btn btn-quiet"
            onClick={clearCompleted}
            disabled={!todos.some(t => t.completed)}
            title="Clear completed tasks"
          >
            Clear Completed
          </button>
        </div>
      </main>

      <footer className="ocean-footer">
        <span className="note">
          Built with the Ocean Professional theme
        </span>
      </footer>
    </div>
  );
}

export default App;

// PUBLIC_INTERFACE
export function cryptoRandomId() {
  /** Create a random, URL-safe ID for Todo items. */
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(2);
    crypto.getRandomValues(arr);
    return Array.from(arr, n => n.toString(36)).join('');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
