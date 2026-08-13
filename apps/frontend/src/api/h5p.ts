import { apiClient } from './client';

/**
 * H5P core (@lumieducation/h5p-server) нь дотооддоо зөвхөн англи хэлний
 * орчуулгын файлтай — монгол ("mn") хэлний албан H5P language pack байхгүй.
 * Тэгэхдээ 'mn' дамжуулахад алдаа шаардлагагүй: h5p-server file олдохгүй бол
 * англи руу автоматаар буцдаг. Иймд язгуур хэлийг дамжуулж байгаа нь ирээдүйд
 * H5P-д mn орчуулга нэмэгдэхэд шууд ажиллах боломж үлдээнэ, харин одоохондоо
 * H5P-ийн ӨӖРИЙН widget-ийн текст (товч нэр, tooltip г.м) англи хэлээр
 * харагдана — манай LMS-ийн эргэн тойрны UI (tab, товч) бол t()-ээр
 * бүрэн mn/en орчуулгатай.
 */
export const h5pApi = {
  newEditorModel: (lessonId: string, language = 'en') =>
    apiClient.get(`/lessons/${lessonId}/h5p-content/new`, { params: { language } }).then((r) => r.data),

  editorModel: (contentId: string, language = 'en') =>
    apiClient.get(`/h5p-content/${contentId}/edit`, { params: { language } }).then((r) => r.data),

  create: (lessonId: string, body: { mainLibraryUbername: string; params: any; metadata: any }) =>
    apiClient
      .post<{ contentId: string; metadata: any }>(`/lessons/${lessonId}/h5p-content`, body)
      .then((r) => r.data),

  update: (contentId: string, body: { mainLibraryUbername: string; params: any; metadata: any }) =>
    apiClient
      .patch<{ contentId: string; metadata: any }>(`/h5p-content/${contentId}`, body)
      .then((r) => r.data),

  remove: (contentId: string) => apiClient.delete(`/h5p-content/${contentId}`),

  playerModel: (contentId: string, language = 'en') =>
    apiClient.get(`/h5p-content/${contentId}/play`, { params: { language } }).then((r) => r.data),

  reportOpen: (contentId: string) => apiClient.post(`/h5p-content/${contentId}/open`),

  reportResult: (
    contentId: string,
    body: { score?: number; maxScore?: number; completed?: boolean; success?: boolean; verb?: string },
  ) => apiClient.post(`/h5p-content/${contentId}/result`, body),
};
