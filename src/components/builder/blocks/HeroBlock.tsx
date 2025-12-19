import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion, useInView, AnimatePresence } from "motion/react";
import useEmblaCarousel from "embla-carousel-react";

interface HeroSlide {
    image?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    button1Text?: string;
    button1Link?: string;
    button2Text?: string;
    button2Link?: string;
    // Video background
    videoUrl?: string;
    videoPoster?: string;
}

interface HeroBlockProps {
    content: {
        slides?: HeroSlide[];
        autoPlay?: boolean;
        autoPlayInterval?: number;
        showDots?: boolean;
        showArrows?: boolean;
        overlayOpacity?: number;
        // Height options
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

        // NEW: Layout options
        layout?: 'default' | 'split-left' | 'split-right';

        // NEW: Video options
        videoAutoplay?: boolean;
        videoMuted?: boolean;
        videoLoop?: boolean;

        // NEW: Text animations
        textAnimation?: 'none' | 'typewriter' | 'fade-word' | 'slide-up' | 'fade-in';
        textAnimationDelay?: number;

        // NEW: Background effects
        backgroundEffect?: 'none' | 'particles' | 'gradient-animated' | 'gradient-mesh';

        // NEW: Scroll animations
        scrollAnimation?: boolean;
        scrollAnimationType?: 'fade-up' | 'fade-in' | 'zoom-in' | 'slide-left';

        // NEW: Mobile carousel swipe
        enableSwipe?: boolean;

        // NEW: Ken Burns effect
        kenBurnsEffect?: boolean;
        kenBurnsIntensity?: 'subtle' | 'medium' | 'strong';

        // NEW: Button styling
        buttonStyle?: 'default' | 'gradient' | 'pill' | 'outlined' | 'glow';
        buttonAnimation?: 'none' | 'pulse' | 'shine' | 'bounce';

        // NEW: Text colors and animations
        titleColor?: string;
        subtitleColor?: string;
        textColorAnimation?: 'none' | 'gradient-animated' | 'rainbow' | 'pulse-glow';
    };
    // Collection context props
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

    // Existing options with defaults
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

    // NEW: Feature defaults (all backward-compatible)
    const layout = content.layout || 'default';
    const videoAutoplay = content.videoAutoplay ?? true;
    const videoMuted = content.videoMuted ?? true;
    const videoLoop = content.videoLoop ?? true;
    const textAnimation = content.textAnimation || 'none';
    const textAnimationDelay = content.textAnimationDelay ?? 0.1;
    const backgroundEffect = content.backgroundEffect || 'none';
    const scrollAnimation = content.scrollAnimation ?? false;
    const scrollAnimationType = content.scrollAnimationType || 'fade-up';
    const enableSwipe = content.enableSwipe ?? true;
    const buttonStyle = content.buttonStyle || 'default';
    const buttonAnimation = content.buttonAnimation || 'none';
    const titleColor = content.titleColor || '#ffffff';
    const subtitleColor = content.subtitleColor || 'rgba(255,255,255,0.7)';
    const textColorAnimation = content.textColorAnimation || 'none';

    const [currentSlide, setCurrentSlide] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(heroRef, { once: true, amount: 0.3 });

    // Embla carousel for swipe support
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        skipSnaps: false,
        dragFree: false,
    });

    // Sync Embla with currentSlide state
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCurrentSlide(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    // Navigate embla when currentSlide changes (for dots/arrows)
    useEffect(() => {
        if (!emblaApi) return;
        if (emblaApi.selectedScrollSnap() !== currentSlide) {
            emblaApi.scrollTo(currentSlide);
        }
    }, [emblaApi, currentSlide]);

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
            case 'left': return 'text-left items-start self-start';
            case 'right': return 'text-right items-end self-end';
            default: return 'text-center items-center self-center';
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

    // Button style classes
    const getButtonClasses = (isPrimary: boolean) => {
        const baseClasses = "w-full sm:w-auto font-medium transition-all duration-300";

        // Button animation classes
        let animationClasses = "";
        switch (buttonAnimation) {
            case 'pulse':
                animationClasses = "hover:scale-105 active:scale-95";
                break;
            case 'shine':
                animationClasses = "relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700";
                break;
            case 'bounce':
                animationClasses = "hover:-translate-y-1 active:translate-y-0";
                break;
        }

        if (isPrimary) {
            switch (buttonStyle) {
                case 'gradient':
                    return cn(baseClasses, animationClasses, "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white border-0 hover:opacity-90");
                case 'pill':
                    return cn(baseClasses, animationClasses, "rounded-full bg-white text-black hover:bg-white/90");
                case 'outlined':
                    return cn(baseClasses, animationClasses, "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black");
                case 'glow':
                    return cn(baseClasses, animationClasses, "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)]");
                default:
                    return cn(baseClasses, animationClasses, "bg-white text-black hover:bg-white/90");
            }
        } else {
            switch (buttonStyle) {
                case 'gradient':
                    return cn(baseClasses, animationClasses, "bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-orange-400/20 text-white border border-white/30 hover:border-white/60");
                case 'pill':
                    return cn(baseClasses, animationClasses, "rounded-full border-white text-white hover:bg-white/10");
                case 'outlined':
                    return cn(baseClasses, animationClasses, "bg-transparent border-2 border-white/60 text-white hover:border-white");
                case 'glow':
                    return cn(baseClasses, animationClasses, "border border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]");
                default:
                    return cn(baseClasses, animationClasses, "border-white text-white hover:bg-white/10");
            }
        }
    };

    // Text animation variants for Framer Motion
    const getTextAnimationVariants = () => {
        switch (textAnimation) {
            case 'fade-in':
                return {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 0.8 } }
                };
            case 'slide-up':
                return {
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                };
            case 'fade-word':
                return {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
                };
            case 'typewriter':
                return {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
                };
            default:
                return {
                    hidden: { opacity: 1 },
                    visible: { opacity: 1 }
                };
        }
    };

    // Scroll animation variants
    const getScrollAnimationVariants = () => {
        if (!scrollAnimation) return undefined;
        switch (scrollAnimationType) {
            case 'fade-up':
                return {
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
                };
            case 'fade-in':
                return {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { duration: 0.8 } }
                };
            case 'zoom-in':
                return {
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
                };
            case 'slide-left':
                return {
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
                };
            default:
                return undefined;
        }
    };

    // Background effect styles
    const getBackgroundEffectClasses = () => {
        switch (backgroundEffect) {
            case 'gradient-animated':
                return 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/30 before:via-pink-500/30 before:to-orange-500/30 before:animate-gradient-shift';
            case 'gradient-mesh':
                return 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] before:from-purple-900/40 before:via-transparent before:to-transparent after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] after:from-pink-900/40 after:via-transparent after:to-transparent';
            case 'particles':
                return 'hero-particles';
            default:
                return '';
        }
    };

    // Text color animation styles
    const getTextColorAnimationStyle = (): { className: string; style: React.CSSProperties } => {
        switch (textColorAnimation) {
            case 'gradient-animated':
                return {
                    className: 'bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-[length:200%_auto] animate-gradient-x',
                    style: {}
                };
            case 'rainbow':
                return {
                    className: 'bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-[length:200%_auto] animate-gradient-x',
                    style: {}
                };
            case 'pulse-glow':
                return {
                    className: 'animate-pulse-glow',
                    style: { color: titleColor, textShadow: `0 0 20px ${titleColor}80, 0 0 40px ${titleColor}40` }
                };
            default:
                return { className: '', style: { color: titleColor } };
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

    // Animated text component for typewriter/fade-word effects
    const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
        if (textAnimation === 'none') {
            return <span className={className}>{text}</span>;
        }

        if (textAnimation === 'typewriter' || textAnimation === 'fade-word') {
            const items = textAnimation === 'typewriter' ? text.split('') : text.split(' ');
            const wordVariant = {
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
            };

            return (
                <motion.span
                    className={className}
                    variants={getTextAnimationVariants()}
                    initial="hidden"
                    animate="visible"
                    key={currentSlide} // Re-animate on slide change
                >
                    {items.map((item, i) => (
                        <motion.span key={i} variants={wordVariant} className="inline-block">
                            {item}{textAnimation === 'fade-word' ? '\u00A0' : ''}
                        </motion.span>
                    ))}
                </motion.span>
            );
        }

        return (
            <motion.span
                className={className}
                variants={getTextAnimationVariants()}
                initial="hidden"
                animate="visible"
                key={currentSlide}
            >
                {text}
            </motion.span>
        );
    };

    // Render single slide content
    const renderSlideContent = (slideData: HeroSlide, index: number) => {
        const isCurrentSlide = index === currentSlide;
        const hasVideo = slideData.videoUrl;
        const hasImage = slideData.image;

        // Render background media (image, video, or color)
        const renderBackground = () => {
            if (hasVideo) {
                return (
                    <video
                        className="absolute inset-0 w-full h-full object-cover"
                        src={slideData.videoUrl}
                        poster={slideData.videoPoster || slideData.image}
                        autoPlay={videoAutoplay}
                        muted={videoMuted}
                        loop={videoLoop}
                        playsInline
                    />
                );
            }
            if (hasImage) {
                return (
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url(${slideData.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundAttachment: parallax ? 'fixed' : 'scroll',
                        }}
                    />
                );
            }
            return (
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: backgroundColor }}
                />
            );
        };

        // Default Layout: Full-width background with centered content
        if (layout === 'default') {
            return (
                <div
                    key={index}
                    className={cn(
                        "relative w-full flex-shrink-0",
                        getHeightClass(),
                        getBackgroundEffectClasses()
                    )}
                    style={{
                        ...(height === 'custom' ? { minHeight: `${customHeight}px` } : {}),
                    }}
                >
                    {/* Background Layer */}
                    {renderBackground()}

                    {/* Overlay */}
                    <div
                        className="absolute inset-0 z-[1]"
                        style={getOverlayStyle()}
                    />

                    {/* Badge */}
                    {showBadge && badgeText && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                            <motion.span
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-4 py-1.5 bg-white/90 text-black text-xs font-medium uppercase tracking-wider rounded-full"
                            >
                                {badgeText}
                            </motion.span>
                        </div>
                    )}

                    {/* Content Container */}
                    <div className="absolute inset-0 z-10 flex">
                        <motion.div
                            className={cn(
                                "w-full px-6 md:px-24 flex flex-col py-8 sm:py-12 md:py-16",
                                contentPosition === 'center' && "justify-center",
                                contentPosition === 'top' && "justify-start pt-16 sm:pt-20",
                                contentPosition === 'bottom' && "justify-end pb-16 sm:pb-20"
                            )}
                            variants={scrollAnimation ? getScrollAnimationVariants() : undefined}
                            initial={scrollAnimation ? "hidden" : undefined}
                            animate={scrollAnimation && isInView ? "visible" : undefined}
                        >
                            {/* Content wrapper */}
                            <motion.div
                                className={cn(
                                    "flex flex-col",
                                    getContentWidthClass(),
                                    getTextAlignClass()
                                )}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                key={`content-${currentSlide}`}
                            >
                                {slideData.subtitle && (
                                    <motion.p
                                        className="text-xs sm:text-sm md:text-base uppercase tracking-widest mb-2 sm:mb-4"
                                        style={{ color: subtitleColor }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: textAnimationDelay }}
                                    >
                                        {slideData.subtitle}
                                    </motion.p>
                                )}

                                <h2
                                    className={cn(
                                        "font-bold mb-3 sm:mb-4 leading-tight",
                                        height === 'small' || height === 'extra-small'
                                            ? "text-2xl sm:text-3xl md:text-4xl"
                                            : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
                                        getTextColorAnimationStyle().className
                                    )}
                                    style={getTextColorAnimationStyle().style}
                                >
                                    <AnimatedText text={slideData.title || "Hero Title"} />
                                </h2>

                                {slideData.description && (
                                    <motion.p
                                        className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: textAnimationDelay + 0.2 }}
                                    >
                                        {slideData.description}
                                    </motion.p>
                                )}

                                {/* Buttons with new styling */}
                                <motion.div
                                    className={cn(
                                        "flex flex-col sm:flex-row gap-3 sm:gap-4",
                                        textAlign === 'center' && "sm:justify-center items-center",
                                        textAlign === 'right' && "sm:justify-end items-end",
                                        textAlign === 'left' && "items-start"
                                    )}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: textAnimationDelay + 0.3 }}
                                >
                                    {slideData.button1Text && (
                                        <Link to={slideData.button1Link || "#"} className="w-full sm:w-auto">
                                            <Button size="lg" className={getButtonClasses(true)}>
                                                {slideData.button1Text}
                                            </Button>
                                        </Link>
                                    )}
                                    {slideData.button2Text && (
                                        <Link to={slideData.button2Link || "#"} className="w-full sm:w-auto">
                                            <Button size="lg" variant="outline" className={getButtonClasses(false)}>
                                                {slideData.button2Text}
                                            </Button>
                                        </Link>
                                    )}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            );
        }

        // Split Layout: Image on one side, content on another
        return (
            <div
                key={index}
                className={cn(
                    "relative w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2",
                    getHeightClass()
                )}
                style={{
                    ...(height === 'custom' ? { minHeight: `${customHeight}px` } : {}),
                }}
            >
                {/* Image Section - Edge to edge */}
                <div
                    className={cn(
                        "relative h-64 md:h-full overflow-hidden",
                        layout === 'split-right' ? "md:order-2" : "md:order-1"
                    )}
                >
                    {hasVideo ? (
                        <video
                            className="absolute inset-0 w-full h-full object-cover"
                            src={slideData.videoUrl}
                            poster={slideData.videoPoster || slideData.image}
                            autoPlay={videoAutoplay}
                            muted={videoMuted}
                            loop={videoLoop}
                            playsInline
                        />
                    ) : hasImage ? (
                        <img
                            src={slideData.image}
                            alt={slideData.title || 'Hero image'}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className="absolute inset-0 w-full h-full"
                            style={{ backgroundColor: backgroundColor }}
                        />
                    )}
                    {/* Overlay for mobile */}
                    <div
                        className="absolute inset-0 z-[1] md:hidden"
                        style={getOverlayStyle()}
                    />
                </div>

                {/* Content Section - Asymmetric padding */}
                <div
                    className={cn(
                        "relative flex",
                        layout === 'split-right' ? "md:order-1" : "md:order-2"
                    )}
                    style={{ backgroundColor: backgroundColor }}
                >
                    <motion.div
                        className={cn(
                            "w-full py-8 sm:py-12 md:py-16 flex flex-col justify-center",
                            // Asymmetric padding: 96px (pl-24/pr-24) on outer edge, 24px (pl-6/pr-6) on inner edge
                            layout === 'split-right'
                                ? "pl-6 pr-6 md:pl-24 md:pr-6"   // Content on LEFT: 96px left, 24px right
                                : "pl-6 pr-6 md:pl-6 md:pr-24"   // Content on RIGHT: 24px left, 96px right
                        )}
                        variants={scrollAnimation ? getScrollAnimationVariants() : undefined}
                        initial={scrollAnimation ? "hidden" : undefined}
                        animate={scrollAnimation && isInView ? "visible" : undefined}
                    >
                        {/* Content wrapper */}
                        <motion.div
                            className={cn(
                                "flex flex-col",
                                getContentWidthClass(),
                                getTextAlignClass()
                            )}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            key={`content-${currentSlide}`}
                        >
                            {slideData.subtitle && (
                                <motion.p
                                    className="text-xs sm:text-sm md:text-base uppercase tracking-widest mb-2 sm:mb-4"
                                    style={{ color: subtitleColor }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: textAnimationDelay }}
                                >
                                    {slideData.subtitle}
                                </motion.p>
                            )}

                            <h2
                                className={cn(
                                    "font-bold mb-3 sm:mb-4 leading-tight",
                                    height === 'small' || height === 'extra-small'
                                        ? "text-2xl sm:text-3xl md:text-4xl"
                                        : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
                                    getTextColorAnimationStyle().className
                                )}
                                style={getTextColorAnimationStyle().style}
                            >
                                <AnimatedText text={slideData.title || "Hero Title"} />
                            </h2>

                            {slideData.description && (
                                <motion.p
                                    className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: textAnimationDelay + 0.2 }}
                                >
                                    {slideData.description}
                                </motion.p>
                            )}

                            {/* Buttons */}
                            <motion.div
                                className={cn(
                                    "flex flex-col sm:flex-row gap-3 sm:gap-4",
                                    textAlign === 'center' && "sm:justify-center items-center",
                                    textAlign === 'right' && "sm:justify-end items-end",
                                    textAlign === 'left' && "items-start"
                                )}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: textAnimationDelay + 0.3 }}
                            >
                                {slideData.button1Text && (
                                    <Link to={slideData.button1Link || "#"} className="w-full sm:w-auto">
                                        <Button size="lg" className={getButtonClasses(true)}>
                                            {slideData.button1Text}
                                        </Button>
                                    </Link>
                                )}
                                {slideData.button2Text && (
                                    <Link to={slideData.button2Link || "#"} className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className={getButtonClasses(false)}>
                                            {slideData.button2Text}
                                        </Button>
                                    </Link>
                                )}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        );
    };
    const useCarousel = enableSwipe && slides.length > 1;

    return (
        <section
            ref={heroRef}
            className={cn("relative overflow-hidden", !fullWidth && "rounded-lg")}
        >
            {/* CSS for gradient animations */}
            <style>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .before\\:animate-gradient-shift::before {
                    background-size: 200% 200%;
                    animation: gradientShift 8s ease infinite;
                }
                .hero-particles::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: 
                        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 1px),
                        radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1) 1px, transparent 1px),
                        radial-gradient(circle at 40% 80%, rgba(255,255,255,0.05) 2px, transparent 2px);
                    background-size: 100px 100px, 150px 150px, 200px 200px;
                    animation: float 20s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-10px) translateX(5px); }
                }
            `}</style>

            {useCarousel ? (
                /* Embla Carousel for Swipe Support */
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {slides.map((slideData, index) => renderSlideContent(slideData, index))}
                    </div>
                </div>
            ) : (
                /* Single slide or no swipe - use AnimatePresence for transitions */
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {renderSlideContent(slide, currentSlide)}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Navigation Arrows */}
            {showArrows && slides.length > 1 && (
                <>
                    <button
                        onClick={goToPrev}
                        className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all duration-300 items-center justify-center group"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all duration-300 items-center justify-center group"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-0.5 transition-transform" />
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
                                "transition-all duration-300 rounded-full",
                                currentSlide === index
                                    ? "w-8 h-2 bg-white"
                                    : "w-2 h-2 bg-white/50 hover:bg-white/70"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

