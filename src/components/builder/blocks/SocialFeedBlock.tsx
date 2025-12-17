import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialImage {
    url: string;
    link?: string;
}

interface SocialFeedBlockContent {
    title?: string;
    subtitle?: string;
    images?: SocialImage[];
    columns?: 3 | 4 | 5 | 6;
    instagramHandle?: string;
    showFollowButton?: boolean;
}

export function SocialFeedBlock({ content }: { content: SocialFeedBlockContent }) {
    const images = content.images || [
        { url: 'https://placehold.co/400x400/f0f0f0/999?text=1' },
        { url: 'https://placehold.co/400x400/f0f0f0/999?text=2' },
        { url: 'https://placehold.co/400x400/f0f0f0/999?text=3' },
        { url: 'https://placehold.co/400x400/f0f0f0/999?text=4' },
        { url: 'https://placehold.co/400x400/f0f0f0/999?text=5' },
        { url: 'https://placehold.co/400x400/f0f0f0/999?text=6' },
    ];

    const columns = content.columns || 6;
    const handle = content.instagramHandle || 'yourbrand';
    const showFollow = content.showFollowButton !== false;

    const gridClasses = {
        3: 'grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
        5: 'grid-cols-2 md:grid-cols-5',
        6: 'grid-cols-3 md:grid-cols-6',
    };

    return (
        <section className="py-16">
            <div className="container mx-auto px-6">
                {(content.title || content.subtitle) && (
                    <div className="text-center mb-8">
                        {content.title && (
                            <h2 className="text-2xl md:text-3xl font-serif mb-2">{content.title}</h2>
                        )}
                        {content.subtitle && (
                            <p className="text-muted-foreground">{content.subtitle}</p>
                        )}
                    </div>
                )}

                <div className={`grid ${gridClasses[columns]} gap-2`}>
                    {images.map((image, index) => (
                        <a
                            key={index}
                            href={image.link || `https://instagram.com/${handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square overflow-hidden bg-muted"
                        >
                            <img
                                src={image.url}
                                alt={`Social feed image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <Instagram className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </a>
                    ))}
                </div>

                {showFollow && (
                    <div className="text-center mt-8">
                        <Button variant="outline" asChild>
                            <a
                                href={`https://instagram.com/${handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Instagram className="h-4 w-4 mr-2" />
                                Follow @{handle}
                            </a>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
