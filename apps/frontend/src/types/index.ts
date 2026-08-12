// TS-ийн жирийн `enum`-ийг ашиглахгүй байгаа шалтгаан: Vite/TS6-ийн
// erasableSyntaxOnly горим бодит runtime код үүсгэдэг enum-ыг хориглодог тул
// үүний оронд `as const` объект ашиглана.
export const UserRole = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Course {
  _id: string;
  title: string;
  description?: string;
  teacherId: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  _id: string;
  courseId: string;
  title: string;
  order: number;
}

export interface Lesson {
  _id: string;
  sectionId: string;
  courseId: string;
  title: string;
  order: number;
  h5pContentIds: string[];
}

export interface Group {
  _id: string;
  courseId: string;
  name: string;
  studentIds: string[];
}

export interface Enrollment {
  _id: string;
  studentId: string | User;
  courseId: string | Course;
  groupId?: string;
}

export interface StudentProgressRow {
  studentId: string;
  name: string;
  email: string;
  opened: boolean;
  completed: boolean;
  score?: number;
  maxScore?: number;
  attempts: number;
  updatedAt?: string;
}

export interface ContentProgress {
  contentId: string;
  totalStudents: number;
  openedCount: number;
  completedCount: number;
  students: StudentProgressRow[];
}

export interface LessonProgress {
  lessonId: string;
  contents: ContentProgress[];
}
