/**
 * Backend exception-уудын message талбарт хүний хэл дээрх текст (Монгол/Англи
 * холилдсон) биш, тогтвортой машины КОД дамжуулна. Ингэснээр frontend
 * сонгосон хэлээрээ (mn/en) орчуулж харуулах боломжтой болно — хэрэв энд
 * шууд Монгол/Англи текст бичвэл нөгөө хэл рүү сольсон үед орчуулагдахгүй
 * "холимог хэлтэй" интерфэйс үүсдэг байсан.
 */
export const ErrorCode = {
  AUTH_EMAIL_TAKEN: 'AUTH_EMAIL_TAKEN',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  COURSE_ACCESS_DENIED: 'COURSE_ACCESS_DENIED',
  COURSE_NOT_PUBLISHED: 'COURSE_NOT_PUBLISHED',
  COURSE_ALREADY_ENROLLED: 'COURSE_ALREADY_ENROLLED',
  SECTION_NOT_FOUND: 'SECTION_NOT_FOUND',
  LESSON_NOT_FOUND: 'LESSON_NOT_FOUND',
  H5P_CONTENT_NOT_FOUND: 'H5P_CONTENT_NOT_FOUND',
  H5P_ACCESS_DENIED: 'H5P_ACCESS_DENIED',
  GROUP_NOT_FOUND: 'GROUP_NOT_FOUND',
  GROUP_STUDENTS_NOT_FOUND: 'GROUP_STUDENTS_NOT_FOUND',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
