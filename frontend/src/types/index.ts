// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    editorMode: 'rich' | 'markdown';
  };
  createdAt: string;
}

// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  author: User;
  collaborators: User[];
  tags: string[];
  category: string;
  isPublic: boolean;
  isArchived: boolean;
  lastEditedBy: User;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Note filter types
export interface NoteFilters {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  archived?: boolean;
  search?: string;
}

// Socket events
export interface SocketEvents {
  'note:join': { noteId: string };
  'note:leave': { noteId: string };
  'note:update': { noteId: string; content: string };
  'note:cursor': { noteId: string; position: number };
  'note:user-joined': { userId: string; noteId: string; timestamp: string };
  'note:user-left': { userId: string; noteId: string; timestamp: string };
  'note:updated': { noteId: string; content: string; userId: string; timestamp: string };
  'note:cursor-updated': { noteId: string; position: number; userId: string; timestamp: string };
}