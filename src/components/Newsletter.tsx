import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Thank you for subscribing", {
      description: "You'll be the first to know about new collections.",
    });
    setEmail("");
    setLoading(false);
  };

  return (
    <section className="bg-stone py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8 fade-in">
          <h2 className="text-4xl md:text-5xl font-serif">Stay in the Know</h2>
          <p className="text-muted-foreground leading-relaxed">
            Subscribe to receive exclusive access to new collections, private sales, 
            and style inspiration curated for the modern wardrobe.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background border-border py-6 px-4 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-foreground"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="py-6 px-8 text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
