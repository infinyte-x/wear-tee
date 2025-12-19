
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCart, getCartCount } from "@/lib/cart";
import { BlockData } from "@/components/builder/types";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import { Loader2 } from "lucide-react";
import { getThemeStyle, PageTheme } from "@/lib/theme";

// Fallback content if DB fetch fails (for safety)
import DynamicHeroSection from "@/components/DynamicHeroSection";
import DynamicCategoryGrid from "@/components/DynamicCategoryGrid";
import Newsletter from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";

const Index = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount(getCart()));
  }, []);

  // Fetch Homepage Content
  const { data: homePage, isLoading } = useQuery({
    queryKey: ['home-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('is_home', true)
        .maybeSingle(); // Use maybeSingle to avoid error if not found

      if (error) console.error("Error fetching home page:", error);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If page found in DB, render using Builder engine
  if (homePage && homePage.content) {
    const blocks = homePage.content as unknown as BlockData[];
    // @ts-ignore
    const themeStyle = homePage.theme ? getThemeStyle(homePage.theme as unknown as PageTheme) : undefined;

    return (
      <div className="min-h-screen bg-background flex flex-col" style={themeStyle}>
        <Navbar cartCount={cartCount} />
        <main className="flex-1 pt-12">
          {blocks.map(block => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </main>
        <Footer />
      </div>
    );
  }

  // FALLBACK: Existing implementation (if no DB page found)
  // This keeps the site working until the migration is applied or if it fails.
  return <FallbackIndex cartCount={cartCount} />;
};

// --- Fallback Component (Original Index.tsx content) ---
const FallbackIndex = ({ cartCount }: { cartCount: number }) => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").eq("featured", true).limit(4);
      if (data) setFeaturedProducts(data);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />
      <DynamicHeroSection />
      <section className="container mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-serif mb-4">Featured Pieces</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {featuredProducts.map(p => (
            <ProductCard key={p.id} {...p} image={p.images[0]} />
          ))}
        </div>
      </section>
      <DynamicCategoryGrid />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default Index;
