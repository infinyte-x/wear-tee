import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Return {
    id: string;
    order_id: string;
    customer_id: string | null;
    reason: string;
    status: ReturnStatus;
    refund_amount: number | null;
    return_tracking: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    order?: {
        id: string;
        total: number;
    };
    customer?: {
        email: string;
        full_name: string;
    };
}

export function useReturns() {
    const queryClient = useQueryClient();

    // Fetch all returns
    const { data: returns, isLoading } = useQuery({
        queryKey: ['returns'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('returns' as any)
                .select(`
                    *,
                    orders!inner (
                        id,
                        total
                    ),
                    profiles:customer_id (
                        email,
                        full_name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data?.map((ret: any) => ({
                ...ret,
                order: ret.orders,
                customer: ret.profiles,
            })) as Return[];
        },
    });

    // Update return status
    const updateStatusMutation = useMutation({
        mutationFn: async ({
            id,
            status,
            refundAmount,
            notes
        }: {
            id: string;
            status: ReturnStatus;
            refundAmount?: number;
            notes?: string;
        }) => {
            const updates: any = { status };
            if (refundAmount !== undefined) updates.refund_amount = refundAmount;
            if (notes !== undefined) updates.admin_notes = notes;

            const { error } = await supabase
                .from('returns' as any)
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            toast.success('Return status updated');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update return: ${error.message}`);
        },
    });

    return {
        returns,
        isLoading,
        updateStatus: updateStatusMutation.mutate,
        isUpdating: updateStatusMutation.isPending,
    };
}
