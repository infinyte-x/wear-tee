import { ShoppingBag, Menu, Search, User, Heart, Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/SearchDialog";

interface NavbarProps {
  cartCount?: number;
}

const Navbar = ({ cartCount = 0 }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { settings } = useSiteSettings();

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Check if announcement bar is showing (for top offset)
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement_dismissed');
    setAnnouncementDismissed(dismissed === 'true');
  }, []);

  const showOnPages = (settings as any)?.announcement_show_on || 'all';
  const currentPath = location.pathname;
  const isAdminRoute = currentPath.startsWith('/admin');

  const shouldShowAnnouncement =
    settings?.announcement_enabled &&
    settings?.announcement_text &&
    !isAdminRoute &&
    !announcementDismissed &&
    (showOnPages === 'all' ||
      (showOnPages === 'home' && currentPath === '/') ||
      (showOnPages === 'products' && (currentPath.startsWith('/products') || currentPath.startsWith('/collections'))));

  const navClasses = cn(
    "fixed left-0 right-0 z-50 transition-all duration-300",
    shouldShowAnnouncement ? "top-[42px]" : "top-0",
    "bg-background border-b border-border/30"
  );

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/' });
  };

  // Desktop nav links - fixed structure
  const desktopNavLinks = [
    { to: "/products/men", label: "Men" },
    { to: "/products/women", label: "Women" },
    { to: "/products", label: "Shop" },
  ];

  // Mobile menu links (full navigation)
  const mobileNavLinks = (settings?.navigation_items && Array.isArray(settings.navigation_items) && settings.navigation_items.length > 0)
    ? settings.navigation_items.map(item => ({
      to: item.href,
      label: item.label,
    }))
    : [
      { to: "/", label: "Home" },
      { to: "/products/men", label: "Men" },
      { to: "/products/women", label: "Women" },
      { to: "/products", label: "Shop All" },
    ];

  // Common nav link styles
  const navLinkClasses = cn(
    "text-[0.75rem] uppercase tracking-[0.15em] font-medium",
    "text-[#181818] transition-all duration-200",
    "px-3 py-2",
    "hover:bg-[#FEFEFE] hover:text-[#181818]"
  );

  // Icon button styles - smaller for compact navbar
  const iconButtonClasses = cn(
    "h-8 w-8 rounded-none transition-all duration-200",
    "text-[#181818] hover:bg-[#FEFEFE] hover:text-[#181818]"
  );

  return (
    <header className={navClasses}>
      <nav className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 md:h-12">

          {/* ════════════════════════════════════════════════════════════
              MOBILE/TABLET: Left Icons (Menu + Search)
          ════════════════════════════════════════════════════════════ */}
          <div className="flex md:hidden items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={iconButtonClasses}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={iconButtonClasses}
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* ════════════════════════════════════════════════════════════
              DESKTOP: Left Navigation Links (Men, Woman, Shop)
          ════════════════════════════════════════════════════════════ */}
          <div className="hidden md:flex items-center gap-1">
            {desktopNavLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={navLinkClasses}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ════════════════════════════════════════════════════════════
              CENTER: Logo (All Breakpoints)
          ════════════════════════════════════════════════════════════ */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 text-lg md:text-xl font-serif tracking-[0.15em] text-[#181818] hover:opacity-80 transition-opacity uppercase"
          >
            {settings?.store_name?.toUpperCase() || 'BRAND'}
          </Link>

          {/* ════════════════════════════════════════════════════════════
              MOBILE/TABLET: Right Icons (User + Cart)
          ════════════════════════════════════════════════════════════ */}
          <div className="flex md:hidden items-center gap-1">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={iconButtonClasses}>
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className={iconButtonClasses}>
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link to="/cart">
              <Button variant="ghost" size="icon" className={cn(iconButtonClasses, "relative")}>
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#181818] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* ════════════════════════════════════════════════════════════
              DESKTOP: Right Icons (Bell, Search, Wishlist, User, Cart)
          ════════════════════════════════════════════════════════════ */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={iconButtonClasses}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={iconButtonClasses}
              onClick={() => setSearchOpen(true)}
              title="Search (Ctrl+K)"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className={iconButtonClasses} title="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={iconButtonClasses} title="Account">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className={iconButtonClasses} title="Sign In">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link to="/cart">
              <Button variant="ghost" size="icon" className={cn(iconButtonClasses, "relative")} title="Cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#181818] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            MOBILE MENU (Full Screen Slide)
        ════════════════════════════════════════════════════════════ */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out",
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="py-4 space-y-1 border-t border-border/30">
            {mobileNavLinks.map((link, index) => (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  "block py-3 text-[0.75rem] tracking-[0.15em] uppercase font-medium",
                  "text-[#181818] transition-all duration-200",
                  "hover:bg-[#FEFEFE] hover:pl-2"
                )}
                onClick={() => setMobileMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/wishlist"
              className={cn(
                "block py-3 text-[0.75rem] tracking-[0.15em] uppercase font-medium",
                "text-[#181818] transition-all duration-200",
                "hover:bg-[#FEFEFE] hover:pl-2 border-t border-border/30 mt-2 pt-4"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Wishlist
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "block py-3 text-[0.75rem] tracking-[0.15em] uppercase font-medium",
                  "text-[#181818] transition-all duration-200",
                  "hover:bg-[#FEFEFE] hover:pl-2"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default Navbar;
