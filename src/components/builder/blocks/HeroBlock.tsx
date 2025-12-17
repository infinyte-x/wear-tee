import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface HeroSlide {
    image?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    button1Text?: string;
    button1Link?: string;
    button2Text?: string;
    button2Link?: string;
}

interface HeroBlockProps {
    content: {
        slides?: HeroSlide[];
        autoPlay?: boolean;
        autoPlayInterval?: number;
        showDots?: boolean;
        showArrows?: boolean;
        overlayOpacity?: number;
        // NEW OPTIONS
        height?: 'extra-small' | 'small' | 'medium' | 'large' | 'fullscreen' | 'custom';
        customHeight?: number;
        textAlign?: 'left' | 'center' | 'right';
        contentPosition?: 'top' | 'center' | 'bottom';
        overlayType?: 'solid' | 'gradient' | 'gradient-radial';
        overlayColor?: string;
        contentWidth?: 'narrow' | 'medium' | 'wide' | 'full';
        fullWidth?: boolean;
        showBadge?: boolean;
        badgeText?: string;
        parallax?: boolean;
        animation?: 'none' | 'fade' | 'slide' | 'zoom';
        // Dynamic collection mode
        useCollectionData?: boolean;
        // Background color (for when no image)
        backgroundColor?: string;
    };
    // Collection context props (passed from BlockRenderer on collection pages)
    collectionTitle?: string;
    collectionDescription?: string;
    collectionImage?: string;
}

export function HeroBlock({ content, collectionTitle, collectionDescription, collectionImage }: HeroBlockProps) {
    // Check if we should use collection data dynamically
    const useCollectionData = content.useCollectionData ?? true; // Default to true for collection pages

    // Get the slide data - either from content or from collection context
    let slides = content.slides || [];

    // If on a collection page and useCollectionData is enabled, inject collection data into slides
    if (useCollectionData && collectionTitle) {
        // If no slides defined, create one with collection data
        if (slides.length === 0) {
            slides = [{
                title: collectionTitle,
                subtitle: 'Collection',
                description: collectionDescription || '',
                image: collectionImage || '',
            }];
        } else {
            // Replace first slide's content with collection data (if not explicitly set)
            slides = slides.map((slide, index) => {
                if (index === 0) {
                    return {
                        ...slide,
                        title: slide.title || collectionTitle,
                        subtitle: slide.subtitle || 'Collection',
                        description: slide.description || collectionDescription || '',
                        image: slide.image || collectionImage || '',
                    };
                }
                return slide;
            });
        }
    }

    // Fallback if still no slides
    if (slides.length === 0) {
        slides = [{ title: "Hero Title", subtitle: "Subtitle goes here" }];
    }

    const autoPlay = content.autoPlay ?? false;
    const autoPlayInterval = content.autoPlayInterval ?? 5000;
    const showDots = content.showDots ?? true;
    const showArrows = content.showArrows ?? true;
    const overlayOpacity = content.overlayOpacity ?? 0.5;

    // New options with defaults
    const height = content.height || 'large';
    const customHeight = content.customHeight || 500;
    const textAlign = content.textAlign || 'center';
    const contentPosition = content.contentPosition || 'center';
    const overlayType = content.overlayType || 'solid';
    const overlayColor = content.overlayColor || '#000000';
    const contentWidth = content.contentWidth || 'medium';
    const fullWidth = content.fullWidth ?? false;
    const showBadge = content.showBadge ?? false;
    const badgeText = content.badgeText || 'New';
    const parallax = content.parallax ?? false;
    const animation = content.animation || 'fade';
    const backgroundColor = content.backgroundColor || '#18181b';

    const [currentSlide, setCurrentSlide] = useState(0);

    // Height classes
    const getHeightClass = () => {
        switch (height) {
            case 'extra-small': return 'min-h-[200px] md:min-h-[250px]';
            case 'small': return 'min-h-[300px] md:min-h-[350px]';
            case 'medium': return 'min-h-[400px] md:min-h-[500px]';
            case 'large': return 'min-h-[500px] md:min-h-[640px]';
            case 'fullscreen': return 'min-h-screen';
            case 'custom': return '';
            default: return 'min-h-[500px] md:min-h-[640px]';
        }
    };

    // Content width classes
    const getContentWidthClass = () => {
        switch (contentWidth) {
            case 'narrow': return 'max-w-xl';
            case 'medium': return 'max-w-3xl';
            case 'wide': return 'max-w-5xl';
            case 'full': return 'max-w-full';
            default: return 'max-w-3xl';
        }
    };

    // Content position classes
    const getPositionClass = () => {
        switch (contentPosition) {
            case 'top': return 'items-start pt-20';
            case 'bottom': return 'items-end pb-20';
            default: return 'items-center';
        }
    };

    // Text alignment classes
    const getTextAlignClass = () => {
        switch (textAlign) {
            case 'left': return 'text-left items-start';
            case 'right': return 'text-right items-end';
            default: return 'text-center items-center';
        }
    };

    // Overlay styles
    const getOverlayStyle = () => {
        const baseOpacity = overlayOpacity;
        switch (overlayType) {
            case 'gradient':
                return {
                    background: `linear-gradient(to top, ${overlayColor} 0%, transparent 100%)`,
                    opacity: baseOpacity + 0.3,
                };
            case 'gradient-radial':
                return {
                    background: `radial-gradient(circle at center, transparent 0%, ${overlayColor} 100%)`,
                    opacity: baseOpacity + 0.2,
                };
            default:
                return {
                    backgroundColor: overlayColor,
                    opacity: baseOpacity,
                };
        }
    };

    // Animation classes
    const getAnimationClass = () => {
        switch (animation) {
            case 'fade': return 'transition-opacity duration-500';
            case 'slide': return 'transition-transform duration-500';
            case 'zoom': return 'transition-all duration-700';
            default: return '';
        }
    };

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, slides.length]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const goToPrev = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const slide = slides[currentSlide] || {};

    return (
        <div className={cn("relative overflow-hidden", !fullWidth && "rounded-lg")}>
            {/* Full-Width Background Image Layer */}
            <div
                className={cn(
                    "relative w-full transition-all duration-500",
                    getHeightClass(),
                    getAnimationClass()
                )}
                style={{
                    backgroundImage: slide.image ? `url(${slide.image})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: parallax ? 'fixed' : 'scroll',
                    backgroundColor: slide.image ? undefined : backgroundColor,
                    ...(height === 'custom' ? { minHeight: `${customHeight}px` } : {}),
                }}
            >
                {/* Overlay */}
                <div
                    className="absolute inset-0"
                    style={getOverlayStyle()}
                />

                {/* Badge */}
                {showBadge && badgeText && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                        <span className="px-4 py-1.5 bg-white/90 text-black text-xs font-medium uppercase tracking-wider rounded-full">
                            {badgeText}
                        </span>
                    </div>
                )}

                {/* Container Layer - same spacing as ProductGridBlock */}
                <div className="absolute inset-0 z-10 flex">
                    <div className={cn(
                        "container mx-auto px-6 flex flex-col py-8 sm:py-16",
                        contentPosition === 'center' && "justify-center",
                        contentPosition === 'top' && "justify-start",
                        contentPosition === 'bottom' && "justify-end"
                    )}>
                        {/* Content wrapper for text alignment and max-width */}
                        <div className={cn(
                            "flex flex-col",
                            getContentWidthClass(),
                            getTextAlignClass()
                        )}>
                            {slide.subtitle && (
                                <p className="text-xs sm:text-sm md:text-base text-white/70 uppercase tracking-widest mb-2 sm:mb-4">
                                    {slide.subtitle}
                                </p>
                            )}
                            <h2 className={cn(
                                "font-bold text-white mb-3 sm:mb-4 transition-all duration-300 leading-tight",
                                height === 'small'
                                    ? "text-2xl sm:text-3xl md:text-4xl"
                                    : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                            )}>
                                {slide.title || "Hero Title"}
                            </h2>
                            {slide.description && (
                                <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl">
                                    {slide.description}
                                </p>
                            )}

                            {/* Buttons - stack on mobile */}
                            <div className={cn(
                                "flex flex-col sm:flex-row gap-3 sm:gap-4",
                                textAlign === 'center' && "sm:justify-center items-center",
                                textAlign === 'right' && "sm:justify-end items-end",
                                textAlign === 'left' && "items-start"
                            )}>
                                {slide.button1Text && (
                                    <Link to={slide.button1Link || "#"} className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90 font-medium">
                                            {slide.button1Text}
                                        </Button>
                                    </Link>
                                )}
                                {slide.button2Text && (
                                    <Link to={slide.button2Link || "#"} className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                                            {slide.button2Text}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows - hidden on mobile, visible on md+ */}
                {showArrows && slides.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            className="hidden sm:block absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="hidden sm:block absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    </>
                )}

                {/* Dots Navigation */}
                {showDots && slides.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all",
                                    currentSlide === index
                                        ? "bg-white scale-110"
                                        : "bg-white/50 hover:bg-white/70"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

