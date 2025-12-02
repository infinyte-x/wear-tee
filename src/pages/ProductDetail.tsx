import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { addToCart, getCart, getCartCount } from "@/lib/cart";
import { toast } from "sonner";

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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
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
        .single();

      if (error) throw error;
      setProduct(data);
      if (data.sizes.length > 0) setSelectedSize(data.sizes[0]);
      if (data.colors.length > 0) setSelectedColor(data.colors[0]);
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/products");
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
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />

      <main className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Image */}
          <div className="fade-in">
            <div className="relative overflow-hidden bg-stone aspect-[3/4]">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8 fade-in">
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
                {product.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif mb-4">{product.name}</h1>
              <p className="text-2xl text-muted-foreground">${product.price.toFixed(2)}</p>
            </div>

            <p className="leading-relaxed text-muted-foreground">{product.description}</p>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <label className="block text-sm tracking-widest uppercase mb-4">Size</label>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 border transition-colors ${
                        selectedSize === size
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <label className="block text-sm tracking-widest uppercase mb-4">Color</label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 border transition-colors ${
                        selectedColor === color
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
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
              className="w-full py-6 text-sm tracking-widest uppercase bg-foreground hover:bg-foreground/90"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            {/* Product Details */}
            <div className="pt-8 border-t border-border space-y-4 text-sm text-muted-foreground">
              <p>Free shipping on orders over $200</p>
              <p>Free returns within 30 days</p>
              <p>Handcrafted with premium materials</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
