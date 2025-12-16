import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PromoCode {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount: number;
    usage_limit: number | null;
    used_count: number;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatePromoCodeInput {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount?: number;
    usage_limit?: number | null;
    expires_at?: string | null;
    is_active?: boolean;
}

export function usePromoCodes() {
    const queryClient = useQueryClient();

    // Fetch all promo codes
    const promoCodesQuery = useQuery({
        queryKey: ['promo-codes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('discount_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as PromoCode[];
        },
    });

    // Create new promo code
    const createMutation = useMutation({
        mutationFn: async (input: CreatePromoCodeInput) => {
            const { error } = await supabase
                .from('discount_codes')
                .insert({
                    code: input.code.toUpperCase(),
                    type: input.type,
                    value: input.value,
                    min_order_amount: input.min_order_amount || 0,
                    usage_limit: input.usage_limit,
                    expires_at: input.expires_at,
                    is_active: input.is_active ?? true,
                });

            if (error) {
                if (error.code === '23505') {
                    throw new Error('A promo code with this name already exists');
                }
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
            toast.success('Promo code created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create promo code');
        },
    });

    // Update promo code
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<PromoCode> & { id: string }) => {
            const { error } = await supabase
                .from('discount_codes')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
            toast.success('Promo code updated');
        },
        onError: () => {
            toast.error('Failed to update promo code');
        },
    });

    // Delete promo code
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('discount_codes')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
            toast.success('Promo code deleted');
        },
        onError: () => {
            toast.error('Failed to delete promo code');
        },
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { error } = await supabase
                .from('discount_codes')
                .update({ is_active })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
            toast.success('Status updated');
        },
        onError: () => {
            toast.error('Failed to update status');
        },
    });

    // Calculate stats
    const promoCodes = promoCodesQuery.data || [];
    const stats = {
        total: promoCodes.length,
        active: promoCodes.filter(p => p.is_active).length,
        expired: promoCodes.filter(p => p.expires_at && new Date(p.expires_at) < new Date()).length,
        totalUses: promoCodes.reduce((sum, p) => sum + p.used_count, 0),
    };

    return {
        promoCodes,
        stats,
        isLoading: promoCodesQuery.isLoading,
        error: promoCodesQuery.error,

        createPromoCode: createMutation.mutate,
        isCreating: createMutation.isPending,

        updatePromoCode: updateMutation.mutate,
        isUpdating: updateMutation.isPending,

        deletePromoCode: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,

        toggleActive: toggleActiveMutation.mutate,
        isToggling: toggleActiveMutation.isPending,
    };
}

// Helper to generate a random promo code
export function generatePromoCode(length = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
