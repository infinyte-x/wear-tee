import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Package, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductCsvTools from '@/components/admin/ProductCsvTools';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  images: string[];
  featured: boolean | null;
  status: string | null;
  sizes: string[] | null;
  colors: string[] | null;
}

const AdminProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Product deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyles = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20';
      case 'draft':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20';
      case 'archived':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product catalog
              {filteredProducts && <span className="text-foreground font-medium"> · {filteredProducts.length} items</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ProductCsvTools
              products={products || []}
              onImportComplete={() => queryClient.invalidateQueries({ queryKey: ['admin-products'] })}
            />
            <Button
              onClick={() => navigate({ to: '/admin/products/new' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50 focus:border-accent transition-colors"
          />
        </div>

        {/* Products Table */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Stock</TableHead>
                <TableHead className="font-semibold">Featured</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg" />
                        <div className="h-4 w-32 bg-muted rounded" />
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-6 w-16 bg-muted rounded-full" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-4 w-8 bg-muted rounded" /></TableCell>
                    <TableCell><div className="h-8 w-20 bg-muted rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <TableRow
                    key={product.id}
                    className="group transition-colors hover:bg-muted/50"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border/50 group-hover:ring-border transition-all">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium line-clamp-2 group-hover:text-accent transition-colors">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{product.category}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize font-medium transition-colors border",
                          getStatusStyles(product.status)
                        )}
                      >
                        {product.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-medium">${product.price.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-medium",
                        product.stock < 10 && "text-amber-600",
                        product.stock === 0 && "text-red-600"
                      )}>
                        {product.stock}
                        {product.stock < 10 && product.stock > 0 && (
                          <span className="text-xs text-amber-600 ml-1">(Low)</span>
                        )}
                        {product.stock === 0 && (
                          <span className="text-xs text-red-600 ml-1">(Out)</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.featured ? (
                        <span className="text-accent font-medium">★ Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate({ to: '/admin/products/$productId', params: { productId: product.id } })}
                          className="hover:bg-accent/10 hover:text-accent transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(product.id)}
                          className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      {searchQuery ? 'No products match your search' : 'No products yet'}
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      {searchQuery ? 'Try adjusting your search terms' : 'Add your first product to get started'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => navigate({ to: '/admin/products/new' })}
                        className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;

