import { useEffect, useState } from "react";
import { Link, getRouteApi } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { usePageBlocks } from "@/hooks/usePageBlocks";
import { PageBlocks } from "@/components/PageBlocks";
import { CheckCircle, Package, Phone, MapPin, CreditCard } from "lucide-react";

interface Order {
  id: string;
  total: number;
  status: string;
  payment_method: string | null;
  payment_status: string | null;
  phone: string | null;
  alt_phone: string | null;
  division: string | null;
  district: string | null;
  area: string | null;
  shipping_address: string | null;
  shipping_fee: number | null;
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

const routeApi = getRouteApi('/order-confirmation/$orderId')

const OrderConfirmation = () => {
  const { orderId } = routeApi.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch page builder blocks for the order confirmation page
  const { data: pageData } = usePageBlocks("order-confirmation");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ]);

      if (orderRes.data) setOrder(orderRes.data);
      if (itemsRes.data) setOrderItems(itemsRes.data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar cartCount={0} />
        <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-16 pt-20 flex items-center justify-center">
          <p className="text-[0.75rem] text-[#666666]">Loading order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar cartCount={0} />
        <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-16 pt-20 text-center">
          <h1 className="text-[1rem] uppercase tracking-[0.1em] font-normal text-[#181818] mb-4">Order Not Found</h1>
          <Link to="/">
            <Button className="h-12 px-8 text-[0.65rem] tracking-[0.2em] uppercase bg-[#181818] hover:bg-[#181818]/90 text-white rounded-none">
              Return Home
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = order.total - (order.shipping_fee || 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar cartCount={0} />

      {/* Page Builder Blocks - Header Section */}
      {pageData?.blocks && pageData.blocks.length > 0 && (
        <PageBlocks blocks={pageData.blocks} position="top" />
      )}

      <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-16 pt-20 max-w-4xl mx-auto">
        {/* Success Header - only show if no page builder blocks */}
        {(!pageData?.blocks || pageData.blocks.length === 0) && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#181818] mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-[1rem] md:text-[1.25rem] uppercase tracking-[0.1em] font-normal text-[#181818] mb-2">Order Confirmed!</h1>
            <p className="text-[0.75rem] text-[#666666]">
              Thank you for your order. We'll contact you shortly.
            </p>
          </div>
        )}

        {/* Order ID */}
        <div className="bg-neutral-50 p-6 text-center mb-8">
          <p className="text-[0.65rem] tracking-[0.15em] uppercase text-[#666666] mb-1">Order ID</p>
          <p className="font-mono text-[0.875rem] text-[#181818]">{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-[0.65rem] text-[#666666] mt-2">{formatDate(order.created_at)}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#666666]" />
              <span className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818]">Contact</span>
            </div>
            <div className="bg-neutral-50 p-4 space-y-1">
              <p className="text-[0.75rem] text-[#181818]">{order.phone}</p>
              {order.alt_phone && (
                <p className="text-[0.65rem] text-[#666666]">Alt: {order.alt_phone}</p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#666666]" />
              <span className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818]">Delivery Address</span>
            </div>
            <div className="bg-neutral-50 p-4 space-y-1">
              <p className="text-[0.75rem] text-[#181818]">{order.shipping_address}</p>
              <p className="text-[0.75rem] text-[#181818]">{order.area}</p>
              <p className="text-[0.65rem] text-[#666666]">{order.district}, {order.division}</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[#666666]" />
            <span className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818]">Payment</span>
          </div>
          <div className="bg-neutral-50 p-4 flex justify-between items-center">
            <div>
              <p className="text-[0.75rem] text-[#181818]">{order.payment_method}</p>
              <p className="text-[0.65rem] text-[#666666] capitalize">Status: {order.payment_status}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-[#666666]" />
            <span className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818]">Order Items</span>
          </div>
          <div className="bg-neutral-50 divide-y divide-[#e5e5e5]">
            {orderItems.map((item) => (
              <div key={item.id} className="p-4 flex justify-between">
                <div>
                  <p className="text-[0.75rem] text-[#181818]">{item.product_name}</p>
                  <p className="text-[0.65rem] text-[#666666]">
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && " • "}
                    {item.color && `Color: ${item.color}`}
                    {(item.size || item.color) && " • "}
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-[0.75rem] text-[#181818]">৳{(item.product_price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="bg-neutral-50 p-6 space-y-3">
          <div className="flex justify-between text-[0.75rem]">
            <span className="text-[#666666]">Subtotal</span>
            <span className="text-[#181818]">৳{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-[0.75rem]">
            <span className="text-[#666666]">Shipping</span>
            <span className="text-[#181818]">{order.shipping_fee === 0 ? "Free" : `৳${order.shipping_fee}`}</span>
          </div>
          <div className="flex justify-between text-[0.875rem] pt-3 border-t border-[#e5e5e5]">
            <span className="uppercase tracking-[0.1em] text-[#181818]">Total</span>
            <span className="text-[#181818]">৳{order.total.toFixed(0)}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-4 p-4 bg-neutral-50">
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[#666666] mb-1">Order Notes:</p>
            <p className="text-[0.75rem] text-[#181818]">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-12 text-center">
          <Link to="/products">
            <Button className="h-12 px-8 text-[0.65rem] tracking-[0.2em] uppercase bg-[#181818] hover:bg-[#181818]/90 text-white rounded-none">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
