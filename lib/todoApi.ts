// Second backend service (todo-service), a separate origin from lib/api.ts.
// Its URL comes from the container's TODO_API_URL at runtime (ECS task
// definition), not from a build-time NEXT_PUBLIC_* value.
import { tokenStore } from './api';
import { getTodoApiUrl } from './runtimeConfig';

// The JWT is minted by the core backend and verified by the todo-service with
// the same JWT_SECRET, so the very same token works against both services.
const todoFetch = async (path: string, options: RequestInit = {}) => {
  const token = tokenStore.get();

  const response = await fetch(`${getTodoApiUrl()}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return response.json();
};

export interface TodoInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string | null;
  isDone?: boolean;
}

export const todoApi = {
  getAll: async (status?: 'done' | 'pending') => {
    return todoFetch(status ? `/todos?status=${status}` : '/todos');
  },

  getById: async (id: string) => {
    return todoFetch(`/todos/${id}`);
  },

  create: async (todo: TodoInput) => {
    return todoFetch('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  },

  update: async (id: string, todo: TodoInput) => {
    return todoFetch(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todo),
    });
  },

  toggle: async (id: string) => {
    return todoFetch(`/todos/${id}/toggle`, { method: 'PATCH' });
  },

  delete: async (id: string) => {
    return todoFetch(`/todos/${id}`, { method: 'DELETE' });
  },
};
