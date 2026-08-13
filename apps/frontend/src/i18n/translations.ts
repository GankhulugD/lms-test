export type Language = 'mn' | 'en';

/**
 * Манай өөрсдийн LMS UI-ийн бүх текст эндээс ирнэ (mn/en). H5P editor/player-ийн
 * дотоод widget-ийн текст үүнд ХАМААРАХГҮЙ — тэр нь @lumieducation/h5p-server
 * болон H5P core-ийн gyi third-party JS-ээс ирдэг бөгөөд H5P монгол хэлний
 * албан орчуулга (language pack) шатаагаагаа тул зөвхөн англи хэлээр үлдэнэ.
 */
export const translations = {
  'common.loading': { mn: 'Ачааллаж байна...', en: 'Loading...' },
  'common.cancel': { mn: 'Цуцлах', en: 'Cancel' },
  'common.save': { mn: 'Хадгалах', en: 'Save' },
  'common.saving': { mn: 'Хадгалж байна...', en: 'Saving...' },
  'common.delete': { mn: 'Устгах', en: 'Delete' },
  'common.add': { mn: 'Нэмэх', en: 'Add' },
  'common.create': { mn: 'Үүсгэх', en: 'Create' },

  'roles.admin': { mn: 'Админ', en: 'Admin' },
  'roles.teacher': { mn: 'Багш', en: 'Teacher' },
  'roles.student': { mn: 'Сурагч', en: 'Student' },

  'login.title': { mn: 'Нэвтрэх', en: 'Sign in' },
  'login.subtitle': { mn: 'LMS системд тавтай морил', en: 'Welcome to the LMS' },
  'login.email': { mn: 'И-мэйл', en: 'Email' },
  'login.password': { mn: 'Нууц үг', en: 'Password' },
  'login.submitting': { mn: 'Түр хүлээнэ үү...', en: 'Please wait...' },
  'login.submit': { mn: 'Нэвтрэх', en: 'Sign in' },
  'login.noAccount': { mn: 'Бүртгэлгүй юу?', en: "Don't have an account?" },
  'login.registerLink': { mn: 'Бүртгүүлэх', en: 'Register' },
  'login.error': { mn: 'И-мэйл эсвэл нууц үг буруу байна', en: 'Invalid email or password' },

  'register.title': { mn: 'Бүртгүүлэх', en: 'Register' },
  'register.subtitle': { mn: 'Шинэ хаяг үүсгэх', en: 'Create a new account' },
  'register.name': { mn: 'Нэр', en: 'Name' },
  'register.email': { mn: 'И-мэйл', en: 'Email' },
  'register.password': { mn: 'Нууц үг (8+ тэмдэгт)', en: 'Password (8+ characters)' },
  'register.role': { mn: 'Төрөл', en: 'Role' },
  'register.submitting': { mn: 'Түр хүлээнэ үү...', en: 'Please wait...' },
  'register.submit': { mn: 'Бүртгүүлэх', en: 'Register' },
  'register.haveAccount': { mn: 'Бүртгэлтэй юу?', en: 'Already have an account?' },
  'register.loginLink': { mn: 'Нэвтрэх', en: 'Sign in' },
  'register.error': { mn: 'Бүртгэл амжилтгүй боллоо', en: 'Registration failed' },

  'layout.lightMode': { mn: 'Цайвар горим', en: 'Light mode' },
  'layout.darkMode': { mn: 'Шөнийн горим', en: 'Dark mode' },
  'layout.language': { mn: 'Хэл солих', en: 'Switch language' },
  'layout.logout': { mn: 'Гарах', en: 'Log out' },

  'error.title': { mn: 'Ямар нэг зүйл буруу боллоо', en: 'Something went wrong' },
  'error.description': {
    mn: 'Хуудсыг дахин ачааллаж үзнэ үү. Хэрэв алдаа давтагдаж байвал browser console-д дэлгэрэнгүй мэдээлэл байгаа болно.',
    en: 'Please reload the page. If the error persists, check the browser console for details.',
  },
  'error.reload': { mn: 'Дахин ачаалах', en: 'Reload' },

  'courses.title': { mn: 'Хичээлүүд', en: 'Courses' },
  'courses.newCourse': { mn: 'Шинэ хичээл', en: 'New course' },
  'courses.titlePlaceholder': { mn: 'Гарчиг', en: 'Title' },
  'courses.descriptionPlaceholder': { mn: 'Тайлбар', en: 'Description' },
  'courses.published': { mn: 'Нийтэлсэн', en: 'Published' },
  'courses.draft': { mn: 'Ноорог', en: 'Draft' },
  'courses.noDescription': { mn: 'Тайлбар байхгүй', en: 'No description' },
  'courses.notFound': { mn: 'Хичээл олдсонгүй.', en: 'No courses found.' },

  'courseDetail.unpublish': { mn: 'Нийтлэлтийг цуцлах', en: 'Unpublish' },
  'courseDetail.publish': { mn: 'Нийтлэх', en: 'Publish' },
  'courseDetail.enroll': { mn: 'Элсэх', en: 'Enroll' },
  'courseDetail.enrolled': { mn: 'Элссэн', en: 'Enrolled' },
  'courseDetail.sectionsTitle': { mn: 'Сэдэв, хичээлүүд', en: 'Topics & lessons' },
  'courseDetail.noLessons': { mn: 'Хичээл алга', en: 'No lessons' },
  'courseDetail.newLessonPlaceholder': { mn: 'Шинэ хичээлийн нэр', en: 'New lesson name' },
  'courseDetail.addLesson': { mn: 'Хичээл', en: 'Lesson' },
  'courseDetail.newSectionPlaceholder': { mn: 'Шинэ сэдвийн нэр', en: 'New topic name' },
  'courseDetail.addSection': { mn: 'Сэдэв', en: 'Topic' },
  'courseDetail.groupsTitle': { mn: 'Бүлгүүд', en: 'Groups' },
  'courseDetail.studentsCountSuffix': { mn: 'сурагч', en: 'students' },
  'courseDetail.addStudentsPlaceholder': {
    mn: 'email1@test.com, email2@test.com',
    en: 'email1@test.com, email2@test.com',
  },
  'courseDetail.newGroupPlaceholder': { mn: 'Шинэ бүлгийн нэр (жиш: 8а-1)', en: 'New group name (e.g. 8a-1)' },
  'courseDetail.addGroup': { mn: 'Бүлэг', en: 'Group' },
  'courseDetail.rosterTitle': { mn: 'Бүх бүртгэлтэй сурагчид', en: 'All enrolled students' },
  'courseDetail.noRoster': { mn: 'Одоогоор бүртгэлтэй сурагч алга', en: 'No enrolled students yet' },
  'courseDetail.completedSuffix': { mn: 'дуусгасан', en: 'completed' },

  'lesson.back': { mn: 'Курс руу буцах', en: 'Back to course' },
  'lesson.refreshProgress': { mn: 'Явц шинэчлэх', en: 'Refresh progress' },
  'lesson.addContent': { mn: 'Контент нэмэх', en: 'Add content' },
  'lesson.noContent': { mn: 'Энэ хичээлд одоогоор H5P контент байхгүй.', en: 'This lesson has no H5P content yet.' },

  'h5p.view': { mn: 'Харах', en: 'View' },
  'h5p.edit': { mn: 'Засварлах', en: 'Edit' },
  'h5p.saveFirst': { mn: 'Эхлээд хадгална уу', en: 'Save first' },
  'h5p.saved': { mn: 'Хадгалагдлаа', en: 'Saved' },
  'h5p.delete': { mn: 'Устгах', en: 'Delete' },
  'h5p.deleteConfirm': { mn: 'Энэ H5P контентыг устгах уу?', en: 'Delete this H5P content?' },

  'progress.title': { mn: 'Сурагчдын явц', en: 'Student progress' },
  'progress.completedSuffix': { mn: 'дуусгасан', en: 'completed' },
  'progress.noStudents': {
    mn: 'Энэ course-д одоогоор элссэн сурагч алга.',
    en: 'No students are enrolled in this course yet.',
  },
  'progress.colStudent': { mn: 'Сурагч', en: 'Student' },
  'progress.colStatus': { mn: 'Төлөв', en: 'Status' },
  'progress.colScore': { mn: 'Оноо', en: 'Score' },
  'progress.colAttempts': { mn: 'Оролдлого', en: 'Attempts' },
  'progress.statusCompleted': { mn: 'Дуусгасан', en: 'Completed' },
  'progress.statusOpened': { mn: 'Үзсэн', en: 'Opened' },
  'progress.statusNotStarted': { mn: 'Оролдоогүй', en: 'Not started' },

  // Backend-ээс ирэх алдааны КОД-уудын орчуулга (apiErrors.ts-ийг үз).
  'apiError.generic': { mn: 'Алдаа гарлаа. Дахин оролдоно уу.', en: 'Something went wrong. Please try again.' },
  'apiError.authEmailTaken': { mn: 'Энэ и-мэйл хаяг бүртгэлтэй байна', en: 'This email is already registered' },
  'apiError.authInvalidCredentials': {
    mn: 'И-мэйл эсвэл нууц үг буруу байна',
    en: 'Invalid email or password',
  },
  'apiError.authUserNotFound': { mn: 'Хэрэглэгч олдсонгүй', en: 'User not found' },
  'apiError.courseNotFound': { mn: 'Курс олдсонгүй', en: 'Course not found' },
  'apiError.courseAccessDenied': {
    mn: 'Танд энэ курс рүү хандах эрх алга',
    en: 'You do not have access to this course',
  },
  'apiError.courseNotPublished': {
    mn: 'Энэ курс одоогоор нийтлэгдээгүй байна',
    en: 'This course has not been published yet',
  },
  'apiError.courseAlreadyEnrolled': {
    mn: 'Та энэ курст аль хэдийн элссэн байна',
    en: 'You are already enrolled in this course',
  },
  'apiError.sectionNotFound': { mn: 'Сэдэв олдсонгүй', en: 'Section not found' },
  'apiError.lessonNotFound': { mn: 'Хичээл олдсонгүй', en: 'Lesson not found' },
  'apiError.h5pContentNotFound': { mn: 'H5P контент олдсонгүй', en: 'H5P content not found' },
  'apiError.h5pAccessDenied': {
    mn: 'Танд энэ контентыг үзэх эрх алга',
    en: 'You do not have access to this content',
  },
  'apiError.groupNotFound': { mn: 'Бүлэг олдсонгүй', en: 'Group not found' },
  'apiError.groupStudentsNotFound': {
    mn: 'Заасан и-мэйлтэй хэрэглэгч олдсонгүй',
    en: 'No users found with the specified emails',
  },
} as const;

export type TranslationKey = keyof typeof translations;
