import { format } from 'date-fns';
import { useLocation } from 'wouter';
import { Moon, Sun, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useUser } from '@/lib/userContext';
import freddieMacLogo from '@assets/image_1765386309294.png';

interface PBCLayoutProps {
  children: React.ReactNode;
}

export function PBCLayout({ children }: PBCLayoutProps) {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

  const currentDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={freddieMacLogo} 
                alt="Freddie Mac Logo" 
                className="h-8"
              />
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#1a365d]">
                  PBC AUTOMATION SYSTEM
                </h1>
                <p className="text-sm text-muted-foreground">{currentDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{user?.name || 'John Doe'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'john.doe@freddiemac.com'}</p>
                <p className="text-xs text-muted-foreground">Role: {user?.role || 'User'}</p>
              </div>
              <User className="h-8 w-8 p-1.5 rounded-full bg-muted" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-[#1a365d] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 rounded-none px-4 py-6 flex items-center gap-2"
              onClick={() => setLocation('/')}
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="h-6 w-px bg-white/20 mx-2" />
            <span className="px-4 py-6 text-white/80">
              Self-Service PBC Automation
            </span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
