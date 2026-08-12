import { apiClient } from './client';

export const h5pApi = {
  newEditorModel: (lessonId: string) =>
    apiClient.get(`/lessons/${lessonId}/h5p-content/new`).then((r) => r.data),

  editorModel: (contentId: string) =>
    apiClient.get(`/h5p-content/${contentId}/edit`).then((r) => r.data),

  create: (lessonId: string, body: { mainLibraryUbername: string; params: any; metadata: any }) =>
    apiClient
      .post<{ contentId: string; metadata: any }>(`/lessons/${lessonId}/h5p-content`, body)
      .then((r) => r.data),

  update: (contentId: string, body: { mainLibraryUbername: string; params: any; metadata: any }) =>
    apiClient
      .patch<{ contentId: string; metadata: any }>(`/h5p-content/${contentId}`, body)
      .then((r) => r.data),

  remove: (contentId: string) => apiClient.delete(`/h5p-content/${contentId}`),

  playerModel: (contentId: string) =>
    apiClient.get(`/h5p-content/${contentId}/play`).then((r) => r.data),

  reportOpen: (contentId: string) => apiClient.post(`/h5p-content/${contentId}/open`),

  reportResult: (
    contentId: string,
    body: { score?: number; maxScore?: number; completed?: boolean; success?: boolean; verb?: string },
  ) => apiClient.post(`/h5p-content/${contentId}/result`, body),
};
