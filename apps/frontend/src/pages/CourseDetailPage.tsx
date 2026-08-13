import { CheckCircle2, FileText, Plus, Users } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { coursesApi, lessonsApi, sectionsApi } from '../api/catalog';
import { enrollmentApi, groupsApi } from '../api/enrollment';
import { progressApi } from '../api/progress';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole, type Course, type Enrollment, type Group, type Lesson, type Section } from '../types';

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isTeacher = user?.role === UserRole.TEACHER || user?.role === UserRole.ADMIN;

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [lessonsBySection, setLessonsBySection] = useState<Record<string, Lesson[]>>({});
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [roster, setRoster] = useState<Enrollment[]>([]);
  const [lessonCompletion, setLessonCompletion] = useState<Record<string, { completed: number; total: number }>>({});
  const [loading, setLoading] = useState(true);

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState<Record<string, string>>({});
  const [newGroupName, setNewGroupName] = useState('');
  const [addEmailsByGroup, setAddEmailsByGroup] = useState<Record<string, string>>({});

  const isEnrolled = myEnrollments.some((e) => {
    const cId = typeof e.courseId === 'string' ? e.courseId : e.courseId._id;
    return cId === courseId;
  });

  async function reloadAll() {
    if (!courseId) return;
    const [courseData, sectionsData] = await Promise.all([
      coursesApi.get(courseId),
      sectionsApi.list(courseId),
    ]);
    setCourse(courseData);
    setSections(sectionsData);

    const lessonsMap: Record<string, Lesson[]> = {};
    await Promise.all(
      sectionsData.map(async (s) => {
        lessonsMap[s._id] = await lessonsApi.list(s._id);
      }),
    );
    setLessonsBySection(lessonsMap);

    if (user?.role === UserRole.STUDENT) {
      setMyEnrollments(await enrollmentApi.myEnrollments());
    }
    if (isTeacher) {
      const [groupsData, rosterData] = await Promise.all([
        groupsApi.list(courseId),
        enrollmentApi.roster(courseId),
      ]);
      setGroups(groupsData);
      setRoster(rosterData);

      // Хичээл бүрийн H5P контентын гүйцэтгэлийн явцыг нэгтгэж, курсын
      // жагсаалт дээр л шууд харагдахуйц болгоно (нэмэлт клик хэрэггүй).
      const lessonsWithContent = Object.values(lessonsMap)
        .flat()
        .filter((l) => l.h5pContentIds.length > 0);
      const progressResults = await Promise.all(
        lessonsWithContent.map((l) => progressApi.lessonProgress(l._id).catch(() => null)),
      );
      const completionMap: Record<string, { completed: number; total: number }> = {};
      lessonsWithContent.forEach((lesson, idx) => {
        const result = progressResults[idx];
        if (!result) return;
        const completed = result.contents.reduce((sum, c) => sum + c.completedCount, 0);
        const total = result.contents.reduce((sum, c) => sum + c.totalStudents, 0);
        completionMap[lesson._id] = { completed, total };
      });
      setLessonCompletion(completionMap);
    }
  }

  useEffect(() => {
    reloadAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function handleAddSection(e: FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    await sectionsApi.create(courseId, { title: newSectionTitle, order: sections.length + 1 });
    setNewSectionTitle('');
    await reloadAll();
  }

  async function handleAddLesson(sectionId: string, e: FormEvent) {
    e.preventDefault();
    const title = newLessonTitle[sectionId] || '';
    if (!title) return;
    await lessonsApi.create(sectionId, {
      title,
      order: (lessonsBySection[sectionId]?.length ?? 0) + 1,
    });
    setNewLessonTitle((prev) => ({ ...prev, [sectionId]: '' }));
    await reloadAll();
  }

  async function handleEnroll() {
    if (!courseId) return;
    await enrollmentApi.enrollSelf(courseId);
    await reloadAll();
  }

  async function handlePublishToggle() {
    if (!courseId || !course) return;
    await coursesApi.update(courseId, { published: !course.published });
    await reloadAll();
  }

  async function handleCreateGroup(e: FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    await groupsApi.create(courseId, newGroupName);
    setNewGroupName('');
    await reloadAll();
  }

  async function handleAddStudents(groupId: string, e: FormEvent) {
    e.preventDefault();
    const raw = addEmailsByGroup[groupId] || '';
    const emails = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (emails.length === 0) return;
    await groupsApi.addStudents(groupId, emails);
    setAddEmailsByGroup((prev) => ({ ...prev, [groupId]: '' }));
    await reloadAll();
  }

  if (loading || !course) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">{course.title}</h1>
          <div className="flex items-center gap-2">
            {isTeacher && (
              <Button variant={course.published ? 'outline' : 'default'} onClick={handlePublishToggle}>
                {course.published ? t('courseDetail.unpublish') : t('courseDetail.publish')}
              </Button>
            )}
            {user?.role === UserRole.STUDENT && !isEnrolled && course.published && (
              <Button onClick={handleEnroll}>{t('courseDetail.enroll')}</Button>
            )}
            {user?.role === UserRole.STUDENT && isEnrolled && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="size-3" />
                {t('courseDetail.enrolled')}
              </Badge>
            )}
          </div>
        </div>
        <p className="mt-1 text-muted-foreground">{course.description}</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">{t('courseDetail.sectionsTitle')}</h2>
        <div className="flex flex-col gap-4">
          {sections.map((section) => (
            <Card key={section._id}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul className="flex flex-col gap-1">
                  {(lessonsBySection[section._id] || []).map((lesson) => (
                    <li key={lesson._id}>
                      <Link
                        to={`/lessons/${lesson._id}`}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="size-3.5 text-muted-foreground" />
                          {lesson.title}
                        </span>
                        <span className="flex items-center gap-2">
                          {isTeacher && lessonCompletion[lesson._id] && lessonCompletion[lesson._id].total > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle2 className="size-3" />
                              {lessonCompletion[lesson._id].completed}/{lessonCompletion[lesson._id].total}{' '}
                              {t('courseDetail.completedSuffix')}
                            </Badge>
                          )}
                          <Badge variant="secondary">{lesson.h5pContentIds.length} H5P</Badge>
                        </span>
                      </Link>
                    </li>
                  ))}
                  {(lessonsBySection[section._id] || []).length === 0 && (
                    <li className="px-3 py-2 text-sm text-muted-foreground">{t('courseDetail.noLessons')}</li>
                  )}
                </ul>
                {isTeacher && (
                  <>
                    <Separator />
                    <form onSubmit={(e) => handleAddLesson(section._id, e)} className="flex gap-2">
                      <Input
                        placeholder={t('courseDetail.newLessonPlaceholder')}
                        value={newLessonTitle[section._id] || ''}
                        onChange={(e) =>
                          setNewLessonTitle((prev) => ({ ...prev, [section._id]: e.target.value }))
                        }
                      />
                      <Button type="submit" variant="secondary">
                        <Plus />
                        {t('courseDetail.addLesson')}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {isTeacher && (
          <form onSubmit={handleAddSection} className="mt-4 flex gap-2">
            <Input
              placeholder={t('courseDetail.newSectionPlaceholder')}
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              required
            />
            <Button type="submit">
              <Plus />
              {t('courseDetail.addSection')}
            </Button>
          </form>
        )}
      </section>

      {isTeacher && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Users className="size-4" />
            {t('courseDetail.groupsTitle')}
          </h2>
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <Card key={group._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {group.name}
                    <Badge variant="secondary">
                      {group.studentIds.length} {t('courseDetail.studentsCountSuffix')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleAddStudents(group._id, e)} className="flex gap-2">
                    <Input
                      placeholder={t('courseDetail.addStudentsPlaceholder')}
                      value={addEmailsByGroup[group._id] || ''}
                      onChange={(e) =>
                        setAddEmailsByGroup((prev) => ({ ...prev, [group._id]: e.target.value }))
                      }
                    />
                    <Button type="submit" variant="secondary">
                      {t('common.add')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
          <form onSubmit={handleCreateGroup} className="mt-4 flex gap-2">
            <Input
              placeholder={t('courseDetail.newGroupPlaceholder')}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
            />
            <Button type="submit">
              <Plus />
              {t('courseDetail.addGroup')}
            </Button>
          </form>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">
                {t('courseDetail.rosterTitle')} ({roster.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1 text-sm">
                {roster.map((e) => {
                  const student = typeof e.studentId === 'string' ? null : e.studentId;
                  return (
                    <li key={e._id} className="rounded-md px-3 py-1.5 text-muted-foreground">
                      {student ? `${student.name} (${student.email})` : String(e.studentId)}
                    </li>
                  );
                })}
                {roster.length === 0 && (
                  <li className="px-3 py-1.5 text-muted-foreground">{t('courseDetail.noRoster')}</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
