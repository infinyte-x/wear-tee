import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Layers,
  PanelLeftClose,
  PanelLeft,
  X,
  BarChart3,
  Palette,
  FileText,
  Building2,
  DollarSign,
  Truck,
  UndoDot,
  Boxes,
  Tag,
  FolderOpen,
  Edit3,
  Paintbrush,
  PaintBucket,
  LayoutTemplate,
  FileCode,
  Stamp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
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
  const { settings } = useSiteSettings();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // --- State for collapsible sections ---
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sales: false,
    catalog: false,
    customizations: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- Auto-open based on active route ---
  useEffect(() => {
    const newOpenState = { ...openSections };

    // Sales section
    if (pathname.includes('/admin/orders') || pathname.includes('/admin/transactions') ||
      pathname.includes('/admin/shipments') || pathname.includes('/admin/returns')) {
      newOpenState.sales = true;
    }

    // Catalog section
    if (pathname.includes('/admin/products') || pathname.includes('/admin/categories') ||
      pathname.includes('/admin/attributes')) {
      newOpenState.catalog = true;
    }

    // Customizations section
    if (pathname.includes('/admin/customize')) {
      newOpenState.customizations = true;
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
        <CollapsibleContent className="pl-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
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
        <div className={cn(
          "p-4 lg:p-5 sticky top-0 bg-sidebar/95 z-10 backdrop-blur-sm border-b border-white/5",
          collapsed && !isMobile && "flex flex-col items-center"
        )}>
          <div className={cn(
            "flex items-center justify-between",
            collapsed && !isMobile && "justify-center"
          )}>
            <Link
              to="/"
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 text-lg font-semibold tracking-wide group transition-all duration-300 hover:opacity-80",
                collapsed && !isMobile && "justify-center"
              )}
            >
              <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors duration-300">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
              {(!collapsed || isMobile) && <span className="text-white">{settings?.store_name || 'BrandLaunch'}</span>}
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
          <button
            onClick={onToggleCollapse}
            className={cn(
              "relative flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-300 rounded-lg group w-full",
              "text-white/60 hover:bg-white/5 hover:text-white",
              collapsed && "justify-center px-2"
            )}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4 group-hover:scale-110 group-hover:text-accent/70 transition-all duration-300" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 group-hover:scale-110 group-hover:text-accent/70 transition-all duration-300" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {/* Dashboard */}
          <NavLink to="/admin" icon={LayoutDashboard} exact>Dashboard</NavLink>

          {/* Sales Section */}
          <NavSection id="sales" label="Sales" icon={DollarSign}>
            <NavLink to="/admin/orders" icon={ShoppingCart}>Orders</NavLink>
            <NavLink to="/admin/transactions" icon={DollarSign}>Transactions</NavLink>
            <NavLink to="/admin/shipments" icon={Truck}>Shipments</NavLink>
            <NavLink to="/admin/returns" icon={UndoDot}>Returns</NavLink>
          </NavSection>

          {/* Catalog Section */}
          <NavSection id="catalog" label="Catalog" icon={Package}>
            <NavLink to="/admin/products" icon={Package}>Products</NavLink>
            <NavLink to="/admin/categories" icon={Layers}>Categories</NavLink>
            <NavLink to="/admin/attributes" icon={Tag}>Attributes</NavLink>
          </NavSection>

          {/* Collections - Standalone */}
          <NavLink to="/admin/collections" icon={Boxes}>Collections</NavLink>

          {/* Customizations Section */}
          <NavSection id="customizations" label="Customizations" icon={Paintbrush}>
            <NavLink to="/admin/customize/theme" icon={PaintBucket}>Theme</NavLink>
            <NavLink to="/admin/customize/layout" icon={LayoutTemplate}>Layout</NavLink>
            <NavLink to="/admin/customize/pages" icon={FileCode}>Pages</NavLink>
            <NavLink to="/admin/customize/brand" icon={Stamp}>Brand</NavLink>
          </NavSection>

          {/* Standalone Links */}
          <NavLink to="/admin/customers" icon={Users}>Customers</NavLink>
          <NavLink to="/admin/manage-shop" icon={Building2}>Manage Shop</NavLink>
          <NavLink to="/admin/reports" icon={BarChart3}>Reports</NavLink>

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
