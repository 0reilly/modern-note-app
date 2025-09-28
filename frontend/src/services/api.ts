import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, AuthResponse, LoginData, RegisterData, Note, NoteFilters, PaginatedResponse, User } from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests if available
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data.success) {
      return response.data.data as T;
    }
    throw new Error(response.data.message);
  }

  // Auth endpoints
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return this.handleResponse(response);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.client.get<ApiResponse<{ user: User }>>('/auth/me');
    return this.handleResponse(response);
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    const response = await this.client.put<ApiResponse<{ user: User }>>('/auth/profile', data);
    return this.handleResponse(response);
  }

  // Note endpoints
  async getNotes(filters: NoteFilters = {}): Promise<PaginatedResponse<Note>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await this.client.get<ApiResponse<PaginatedResponse<Note>>>(`/notes?${params}`);
    return this.handleResponse(response);
  }

  async getNote(id: string): Promise<{ note: Note }> {
    const response = await this.client.get<ApiResponse<{ note: Note }>>(`/notes/${id}`);
    return this.handleResponse(response);
  }

  async createNote(data: { title: string; content?: string; category?: string; tags?: string[] }): Promise<{ note: Note }> {
    const response = await this.client.post<ApiResponse<{ note: Note }>>('/notes', data);
    return this.handleResponse(response);
  }

  async updateNote(id: string, data: Partial<Note>): Promise<{ note: Note }> {
    const response = await this.client.put<ApiResponse<{ note: Note }>>(`/notes/${id}`, data);
    return this.handleResponse(response);
  }

  async deleteNote(id: string): Promise<void> {
    const response = await this.client.delete<ApiResponse>(`/notes/${id}`);
    return this.handleResponse(response);
  }

  async addCollaborator(noteId: string, userId: string): Promise<{ note: Note }> {
    const response = await this.client.post<ApiResponse<{ note: Note }>>(`/notes/${noteId}/collaborate`, { userId });
    return this.handleResponse(response);
  }

  // User search
  async searchUsers(query: string): Promise<{ users: User[] }> {
    const response = await this.client.get<ApiResponse<{ users: User[] }>>(`/users/search?q=${encodeURIComponent(query)}`);
    return this.handleResponse(response);
  }

  // Meta endpoints
  async getCategories(): Promise<{ categories: Array<{ _id: string; count: number }> }> {
    const response = await this.client.get<ApiResponse<{ categories: Array<{ _id: string; count: number }> }>>('/notes/meta/categories');
    return this.handleResponse(response);
  }

  async getTags(): Promise<{ tags: Array<{ _id: string; count: number }> }> {
    const response = await this.client.get<ApiResponse<{ tags: Array<{ _id: string; count: number }> }>>('/notes/meta/tags');
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number; environment: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();