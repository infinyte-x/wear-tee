import { ShoppingBag, Menu, X, Search, User, Shield, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavbarProps {
  cartCount?: number;
}

const Navbar = ({ cartCount = 0 }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navClasses = cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
    scrolled || !isHome
      ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
      : "bg-transparent"
  );

  const textClasses = cn(
    "transition-colors duration-300",
    isHome && !scrolled ? "text-cream" : "text-foreground"
  );

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/' });
  };

  const navLinks = [
    { to: "/products", label: "Shop", search: undefined },
    { to: "/products", label: "Outerwear", search: { category: "Outerwear" } },
    { to: "/products", label: "Knitwear", search: { category: "Knitwear" } },
    { to: "/products", label: "Tailoring", search: { category: "Tailoring" } },
  ];

  return (
    <header className={navClasses}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={cn(
              "text-2xl font-serif tracking-wide transition-all duration-300 hover:opacity-80 hover:scale-[1.02]",
              textClasses
            )}
          >
            ATELIER
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                search={link.search}
                className={cn(
                  "relative text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-80",
                  "after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300",
                  "hover:after:w-full",
                  textClasses
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-transparent hover:scale-110 transition-all duration-300",
                textClasses
              )}
            >
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "hover:bg-transparent hover:scale-110 transition-all duration-300",
                      textClasses
                    )}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 animate-scale-in">
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "hover:bg-transparent hover:scale-110 transition-all duration-300",
                    textClasses
                  )}
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "relative hover:bg-transparent hover:scale-110 transition-all duration-300",
                  textClasses
                )}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-medium animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "md:hidden hover:bg-transparent hover:scale-110 transition-all duration-300",
                textClasses
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="relative w-5 h-5">
                <Menu className={cn(
                  "absolute inset-0 transition-all duration-300",
                  mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                )} />
                <X className={cn(
                  "absolute inset-0 transition-all duration-300",
                  mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                )} />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-500 ease-out",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="py-6 space-y-1 border-t border-border/30 mt-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                to={link.to}
                search={link.search}
                className={cn(
                  "block py-3 text-sm tracking-widest uppercase transition-all duration-300 hover:pl-2 hover:opacity-80",
                  textClasses
                )}
                onClick={() => setMobileMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label === "Shop" ? "Shop All" : link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "block py-3 text-sm tracking-widest uppercase transition-all duration-300 hover:pl-2 hover:opacity-80 pt-4 border-t border-border/30 mt-2",
                  textClasses
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

