import { useEffect, useState } from "react";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { addToCart, getCart, getCartCount } from "@/lib/cart";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductReviews } from "@/components/ProductReviews";
import { WishlistButton } from "@/components/WishlistButton";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  category: string;
  sizes: string[] | null;
  colors: string[] | null;
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
        <div className="w-full px-4 md:px-6 lg:px-8 pt-16 pb-16">
          <div className="animate-pulse grid md:grid-cols-2 gap-0.5">
            <div className="bg-neutral-100 aspect-[3/4]" />
            <div className="p-6 md:p-8 space-y-6">
              <div className="h-4 bg-neutral-100 w-1/4" />
              <div className="h-6 bg-neutral-100 w-3/4" />
              <div className="h-4 bg-neutral-100 w-1/4" />
              <div className="h-32 bg-neutral-100" />
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

      <main className="flex-1 pt-12">
        {/* Product Grid - Edge to edge */}
        <div className="grid md:grid-cols-2 gap-0.5">
          {/* Product Images */}
          <div className="relative bg-neutral-100">
            {/* Main Image */}
            <div className="relative aspect-[3/4] md:aspect-auto md:h-[calc(100vh-48px)] overflow-hidden">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-[#181818]" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-[#181818]" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${selectedImageIndex === index ? 'bg-[#181818]' : 'bg-[#181818]/30'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 md:p-8 lg:p-12 flex flex-col justify-center">
            {/* Category */}
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#666666] mb-3">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="text-[1rem] md:text-[1.25rem] uppercase tracking-[0.1em] font-normal text-[#181818] mb-3">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-[0.875rem] tracking-[0.05em] text-[#181818] mb-6">
              ${product.price.toFixed(2)}
            </p>

            {/* Description */}
            {product.description && (
              <p className="text-[0.75rem] leading-relaxed text-[#666666] mb-8">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-[#181818] mb-3">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-[0.65rem] uppercase tracking-[0.1em] transition-all ${selectedSize === size
                          ? "bg-[#181818] text-white"
                          : "border border-[#e5e5e5] text-[#181818] hover:border-[#181818]"
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
              <div className="mb-8">
                <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-[#181818] mb-3">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-[0.65rem] uppercase tracking-[0.1em] transition-all ${selectedColor === color
                          ? "bg-[#181818] text-white"
                          : "border border-[#e5e5e5] text-[#181818] hover:border-[#181818]"
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-2 mb-8">
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-12 text-[0.65rem] tracking-[0.2em] uppercase bg-[#181818] hover:bg-[#181818]/90 text-white rounded-none"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Bag"}
              </Button>
              <WishlistButton
                productId={product.id}
                variant="icon"
                size="lg"
                className="h-12 w-12 border border-[#e5e5e5] rounded-none hover:border-[#181818]"
              />
            </div>

            {/* Product Details */}
            <div className="pt-6 border-t border-[#e5e5e5] space-y-2">
              <p className="text-[0.65rem] tracking-[0.1em] uppercase text-[#666666]">
                Free shipping on orders over $200
              </p>
              <p className="text-[0.65rem] tracking-[0.1em] uppercase text-[#666666]">
                Free returns within 30 days
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="w-full px-4 md:px-6 lg:px-8 py-16">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
