import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSlide {
    image?: string;
    title?: string;
    subtitle?: string;
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
    };
}

export function HeroBlock({ content }: HeroBlockProps) {
    const slides = content.slides || [{ title: "Hero Title", subtitle: "Subtitle goes here" }];
    const autoPlay = content.autoPlay ?? false;
    const autoPlayInterval = content.autoPlayInterval ?? 5000;
    const showDots = content.showDots ?? true;
    const showArrows = content.showArrows ?? true;
    const overlayOpacity = content.overlayOpacity ?? 0.5;

    const [currentSlide, setCurrentSlide] = useState(0);

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
        <div className="relative overflow-hidden rounded-lg">
            {/* Background Image */}
            <div
                className="relative min-h-[300px] md:min-h-[480px] lg:min-h-[640px] flex items-center justify-center transition-all duration-500"
                style={{
                    backgroundImage: slide.image ? `url(${slide.image})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: slide.image ? undefined : "#18181b",
                }}
            >
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: overlayOpacity }}
                />

                {/* Content */}
                <div className="relative z-10 text-center px-8 py-20 max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 transition-all duration-300">
                        {slide.title || "Hero Title"}
                    </h2>
                    <p className="text-xl text-white/80 mb-8 transition-all duration-300">
                        {slide.subtitle || "Subtitle goes here"}
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        {slide.button1Text && (
                            <a href={slide.button1Link || "#"}>
                                <Button size="lg" className="bg-white text-black hover:bg-white/90">
                                    {slide.button1Text}
                                </Button>
                            </a>
                        )}
                        {slide.button2Text && (
                            <a href={slide.button2Link || "#"}>
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                    {slide.button2Text}
                                </Button>
                            </a>
                        )}
                    </div>
                </div>

                {/* Navigation Arrows */}
                {showArrows && slides.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <ChevronRight className="h-6 w-6" />
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
