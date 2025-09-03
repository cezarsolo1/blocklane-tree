import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import AppFooter from '@/components/AppFooter';
import { 
  Home, 
  Plus, 
  Activity, 
  LogOut, 
  Menu,
  X,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Nieuwe melding', href: '/wizard', icon: Plus },
  { name: 'Status', href: '/status', icon: Activity },
];

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Don't show AppShell on auth pages
  if (location.pathname.startsWith('/auth') || location.pathname === '/logout' || location.pathname.startsWith('/end/')) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-end px-6 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          {user && (
            <div className="space-y-3">
              <div className="px-3 py-2">
                <p className="text-sm text-muted-foreground">Ingelogd als</p>
                <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              </div>
              <Link
                to="/logout"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Uitloggen
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-16 items-center gap-4 px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 flex-1">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
        <AppFooter />
      </div>
    </div>
  );
}