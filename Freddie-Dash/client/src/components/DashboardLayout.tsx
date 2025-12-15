import React from 'react';
import { Link, useLocation } from 'wouter';
import { UserCircle, LogOut, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import freddieMacLogo from '@assets/image_1765386309294.png';
import { useUser, USERS } from '@/lib/userContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, setUser } = useUser();

  const tabs = [
    { name: 'Fake Asset List', path: '/assets' },
    { name: 'TPI', path: '/tpi' },
    { name: 'BTO', path: '/bto' },
    { name: 'CMDB', path: '/cmdb' },
  ];

  const isActive = (path: string) => location === path || (path === '/assets' && location === '/');

  const currentDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Header - White Background */}
      <header className="bg-background border-b border-border shadow-sm z-20">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Logo Area */}
            <Link href="/">
              <a className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
                {/* Freddie Mac Logo */}
                <img 
                  src={freddieMacLogo} 
                  alt="Freddie Mac" 
                  className="h-8 w-auto" 
                />
                
                {/* Heading and Date Display */}
                <div className="flex flex-col justify-center border-l border-muted-foreground/20 pl-6 h-10">
                  <h1 className="text-2xl font-bold leading-none text-primary tracking-tight">FAST DASHBOARD</h1>
                  <span className="text-xs font-medium leading-none text-muted-foreground mt-0.5">{currentDate}</span>
                </div>
              </a>
            </Link>
          </div>

          {/* User Information */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col text-right hidden sm:flex space-y-1">
                <span className="text-sm font-bold leading-none text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground leading-none">{user.email}</span>
                <span className="text-xs font-semibold text-primary leading-none">Role: {user.role}</span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:bg-muted">
                    <UserCircle className="h-9 w-9 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Switch User</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {USERS.map((u) => (
                    <DropdownMenuItem 
                      key={u.email} 
                      onClick={() => setUser(u)}
                      className="flex items-center justify-between"
                    >
                      <span>{u.name} ({u.role})</span>
                      {user.email === u.email && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Primary Color */}
      <nav className="bg-primary text-primary-foreground shadow-md z-10">
        <div className="w-full px-6">
          <div className="flex h-14 space-x-1">
            {tabs.map((tab) => (
              <Link key={tab.path} href={tab.path}>
                <a
                  className={`
                    px-6 h-full flex items-center text-sm font-semibold transition-colors border-b-4 whitespace-nowrap
                    ${isActive(tab.path) 
                      ? 'bg-secondary text-primary border-accent' 
                      : 'text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-white border-transparent'
                    }
                  `}
                >
                  {tab.name}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
