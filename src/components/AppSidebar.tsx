import {
  LayoutDashboard, Box, Cpu, Map, Users, Fan, AlertTriangle, Zap, BrainCircuit, Truck, HeartPulse, FileText, Settings
} from 'lucide-react';
import spritleLogo from '@/assets/spritle-logo.png';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';

const navGroups = [
  {
    label: 'MONITORING',
    items: [
      { title: 'Dashboard', url: '/', icon: LayoutDashboard },
      { title: 'Mine Map', url: '/map', icon: Map },
      { title: 'Worker Tracking', url: '/workers', icon: Users },
    ],
  },
  {
    label: 'CONTROL',
    items: [
      { title: 'Ventilation', url: '/ventilation', icon: Fan },
      { title: 'Alerts & Safety', url: '/alerts', icon: AlertTriangle, badge: true },
      { title: 'Energy', url: '/energy', icon: Zap },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { title: 'AI Predictions', url: '/predictions', icon: BrainCircuit },
      { title: 'Digital Twin', url: '/digital-twin', icon: Box },
    ],
  },
  {
    label: 'ASSETS',
    items: [
      { title: 'Devices', url: '/devices', icon: Cpu },
      { title: 'Device Health', url: '/health', icon: HeartPulse },
      { title: 'Fleet Management', url: '/fleet', icon: Truck },
      { title: 'Reports', url: '/reports', icon: FileText },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];

interface Props {
  alertCount?: number;
}

export function AppSidebar({ alertCount = 0 }: Props) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className={`p-4 pb-2 ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Fan className="h-4 w-4 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-sm font-bold text-foreground tracking-wide">SmartMine</h1>
                <p className="text-[10px] text-muted-foreground">VoD Control System</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav groups */}
        <div className="flex-1 overflow-auto">
          {navGroups.map(group => (
            <SidebarGroup key={group.label}>
              {!collapsed && (
                <SidebarGroupLabel className="text-[10px] tracking-widest text-muted-foreground/70 font-medium px-4">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map(item => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === '/'}
                          className="hover:bg-sidebar-accent/60 transition-colors"
                          activeClassName="bg-primary/15 text-primary font-medium border-l-2 border-primary"
                        >
                          <item.icon className="mr-2.5 h-4 w-4 shrink-0" />
                          {!collapsed && (
                            <span className="flex-1">{item.title}</span>
                          )}
                          {!collapsed && 'badge' in item && item.badge && alertCount > 0 && (
                            <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {alertCount}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <div>
                <p className="text-xs font-medium text-foreground">System Online</p>
                <p className="text-[10px] text-muted-foreground">VoD v2.4.1 · SCADA linked</p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
