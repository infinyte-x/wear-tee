import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface CTABlockContent {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    variant?: 'default' | 'dark' | 'gradient';
}

export function CTABlock({ content }: { content: CTABlockContent }) {
    const variant = content.variant || 'default';

    const bgClasses = {
        default: 'bg-primary/5 border',
        dark: 'bg-zinc-900 text-white',
        gradient: 'bg-gradient-to-r from-primary to-primary/60 text-white',
    };

    return (
        <section className={`py-16 ${bgClasses[variant]} rounded-xl`}>
            <div className="container mx-auto px-6">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl font-serif">
                        {content.title || "Ready to get started?"}
                    </h2>

                    {content.description && (
                        <p className={variant === 'default' ? 'text-muted-foreground' : 'opacity-90'}>
                            {content.description}
                        </p>
                    )}

                    <div className="pt-4">
                        {content.buttonLink ? (
                            <Button
                                size="lg"
                                variant={variant === 'default' ? 'default' : 'secondary'}
                                asChild
                            >
                                <Link to={content.buttonLink}>
                                    {content.buttonText || "Get Started"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                variant={variant === 'default' ? 'default' : 'secondary'}
                            >
                                {content.buttonText || "Get Started"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
