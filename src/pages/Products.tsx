import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { getCart, getCartCount } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
    setCartCount(getCartCount(getCart()));
  }, []);

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
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />

      <main className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16 fade-in">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Collection</h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Timeless pieces crafted with uncompromising attention to detail. Each garment embodies
            quiet luxury and enduring elegance.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-6 mb-12 overflow-x-auto pb-4 fade-in">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-sm tracking-widest uppercase whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "text-foreground border-b-2 border-accent pb-1"
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
    </div>
  );
};

export default Products;
