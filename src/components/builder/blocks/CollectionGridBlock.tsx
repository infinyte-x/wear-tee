import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
}

interface CollectionGridBlockProps {
    content: {
        columns?: 2 | 3 | 4 | 5 | 6;
        gap?: 'small' | 'medium' | 'large';
        headerAlign?: 'left' | 'center' | 'right';
        padding?: 'none' | 'small' | 'medium' | 'large';
        backgroundColor?: string;
        showEmptyState?: boolean;
        emptyMessage?: string;
        showProductCount?: boolean;
        sortBy?: 'newest' | 'price-low' | 'price-high' | 'name';
    };
    // Collection context - passed from the parent CollectionPage
    collectionId?: string;
    collectionSlug?: string;
}

/**
 * CollectionGridBlock - Displays products from the current collection
 * This block is designed to be used on collection pages and automatically
 * fetches products based on the collection context.
 */
export function CollectionGridBlock({ content, collectionId, collectionSlug }: CollectionGridBlockProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Configurable options with defaults
    const columns = content.columns || 4;
    const gap = content.gap || 'large';
    const headerAlign = content.headerAlign || 'left';
    const padding = content.padding || 'medium';
    const backgroundColor = content.backgroundColor || 'transparent';
    const showEmptyState = content.showEmptyState !== false;
    const emptyMessage = content.emptyMessage || 'No products in this collection yet.';
    const showProductCount = content.showProductCount !== false;
    const sortBy = content.sortBy || 'newest';

    useEffect(() => {
        const fetchProducts = async () => {
            if (!collectionId && !collectionSlug) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                let targetCollectionId = collectionId;

                // If we only have slug, first get the collection ID
                if (!targetCollectionId && collectionSlug) {
                    const { data: collection } = await supabase
                        .from('collections')
                        .select('id')
                        .eq('slug', collectionSlug)
                        .single();

                    if (collection) {
                        targetCollectionId = collection.id;
                    }
                }

                if (!targetCollectionId) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                // Fetch product IDs linked to this collection
                const { data: productLinks } = await supabase
                    .from('product_collections')
                    .select('product_id')
                    .eq('collection_id', targetCollectionId);

                if (!productLinks || productLinks.length === 0) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                const productIds = productLinks.map(link => link.product_id);

                // Fetch the actual products
                let query = supabase
                    .from('products')
                    .select('id, name, price, images, category')
                    .in('id', productIds);

                // Apply sorting
                switch (sortBy) {
                    case 'price-low':
                        query = query.order('price', { ascending: true });
                        break;
                    case 'price-high':
                        query = query.order('price', { ascending: false });
                        break;
                    case 'name':
                        query = query.order('name', { ascending: true });
                        break;
                    case 'newest':
                    default:
                        query = query.order('created_at', { ascending: false });
                        break;
                }

                const { data: productsData } = await query;
                setProducts(productsData || []);
            } catch (error) {
                console.error('Error fetching collection products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [collectionId, collectionSlug, sortBy]);

    // Dynamic column classes
    const getGridCols = () => {
        switch (columns) {
            case 2: return 'grid-cols-1 sm:grid-cols-2';
            case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
            case 5: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
            case 6: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
            case 4:
            default: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
        }
    };

    // Gap classes
    const getGapClass = () => {
        switch (gap) {
            case 'small': return 'gap-2 sm:gap-3 md:gap-4';
            case 'medium': return 'gap-3 sm:gap-4 md:gap-6';
            case 'large':
            default: return 'gap-4 sm:gap-6 md:gap-8';
        }
    };

    // Padding classes
    const getPaddingClass = () => {
        switch (padding) {
            case 'none': return 'py-0';
            case 'small': return 'py-4 sm:py-6 md:py-8';
            case 'medium': return 'py-8 sm:py-12 md:py-16';
            case 'large':
            default: return 'py-12 sm:py-16 md:py-24';
        }
    };

    // Skeleton loader
    const renderSkeletons = () => (
        <div className={cn("grid", getGridCols(), getGapClass())}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    );

    // Show placeholder for page builder preview when no collection context
    if (!collectionId && !collectionSlug) {
        return (
            <section
                className={cn("container mx-auto px-6", getPaddingClass())}
                style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
            >
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                    <p className="text-muted-foreground text-lg font-medium mb-2">Collection Products Grid</p>
                    <p className="text-muted-foreground text-sm">
                        Products from the current collection will be displayed here.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section
            className={cn("container mx-auto px-6", getPaddingClass())}
            style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        >
            {showProductCount && products.length > 0 && (
                <p className={cn(
                    "text-sm text-muted-foreground mb-6",
                    headerAlign === 'center' && "text-center",
                    headerAlign === 'right' && "text-right"
                )}>
                    {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
            )}

            {loading ? (
                renderSkeletons()
            ) : products.length === 0 && showEmptyState ? (
                <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">{emptyMessage}</p>
                </div>
            ) : (
                <div className={cn("grid", getGridCols(), getGapClass())}>
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            image={product.images?.[0]}
                            category={product.category}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
