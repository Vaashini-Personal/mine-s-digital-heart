import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: ReactNode;
  running?: boolean;
  onToggleSimulation?: () => void;
  alertCount?: number;
}

export function AppLayout({ children, running, onToggleSimulation, alertCount = 0 }: Props) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-xs font-mono text-muted-foreground">SCADA CONTROL</span>
            </div>
            <div className="flex items-center gap-3">
              {alertCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {alertCount} Alerts
                </Badge>
              )}
              {onToggleSimulation && (
                <button
                  onClick={onToggleSimulation}
                  className={`text-xs font-mono px-3 py-1 rounded border transition-colors ${
                    running
                      ? 'border-success text-success bg-success/10'
                      : 'border-muted-foreground text-muted-foreground bg-muted'
                  }`}
                >
                  {running ? '● LIVE' : '○ PAUSED'}
                </button>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
