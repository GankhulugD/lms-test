import type { TranslationKey } from './translations';

/**
 * Backend-ийн `apps/backend/src/shared/error-codes.ts`-тэй ЯГ таарсан байх
 * ёстой машины код -> орчуулгын түлхүүрийн харгалзаа. Шинэ ErrorCode
 * нэмэгдэх бүрт эндээ мөн нэмнэ.
 */
const apiErrorMessageKeys: Record<string, TranslationKey> = {
  AUTH_EMAIL_TAKEN: 'apiError.authEmailTaken',
  AUTH_INVALID_CREDENTIALS: 'apiError.authInvalidCredentials',
  AUTH_USER_NOT_FOUND: 'apiError.authUserNotFound',
  COURSE_NOT_FOUND: 'apiError.courseNotFound',
  COURSE_ACCESS_DENIED: 'apiError.courseAccessDenied',
  COURSE_NOT_PUBLISHED: 'apiError.courseNotPublished',
  COURSE_ALREADY_ENROLLED: 'apiError.courseAlreadyEnrolled',
  SECTION_NOT_FOUND: 'apiError.sectionNotFound',
  LESSON_NOT_FOUND: 'apiError.lessonNotFound',
  H5P_CONTENT_NOT_FOUND: 'apiError.h5pContentNotFound',
  H5P_ACCESS_DENIED: 'apiError.h5pAccessDenied',
  GROUP_NOT_FOUND: 'apiError.groupNotFound',
  GROUP_STUDENTS_NOT_FOUND: 'apiError.groupStudentsNotFound',
};

/**
 * axios алдаанаас backend-ийн буцаасан КОД-ыг олж, түүнд харгалзах орчуулгын
 * түлхүүрийг буцаана. Танигдаагүй код (эсвэл сүлжээний алдаа) бол `null`
 * буцааж, дуудагч тал ерөнхий 'apiError.generic' мессежийг ашиглана —
 * backend-ийн түүхий (техникийн, орчуулаагүй) текстийг хэзээ ч UI-д шууд
 * харуулахгүй байхын тулд.
 */
export function getApiErrorKey(err: unknown): TranslationKey | null {
  const code = (err as any)?.response?.data?.message;
  if (typeof code === 'string' && code in apiErrorMessageKeys) {
    return apiErrorMessageKeys[code];
  }
  return null;
}
