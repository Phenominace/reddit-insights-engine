'use client';

import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Target,
  LayoutDashboard, 
  Search, 
  FolderOpen, 
  Building2, 
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', label: 'Insights Search', icon: Search },
  { id: 'categories', label: 'Insight Patterns', icon: FolderOpen },
  { id: 'industries', label: 'Industry Presets', icon: Building2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Target className="h-7 w-7 text-lime-500" />
            <span className="font-bold text-slate-900 dark:text-white">Audience AI</span>
          </div>
        )}
        {collapsed && <Target className="h-7 w-7 text-lime-500 mx-auto" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle & Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="outline"
          onClick={toggleTheme}
          className={cn(
            "w-full justify-start gap-3 border-slate-200 dark:border-slate-700",
            collapsed && "justify-center px-2"
          )}
        >
          {theme === 'light' ? (
            <>
              <Moon className="h-5 w-5" />
              {!collapsed && <span>Dark Mode</span>}
            </>
          ) : (
            <>
              <Sun className="h-5 w-5" />
              {!collapsed && <span>Light Mode</span>}
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
