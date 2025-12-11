import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroContent {
  headline: string;
  subheadline: string;
  description: string;
  image: string;
  button_text: string;
  button_link: string;
}

const DynamicHeroSection = () => {
  const { data: heroContent } = useQuery({
    queryKey: ['hero-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('key', 'hero')
        .maybeSingle();
      if (error) throw error;
      return data?.content as unknown as HeroContent;
    },
  });

  const content = heroContent || {
    headline: "Timeless Elegance,",
    subheadline: "Modern Spirit",
    description: "Discover a curated collection of luxury pieces crafted with uncompromising attention to detail.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&auto=format&fit=crop&q=80",
    button_text: "Shop Collection",
    button_link: "/products",
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={content.image}
          alt="Fashion hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/20 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-6 max-w-4xl fade-in">
        <p className="text-xs tracking-[0.4em] uppercase text-cream/80">
          New Collection 2024
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-cream tracking-tight leading-[1.1]">
          {content.headline}
          <br />
          <span className="italic font-light">{content.subheadline}</span>
        </h1>
        <p className="text-lg md:text-xl text-cream/80 max-w-xl mx-auto leading-relaxed">
          {content.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to={content.button_link}>
            <Button
              size="lg"
              className="px-10 py-6 text-xs tracking-widest uppercase bg-cream text-charcoal hover:bg-cream/90 group"
            >
              {content.button_text}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/products?featured=true">
            <Button
              size="lg"
              variant="outline"
              className="px-10 py-6 text-xs tracking-widest uppercase border-cream/50 text-cream hover:bg-cream/10 hover:border-cream"
            >
              View Lookbook
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/60">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-cream/60 to-transparent" />
      </div>
    </section>
  );
};

export default DynamicHeroSection;
