import { useState } from 'react';
import { useProductReviews } from '@/hooks/useProductReviews';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/StarRating';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductReviewsProps {
    productId: string;
    productName: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const [showForm, setShowForm] = useState(false);
    const { reviews, stats, isLoading, createReview, isCreating } = useProductReviews(productId);

    return (
        <section className="py-12 border-t border-border">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-serif tracking-wide">Customer Reviews</h2>
                    {stats.totalReviews > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={stats.averageRating} size="sm" />
                            <span className="text-sm text-muted-foreground">
                                {stats.averageRating.toFixed(1)} out of 5 ({stats.totalReviews} reviews)
                            </span>
                        </div>
                    )}
                </div>
                <Button
                    variant={showForm ? 'outline' : 'default'}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Form
                        </>
                    ) : (
                        <>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Write a Review
                        </>
                    )}
                </Button>
            </div>

            {/* Review Form */}
            <div className={cn(
                "overflow-hidden transition-all duration-300",
                showForm ? "max-h-[600px] opacity-100 mb-8" : "max-h-0 opacity-0"
            )}>
                <div className="p-6 bg-muted/30 rounded-xl">
                    <h3 className="font-medium mb-4">Write a Review for {productName}</h3>
                    <ReviewForm
                        productId={productId}
                        onSubmit={(input) => {
                            createReview(input);
                            setShowForm(false);
                        }}
                        isSubmitting={isCreating}
                    />
                </div>
            </div>

            {/* Reviews List */}
            <ReviewsList reviews={reviews} stats={stats} isLoading={isLoading} />
        </section>
    );
}
