import { BookOpen, Plus } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../api/catalog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { UserRole, type Course } from '../types';

export function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function reload() {
    return coursesApi.list().then(setCourses);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await coursesApi.create({ title, description });
    setTitle('');
    setDescription('');
    setShowCreate(false);
    await reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Хичээлүүд</h1>
        {user?.role === UserRole.TEACHER && (
          <Button onClick={() => setShowCreate((v) => !v)}>
            <Plus />
            Шинэ хичээл
          </Button>
        )}
      </div>

      {showCreate && (
        <Card className="mb-6">
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <Input
                placeholder="Гарчиг"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Тайлбар"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button type="submit" className="self-start">
                Үүсгэх
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course._id} to={`/courses/${course._id}`}>
              <Card className="h-full transition hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="size-4 text-primary" />
                      {course.title}
                    </CardTitle>
                    <Badge variant={course.published ? 'default' : 'secondary'}>
                      {course.published ? 'Нийтэлсэн' : 'Ноорог'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {course.description || 'Тайлбар байхгүй'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {courses.length === 0 && (
            <p className="text-sm text-muted-foreground">Хичээл олдсонгүй.</p>
          )}
        </div>
      )}
    </div>
  );
}
