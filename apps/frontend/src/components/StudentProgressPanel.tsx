import { CheckCircle2, CircleDashed, Eye } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { ContentProgress } from '../types';

interface Props {
  progress: ContentProgress | undefined;
  loading?: boolean;
}

function statusBadge(student: ContentProgress['students'][number]) {
  if (student.completed) {
    return (
      <Badge className="gap-1">
        <CheckCircle2 className="size-3" />
        Дуусгасан
      </Badge>
    );
  }
  if (student.opened) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Eye className="size-3" />
        Үзсэн
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <CircleDashed className="size-3" />
      Оролдоогүй
    </Badge>
  );
}

export function StudentProgressPanel({ progress, loading }: Props) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Сурагчдын явц
          </CardTitle>
          {progress && (
            <Badge variant="secondary">
              {progress.completedCount}/{progress.totalStudents} дуусгасан
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Ачааллаж байна...</p>}
        {!loading && (!progress || progress.totalStudents === 0) && (
          <p className="text-sm text-muted-foreground">Энэ course-д одоогоор элссэн сурагч алга.</p>
        )}
        {!loading && progress && progress.totalStudents > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сурагч</TableHead>
                <TableHead>Төлөв</TableHead>
                <TableHead>Оноо</TableHead>
                <TableHead>Оролдлого</TableHead>
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
                  <TableCell>{statusBadge(s)}</TableCell>
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
