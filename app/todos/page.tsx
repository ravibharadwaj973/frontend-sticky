'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/layout/Header';
import { todoApi } from '@/lib/todoApi';
import { Todo } from '@/types';

type Filter = 'all' | 'pending' | 'done';

const PRIORITIES: Todo['priority'][] = ['low', 'medium', 'high'];

const PRIORITY_STYLES: Record<Todo['priority'], string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700',
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  // inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Todo['priority']>('medium');

  const loadTodos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await todoApi.getAll(filter === 'all' ? undefined : filter);
      if (data.todos) {
        setTodos(data.todos);
        setError('');
      } else {
        setError(data.error || 'Could not load todos');
      }
    } catch {
      setError('Could not reach the todo service');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const data = await todoApi.create({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
      });

      if (data.error) {
        setError(data.error);
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        loadTodos();
      }
    } catch {
      setError('Could not reach the todo service');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    const data = await todoApi.toggle(todo._id);
    if (data.error) setError(data.error);
    else loadTodos();
  };

  const handleDelete = async (todo: Todo) => {
    if (!window.confirm(`Delete todo "${todo.title}"?`)) return;

    const data = await todoApi.delete(todo._id);
    if (data.error) setError(data.error);
    else loadTodos();
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) return;

    const data = await todoApi.update(id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
    });

    if (data.error) {
      setError(data.error);
    } else {
      setEditingId(null);
      loadTodos();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Todos</h1>
          <Link
            href="/notes"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Notes
          </Link>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Served by the <span className="font-medium">todo-service</span> on its own port,
          separate from the notes backend.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {/* Create */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-black">
          <h2 className="text-xl font-semibold mb-4">Add a Todo</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              placeholder="What needs doing?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-20 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Priority:</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Todo['priority'])}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Due:</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add Todo'}
            </button>
          </form>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(['all', 'pending', 'done'] as Filter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-lg text-sm capitalize ${
                filter === option
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p className="text-gray-500">Loading todos...</p>
        ) : todos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No todos here yet. Add your first one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div key={todo._id} className="bg-white p-4 rounded-lg shadow-md text-black">
                {editingId === todo._id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full h-20 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as Todo['priority'])}
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(todo._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={todo.isDone}
                        onChange={() => handleToggle(todo)}
                        className="mt-1 w-4 h-4 shrink-0"
                      />
                      <div className="min-w-0">
                        <p
                          className={`font-medium ${
                            todo.isDone ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}
                        >
                          {todo.title}
                        </p>
                        {todo.description && (
                          <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${PRIORITY_STYLES[todo.priority]}`}
                          >
                            {todo.priority}
                          </span>
                          {todo.dueDate && (
                            <span className="text-xs text-gray-400">
                              due {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(todo)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(todo)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
