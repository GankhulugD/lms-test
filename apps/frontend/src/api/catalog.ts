import { apiClient } from './client';
import type { Course, Lesson, Section } from '../types';

export const coursesApi = {
  list: () => apiClient.get<Course[]>('/courses').then((r) => r.data),
  get: (id: string) => apiClient.get<Course>(`/courses/${id}`).then((r) => r.data),
  create: (data: { title: string; description?: string; published?: boolean }) =>
    apiClient.post<Course>('/courses', data).then((r) => r.data),
  update: (id: string, data: Partial<{ title: string; description: string; published: boolean }>) =>
    apiClient.patch<Course>(`/courses/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/courses/${id}`),
};

export const sectionsApi = {
  list: (courseId: string) =>
    apiClient.get<Section[]>(`/courses/${courseId}/sections`).then((r) => r.data),
  create: (courseId: string, data: { title: string; order: number }) =>
    apiClient.post<Section>(`/courses/${courseId}/sections`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/sections/${id}`),
};

export const lessonsApi = {
  list: (sectionId: string) =>
    apiClient.get<Lesson[]>(`/sections/${sectionId}/lessons`).then((r) => r.data),
  get: (id: string) => apiClient.get<Lesson>(`/lessons/${id}`).then((r) => r.data),
  create: (sectionId: string, data: { title: string; order: number }) =>
    apiClient.post<Lesson>(`/sections/${sectionId}/lessons`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/lessons/${id}`),
};
