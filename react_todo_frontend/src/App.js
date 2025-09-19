import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App - Todo application styled to match the extracted Figma design.
 * - Keeps full CRUD interactions, filters and persistence
 * - Applies dark themed layout, header, and add button per static assets
 */
function App() {
  const [todos, setTodos] = useState(() => {
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

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch {
      // ignore
    }
  }, [todos]);

  const remainingCount = useMemo(
    () => todos.filter(t => !t.completed).length,
    [todos]
  );

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }, [todos, filter]);

  // PUBLIC_INTERFACE
  const addTodo = () => {
    const title = input.trim();
    if (!title) return;
    const newTodo = { id: cryptoRandomId(), title, completed: false, createdAt: Date.now() };
    setTodos(prev => [newTodo, ...prev]);
    setInput('');
  };

  // PUBLIC_INTERFACE
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    if (editingId === id) { setEditingId(null); setEditingText(''); }
  };

  // PUBLIC_INTERFACE
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
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
    if (!text) { deleteTodo(id); return; }
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, title: text } : t)));
    setEditingId(null);
    setEditingText('');
  };

  // PUBLIC_INTERFACE
  const clearCompleted = () => setTodos(prev => prev.filter(t => !t.completed));

  const setFilterAll = () => setFilter('all');
  const setFilterActive = () => setFilter('active');
  const setFilterCompleted = () => setFilter('completed');

  const handleAddKeyDown = (e) => { if (e.key === 'Enter') addTodo(); };
  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') saveEditing(id);
    if (e.key === 'Escape') cancelEditing();
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="app">
      {/* Header to match Figma header block */}
      <header className="header" role="banner" aria-label="Header">
        <div className="header-inner">
          <div className="header-title" role="group" aria-label="Title and status">
            <h1>Tasks</h1>
            <div className="header-sub">{completedCount} of {todos.length || 0} completed</div>
          </div>
          {/* Add button mirrors purple rounded square with plus */}
          <button
            className="add-btn"
            type="button"
            aria-label="Add task"
            title="Add task"
            onClick={addTodo}
            disabled={!input.trim()}
          >
            <span className="plus" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="main" role="main">
        {/* Input row (dark theme) */}
        <div className="input-row" style={{ marginTop: 16 }}>
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
            className="btn-primary"
            type="button"
            onClick={addTodo}
            disabled={!input.trim()}
            aria-disabled={!input.trim()}
            title="Add task"
          >
            Add
          </button>
        </div>

        {/* Tasks list as dark cards */}
        <ul className="todo-list" aria-live="polite">
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
                  className="input"
                  style={{ padding: '10px 12px', borderRadius: 12 }}
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
                      className="btn-ghost"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => saveEditing(todo.id)}
                      title="Save"
                    >
                      Save
                    </button>
                    <button
                      className="btn-ghost danger"
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
                      className="btn-ghost"
                      onClick={() => startEditing(todo.id, todo.title)}
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      className="btn-ghost danger"
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
            className="btn-ghost"
            onClick={clearCompleted}
            disabled={!todos.some(t => t.completed)}
            title="Clear completed tasks"
          >
            Clear Completed
          </button>
        </div>
      </main>

      <footer className="app-footer">
        <span className="note">Figma dark design applied</span>
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
