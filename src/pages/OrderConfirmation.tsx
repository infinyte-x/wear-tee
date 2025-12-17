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
        <main className="flex-1 container mx-auto px-6 py-16 pt-24 flex items-center justify-center">
          <p className="text-muted-foreground">Loading order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar cartCount={0} />
        <main className="flex-1 container mx-auto px-6 py-16 pt-24 text-center">
          <h1 className="text-2xl font-serif mb-4">Order Not Found</h1>
          <Link to="/">
            <Button>Return Home</Button>
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

      <main className="flex-1 container mx-auto px-6 py-16 pt-24 max-w-4xl">
        {/* Success Header - only show if no page builder blocks */}
        {(!pageData?.blocks || pageData.blocks.length === 0) && (
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif mb-4">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll contact you shortly to confirm delivery.
            </p>
          </div>
        )}

        {/* Order ID */}
        <div className="bg-stone p-6 text-center mb-8 fade-in">
          <p className="text-sm text-muted-foreground mb-1">Order ID</p>
          <p className="font-mono text-lg">{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm text-muted-foreground mt-2">{formatDate(order.created_at)}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <div className="space-y-4 fade-in">
            <div className="flex items-center gap-2 text-lg font-serif">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>Contact</span>
            </div>
            <div className="bg-stone p-4 space-y-2">
              <p>{order.phone}</p>
              {order.alt_phone && (
                <p className="text-muted-foreground">Alt: {order.alt_phone}</p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-4 fade-in">
            <div className="flex items-center gap-2 text-lg font-serif">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>Delivery Address</span>
            </div>
            <div className="bg-stone p-4 space-y-1">
              <p>{order.shipping_address}</p>
              <p>{order.area}</p>
              <p>{order.district}, {order.division}</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-8 fade-in">
          <div className="flex items-center gap-2 text-lg font-serif mb-4">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span>Payment</span>
          </div>
          <div className="bg-stone p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{order.payment_method}</p>
              <p className="text-sm text-muted-foreground capitalize">
                Status: {order.payment_status}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8 fade-in">
          <div className="flex items-center gap-2 text-lg font-serif mb-4">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span>Order Items</span>
          </div>
          <div className="bg-stone divide-y divide-border">
            {orderItems.map((item) => (
              <div key={item.id} className="p-4 flex justify-between">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && " • "}
                    {item.color && `Color: ${item.color}`}
                    {(item.size || item.color) && " • "}
                    Qty: {item.quantity}
                  </p>
                </div>
                <p>৳{(item.product_price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="bg-stone p-6 space-y-3 fade-in">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>৳{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{order.shipping_fee === 0 ? "Free" : `৳${order.shipping_fee}`}</span>
          </div>
          <div className="flex justify-between text-xl font-serif pt-3 border-t border-border">
            <span>Total</span>
            <span>৳{order.total.toFixed(0)}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-6 p-4 bg-stone fade-in">
            <p className="text-sm text-muted-foreground mb-1">Order Notes:</p>
            <p className="text-sm">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-12 text-center fade-in">
          <Link to="/products">
            <Button className="bg-foreground hover:bg-foreground/90 px-8 py-6 text-xs tracking-widest uppercase">
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
