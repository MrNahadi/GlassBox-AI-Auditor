import { Link, Outlet, useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeSelector } from './ThemeSelector';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Live Audit' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/glossary', label: 'Glossary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Eye className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-lg"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Glassbox AI</h1>
                <p className="text-xs text-muted-foreground">Transparent Governance</p>
              </div>
            </div>

            <nav className="flex items-center space-x-6">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === item.path
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <ThemeSelector />
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Glassbox AI - Empowering transparent and accountable governance</p>
        </div>
      </footer>
    </div>
  );
}
