export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  color: string;
  position: {
    x: number;
    y: number;
  };
  user: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadNotification {
  _id: string;
  message: string;
  bucket?: string;
  key?: string;
  size?: number;
  user?: string;
  createdAt?: string;
  url?: string | null;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}