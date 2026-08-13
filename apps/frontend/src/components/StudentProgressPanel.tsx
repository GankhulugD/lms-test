import { CheckCircle2, CircleDashed, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { ContentProgress } from '../types';
import type { TranslationKey } from '../i18n/translations';

interface Props {
  progress: ContentProgress | undefined;
  loading?: boolean;
}

function statusBadge(student: ContentProgress['students'][number], t: (key: TranslationKey) => string) {
  if (student.completed) {
    return (
      <Badge className="gap-1">
        <CheckCircle2 className="size-3" />
        {t('progress.statusCompleted')}
      </Badge>
    );
  }
  if (student.opened) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Eye className="size-3" />
        {t('progress.statusOpened')}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <CircleDashed className="size-3" />
      {t('progress.statusNotStarted')}
    </Badge>
  );
}

export function StudentProgressPanel({ progress, loading }: Props) {
  const { t } = useLanguage();
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t('progress.title')}</CardTitle>
          {progress && (
            <Badge variant="secondary">
              {progress.completedCount}/{progress.totalStudents} {t('progress.completedSuffix')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
        {!loading && (!progress || progress.totalStudents === 0) && (
          <p className="text-sm text-muted-foreground">{t('progress.noStudents')}</p>
        )}
        {!loading && progress && progress.totalStudents > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('progress.colStudent')}</TableHead>
                <TableHead>{t('progress.colStatus')}</TableHead>
                <TableHead>{t('progress.colScore')}</TableHead>
                <TableHead>{t('progress.colAttempts')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {progress.students.map((s) => (
                <TableRow key={s.studentId}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(s, t)}</TableCell>
                  <TableCell>
                    {s.score !== undefined && s.maxScore !== undefined
                      ? `${s.score}/${s.maxScore}`
                      : '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.attempts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
