import { StarRating } from '@/components/StarRating';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type ProductReview, type ReviewStats } from '@/hooks/useProductReviews';
import { cn } from '@/lib/utils';

interface ReviewsListProps {
    reviews: ProductReview[];
    stats: ReviewStats;
    isLoading: boolean;
}

export function ReviewsList({ reviews, stats, isLoading }: ReviewsListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse border-b border-border pb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-4 w-16 bg-muted rounded" />
                        </div>
                        <div className="h-4 w-32 bg-muted rounded mb-2" />
                        <div className="h-16 w-full bg-muted rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Rating Summary */}
            <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/30 rounded-lg">
                {/* Overall Rating */}
                <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
                    <StarRating rating={stats.averageRating} size="md" />
                    <p className="text-sm text-muted-foreground">{stats.totalReviews} reviews</p>
                </div>

                {/* Rating Distribution */}
                <div className="flex-1 space-y-1">
                    {stats.ratingDistribution.map(({ rating, count, percentage }) => (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                            <span className="w-12">{rating} star</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-8 text-right text-muted-foreground">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{review.reviewer_name}</span>
                                        {review.is_verified_purchase && (
                                            <Badge variant="secondary" className="text-xs gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Verified Purchase
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                        </div>

                        {/* Content */}
                        {review.title && (
                            <h4 className="font-medium mb-1">{review.title}</h4>
                        )}
                        {review.comment && (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {review.comment}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
