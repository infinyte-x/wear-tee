import { useEffect, useState, useMemo } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import ProductFilters, { FilterState } from "@/components/ProductFilters";
import { getCart, getCartCount } from "@/lib/cart";

const routeApi = getRouteApi('/products')

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[] | null;
  colors: string[] | null;
}

const Products = () => {
  const { category: categoryFromUrl } = routeApi.useSearch()

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || "All");
  const [cartCount, setCartCount] = useState(0);

  // Calculate max price for filter
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 100) * 100;
  }, [products]);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priceRange: [0, 1000],
    sizes: [],
    colors: [],
    sortBy: 'newest',
  });

  // Update price range when maxPrice changes
  useEffect(() => {
    if (maxPrice > 0 && filters.priceRange[1] === 1000) {
      setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
    }
  }, [maxPrice]);

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

  // Get available sizes and colors from products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => p.sizes?.forEach(s => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => p.colors?.forEach(c => colors.add(c)));
    return Array.from(colors).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }

    // Price filter
    result = result.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter(p =>
        p.sizes?.some(s => filters.sizes.includes(s))
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter(p =>
        p.colors?.some(c => filters.colors.includes(c))
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        // Already sorted by created_at desc from query
        break;
    }

    return result;
  }, [products, selectedCategory, filters]);

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
        <div className="flex gap-8 mb-8 overflow-x-auto pb-4 fade-in border-b border-border">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-xs tracking-[0.2em] uppercase whitespace-nowrap transition-all pb-4 -mb-[1px] ${selectedCategory === category
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Filters */}
        <ProductFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableSizes={availableSizes}
          availableColors={availableColors}
          maxPrice={maxPrice}
        />

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="shimmer aspect-[3/4] rounded-sm" />
                <div className="space-y-2">
                  <div className="shimmer h-3 w-1/3 rounded" />
                  <div className="shimmer h-5 w-full rounded" />
                  <div className="shimmer h-4 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 fade-in">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 stagger-children">
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
