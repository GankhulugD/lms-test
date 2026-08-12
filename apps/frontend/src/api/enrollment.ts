import { apiClient } from './client';
import type { Enrollment, Group } from '../types';

export const groupsApi = {
  list: (courseId: string) =>
    apiClient.get<Group[]>(`/courses/${courseId}/groups`).then((r) => r.data),
  create: (courseId: string, name: string) =>
    apiClient.post<Group>(`/courses/${courseId}/groups`, { name }).then((r) => r.data),
  addStudents: (groupId: string, emails: string[]) =>
    apiClient.post(`/groups/${groupId}/students`, { emails }).then((r) => r.data),
};

export const enrollmentApi = {
  enrollSelf: (courseId: string) =>
    apiClient.post<Enrollment>(`/courses/${courseId}/enroll`).then((r) => r.data),
  myEnrollments: () => apiClient.get<Enrollment[]>('/me/enrollments').then((r) => r.data),
  roster: (courseId: string) =>
    apiClient.get<Enrollment[]>(`/courses/${courseId}/roster`).then((r) => r.data),
};
