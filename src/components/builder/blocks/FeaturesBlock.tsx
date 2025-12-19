
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

// Dynamic icon renderer - supports any lucide icon by name
function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComponent = (Icons as any)[name] || Icons.Star;
    return <IconComponent className={className} />;
}

export function FeaturesBlock({ content }: { content: any }) {
    const features = content.items || [
        { title: "Quality", description: "Best materials", icon: "Star" },
        { title: "Shipping", description: "Fast delivery", icon: "Truck" },
        { title: "Secure", description: "Safe payments", icon: "Shield" },
    ];

    const columns = content.columns || 3;
    const variant = content.variant || 'cards';
    const showTitle = content.title || content.subtitle;

    const getGridCols = () => {
        switch (columns) {
            case 2: return 'grid-cols-1 md:grid-cols-2';
            case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            default: return 'grid-cols-1 md:grid-cols-3';
        }
    };

    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto">
                {showTitle && (
                    <div className="text-center mb-12">
                        {content.subtitle && (
                            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                                {content.subtitle}
                            </p>
                        )}
                        {content.title && (
                            <h2 className="text-3xl md:text-4xl font-serif">
                                {content.title}
                            </h2>
                        )}
                    </div>
                )}

                <div className={cn("grid gap-8", getGridCols())}>
                    {features.map((item: any, i: number) => (
                        <div
                            key={i}
                            className={cn(
                                "flex flex-col items-center text-center p-6 rounded-lg transition-all",
                                variant === 'cards' && "bg-background shadow-sm border hover:shadow-md",
                                variant === 'minimal' && "bg-transparent",
                                variant === 'icons-only' && "bg-transparent"
                            )}
                        >
                            <div className={cn(
                                "p-3 rounded-full mb-4",
                                variant === 'cards' && "bg-primary/10",
                                variant === 'minimal' && "bg-primary/5",
                                variant === 'icons-only' && "bg-primary text-white"
                            )}>
                                <DynamicIcon
                                    name={item.icon || 'Star'}
                                    className={cn(
                                        "h-6 w-6",
                                        variant === 'icons-only' ? "text-white" : "text-primary"
                                    )}
                                />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                            {variant !== 'icons-only' && item.description && (
                                <p className="text-muted-foreground text-sm">{item.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
