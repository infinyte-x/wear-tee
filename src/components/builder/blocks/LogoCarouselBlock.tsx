import { cn } from "@/lib/utils";

interface LogoItem {
    url: string;
    alt: string;
    link?: string;
}

interface LogoCarouselBlockContent {
    title?: string;
    logos?: LogoItem[];
    speed?: 'slow' | 'normal' | 'fast';
    grayscale?: boolean;
}

export function LogoCarouselBlock({ content }: { content: LogoCarouselBlockContent }) {
    const logos = content.logos || [
        { url: 'https://placehold.co/200x80/f8f8f8/666?text=Brand+1', alt: 'Brand 1' },
        { url: 'https://placehold.co/200x80/f8f8f8/666?text=Brand+2', alt: 'Brand 2' },
        { url: 'https://placehold.co/200x80/f8f8f8/666?text=Brand+3', alt: 'Brand 3' },
        { url: 'https://placehold.co/200x80/f8f8f8/666?text=Brand+4', alt: 'Brand 4' },
        { url: 'https://placehold.co/200x80/f8f8f8/666?text=Brand+5', alt: 'Brand 5' },
    ];

    const speedDuration = {
        slow: '40s',
        normal: '25s',
        fast: '15s',
    };

    const speed = content.speed || 'normal';
    const grayscale = content.grayscale ?? true;

    // Duplicate logos for seamless loop
    const duplicatedLogos = [...logos, ...logos];

    return (
        <section className="py-12 overflow-hidden">
            <div className="container mx-auto">
                {content.title && (
                    <h2 className="text-lg font-medium text-center text-muted-foreground mb-8">
                        {content.title}
                    </h2>
                )}
            </div>

            <div className="relative">
                {/* Gradient masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

                {/* Scrolling track */}
                <div
                    className="flex items-center gap-16 animate-scroll"
                    style={{
                        animationDuration: speedDuration[speed],
                        width: 'fit-content',
                    }}
                >
                    {duplicatedLogos.map((logo, index) => {
                        const LogoImage = (
                            <img
                                src={logo.url}
                                alt={logo.alt}
                                className={cn(
                                    "h-12 w-auto object-contain transition-all hover:scale-105",
                                    grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                                )}
                            />
                        );

                        return logo.link ? (
                            <a
                                key={index}
                                href={logo.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0"
                            >
                                {LogoImage}
                            </a>
                        ) : (
                            <div key={index} className="shrink-0">
                                {LogoImage}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll linear infinite;
                }
            `}</style>
        </section>
    );
}
