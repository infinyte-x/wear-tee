
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function NewsletterBlock({ content }: { content: any }) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    // Configurable properties
    const variant = content.variant || 'default';
    const showNameField = content.showNameField || false;
    const centerAlign = content.centerAlign !== false;
    const buttonText = content.buttonText || 'Subscribe';
    const placeholder = content.placeholder || 'Enter your email';
    const backgroundImage = content.backgroundImage || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const insertData: any = { email };
            if (showNameField && name) {
                insertData.name = name;
            }

            const { error } = await supabase
                .from("newsletter_subscribers")
                .insert(insertData);

            if (error) {
                if (error.code === '23505') {
                    toast.info("You are already subscribed!");
                } else {
                    throw error;
                }
            } else {
                toast.success("Thanks for subscribing!");
                setEmail("");
                setName("");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Variant styles
    const getVariantStyles = () => {
        switch (variant) {
            case 'dark':
                return 'bg-zinc-900 text-white';
            case 'gradient':
                return 'bg-gradient-to-br from-primary/90 to-primary text-white';
            case 'minimal':
                return 'bg-transparent border-y border-border';
            default:
                return 'bg-muted/30';
        }
    };

    const getButtonVariant = () => {
        switch (variant) {
            case 'dark':
            case 'gradient':
                return 'secondary';
            default:
                return 'default';
        }
    };

    return (
        <section
            className={cn("py-24 relative overflow-hidden", getVariantStyles())}
            style={backgroundImage ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            } : undefined}
        >
            {/* Overlay for background image */}
            {backgroundImage && (
                <div className="absolute inset-0 bg-black/50" />
            )}

            <div className={cn(
                "container mx-auto px-6 relative z-10",
                centerAlign && "text-center"
            )}>
                <div className={cn(
                    "max-w-2xl space-y-8 fade-in",
                    centerAlign && "mx-auto"
                )}>
                    <div>
                        {content.subtitle && (
                            <p className={cn(
                                "text-xs tracking-[0.3em] uppercase mb-4",
                                variant === 'dark' || variant === 'gradient' || backgroundImage
                                    ? "text-white/70"
                                    : "text-muted-foreground"
                            )}>
                                {content.subtitle}
                            </p>
                        )}
                        <h2 className={cn(
                            "text-3xl md:text-4xl font-serif mb-4",
                            backgroundImage && "text-white"
                        )}>
                            {content.title || "Join Our Newsletter"}
                        </h2>
                        <p className={cn(
                            variant === 'dark' || variant === 'gradient' || backgroundImage
                                ? "text-white/80"
                                : "text-muted-foreground"
                        )}>
                            {content.description || "Subscribe to receive updates, access to exclusive deals, and more."}
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className={cn(
                            "flex flex-col gap-4",
                            centerAlign ? "max-w-md mx-auto" : "max-w-md",
                            !showNameField && "sm:flex-row"
                        )}
                    >
                        {showNameField && (
                            <Input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={cn(
                                    "h-11",
                                    (variant === 'dark' || variant === 'gradient' || backgroundImage) &&
                                    "bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                )}
                            />
                        )}
                        <div className={cn(
                            "flex gap-4",
                            showNameField ? "flex-col sm:flex-row" : "flex-1"
                        )}>
                            <Input
                                type="email"
                                placeholder={placeholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={cn(
                                    "h-11 flex-1",
                                    (variant === 'dark' || variant === 'gradient' || backgroundImage) &&
                                    "bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                )}
                            />
                            <Button
                                type="submit"
                                variant={getButtonVariant() as any}
                                className="h-11 px-8 whitespace-nowrap"
                                disabled={loading}
                            >
                                {loading ? "Subscribing..." : buttonText}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
