import { useEffect, useState } from "react";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { addToCart, getCart, getCartCount } from "@/lib/cart";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
}

const routeApi = getRouteApi('/product/$id')

const ProductDetail = () => {
  const { id } = routeApi.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProduct();
    setCartCount(getCartCount(getCart()));
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate({ to: "/products" });
        return;
      }
      setProduct(data);
      if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
      if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate({ to: "/products" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
      },
      selectedSize,
      selectedColor
    );

    setCartCount(getCartCount(getCart()));
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cartCount} />
        <div className="container mx-auto px-6 py-16">
          <div className="animate-pulse grid md:grid-cols-2 gap-12">
            <div className="bg-stone aspect-[3/4]" />
            <div className="space-y-6">
              <div className="h-8 bg-stone w-3/4" />
              <div className="h-6 bg-stone w-1/4" />
              <div className="h-32 bg-stone" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar cartCount={cartCount} />

      <main className="flex-1 container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Images */}
          <div className="fade-in space-y-4">
            <div className="relative overflow-hidden bg-stone aspect-[3/4]">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-24 bg-stone overflow-hidden transition-opacity ${selectedImageIndex === index ? 'ring-1 ring-foreground' : 'opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8 fade-in">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                {product.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif mb-4">{product.name}</h1>
              <p className="text-2xl">${product.price.toFixed(2)}</p>
            </div>

            <p className="leading-relaxed text-muted-foreground">{product.description}</p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase mb-4">Size</label>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 text-sm transition-all ${selectedSize === size
                        ? "bg-foreground text-background"
                        : "border border-border hover:border-foreground"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs tracking-[0.2em] uppercase mb-4">Color</label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 text-sm transition-all ${selectedColor === color
                        ? "bg-foreground text-background"
                        : "border border-border hover:border-foreground"
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              className="w-full py-6 text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            {/* Product Details */}
            <div className="pt-8 border-t border-border space-y-4 text-sm text-muted-foreground">
              <p>Complimentary shipping on orders over $200</p>
              <p>Free returns within 30 days</p>
              <p>Handcrafted with premium materials</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
