import { apiClient } from './client';
import type { User, UserRole } from '../types';

export interface LoginResponse {
  accessToken: string;
}

export function login(email: string, password: string) {
  return apiClient.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data);
}

export function register(email: string, password: string, name: string, role?: UserRole) {
  return apiClient
    .post<LoginResponse>('/auth/register', { email, password, name, role })
    .then((r) => r.data);
}

export function fetchMe() {
  return apiClient.post<User>('/auth/me').then((r) => r.data);
}
