import { useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const Invoice = () => {
    const { orderId } = useParams({ strict: false }) as { orderId: string };
    const navigate = useNavigate();

    const { data: order, isLoading: loadingOrder } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*, profiles(full_name, email, phone, address, city, country)')
                .eq('id', orderId)
                .single();
            if (error) throw error;
            return data;
        },
    });

    const { data: items, isLoading: loadingItems } = useQuery({
        queryKey: ['order-items', orderId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);
            if (error) throw error;
            return data;
        },
    });

    const handlePrint = () => {
        window.print();
    };

    if (loadingOrder || loadingItems) {
        return <div className="flex items-center justify-center min-h-screen">Loading Invoice...</div>;
    }

    if (!order) {
        return <div className="flex items-center justify-center min-h-screen">Order not found</div>;
    }

    // Default company info (could be moved to settings later)
    const company = {
        name: "ATELIER Studio",
        address: "123 Fashion Ave, Dhaka, BD",
        email: "support@atelier.com",
        phone: "+880 1234 567890",
        website: "www.atelier-studio.com"
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:max-w-none">

                {/* Toolbar - Hidden when printing */}
                <div className="bg-gray-100 p-4 border-b flex justify-between items-center print:hidden">
                    <Button variant="outline" onClick={() => navigate({ to: '/admin/orders' })}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Button>
                    <Button onClick={handlePrint} className="bg-charcoal text-cream">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Invoice
                    </Button>
                </div>

                {/* Invoice Content */}
                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">INVOICE</h1>
                            <p className="text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-serif font-bold text-gray-900">{company.name}</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {company.address}<br />
                                {company.email}<br />
                                {company.phone}
                            </p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-12 border-b pb-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Bill To</h3>
                            <div className="text-gray-600 text-sm space-y-1">
                                <p className="font-medium text-gray-900">{order.profiles?.full_name || order.shipping_address?.split(',')[0] || 'Guest Customer'}</p>
                                <p>{order.profiles?.email}</p>
                                <p>{order.profiles?.phone || order.phone}</p>
                                <p className="mt-2 text-gray-800">
                                    {order.shipping_address}<br />
                                    {order.shipping_city} {order.shipping_country && `, ${order.shipping_country}`}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="space-y-2">
                                <div className="flex justify-between md:justify-end gap-8">
                                    <span className="text-gray-500 text-sm">Invoice Date:</span>
                                    <span className="text-gray-900 font-medium text-sm">
                                        {format(new Date(order.created_at), 'MMMM dd, yyyy')}
                                    </span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-8">
                                    <span className="text-gray-500 text-sm">Status:</span>
                                    <span className="text-gray-900 font-medium text-sm capitalize">{order.status}</span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-8">
                                    <span className="text-gray-500 text-sm">Payment Method:</span>
                                    <span className="text-gray-900 font-medium text-sm capitalize">{order.payment_method || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left py-3 font-bold text-sm uppercase">Item</th>
                                <th className="text-center py-3 font-bold text-sm uppercase">Qty</th>
                                <th className="text-right py-3 font-bold text-sm uppercase">Price</th>
                                <th className="text-right py-3 font-bold text-sm uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {items?.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-4">
                                        <p className="font-medium text-gray-900">{item.product_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.size && `Size: ${item.size}`} {item.color && ` • Color: ${item.color}`}
                                        </p>
                                    </td>
                                    <td className="text-center py-4">{item.quantity}</td>
                                    <td className="text-right py-4">${Number(item.product_price).toFixed(2)}</td>
                                    <td className="text-right py-4 font-medium text-gray-900">
                                        ${(Number(item.product_price) * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>${(Number(order.total) - Number(order.shipping_fee || 0)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span>${Number(order.shipping_fee || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3">
                                <span>Total</span>
                                <span>${Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-8 text-center text-sm text-gray-500">
                        <p>Thank you for your business!</p>
                        <p className="mt-1">{company.website}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
