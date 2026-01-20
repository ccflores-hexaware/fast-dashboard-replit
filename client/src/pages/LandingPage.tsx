import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileCheck } from 'lucide-react';
import freddieMacLogo from '@assets/image_1765386309294.png';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <header className="border-b bg-white dark:bg-slate-950 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <img 
              src={freddieMacLogo} 
              alt="Freddie Mac Logo" 
              className="h-8"
            />
            <div className="h-6 w-px bg-border" />
            <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Enterprise IT Management
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Welcome to IAM Suite</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Select an application to continue
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary group flex flex-col"
              onClick={() => setLocation('/fast')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <LayoutDashboard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">FAST Dashboard</CardTitle>
                <CardDescription className="text-base">Full Asset Status Tracker</CardDescription>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-1">
                <p className="text-sm text-muted-foreground mb-4 flex-1">Manage technology portfolios across Assets, TPI, BTO, and CMDB modules. Full CRUD capabilities for administrators.</p>
                <Button className="w-full" variant="outline">
                  Open FAST Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary group flex flex-col"
              onClick={() => setLocation('/pbc')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                  <FileCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">PBC Automation</CardTitle>
                <CardDescription className="text-base">
                  Self-Service Control Evidence System
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-1">
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Request control execution evidence for auditors. 
                  Automated evidence generation for IAM controls with Excel export.
                </p>
                <Button className="w-full" variant="outline">
                  Open PBC System
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t bg-white dark:bg-slate-950 py-4">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">Freddie Mac Enterprise IAM Suite</div>
      </footer>
    </div>
  );
}
