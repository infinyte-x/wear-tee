import { Play } from "lucide-react";
import { useState } from "react";

interface VideoBlockContent {
    url?: string;
    title?: string;
    autoplay?: boolean;
}

function getVideoEmbedUrl(url: string): string | null {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
}

export function VideoBlock({ content }: { content: VideoBlockContent }) {
    const [isPlaying, setIsPlaying] = useState(content.autoplay || false);

    const embedUrl = content.url ? getVideoEmbedUrl(content.url) : null;

    if (!embedUrl && !content.url) {
        return (
            <section className="py-8">
                <div className="container mx-auto">
                    <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border-2 border-dashed">
                        <div className="text-center text-muted-foreground">
                            <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Add a YouTube or Vimeo URL</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8">
            <div className="container mx-auto">
                {content.title && (
                    <h3 className="text-2xl font-serif mb-4 text-center">{content.title}</h3>
                )}

                <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                    {embedUrl ? (
                        <iframe
                            src={`${embedUrl}${content.autoplay ? '?autoplay=1' : ''}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={content.title || "Embedded video"}
                        />
                    ) : (
                        <video
                            src={content.url}
                            className="w-full h-full object-cover"
                            controls
                            autoPlay={content.autoplay}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
