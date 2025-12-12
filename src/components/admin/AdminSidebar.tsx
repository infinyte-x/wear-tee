import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  UserPlus,
  LogOut,
  Store,
  FolderTree,
  FileText,
  Megaphone,
  Settings,
  Truck,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Products', url: '/admin/products', icon: Package },
  { title: 'Categories', url: '/admin/categories', icon: FolderTree },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
  { title: 'Customers', url: '/admin/customers', icon: Users },
  { title: 'Site Content', url: '/admin/content', icon: FileText },
  { title: 'Marketing', url: '/admin/marketing', icon: Megaphone },
  { title: 'Shipping', url: '/admin/shipping', icon: Truck },
  { title: 'Payments', url: '/admin/payments', icon: CreditCard },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
  { title: 'Admin Invites', url: '/admin/invites', icon: UserPlus },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 min-h-screen bg-charcoal text-cream border-r border-border/10">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-serif tracking-wide">
          <Store className="h-5 w-5" />
          ATELIER
        </Link>
        <p className="text-xs text-cream/60 mt-1 tracking-widest uppercase">Admin Panel</p>
      </div>

      <nav className="px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              <Link
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-colors ${
                  isActive(item.url)
                    ? 'bg-cream/10 text-cream'
                    : 'text-cream/70 hover:bg-cream/5 hover:text-cream'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-cream/10">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-cream/70 hover:text-cream hover:bg-cream/5"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
