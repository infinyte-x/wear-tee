import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
    product?: {
        id: string;
        name: string;
        price: number;
        images: string[];
        stock: number;
    };
}

export function useWishlist() {
    const queryClient = useQueryClient();

    // Fetch user's wishlist items
    // Note: Using 'any' temporarily until Supabase types are regenerated
    const wishlistQuery = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await (supabase as any)
                .from('wishlists')
                .select(`
                    id,
                    user_id,
                    product_id,
                    created_at,
                    products:product_id (
                        id,
                        name,
                        price,
                        images,
                        stock
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform the nested product data
            return (data || []).map((item: any) => ({
                id: item.id,
                user_id: item.user_id,
                product_id: item.product_id,
                created_at: item.created_at,
                product: item.products,
            })) as WishlistItem[];
        },
    });

    // Check if a product is in wishlist
    const isInWishlist = (productId: string): boolean => {
        return wishlistQuery.data?.some(item => item.product_id === productId) || false;
    };

    // Add to wishlist
    const addMutation = useMutation({
        mutationFn: async (productId: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('Please sign in to add items to your wishlist');
            }

            const { error } = await (supabase as any)
                .from('wishlists')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    throw new Error('Already in wishlist');
                }
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            toast.success('Added to wishlist');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add to wishlist');
        },
    });

    // Remove from wishlist
    const removeMutation = useMutation({
        mutationFn: async (productId: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await (supabase as any)
                .from('wishlists')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            toast.success('Removed from wishlist');
        },
        onError: () => {
            toast.error('Failed to remove from wishlist');
        },
    });

    // Toggle wishlist
    const toggleWishlist = (productId: string) => {
        if (isInWishlist(productId)) {
            removeMutation.mutate(productId);
        } else {
            addMutation.mutate(productId);
        }
    };

    return {
        items: wishlistQuery.data || [],
        isLoading: wishlistQuery.isLoading,
        error: wishlistQuery.error,

        isInWishlist,
        toggleWishlist,
        addToWishlist: addMutation.mutate,
        removeFromWishlist: removeMutation.mutate,

        isAdding: addMutation.isPending,
        isRemoving: removeMutation.isPending,
    };
}
