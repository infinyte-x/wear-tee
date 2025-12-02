import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { getCart, getCartCount } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  featured: boolean;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone/50 to-background" />
        <div className="relative z-10 text-center space-y-8 px-6 fade-in">
          <h1 className="text-6xl md:text-8xl font-serif tracking-tight">
            Timeless Elegance
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover a curated collection of luxury pieces crafted with uncompromising attention
            to detail and enduring style.
          </p>
          <Link to="/products">
            <Button
              size="lg"
              className="mt-8 px-12 py-6 text-sm tracking-widest uppercase bg-foreground hover:bg-foreground/90"
            >
              Explore Collection
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-16 text-center fade-in">
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
      </section>

      {/* Philosophy Section */}
      <section className="bg-stone py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6 fade-in">
            <h2 className="text-4xl font-serif">Our Philosophy</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              We believe in the power of understated elegance. Each piece in our collection is
              thoughtfully designed and meticulously crafted to transcend fleeting trends,
              offering enduring style that speaks softly yet confidently.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              From the finest materials sourced globally to the skilled artisans who bring our
              vision to life, every detail reflects our commitment to exceptional quality and
              timeless design.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <p className="text-2xl font-serif">ATELIER</p>
            <p className="text-sm text-muted-foreground">
              © 2024 Atelier. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
