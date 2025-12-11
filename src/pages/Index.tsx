import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import DynamicHeroSection from "@/components/DynamicHeroSection";
import DynamicCategoryGrid from "@/components/DynamicCategoryGrid";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { getCart, getCartCount } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  featured: boolean;
}

interface PhilosophyContent {
  title: string;
  description: string;
  image: string;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const { data: philosophyContent } = useQuery({
    queryKey: ['philosophy-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('key', 'philosophy')
        .maybeSingle();
      if (error) throw error;
      return data?.content as unknown as PhilosophyContent;
    },
  });

  useEffect(() => {
    fetchFeaturedProducts();
    setCartCount(getCartCount(getCart()));
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .limit(4);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
  };

  const philosophy = philosophyContent || {
    title: "Our Philosophy",
    description: "We believe in the power of understated elegance. Each piece in our collection is thoughtfully designed and meticulously crafted to transcend fleeting trends. From the finest materials sourced globally to the skilled artisans who bring our vision to life, every detail reflects our commitment to exceptional quality and timeless design.",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop&q=80",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />

      <DynamicHeroSection />

      {/* Featured Products */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-16 text-center fade-in">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Curated Selection</p>
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Featured Pieces</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Handpicked essentials that embody quiet luxury and sophisticated craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.images[0]}
              category={product.category}
            />
          ))}
        </div>

        <div className="text-center mt-12 fade-in">
          <Link
            to="/products"
            className="inline-block text-sm tracking-widest uppercase border-b border-foreground pb-1 hover:opacity-70 transition-opacity"
          >
            View All Products
          </Link>
        </div>
      </section>

      <DynamicCategoryGrid />

      {/* Philosophy Section */}
      <section className="py-24 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-in">
              <img
                src={philosophy.image}
                alt="Craftsmanship"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            <div className="space-y-8 fade-in">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Our Philosophy</p>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                Crafted with Purpose, <br />
                <span className="italic">Designed to Last</span>
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {philosophy.description}
              </p>
              <Link
                to="/products"
                className="inline-block text-sm tracking-widest uppercase border-b border-foreground pb-1 hover:opacity-70 transition-opacity"
              >
                Discover More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />

      <Footer />
    </div>
  );
};

export default Index;
