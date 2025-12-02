import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
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

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

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
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />

      <main className="container mx-auto px-6 py-16">
        <div className="mb-16 fade-in">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Shopping Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 fade-in">
            <p className="text-muted-foreground mb-8">Your cart is empty</p>
            <Link to="/products">
              <Button className="bg-foreground hover:bg-foreground/90">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-6 pb-8 border-b border-border fade-in">
                  <div className="w-32 h-40 bg-stone flex-shrink-0">
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
                        {item.size && (
                          <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-sm text-muted-foreground">Color: {item.color}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 border border-border">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-stone transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-stone transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border p-8 space-y-6 sticky top-24 fade-in">
                <h2 className="text-2xl font-serif">Order Summary</h2>

                <div className="space-y-3 py-6 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{total > 200 ? "Free" : "$15.00"}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-serif">
                  <span>Total</span>
                  <span>${(total + (total > 200 ? 0 : 15)).toFixed(2)}</span>
                </div>

                <Button className="w-full py-6 text-sm tracking-widest uppercase bg-foreground hover:bg-foreground/90">
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Free shipping on orders over $200
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
