import { forwardRef, useImperativeHandle, useRef } from 'react';
import { H5PEditorUI } from '@lumieducation/h5p-react';
import { h5pApi } from '../api/h5p';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  lessonId: string;
  /** Байгаа контентыг засварлах бол contentId, шинээр үүсгэх бол undefined. */
  contentId?: string;
  onSaved?: (contentId: string) => void;
  onSaveError?: (message: string) => void;
}

export interface H5pEditorHandle {
  save: () => Promise<void>;
}

/**
 * H5P core client "шинэ контент" горимыг зөвхөн contentId === 'new' (тодорхой
 * энэ мөр утгаар!) мөрөөр л таньдаг тул энд шууд дамжуулж байна.
 *
 * saveContentCallback-аас ирэх requestBody.params нь бодит H5P контентын
 * {metadata, params} хоёуланг НЭГ дор агуулдаг (H5P core client-ийн дотоод
 * хэрэгжилтээс шалтгаална) — тэдгээрийг тусад нь салгаж backend руу дамжуулна.
 */
export const H5pEditor = forwardRef<H5pEditorHandle, Props>(function H5pEditor(
  { lessonId, contentId, onSaved, onSaveError },
  ref,
) {
  const editorRef = useRef<any>(null);
  const { language } = useLanguage();

  useImperativeHandle(ref, () => ({
    save: async () => {
      await editorRef.current?.save();
    },
  }));

  return (
    <H5PEditorUI
      ref={editorRef}
      contentId={contentId ?? 'new'}
      loadContentCallback={async (id) => {
        if (!id) {
          return h5pApi.newEditorModel(lessonId, language);
        }
        const data = await h5pApi.editorModel(id, language);
        return {
          integration: data.integration,
          scripts: data.scripts,
          styles: data.styles,
          library: data.content.library,
          metadata: data.content.params.metadata,
          params: data.content.params.params,
        };
      }}
      saveContentCallback={async (id, requestBody) => {
        const mainLibraryUbername = requestBody.library;
        const { metadata, params } = requestBody.params;
        const result = id
          ? await h5pApi.update(id, { mainLibraryUbername, metadata, params })
          : await h5pApi.create(lessonId, { mainLibraryUbername, metadata, params });
        onSaved?.(result.contentId);
        return result;
      }}
      onSaveError={(message) => onSaveError?.(message)}
    />
  );
});
