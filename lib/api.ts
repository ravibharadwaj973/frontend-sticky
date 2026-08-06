// Set NEXT_PUBLIC_API_URL in frontends/.env.local to override (e.g. http://localhost:5000/api for local dev)
const API_BASE_URL ='http://43.205.206.238/api';

// Browsers refuse to store cross-site cookies over plain HTTP, so the JWT is
// also kept in localStorage and sent as an Authorization header on every call.
const TOKEN_KEY = 'stickynoted_token';

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
  },
  clear: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
  },
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = tokenStore.get();

  const response = await fetch(`${API_BASE_URL}${path}`, {
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

export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      console.log(email)
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) tokenStore.set(data.token);
      return data;
    },

    register: async (name: string, email: string, password: string) => {
      console.log(name)
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (data.token) tokenStore.set(data.token);
      return data;
    },

    logout: async () => {
      tokenStore.clear();
      return apiFetch('/auth/logout', { method: 'POST' });
    },

    getMe: async () => {
      return apiFetch('/auth/me');
    },
  },

  // Notes endpoints
  notes: {
    getAll: async () => {
      return apiFetch('/notes');
    },

    getArchived: async () => {
      return apiFetch('/notes/archived');
    },

    getById: async (id: string) => {
      return apiFetch(`/notes/${id}`);
    },

    create: async (noteData: { title: string; content: string; color?: string; position?: { x: number; y: number } }) => {
      return apiFetch('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
    },

    update: async (id: string, noteData: any) => {
      return apiFetch(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(noteData),
      });
    },

    archive: async (id: string) => {
      return apiFetch(`/notes/${id}/archive`, { method: 'PATCH' });
    },

    unarchive: async (id: string) => {
      return apiFetch(`/notes/${id}/unarchive`, { method: 'PATCH' });
    },

    delete: async (id: string) => {
      return apiFetch(`/notes/${id}`, { method: 'DELETE' });
    },
  },

  // Image upload endpoints (Lambda -> S3 -> SNS -> MongoDB)
  uploads: {
    upload: async (payload: { filename: string; contentType: string; data: string }) => {
      return apiFetch('/uploads', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    getNotifications: async () => {
      return apiFetch('/uploads/notifications');
    },
  },
};
