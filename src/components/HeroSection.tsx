import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax effect values
  const imageTransform = `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0002})`;
  const contentOpacity = Math.max(0, 1 - scrollY / 600);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&auto=format&fit=crop&q=80"
          alt="Fashion hero"
          className="w-full h-full object-cover transition-transform duration-100 ease-out"
          style={{ transform: imageTransform }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/30 to-background" />
        {/* Bottom fade for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 text-center px-6 max-w-4xl"
        style={{ opacity: contentOpacity }}
      >
        {/* Subtitle */}
        <p
          className={cn(
            "text-xs tracking-[0.4em] uppercase text-cream/80 mb-6 transition-all duration-700",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: "200ms" }}
        >
          New Collection 2024
        </p>

        {/* Main Heading */}
        <h1
          className={cn(
            "text-5xl md:text-7xl lg:text-8xl font-serif text-cream tracking-tight leading-[1.1] mb-8 transition-all duration-700",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "400ms" }}
        >
          Timeless Elegance,
          <br />
          <span className="italic font-light">Modern Spirit</span>
        </h1>

        {/* Description */}
        <p
          className={cn(
            "text-lg md:text-xl text-cream/80 max-w-xl mx-auto leading-relaxed mb-10 transition-all duration-700",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "600ms" }}
        >
          Discover a curated collection of luxury pieces crafted with uncompromising attention to detail.
        </p>

        {/* Buttons */}
        <div
          className={cn(
            "flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "800ms" }}
        >
          <Link to="/products">
            <Button
              size="lg"
              className="px-10 py-6 text-xs tracking-widest uppercase bg-cream text-charcoal hover:bg-cream/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 group"
            >
              Shop Collection
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/products">
            <Button
              size="lg"
              variant="outline"
              className="px-10 py-6 text-xs tracking-widest uppercase border-cream/50 text-cream hover:bg-cream/10 hover:border-cream hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300"
            >
              View Lookbook
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={cn(
          "absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-cream/60 transition-all duration-700",
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: "1000ms" }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>
    </section>
  );
};

export default HeroSection;

