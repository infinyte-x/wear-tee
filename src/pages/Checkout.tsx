import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCart,
  getCartTotal,
  getCartCount,
  clearCart,
  type CartItem,
} from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePageBlocks } from "@/hooks/usePageBlocks";
import { PageBlocks } from "@/components/PageBlocks";
import { toast } from "sonner";
import { Loader2, Phone, MapPin, CreditCard, Truck } from "lucide-react";

interface Division {
  id: string;
  name: string;
  name_bn: string | null;
}

interface District {
  id: string;
  name: string;
  name_bn: string | null;
  division_id: string | null;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  instructions: string | null;
  account_number: string | null;
}

interface ShippingZone {
  id: string;
  name: string;
  name_bn: string | null;
  base_rate: number;
  free_shipping_threshold: number | null;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch page builder blocks for the checkout page
  const { data: pageData } = usePageBlocks("checkout");

  // Form state
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Data from DB
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);

  useEffect(() => {
    loadCart();
    fetchData();
  }, []);

  useEffect(() => {
    if (division) {
      const filtered = districts.filter(d => d.division_id === division);
      setFilteredDistricts(filtered);
      setDistrict("");
    }
  }, [division, districts]);

  useEffect(() => {
    // Auto-select shipping zone based on division
    if (division && shippingZones.length > 0) {
      const selectedDivision = divisions.find(d => d.id === division);
      if (selectedDivision) {
        const isDhaka = selectedDivision.name.toLowerCase() === "dhaka";
        const zone = shippingZones.find(z =>
          isDhaka ? z.name.toLowerCase().includes("inside") : z.name.toLowerCase().includes("outside")
        );
        setSelectedZone(zone || shippingZones[0]);
      }
    }
  }, [division, divisions, shippingZones]);

  const loadCart = () => {
    const cartItems = getCart();
    setCart(cartItems);
    setCartCount(getCartCount(cartItems));

    if (cartItems.length === 0) {
      navigate({ to: "/cart" });
    }
  };

  const fetchData = async () => {
    const [divisionsRes, districtsRes, paymentRes, shippingRes] = await Promise.all([
      supabase.from("bd_divisions").select("*").order("name"),
      supabase.from("bd_districts").select("*").order("name"),
      supabase.from("payment_methods").select("*").eq("is_active", true).order("display_order"),
      supabase.from("shipping_zones").select("*").eq("is_active", true).order("display_order"),
    ]);

    if (divisionsRes.data) setDivisions(divisionsRes.data);
    if (districtsRes.data) setDistricts(districtsRes.data);
    if (paymentRes.data) setPaymentMethods(paymentRes.data);
    if (shippingRes.data) {
      setShippingZones(shippingRes.data);
      if (shippingRes.data.length > 0) {
        setSelectedZone(shippingRes.data[0]);
      }
    }
  };

  const subtotal = getCartTotal(cart);
  const shippingFee = selectedZone
    ? (selectedZone.free_shipping_threshold && subtotal >= selectedZone.free_shipping_threshold ? 0 : selectedZone.base_rate)
    : 0;
  const total = subtotal + shippingFee;

  const validatePhone = (phoneNum: string) => {
    const cleaned = phoneNum.replace(/\D/g, "");
    return cleaned.length === 11 && cleaned.startsWith("01");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phone)) {
      toast.error("Please enter a valid Bangladesh phone number (01XXXXXXXXX)");
      return;
    }

    if (!division || !district || !area || !address) {
      toast.error("Please fill in all address fields");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDivision = divisions.find(d => d.id === division);
      const selectedDistrict = filteredDistricts.find(d => d.id === district);
      const selectedPayment = paymentMethods.find(p => p.id === paymentMethod);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          total,
          status: "pending",
          payment_method: selectedPayment?.name || null,
          payment_status: "pending",
          phone,
          alt_phone: altPhone || null,
          division: selectedDivision?.name || null,
          district: selectedDistrict?.name || null,
          area,
          shipping_address: address,
          shipping_fee: shippingFee,
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      toast.success("Order placed successfully!");
      navigate({ to: "/order-confirmation/$orderId", params: { orderId: order.id } });
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(p => p.id === paymentMethod);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar cartCount={cartCount} />

      {/* Page Builder Blocks - Header Section */}
      {pageData?.blocks && pageData.blocks.length > 0 && (
        <PageBlocks blocks={pageData.blocks} position="top" />
      )}

      <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-16 pt-20">
        {/* Only show default header if no page builder blocks */}
        {(!pageData?.blocks || pageData.blocks.length === 0) && (
          <div className="mb-8">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#666666] mb-2">Checkout</p>
            <h1 className="text-[1rem] md:text-[1.25rem] uppercase tracking-[0.1em] font-normal text-[#181818]">Complete Your Order</h1>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-10">
              {/* Contact Information */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-[#e5e5e5]">
                  <Phone className="h-4 w-4 text-[#666666]" />
                  <h2 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818]">Contact Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">Phone Number *</label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-transparent border-[#e5e5e5] focus:border-[#181818] rounded-none text-[0.875rem]"
                      required
                    />
                    <p className="text-[0.65rem] text-[#666666]">Required for delivery</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">Alternative Phone</label>
                    <Input
                      id="altPhone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="bg-transparent border-[#e5e5e5] focus:border-[#181818] rounded-none text-[0.875rem]"
                    />
                  </div>
                </div>
              </section>

              {/* Delivery Address */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-[#e5e5e5]">
                  <MapPin className="h-4 w-4 text-[#666666]" />
                  <h2 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818]">Delivery Address</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">Division *</label>
                    <Select value={division} onValueChange={setDivision}>
                      <SelectTrigger className="bg-transparent border-[#e5e5e5] rounded-none text-[0.875rem]">
                        <SelectValue placeholder="Select Division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((div) => (
                          <SelectItem key={div.id} value={div.id}>
                            {div.name} {div.name_bn && `(${div.name_bn})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">District *</label>
                    <Select value={district} onValueChange={setDistrict} disabled={!division}>
                      <SelectTrigger className="bg-transparent border-[#e5e5e5] rounded-none text-[0.875rem]">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDistricts.map((dist) => (
                          <SelectItem key={dist.id} value={dist.id}>
                            {dist.name} {dist.name_bn && `(${dist.name_bn})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">Area / Thana / Upazila *</label>
                  <Input
                    id="area"
                    placeholder="Enter your area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="bg-transparent border-[#e5e5e5] focus:border-[#181818] rounded-none text-[0.875rem]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">Full Address *</label>
                  <Textarea
                    id="address"
                    placeholder="House no, Road no, Block, etc."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-transparent border-[#e5e5e5] focus:border-[#181818] rounded-none text-[0.875rem] min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">Order Notes (Optional)</label>
                  <Textarea
                    id="notes"
                    placeholder="Special delivery instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-transparent border-[#e5e5e5] focus:border-[#181818] rounded-none text-[0.875rem]"
                  />
                </div>
              </section>

              {/* Shipping Zone Info */}
              {selectedZone && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#e5e5e5]">
                    <Truck className="h-4 w-4 text-[#666666]" />
                    <h2 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818]">Shipping</h2>
                  </div>

                  <div className="bg-neutral-50 p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[0.75rem] text-[#181818]">{selectedZone.name}</p>
                        <p className="text-[0.65rem] text-[#666666]">
                          {selectedZone.free_shipping_threshold && subtotal >= selectedZone.free_shipping_threshold
                            ? "Free shipping applied!"
                            : `Delivery charge: ৳${selectedZone.base_rate}`}
                        </p>
                      </div>
                      <p className="text-[0.875rem] text-[#181818]">
                        {shippingFee === 0 ? "Free" : `৳${shippingFee}`}
                      </p>
                    </div>
                    {selectedZone.free_shipping_threshold && subtotal < selectedZone.free_shipping_threshold && (
                      <p className="text-[0.65rem] text-[#666666] mt-3">
                        Add ৳{(selectedZone.free_shipping_threshold - subtotal).toFixed(0)} more for free shipping
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* Payment Method */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-[#e5e5e5]">
                  <CreditCard className="h-4 w-4 text-[#666666]" />
                  <h2 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818]">Payment Method</h2>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === method.id
                          ? "border-[#181818] bg-neutral-50"
                          : "border-[#e5e5e5] hover:border-[#181818]"
                          }`}
                      >
                        <RadioGroupItem value={method.id} className="mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[0.75rem] text-[#181818]">{method.name}</p>
                          {method.type === "mobile_wallet" && method.account_number && (
                            <p className="text-[0.65rem] text-[#666666] mt-1">
                              Send to: {method.account_number}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>

                {selectedPaymentMethod?.instructions && (
                  <div className="bg-neutral-50 p-4">
                    <p className="text-[0.75rem] text-[#666666] whitespace-pre-line">
                      {selectedPaymentMethod.instructions}
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-neutral-50 p-6 space-y-6 sticky top-16">
                <h2 className="text-[0.75rem] uppercase tracking-[0.15em] text-[#181818]">Order Summary</h2>

                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-18 bg-white flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[0.75rem] text-[#181818]">{item.name}</p>
                        <p className="text-[0.65rem] text-[#666666]">
                          {item.size && `${item.size}`}
                          {item.size && item.color && " / "}
                          {item.color && `${item.color}`}
                        </p>
                        <p className="text-[0.65rem] text-[#666666]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[0.75rem] text-[#181818]">৳{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 py-6 border-y border-[#e5e5e5]">
                  <div className="flex justify-between text-[0.75rem]">
                    <span className="text-[#666666]">Subtotal</span>
                    <span className="text-[#181818]">৳{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-[0.75rem]">
                    <span className="text-[#666666]">Shipping</span>
                    <span className="text-[#181818]">{shippingFee === 0 ? "Free" : `৳${shippingFee}`}</span>
                  </div>
                </div>

                <div className="flex justify-between text-[0.875rem]">
                  <span className="uppercase tracking-[0.1em] text-[#181818]">Total</span>
                  <span className="text-[#181818]">৳{total.toFixed(0)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-[0.65rem] tracking-[0.2em] uppercase bg-[#181818] hover:bg-[#181818]/90 text-white rounded-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <p className="text-[0.65rem] text-[#666666] text-center">
                  By placing this order, you agree to our terms
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
