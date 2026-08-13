import { Check, Eye, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { h5pApi } from '../api/h5p';
import { useLanguage } from '../context/LanguageContext';
import { H5pEditor, type H5pEditorHandle } from './H5pEditor';
import { H5pPlayer } from './H5pPlayer';
import { StudentProgressPanel } from './StudentProgressPanel';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import type { ContentProgress } from '../types';

interface Props {
  lessonId: string;
  /** Байгаа контентыг харах/засварлах бол contentId, шинээр үүсгэх бол undefined. */
  contentId?: string;
  isTeacher: boolean;
  progress?: ContentProgress;
  progressLoading?: boolean;
  onDeleted?: () => void;
  /** contentId шинээр үүссэн (эсвэл засварлагдсан) үед дуудагдана. */
  onSaved: (contentId: string) => void;
  /** Зөвхөн шинэ контент үүсгэх горимд ("Цуцлах" товч). */
  onCancelCreate?: () => void;
}

/**
 * Lumi-шиг "Харах / Засварлах" tab-тай H5P контентын карт. Шинэ контент
 * үүсгэх (contentId === undefined) болон байгаа контентыг засварлах хоёр
 * горимыг НЭГ л компонент, НЭГ л UI хэлбэрээр (tab toggle) харуулна —
 * ингэснээр интерфэйс хаана ч ижил, тогтвортой мэдрэмж өгнө.
 *
 * Шинээр үүсгэх үед "Харах" tab түр disabled байна, учир нь H5P контент
 * анх удаа хадгалагдаж, contentId үүсэх хүртэл тоглуулах юм байхгүй.
 */
export function H5pContentBlock({
  lessonId,
  contentId,
  isTeacher,
  progress,
  progressLoading,
  onDeleted,
  onSaved,
  onCancelCreate,
}: Props) {
  const { t } = useLanguage();
  const isNew = !contentId;
  const [tab, setTab] = useState<'view' | 'edit'>(isNew ? 'edit' : 'view');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  // Хадгалагдах болгонд нэмэгддэг тоолуур — "Харах" tab-ийг үргэлж хамгийн
  // сүүлд хадгалагдсан хувилбараар дахин ачаалуулахын тулд H5pPlayer-ийн
  // key-д ашиглана (contentId өөрөө өөрчлөгддөггүй тул component
  // remount хийхгүй бол хуучин cache-лэгдсэн өгөгдөл харагдах эрсдэлтэй).
  const [playerVersion, setPlayerVersion] = useState(0);
  const editorRef = useRef<H5pEditorHandle>(null);

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [justSaved]);

  async function handleDelete() {
    if (!contentId) return;
    if (!confirm(t('h5p.deleteConfirm'))) return;
    await h5pApi.remove(contentId);
    onDeleted?.();
  }

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    try {
      await editorRef.current?.save();
      // Дундаас нь хадгалаад Edit tab дээрээ үлдэж, гүйцээж болохоор — "Харах"
      // tab руу албадан шилжүүлдэггүй. Дараа нь тэр хэрэглэгч өөрөө "Харах"
      // дээр дархад hадгалагдсан хамгийн сүүлийн хувилбар шууд харагдана.
      if (!isNew) {
        setPlayerVersion((v) => v + 1);
        setJustSaved(true);
      }
    } catch {
      // H5pEditor-ийн onSaveError аль хэдийн мессежийг барьсан
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      {isTeacher && (
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'view' | 'edit')}>
              <TabsList>
                <TabsTrigger value="view" disabled={isNew} title={isNew ? t('h5p.saveFirst') : undefined}>
                  <Eye />
                  {t('h5p.view')}
                </TabsTrigger>
                <TabsTrigger value="edit">
                  <Pencil />
                  {t('h5p.edit')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              {justSaved && (
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <Check className="size-4" />
                  {t('h5p.saved')}
                </span>
              )}
              {tab === 'edit' && (
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? t('common.saving') : t('common.save')}
                </Button>
              )}
              {isNew ? (
                <Button size="sm" variant="outline" onClick={onCancelCreate}>
                  <X />
                  {t('common.cancel')}
                </Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  <Trash2 />
                  {t('h5p.delete')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {saveError && <p className="mb-2 text-sm text-destructive">{saveError}</p>}
        {tab === 'view' && !isNew ? (
          <H5pPlayer key={`${contentId}-${playerVersion}`} contentId={contentId} trackProgress={!isTeacher} />
        ) : (
          <H5pEditor
            ref={editorRef}
            lessonId={lessonId}
            contentId={contentId}
            onSaveError={setSaveError}
            onSaved={onSaved}
          />
        )}
      </CardContent>
      {isTeacher && !isNew && (
        <div className="px-4 pb-4">
          <StudentProgressPanel progress={progress} loading={progressLoading} />
        </div>
      )}
    </Card>
  );
}
