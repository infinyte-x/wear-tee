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

      <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-16 pt-20">
        {/* Header */}
        {(!pageData?.blocks || pageData.blocks.length === 0) && (
          <div className="mb-12">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#666666] mb-2">
              Your Bag
            </p>
            <h1 className="text-[1rem] md:text-[1.25rem] uppercase tracking-[0.1em] font-normal text-[#181818]">
              Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h1>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[0.75rem] text-[#666666] mb-8">Your cart is empty</p>
            <Link to="/products">
              <Button className="h-12 px-8 text-[0.65rem] tracking-[0.2em] uppercase bg-[#181818] hover:bg-[#181818]/90 text-white rounded-none">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-[#e5e5e5] text-[0.65rem] tracking-[0.15em] uppercase text-[#666666]">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Cart Items */}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 py-6 border-b border-[#e5e5e5] items-center"
                >
                  {/* Product Info */}
                  <div className="col-span-12 md:col-span-6 flex gap-4">
                    <div className="w-20 h-24 bg-neutral-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-[0.75rem] uppercase tracking-[0.05em] text-[#181818] mb-1">
                          {item.name}
                        </h3>
                        <div className="flex gap-3 text-[0.65rem] text-[#666666]">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-[0.65rem] tracking-[0.1em] uppercase text-[#666666] hover:text-[#181818] transition-colors self-start md:hidden"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-4 md:col-span-2 flex justify-center">
                    <div className="flex items-center border border-[#e5e5e5]">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-neutral-100 transition-colors"
                      >
                        <Minus className="h-3 w-3 text-[#181818]" />
                      </button>
                      <span className="w-8 text-center text-[0.75rem] text-[#181818]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-neutral-100 transition-colors"
                      >
                        <Plus className="h-3 w-3 text-[#181818]" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-4 md:col-span-2 text-right">
                    <span className="text-[0.75rem] text-[#666666]">
                      ৳{item.price.toFixed(0)}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="col-span-4 md:col-span-2 text-right flex items-center justify-end gap-4">
                    <span className="text-[0.75rem] text-[#181818]">
                      ৳{(item.price * item.quantity).toFixed(0)}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="hidden md:block text-[#666666] hover:text-[#181818] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-50 p-6 sticky top-16">
                <h2 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 pb-6 border-b border-[#e5e5e5]">
                  <div className="flex justify-between text-[0.75rem]">
                    <span className="text-[#666666]">Subtotal</span>
                    <span className="text-[#181818]">৳{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-[0.75rem]">
                    <span className="text-[#666666]">Shipping</span>
                    <span className="text-[#666666]">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between py-6 text-[0.875rem]">
                  <span className="uppercase tracking-[0.1em] text-[#181818]">Total</span>
                  <span className="text-[#181818]">৳{total.toFixed(0)}</span>
                </div>

                <Button
                  onClick={() => navigate({ to: "/checkout" })}
                  className="w-full h-12 text-[0.65rem] tracking-[0.2em] uppercase bg-[#181818] hover:bg-[#181818]/90 text-white rounded-none"
                >
                  Checkout
                </Button>

                <p className="text-[0.65rem] text-[#666666] text-center mt-4">
                  Taxes and shipping calculated at checkout
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
