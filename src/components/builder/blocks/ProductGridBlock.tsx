
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    featured: boolean;
    created_at?: string;
}

export function ProductGridBlock({ content }: { content: any }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Configurable options with defaults
    const limit = content.limit || 4;
    const columns = content.columns || 4;
    const showFeaturedOnly = content.featuredOnly !== false;
    const sortBy = content.sortBy || 'newest';
    const categoryFilter = content.category || '';
    const showViewAll = content.showViewAllButton !== false;
    const viewAllLink = content.viewAllLink || '/products';
    const viewAllText = content.viewAllText || 'View All Products';

    // NEW OPTIONS
    const gap = content.gap || 'large'; // small, medium, large
    const headerAlign = content.headerAlign || 'center'; // left, center, right
    const cardStyle = content.cardStyle || 'default'; // default, minimal, bordered, shadow
    const showSubtitle = content.showSubtitle !== false;
    const backgroundColor = content.backgroundColor || 'transparent';
    const padding = content.padding || 'large'; // none, small, medium, large
    const showEmptyState = content.showEmptyState !== false;
    const emptyMessage = content.emptyMessage || 'No products found';

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            let query = supabase.from("products").select("*");

            if (showFeaturedOnly) {
                query = query.eq("featured", true);
            }

            if (categoryFilter) {
                query = query.eq("category", categoryFilter);
            }

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

            query = query.limit(limit);

            const { data } = await query;
            if (data) setProducts(data as Product[]);
            setLoading(false);
        };

        fetchProducts();
    }, [limit, showFeaturedOnly, sortBy, categoryFilter]);

    // Dynamic column classes - mobile first with sm, md, lg breakpoints
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

    // Gap classes - responsive
    const getGapClass = () => {
        switch (gap) {
            case 'small': return 'gap-2 sm:gap-3 md:gap-4';
            case 'medium': return 'gap-3 sm:gap-4 md:gap-6';
            case 'large':
            default: return 'gap-4 sm:gap-6 md:gap-8';
        }
    };

    // Padding classes - responsive
    const getPaddingClass = () => {
        switch (padding) {
            case 'none': return 'py-0';
            case 'small': return 'py-4 sm:py-6 md:py-8';
            case 'medium': return 'py-8 sm:py-12 md:py-16';
            case 'large':
            default: return 'py-12 sm:py-16 md:py-24';
        }
    };

    // Header alignment
    const getHeaderAlign = () => {
        switch (headerAlign) {
            case 'left': return 'text-left';
            case 'right': return 'text-right';
            default: return 'text-center';
        }
    };

    // Skeleton loader
    const renderSkeletons = () => (
        <div className={cn("grid", getGridCols(), getGapClass())}>
            {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[3/4] rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    );

    return (
        <section
            className={cn("container mx-auto px-6", getPaddingClass())}
            style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        >
            {content.title && (
                <div className={cn("mb-8 sm:mb-12 md:mb-16 fade-in", getHeaderAlign())}>
                    {showSubtitle && (
                        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2 sm:mb-4">
                            {content.subtitle || "Curated Selection"}
                        </p>
                    )}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-2 sm:mb-4">{content.title}</h2>
                    {content.description && (
                        <p className={cn(
                            "text-sm sm:text-base text-muted-foreground leading-relaxed",
                            headerAlign === 'center' ? "max-w-2xl mx-auto" : "max-w-2xl"
                        )}>
                            {content.description}
                        </p>
                    )}
                </div>
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
                            image={product.images[0]}
                            category={product.category}
                        />
                    ))}
                </div>
            )}

            {showViewAll && products.length > 0 && (
                <div className={cn(
                    "mt-12",
                    headerAlign === 'center' && "text-center",
                    headerAlign === 'right' && "text-right"
                )}>
                    <Button asChild variant="outline" size="lg">
                        <Link to={viewAllLink}>{viewAllText}</Link>
                    </Button>
                </div>
            )}
        </section>
    );
}

