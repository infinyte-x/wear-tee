import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  getCartTotal,
  getCartCount,
  type CartItem,
} from "@/lib/cart";
import { toast } from "sonner";
import { usePageBlocks } from "@/hooks/usePageBlocks";
import { PageBlocks } from "@/components/PageBlocks";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  // Fetch page builder blocks for the cart page
  const { data: pageData } = usePageBlocks("cart");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cartItems = getCart();
    setCart(cartItems);
    setCartCount(getCartCount(cartItems));
  };

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId);
    loadCart();
    toast.success("Item removed from cart");
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartItemQuantity(itemId, quantity);
    loadCart();
  };

  const total = getCartTotal(cart);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar cartCount={cartCount} />

      {/* Page Builder Blocks - Header Section */}
      {pageData?.blocks && pageData.blocks.length > 0 && (
        <PageBlocks blocks={pageData.blocks} position="top" />
      )}

      <main className="flex-1 container mx-auto px-6 py-16 pt-24">
        {/* Only show default header if no page builder blocks */}
        {(!pageData?.blocks || pageData.blocks.length === 0) && (
          <div className="mb-16 fade-in">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">Your Selection</p>
            <h1 className="text-5xl md:text-6xl font-serif">Shopping Cart</h1>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-20 fade-in">
            <p className="text-muted-foreground mb-8">Your cart is empty</p>
            <Link to="/products">
              <Button className="bg-foreground hover:bg-foreground/90 px-8 py-6 text-xs tracking-widest uppercase">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-0">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex gap-6 py-8 fade-in ${index !== cart.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="w-28 h-36 bg-stone flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-serif text-xl mb-2">{item.name}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors h-fit"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-3 hover:bg-stone transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-12 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-3 hover:bg-stone transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="text-lg font-serif">৳{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-stone p-8 space-y-6 sticky top-24 fade-in">
                <h2 className="text-xl font-serif">Order Summary</h2>

                <div className="space-y-4 py-6 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>৳{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-serif">
                  <span>Subtotal</span>
                  <span>৳{total.toFixed(0)}</span>
                </div>

                <Button
                  onClick={() => navigate({ to: "/checkout" })}
                  className="w-full py-6 text-xs tracking-widest uppercase bg-foreground hover:bg-foreground/90"
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Shipping calculated based on your location
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
