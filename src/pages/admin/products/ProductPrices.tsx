import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Save,
    Search,
    AlertCircle,
    RotateCcw,
    ChevronRight,
    ChevronDown,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

// Mock variants interface since they don't exist in DB yet
interface Variant {
    id: string;
    sku: string;
    description: string;
    price?: number;
    cost?: number;
    salePrice?: number;
}

const ProductPrices = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({});
    const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

    const { data: products, isLoading } = useQuery({
        queryKey: ['admin-products-prices'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, price, images, category, colors, sizes, stock')
                .order('name');
            if (error) throw error;
            return data;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            const updates = Object.entries(priceUpdates).map(([id, price]) =>
                supabase.from('products').update({ price }).eq('id', id)
            );
            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products-prices'] });
            toast.success('Prices updated successfully');
            setPriceUpdates({});
        },
        onError: () => {
            toast.error('Failed to update prices');
        }
    });

    const handlePriceChange = (id: string, value: string) => {
        const numValue = parseFloat(value);
        // Allow empty string to clear input, but don't set invalid numbers
        if (value === '' || !isNaN(numValue)) {
            // we track updates by product ID
            const val = value === '' ? 0 : numValue;
            setPriceUpdates(prev => ({ ...prev, [id]: val }));
        }
    };

    const toggleExpand = (productId: string) => {
        setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
    };

    // Helper to generate mock variants for display
    const getMockVariants = (product: any): Variant[] => {
        const variants: Variant[] = [];
        // Simple mock: if colors or sizes exist, create a few combos
        // Otherwise return empty

        // This is a strictly visual mock to match the design request
        if (product.colors && product.colors.length > 0) {
            product.colors.forEach((color: string, idx: number) => {
                variants.push({
                    id: `${product.id}-var-${idx}`,
                    sku: `${product.name.substring(0, 2).toUpperCase()}-${100 + idx}-C${idx}`,
                    description: `Color: ${color}, Size: ${product.sizes?.[0] || 'Std'}`,
                    price: product.price, // Inherit main price
                    cost: Math.floor(product.price * 0.6), // Mock cost
                    salePrice: Math.floor(product.price * 0.9) // Mock sale
                });
            });
        }
        return variants;
    };

    const hasChanges = Object.keys(priceUpdates).length > 0;

    const filteredProducts = useMemo(() => {
        return products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];
    }, [products, search]);

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* Warning Alert */}
                <Alert className="bg-[#FFF8F0] border-orange-200 text-orange-800">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="ml-2 text-sm text-orange-700">
                        These prices represent the original costs of the product and may not reflect the final prices, which could vary due to factors such as flash sales, promotions, and more.
                    </AlertDescription>
                </Alert>

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <div className="absolute left-2.5 top-2.5 text-muted-foreground">
                            <Search className="h-4 w-4" />
                        </div>
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-background"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-products-prices'] })} className="ml-auto">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reload
                        </Button>
                        {hasChanges && (
                            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="animate-in fade-in">
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="border border-border rounded-lg overflow-hidden bg-card">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="uppercase text-xs hover:bg-transparent">
                                <TableHead className="w-[60px] text-muted-foreground font-semibold">ID</TableHead>
                                <TableHead className="w-[80px] text-muted-foreground font-semibold">Image</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Products</TableHead>
                                <TableHead className="w-[180px] text-muted-foreground font-semibold">Cost per item</TableHead>
                                <TableHead className="w-[180px] text-muted-foreground font-semibold">Price</TableHead>
                                <TableHead className="w-[180px] text-muted-foreground font-semibold">Price Sale</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        Loading products...
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((product: any) => {
                                    const isExpanded = expandedProducts[product.id];
                                    const variants = getMockVariants(product);
                                    const hasVariants = variants.length > 0;
                                    const currentPrice = priceUpdates[product.id] ?? product.price;

                                    return (
                                        <>
                                            {/* Main Product Row */}
                                            <TableRow key={product.id} className="group border-b border-border/50">
                                                <TableCell className="font-medium text-muted-foreground align-top py-4">
                                                    {product.id.substring(0, 4)}...
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <div className="h-10 w-10 bg-muted rounded-md overflow-hidden flex items-center justify-center border">
                                                        {product.images?.[0] ? (
                                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="align-top py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => hasVariants && toggleExpand(product.id)}>
                                                            {product.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground uppercase">
                                                            SKU: {product.name.substring(0, 3).toUpperCase()}-{(Math.random() * 1000).toFixed(0)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Mock Cost Input */}
                                                <TableCell className="align-top py-4">
                                                    <span className="text-muted-foreground">—</span>
                                                </TableCell>

                                                {/* Real Price Input */}
                                                <TableCell className="align-top py-4">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                                                        <Input
                                                            type="number"
                                                            className={`pl-6 bg-transparent ${priceUpdates[product.id] ? 'border-amber-500 ring-1 ring-amber-500/20' : ''}`}
                                                            value={currentPrice}
                                                            onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                                        />
                                                    </div>
                                                </TableCell>

                                                {/* Mock Sale Price Input */}
                                                <TableCell className="align-top py-4">
                                                    <span className="text-muted-foreground">—</span>
                                                </TableCell>
                                            </TableRow>

                                            {/* Variant Rows (if expanded) - This mocks the hierarchical view */}
                                            {hasVariants && (
                                                <TableRow className="bg-muted/5 hover:bg-muted/10">
                                                    <TableCell colSpan={6} className="p-0 border-b">
                                                        <div className="flex flex-col w-full">
                                                            {variants.map((variant) => (
                                                                <div key={variant.id} className="flex items-center w-full py-3 border-b last:border-0 hover:bg-muted/20 transition-colors">
                                                                    {/* Spacer columns to align with headers */}
                                                                    <div className="w-[60px] shrink-0"></div>
                                                                    <div className="w-[80px] shrink-0 text-center">
                                                                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 inline-block rotate-90 sm:rotate-0 sm:ml-4" />
                                                                    </div>

                                                                    {/* Mock Variant Data */}
                                                                    <div className="flex-1 px-4 text-sm">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-green-600 font-medium">↳ {variant.description}</span>
                                                                            <span className="text-xs text-muted-foreground">SKU: {variant.sku}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Mock Inputs for Variants */}
                                                                    <div className="w-[180px] px-4 shrink-0">
                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                                                                            <Input disabled className="pl-6 h-9 bg-white" placeholder={variant.cost?.toString()} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-[180px] px-4 shrink-0">
                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                                                                            <Input disabled className="pl-6 h-9 bg-white" placeholder={variant.price?.toString()} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-[180px] px-4 shrink-0">
                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                                                                            <Input disabled className="pl-6 h-9 bg-white" placeholder={variant.salePrice?.toString()} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        No products found
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

export default ProductPrices;
