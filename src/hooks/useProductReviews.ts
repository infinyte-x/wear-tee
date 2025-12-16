import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductReview {
    id: string;
    product_id: string;
    user_id: string | null;
    reviewer_name: string;
    reviewer_email: string | null;
    rating: number;
    title: string | null;
    comment: string | null;
    is_verified_purchase: boolean;
    is_approved: boolean;
    helpful_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateReviewInput {
    product_id: string;
    reviewer_name: string;
    reviewer_email?: string;
    rating: number;
    title?: string;
    comment?: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number; percentage: number }[];
}

export function useProductReviews(productId: string) {
    const queryClient = useQueryClient();

    // Fetch reviews for a product
    // Note: Using 'any' temporarily until Supabase types are regenerated after migration
    const reviewsQuery = useQuery({
        queryKey: ['product-reviews', productId],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('product_reviews')
                .select('*')
                .eq('product_id', productId)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []) as ProductReview[];
        },
        enabled: !!productId,
    });

    // Calculate stats
    const reviews = reviewsQuery.data || [];
    const stats: ReviewStats = {
        averageRating: reviews.length > 0
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
            : 0,
        totalReviews: reviews.length,
        ratingDistribution: [5, 4, 3, 2, 1].map(rating => {
            const count = reviews.filter(r => r.rating === rating).length;
            return {
                rating,
                count,
                percentage: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0,
            };
        }),
    };

    // Create new review
    const createMutation = useMutation({
        mutationFn: async (input: CreateReviewInput) => {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await (supabase as any)
                .from('product_reviews')
                .insert({
                    product_id: input.product_id,
                    user_id: user?.id || null,
                    reviewer_name: input.reviewer_name,
                    reviewer_email: input.reviewer_email || null,
                    rating: input.rating,
                    title: input.title || null,
                    comment: input.comment || null,
                    is_verified_purchase: !!user, // Verified if logged in
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
            toast.success('Thank you for your review!');
        },
        onError: () => {
            toast.error('Failed to submit review');
        },
    });

    return {
        reviews,
        stats,
        isLoading: reviewsQuery.isLoading,
        error: reviewsQuery.error,

        createReview: createMutation.mutate,
        isCreating: createMutation.isPending,
    };
}
