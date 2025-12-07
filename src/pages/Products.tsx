import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { getCart, getCartCount } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || "All");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
    setCartCount(getCartCount(getCart()));
  }, []);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar cartCount={cartCount} />

      <main className="flex-1 container mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16 fade-in">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            {selectedCategory === "All" ? "All Products" : selectedCategory}
          </p>
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Collection</h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Timeless pieces crafted with uncompromising attention to detail. Each garment embodies
            quiet luxury and enduring elegance.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-8 mb-12 overflow-x-auto pb-4 fade-in border-b border-border">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-xs tracking-[0.2em] uppercase whitespace-nowrap transition-all pb-4 -mb-[1px] ${
                selectedCategory === category
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-stone aspect-[3/4] mb-4" />
                <div className="h-4 bg-stone mb-2 w-1/2" />
                <div className="h-6 bg-stone mb-2" />
                <div className="h-4 bg-stone w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 fade-in">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 stagger-children">
            {filteredProducts.map((product) => (
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
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
