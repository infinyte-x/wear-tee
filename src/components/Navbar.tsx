import { ShoppingBag, Menu, X, Search, User, Shield, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClasses = isHome && !scrolled
    ? "fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    : "sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300";

  const textClasses = isHome && !scrolled
    ? "text-cream"
    : "text-foreground";

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className={navClasses}>
      <nav className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={`text-2xl font-serif tracking-wide hover:opacity-70 transition-opacity ${textClasses}`}
          >
            ATELIER
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              to="/products"
              className={`text-xs tracking-[0.2em] uppercase hover:opacity-70 transition-opacity ${textClasses}`}
            >
              Shop
            </Link>
            <Link
              to="/products?category=Outerwear"
              className={`text-xs tracking-[0.2em] uppercase hover:opacity-70 transition-opacity ${textClasses}`}
            >
              Outerwear
            </Link>
            <Link
              to="/products?category=Knitwear"
              className={`text-xs tracking-[0.2em] uppercase hover:opacity-70 transition-opacity ${textClasses}`}
            >
              Knitwear
            </Link>
            <Link
              to="/products?category=Tailoring"
              className={`text-xs tracking-[0.2em] uppercase hover:opacity-70 transition-opacity ${textClasses}`}
            >
              Tailoring
            </Link>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className={`hover:bg-transparent ${textClasses}`}>
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={`hover:bg-transparent ${textClasses}`}>
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
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
                <Button variant="ghost" size="icon" className={`hover:bg-transparent ${textClasses}`}>
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className={`relative hover:bg-transparent ${textClasses}`}>
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden hover:bg-transparent ${textClasses}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-6 pb-4 space-y-4 border-t border-border/30 pt-6">
            <Link
              to="/products"
              className={`block text-sm tracking-widest uppercase hover:opacity-70 transition-opacity ${textClasses}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop All
            </Link>
            <Link
              to="/products?category=Outerwear"
              className={`block text-sm tracking-widest uppercase hover:opacity-70 transition-opacity ${textClasses}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Outerwear
            </Link>
            <Link
              to="/products?category=Knitwear"
              className={`block text-sm tracking-widest uppercase hover:opacity-70 transition-opacity ${textClasses}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Knitwear
            </Link>
            <Link
              to="/products?category=Tailoring"
              className={`block text-sm tracking-widest uppercase hover:opacity-70 transition-opacity ${textClasses}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Tailoring
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`block text-sm tracking-widest uppercase hover:opacity-70 transition-opacity ${textClasses}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
