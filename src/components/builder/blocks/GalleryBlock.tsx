import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

interface GalleryImage {
    url: string;
    alt?: string;
    caption?: string;
}

interface GalleryBlockContent {
    title?: string;
    columns?: 2 | 3 | 4;
    images?: GalleryImage[];
}

export function GalleryBlock({ content }: { content: GalleryBlockContent }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const columns = content.columns || 3;

    const gridClasses = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    };

    const images = content.images || [
        { url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600", alt: "Gallery image 1" },
        { url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600", alt: "Gallery image 2" },
        { url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600", alt: "Gallery image 3" },
        { url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600", alt: "Gallery image 4" },
        { url: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600", alt: "Gallery image 5" },
        { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600", alt: "Gallery image 6" },
    ];

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <section className="py-8">
            <div className="container mx-auto px-6">
                {content.title && (
                    <h2 className="text-3xl font-serif mb-8 text-center">{content.title}</h2>
                )}

                <div className={`grid ${gridClasses[columns]} gap-4`}>
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => openLightbox(index)}
                            className="aspect-square overflow-hidden rounded-lg group relative focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <img
                                src={image.url}
                                alt={image.alt || `Gallery image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </button>
                    ))}
                </div>

                <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                    <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
                        <div className="relative aspect-video md:aspect-[4/3] flex items-center justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
                                onClick={() => setLightboxOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                onClick={goToPrevious}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>

                            <img
                                src={images[currentIndex]?.url}
                                alt={images[currentIndex]?.alt || ''}
                                className="max-h-[80vh] max-w-full object-contain"
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                onClick={goToNext}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>

                            {images[currentIndex]?.caption && (
                                <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                                    {images[currentIndex].caption}
                                </div>
                            )}
                        </div>

                        <div className="p-4 text-center text-white/60 text-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}
