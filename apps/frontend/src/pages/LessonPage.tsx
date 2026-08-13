import { ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { lessonsApi } from '../api/catalog';
import { progressApi } from '../api/progress';
import { H5pContentBlock } from '../components/H5pContentBlock';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole, type Lesson, type LessonProgress } from '../types';

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isTeacher = user?.role === UserRole.TEACHER || user?.role === UserRole.ADMIN;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const autoOpenedRef = useRef(false);

  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

  async function reload() {
    if (!lessonId) return;
    const data = await lessonsApi.get(lessonId);
    setLesson(data);
    return data;
  }

  async function reloadProgress() {
    if (!lessonId || !isTeacher) return;
    setProgressLoading(true);
    try {
      setProgress(await progressApi.lessonProgress(lessonId));
    } finally {
      setProgressLoading(false);
    }
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    if (isTeacher) reloadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, isTeacher]);

  // Lumi-шиг UX: хичээлд одоогоор контент байхгүй бол багш нэвтэрсэн даруйдаа
  // шууд контент editor-ыг харах ёстой — нэмэлт товч дарах шаардлагагүй.
  useEffect(() => {
    if (lesson && isTeacher && lesson.h5pContentIds.length === 0 && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      setCreating(true);
    }
  }, [lesson, isTeacher]);

  async function handleContentCreated() {
    setCreating(false);
    await reload();
    await reloadProgress();
  }

  if (loading || !lesson) return <p className="text-sm text-muted-foreground">{t('common.loading')}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to={`/courses/${lesson.courseId}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t('lesson.back')}
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">{lesson.title}</h1>
          <div className="flex items-center gap-2">
            {isTeacher && (
              <Button variant="outline" size="sm" onClick={reloadProgress} disabled={progressLoading}>
                <RefreshCw className={progressLoading ? 'animate-spin' : ''} />
                {t('lesson.refreshProgress')}
              </Button>
            )}
            {isTeacher && !creating && (
              <Button onClick={() => setCreating(true)}>
                <Plus />
                {t('lesson.addContent')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {creating && (
        <H5pContentBlock
          lessonId={lessonId!}
          isTeacher={isTeacher}
          onSaved={handleContentCreated}
          onCancelCreate={() => setCreating(false)}
        />
      )}

      {!creating && lesson.h5pContentIds.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('lesson.noContent')}</p>
      )}

      <div className="flex flex-col gap-6">
        {lesson.h5pContentIds.map((contentId) => (
          <H5pContentBlock
            key={contentId}
            lessonId={lessonId!}
            contentId={contentId}
            isTeacher={isTeacher}
            progress={progress?.contents.find((c) => c.contentId === contentId)}
            progressLoading={progressLoading}
            onDeleted={() => {
              reload();
              reloadProgress();
            }}
            onSaved={() => {
              reload();
              reloadProgress();
            }}
          />
        ))}
      </div>
    </div>
  );
}
