import { GraduationCap, LogOut, Moon, Sun } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Админ',
  [UserRole.TEACHER]: 'Багш',
  [UserRole.STUDENT]: 'Сурагч',
};

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <GraduationCap className="size-5 text-primary" />
            LMS
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Цайвар горим' : 'Шөнийн горим'}
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none">
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {roleLabels[user.role]}
                  </Badge>
                  <Avatar size="sm">
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} variant="destructive">
                    <LogOut />
                    Гарах
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
