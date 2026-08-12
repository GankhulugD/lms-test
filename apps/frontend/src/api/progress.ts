import { apiClient } from './client';
import type { LessonProgress } from '../types';

export const progressApi = {
  lessonProgress: (lessonId: string) =>
    apiClient.get<LessonProgress>(`/lessons/${lessonId}/progress`).then((r) => r.data),
};
