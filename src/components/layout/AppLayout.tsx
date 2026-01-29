import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileBarChart, 
  Settings, 
  Upload,
  Bell,
  Menu,
  X,
  ChevronLeft,
  Factory,
  GanttChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  alertCount?: number;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Encomendas', icon: Package },
  { id: 'timeline', label: 'Timeline', icon: GanttChart },
  { id: 'reports', label: 'Relatórios', icon: FileBarChart },
  { id: 'import', label: 'Importar', icon: Upload },
];

export const AppLayout = ({ children, currentPage, onPageChange, alertCount = 0 }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">OrderFlow</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent relative">
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-status-danger">
              {alertCount}
            </Badge>
          )}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-16"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen bg-sidebar z-40 transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-20",
          "hidden lg:flex",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center w-full")}>
            <Factory className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-bold text-xl text-sidebar-foreground">OrderFlow</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      !sidebarOpen && "justify-center"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-sidebar-border">
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "w-full text-sidebar-foreground hover:bg-sidebar-accent",
              !sidebarOpen && "justify-center"
            )}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", !sidebarOpen && "rotate-180")} />
            {sidebarOpen && <span className="ml-2">Recolher</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          "lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-sidebar z-40 transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="py-4 px-3">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "min-h-screen transition-all duration-300 pt-16 lg:pt-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b bg-card">
          <h1 className="text-lg font-semibold text-foreground capitalize">
            {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-status-danger text-white">
                  {alertCount}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
