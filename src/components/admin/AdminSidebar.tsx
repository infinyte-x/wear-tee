import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  Store,
  ChevronDown,
  Tags,
  Layers,
  PanelLeftClose,
  PanelLeft,
  X,
  Cog,
  BarChart3,
  Smartphone,
  Palette,
  FileText,
  Ticket,
  UserCog,
  Building2,
  Globe,
  CreditCard,
  MessageSquare,
  Share2,
  Truck,
  Search as SearchIcon,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

const AdminSidebar = ({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
  isMobile = false
}: AdminSidebarProps) => {
  const { signOut } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // --- State for collapsible sections ---
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    configuration: false,
    reports: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- Auto-open based on active route ---
  useEffect(() => {
    const newOpenState = { ...openSections };
    if (pathname.includes('/admin/manage-shop') || pathname.includes('/admin/theme') ||
      pathname.includes('/admin/landing-pages') || pathname.includes('/admin/promo-codes') ||
      pathname.includes('/admin/users-permissions') || pathname.includes('/admin/mobile-app')) {
      newOpenState.configuration = true;
    }
    if (pathname.includes('/admin/analytics') || pathname.includes('/admin/reports')) {
      newOpenState.reports = true;
    }

    setOpenSections(prev => ({ ...prev, ...newOpenState }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close mobile menu on navigation
  const handleNavClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  // --- Helper Components ---
  const NavLink = ({
    to,
    children,
    icon: Icon,
    exact = false,
    className
  }: {
    to: string,
    children: React.ReactNode,
    icon?: any,
    exact?: boolean,
    className?: string
  }) => {
    const active = exact ? pathname === to : pathname.startsWith(to);

    const linkContent = (
      <Link
        to={to}
        onClick={handleNavClick}
        className={cn(
          "relative flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-300 rounded-lg group",
          active
            ? "bg-accent/20 text-white shadow-sm"
            : "text-white/60 hover:bg-white/5 hover:text-white",
          collapsed && !isMobile && "justify-center px-2",
          className
        )}
      >
        {/* Active indicator bar */}
        <span className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-accent transition-all duration-300",
          active ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )} />
        {Icon && <Icon className={cn(
          "h-4 w-4 flex-shrink-0 transition-all duration-300",
          active ? "text-accent" : "group-hover:scale-110 group-hover:text-accent/70"
        )} />}
        {!Icon && !collapsed && <span className="h-4 w-4 block" />}
        {(!collapsed || isMobile) && <span className="font-medium truncate">{children}</span>}
      </Link>
    );

    // Show tooltip when collapsed on desktop
    if (collapsed && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-sidebar text-white border-white/20">
            {children}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  const NavSection = ({
    id,
    label,
    icon: Icon,
    children
  }: {
    id: string,
    label: string,
    icon: any,
    children: React.ReactNode
  }) => {
    const isOpen = openSections[id];

    // Collapsed mode - just show icon with tooltip
    if (collapsed && !isMobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => toggleSection(id)}
              className={cn(
                "flex items-center justify-center w-full px-2 py-3 text-sm rounded-lg transition-all duration-300 group",
                isOpen
                  ? "bg-white/5 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-all duration-300",
                isOpen ? "text-accent" : "group-hover:scale-110 group-hover:text-accent/70"
              )} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-sidebar text-white border-white/20">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleSection(id)} className="space-y-1">
        <CollapsibleTrigger className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-sm tracking-wide rounded-lg transition-all duration-300 group",
          isOpen
            ? "bg-white/5 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        )}>
          <div className="flex items-center gap-3">
            <Icon className={cn(
              "h-4 w-4 transition-all duration-300",
              isOpen ? "text-accent" : "group-hover:scale-110 group-hover:text-accent/70"
            )} />
            <span className="font-medium">{label}</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 opacity-60 transition-transform duration-300",
            isOpen ? "rotate-0" : "-rotate-90"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-1 border-l-2 border-white/10 ml-6 animate-in slide-in-from-top-2 duration-200">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  };


  return (
    <TooltipProvider>
      <aside className={cn(
        "h-full bg-sidebar text-sidebar-text border-r border-white/5 flex flex-col overflow-y-auto transition-all duration-300",
        collapsed && !isMobile ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="p-4 lg:p-5 sticky top-0 bg-sidebar/95 z-10 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 text-lg font-semibold tracking-wide group transition-all duration-300 hover:opacity-80",
                collapsed && !isMobile && "justify-center"
              )}
            >
              <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors duration-300">
                <Store className="h-5 w-5 text-accent" />
              </div>
              {(!collapsed || isMobile) && <span className="text-white">BrandLaunch</span>}
            </Link>

            {/* Mobile close button */}
            {isMobile && onCloseMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseMobile}
                className="text-white/60 hover:text-white hover:bg-white/10 lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {(!collapsed || isMobile) && (
            <p className="text-[10px] text-white/40 mt-2 tracking-[0.2em] uppercase font-medium">
              Merchant Panel
            </p>
          )}
        </div>

        {/* Collapse Toggle - Desktop only */}
        <div className="px-3 mb-2 hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn(
              "w-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 mr-2" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {/* Main Navigation - Zatiq Style */}
          <NavLink to="/admin" icon={LayoutDashboard} exact>Dashboard</NavLink>
          <NavLink to="/admin/orders" icon={ShoppingCart}>Orders</NavLink>
          <NavLink to="/admin/products" icon={Package}>Products</NavLink>
          <NavLink to="/admin/categories" icon={Layers}>Categories</NavLink>
          <NavLink to="/admin/customers" icon={Users}>Customers</NavLink>

          {/* Divider */}
          {(!collapsed || isMobile) && (
            <div className="pt-4 pb-2">
              <div className="text-[10px] text-white/40 uppercase tracking-wider font-medium px-4">Configuration</div>
            </div>
          )}

          {/* Configuration Section */}
          <NavSection id="configuration" label="Configuration" icon={Cog}>
            <NavLink to="/admin/manage-shop" icon={Building2}>Manage Shop</NavLink>
            <NavLink to="/admin/mobile-app" icon={Smartphone}>Mobile App Request</NavLink>
            <NavLink to="/admin/theme" icon={Palette}>Customize Theme</NavLink>
            <NavLink to="/admin/landing-pages" icon={FileText}>Landing Pages</NavLink>
            <NavLink to="/admin/promo-codes" icon={Ticket}>Promo Codes</NavLink>
            <NavLink to="/admin/users-permissions" icon={UserCog}>Users & Permissions</NavLink>
          </NavSection>

          {/* Reports Section */}
          {(!collapsed || isMobile) && (
            <div className="pt-4 pb-2">
              <div className="text-[10px] text-white/40 uppercase tracking-wider font-medium px-4">Reports</div>
            </div>
          )}

          <NavSection id="reports" label="Reports" icon={BarChart3}>
            <NavLink to="/admin/analytics" icon={TrendingUp}>Analytics</NavLink>
          </NavSection>

          {/* Settings - Direct Link */}
          <NavLink to="/admin/settings" icon={Settings} className="mt-4">Settings</NavLink>

        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-sidebar sticky bottom-0">
          <Button
            variant="ghost"
            onClick={signOut}
            className={cn(
              "w-full text-white/60 hover:text-red-400 hover:bg-red-500/10 px-3 py-2.5 rounded-lg transition-all duration-300 group",
              collapsed && !isMobile ? "justify-center" : "justify-start"
            )}
          >
            <LogOut className={cn(
              "h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1",
              !collapsed || isMobile ? "mr-3" : ""
            )} />
            {(!collapsed || isMobile) && <span className="font-medium">Sign Out</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AdminSidebar;
