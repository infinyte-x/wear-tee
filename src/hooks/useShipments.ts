import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ShipmentOrder {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total: number;
    status: string;
    tracking_number: string | null;
    carrier: string | null;
    shipped_at: string | null;
    created_at: string;
    shipping_address: any;
}

export function useShipments() {
    const queryClient = useQueryClient();

    // Fetch orders that need shipping or are shipped
    const { data: shipments, isLoading } = useQuery({
        queryKey: ['shipments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:user_id (
                        email,
                        full_name
                    )
                `)
                .in('status', ['paid', 'processing', 'shipped', 'delivered'])
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data?.map((order: any) => ({
                id: order.id,
                order_number: order.id.slice(0, 8).toUpperCase(),
                customer_name: order.profiles?.full_name || order.guest_name || 'Guest',
                customer_email: order.profiles?.email || order.guest_email || '',
                total: order.total,
                status: order.status,
                tracking_number: order.tracking_number,
                carrier: order.carrier,
                shipped_at: order.shipped_at,
                created_at: order.created_at,
                shipping_address: order.shipping_address,
            })) as ShipmentOrder[];
        },
    });

    // Add tracking information
    const addTrackingMutation = useMutation({
        mutationFn: async ({
            orderId,
            trackingNumber,
            carrier
        }: {
            orderId: string;
            trackingNumber: string;
            carrier: string;
        }) => {
            const { error } = await supabase
                .from('orders')
                .update({
                    tracking_number: trackingNumber,
                    carrier: carrier,
                    shipped_at: new Date().toISOString(),
                    status: 'shipped',
                })
                .eq('id', orderId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Tracking information added');
        },
        onError: (error: Error) => {
            toast.error(`Failed to add tracking: ${error.message}`);
        },
    });

    // Update shipment status
    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Status updated');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update status: ${error.message}`);
        },
    });

    return {
        shipments,
        isLoading,
        addTracking: addTrackingMutation.mutate,
        updateStatus: updateStatusMutation.mutate,
        isAddingTracking: addTrackingMutation.isPending,
        isUpdatingStatus: updateStatusMutation.isPending,
    };
}
