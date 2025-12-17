import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapBlockContent {
    title?: string;
    address?: string;
    embedUrl?: string;
    mapImage?: string;
    lat?: number;
    lng?: number;
    zoom?: number;
    showAddressCard?: boolean;
    buttonText?: string;
    buttonLink?: string;
}

export function MapBlock({ content }: { content: MapBlockContent }) {
    const address = content.address || "123 Main St, City, Country";
    const showCard = content.showAddressCard !== false;

    // Generate Google Maps embed URL from lat/lng if provided
    const getEmbedUrl = () => {
        if (content.embedUrl) return content.embedUrl;
        if (content.lat && content.lng) {
            const zoom = content.zoom || 14;
            return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${content.lng}!3d${content.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2s!4v1000000000000!5m2!1sen!2s&z=${zoom}`;
        }
        // Default to a placeholder map
        return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.902929594116!2d90.38935131498185!3d23.75086868458909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ1JzAzLjEiTiA5MMKwMjMnMjkuNCJF!5e0!3m2!1sen!2sbd!4v1000000000000!5m2!1sen!2sbd";
    };

    const getGoogleMapsLink = () => {
        if (content.buttonLink) return content.buttonLink;
        if (content.lat && content.lng) {
            return `https://www.google.com/maps?q=${content.lat},${content.lng}`;
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    };

    return (
        <section className="py-16">
            <div className="container mx-auto px-6">
                {content.title && (
                    <h2 className="text-2xl md:text-3xl font-serif text-center mb-10">{content.title}</h2>
                )}

                <div className="relative rounded-xl overflow-hidden shadow-lg">
                    {/* Map */}
                    {content.mapImage ? (
                        <img
                            src={content.mapImage}
                            alt="Location map"
                            className="w-full h-[400px] object-cover"
                        />
                    ) : (
                        <iframe
                            src={getEmbedUrl()}
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Location Map"
                        />
                    )}

                    {/* Address Card Overlay */}
                    {showCard && (
                        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-sm">
                            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-6 shadow-lg border">
                                <div className="flex items-start gap-3 mb-4">
                                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-sm">{address}</p>
                                </div>
                                <Button asChild className="w-full">
                                    <a
                                        href={getGoogleMapsLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {content.buttonText || "Get Directions"}
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
