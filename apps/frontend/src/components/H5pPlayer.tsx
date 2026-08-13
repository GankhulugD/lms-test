import { H5PPlayerUI } from '@lumieducation/h5p-react';
import { h5pApi } from '../api/h5p';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  contentId: string;
  /** Сурагчийн явцыг (нээсэн/дуусгасан/оноо) backend рүү илгээх эсэх. */
  trackProgress?: boolean;
}

/**
 * @lumieducation/h5p-react-ийн H5PPlayerUI-г бидний backend-тэй холбоно.
 * loadContentCallback-ийн буцаах утга нь H5PPlayer.render()-ийн үр дүн
 * (IPlayerModel) яг таг байх ёстой — бидний /h5p-content/:id/play endpoint
 * үүнийг шууд буцаадаг тул нэмэлт хөрвүүлэлт хэрэггүй.
 *
 * trackProgress=true бол H5P контент дотроос ирэх xAPI event-үүдийг
 * (initialized, xAPI statement) барьж авч, сурагчийн явцыг backend-д хадгална.
 */
export function H5pPlayer({ contentId, trackProgress = false }: Props) {
  const { language } = useLanguage();
  return (
    <H5PPlayerUI
      contentId={contentId}
      loadContentCallback={() => h5pApi.playerModel(contentId, language)}
      onInitialized={
        trackProgress
          ? () => {
              h5pApi.reportOpen(contentId).catch(() => {});
            }
          : undefined
      }
      onxAPIStatement={
        trackProgress
          ? (statement) => {
              handleXapiStatement(contentId, statement);
            }
          : undefined
      }
    />
  );
}

/**
 * H5P контент төрөл бүр (Multiple Choice, Interactive Video, ...) харилцан
 * адилгүй xAPI statement илгээдэг ч ихэнхдээ `result.completion`/`result.score`
 * агуулдаг. Эдгээр талбар байгаа тохиолдолд л "бодит оролдлого" гэж үзэн
 * backend-д хадгалуулна — үгүй бол дуугүй орхино (жиш: "attempted" verb).
 */
function handleXapiStatement(contentId: string, statement: any) {
  const result = statement?.result;
  if (!result || (result.completion === undefined && result.score === undefined)) {
    return;
  }

  const verbId: string | undefined = statement?.verb?.id;
  h5pApi
    .reportResult(contentId, {
      score: result.score?.raw,
      maxScore: result.score?.max,
      completed: !!result.completion,
      success: typeof result.success === 'boolean' ? result.success : undefined,
      verb: verbId ? verbId.split('/').pop() : undefined,
    })
    .catch(() => {});
}
