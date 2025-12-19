import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    product_count?: number;
}

interface CategoryGridBlockContent {
    title?: string;
    subtitle?: string;
    columns?: 2 | 3 | 4 | 5 | 6;
    limit?: number;
    showDescription?: boolean;
    // NEW OPTIONS
    aspectRatio?: 'square' | 'portrait' | 'landscape' | 'wide';
    overlayStyle?: 'gradient' | 'solid' | 'none';
    overlayColor?: string;
    showProductCount?: boolean;
    headerAlign?: 'left' | 'center' | 'right';
    gap?: 'small' | 'medium' | 'large';
    cardStyle?: 'rounded' | 'square' | 'circle';
    hoverEffect?: 'zoom' | 'lift' | 'none';
    textPosition?: 'bottom' | 'center' | 'overlay';
    padding?: 'none' | 'small' | 'medium' | 'large';
}

export function CategoryGridBlock({ content }: { content: CategoryGridBlockContent }) {
    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories-block', content.limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*, products:products(count)')
                .eq('is_active', true)
                .order('display_order', { ascending: true })
                .limit(content.limit || 6);

            if (error) throw error;
            return data as Category[];
        },
    });

    // Options with defaults
    const columns = content.columns || 3;
    const aspectRatio = content.aspectRatio || 'landscape';
    const overlayStyle = content.overlayStyle || 'gradient';
    const overlayColor = content.overlayColor || '#000000';
    const showProductCount = content.showProductCount ?? false;
    const headerAlign = content.headerAlign || 'center';
    const gap = content.gap || 'medium';
    const cardStyle = content.cardStyle || 'rounded';
    const hoverEffect = content.hoverEffect || 'zoom';
    const textPosition = content.textPosition || 'bottom';
    const padding = content.padding || 'medium';

    // Grid classes - mobile first with sm, md, lg breakpoints
    const getGridClasses = () => {
        switch (columns) {
            case 2: return 'grid-cols-1 sm:grid-cols-2';
            case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
            case 5: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
            case 6: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
            default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        }
    };

    // Aspect ratio classes
    const getAspectClass = () => {
        switch (aspectRatio) {
            case 'square': return 'aspect-square';
            case 'portrait': return 'aspect-[3/4]';
            case 'wide': return 'aspect-[16/9]';
            case 'landscape':
            default: return 'aspect-[4/3]';
        }
    };

    // Gap classes - responsive
    const getGapClass = () => {
        switch (gap) {
            case 'small': return 'gap-2 sm:gap-3';
            case 'large': return 'gap-4 sm:gap-6 md:gap-8';
            default: return 'gap-3 sm:gap-4 md:gap-6';
        }
    };

    // Padding classes - responsive
    const getPaddingClass = () => {
        switch (padding) {
            case 'none': return 'py-0';
            case 'small': return 'py-4 sm:py-6 md:py-8';
            case 'large': return 'py-24';
            default: return 'py-16';
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

    // Card border radius
    const getCardStyle = () => {
        switch (cardStyle) {
            case 'square': return 'rounded-none';
            case 'circle': return 'rounded-full';
            default: return 'rounded-lg';
        }
    };

    // Overlay styles
    const getOverlayStyle = () => {
        switch (overlayStyle) {
            case 'solid':
                return { backgroundColor: overlayColor, opacity: 0.5 };
            case 'none':
                return { opacity: 0 };
            case 'gradient':
            default:
                return {};
        }
    };

    // Hover effect classes
    const getHoverClass = () => {
        switch (hoverEffect) {
            case 'lift': return 'group-hover:-translate-y-1 transition-transform';
            case 'none': return '';
            default: return 'group-hover:scale-105 transition-transform duration-500';
        }
    };

    return (
        <section className={getPaddingClass()}>
            <div className="container mx-auto">
                {(content.title || content.subtitle) && (
                    <div className={cn("mb-10", getHeaderAlign())}>
                        {content.subtitle && (
                            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
                                {content.subtitle}
                            </p>
                        )}
                        {content.title && (
                            <h2 className="text-2xl md:text-3xl font-serif">{content.title}</h2>
                        )}
                    </div>
                )}

                {isLoading ? (
                    <div className={cn("grid", getGridClasses(), getGapClass())}>
                        {Array.from({ length: content.limit || 6 }).map((_, i) => (
                            <Skeleton key={i} className={cn(getAspectClass(), getCardStyle())} />
                        ))}
                    </div>
                ) : (
                    <div className={cn("grid", getGridClasses(), getGapClass())}>
                        {categories?.map((category) => (
                            <a
                                key={category.id}
                                href={`/category/${category.slug}`}
                                className={cn(
                                    "group relative overflow-hidden bg-muted",
                                    getAspectClass(),
                                    getCardStyle(),
                                    hoverEffect === 'lift' && "hover:shadow-xl transition-shadow"
                                )}
                            >
                                {category.image_url && (
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                        className={cn("w-full h-full object-cover", getHoverClass())}
                                    />
                                )}

                                {/* Overlay */}
                                {overlayStyle === 'gradient' ? (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                ) : (
                                    <div className="absolute inset-0" style={getOverlayStyle()} />
                                )}

                                {/* Content */}
                                <div className={cn(
                                    "absolute left-0 right-0 p-6 text-white",
                                    textPosition === 'center' && "top-1/2 -translate-y-1/2 text-center",
                                    textPosition === 'bottom' && "bottom-0",
                                    textPosition === 'overlay' && "inset-0 flex flex-col items-center justify-center text-center"
                                )}>
                                    <h3 className={cn(
                                        "font-semibold mb-1",
                                        columns >= 5 ? "text-base" : "text-xl"
                                    )}>
                                        {category.name}
                                    </h3>
                                    {showProductCount && (
                                        <span className="text-xs text-white/70">
                                            {(category as any).products?.length || 0} Products
                                        </span>
                                    )}
                                    {content.showDescription && category.description && (
                                        <p className="text-sm text-white/80 line-clamp-2 mt-1">
                                            {category.description}
                                        </p>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

