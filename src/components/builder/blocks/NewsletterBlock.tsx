
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function NewsletterBlock({ content }: { content: any }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from("newsletter_subscribers")
                .insert({ email });

            if (error) {
                if (error.code === '23505') {
                    toast.info("You are already subscribed!");
                } else {
                    throw error;
                }
            } else {
                toast.success("Thanks for subscribing!");
                setEmail("");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-24 border-t border-border bg-background">
            <div className="container mx-auto px-6 text-center">
                <div className="max-w-2xl mx-auto space-y-8 fade-in">
                    <div>
                        <h2 className="text-3xl font-serif mb-4">
                            {content.title || "Join Our Newsletter"}
                        </h2>
                        <p className="text-muted-foreground">
                            {content.description || "Subscribe to receive updates, access to exclusive deals, and more."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11 bg-background"
                        />
                        <Button type="submit" className="h-11 px-8" disabled={loading}>
                            {loading ? "Subscribing..." : "Subscribe"}
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
