import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/StarRating';
import { Loader2, Send } from 'lucide-react';
import { type CreateReviewInput } from '@/hooks/useProductReviews';

interface ReviewFormProps {
    productId: string;
    onSubmit: (input: CreateReviewInput) => void;
    isSubmitting: boolean;
}

export function ReviewForm({ productId, onSubmit, isSubmitting }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !name.trim()) return;

        onSubmit({
            product_id: productId,
            reviewer_name: name.trim(),
            reviewer_email: email.trim() || undefined,
            rating,
            title: title.trim() || undefined,
            comment: comment.trim() || undefined,
        });

        // Reset form
        setRating(0);
        setName('');
        setEmail('');
        setTitle('');
        setComment('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div className="space-y-2">
                <Label>Your Rating *</Label>
                <div className="flex items-center gap-2">
                    <StarRating
                        rating={rating}
                        size="lg"
                        interactive
                        onChange={setRating}
                    />
                    {rating > 0 && (
                        <span className="text-sm text-muted-foreground">
                            {rating === 5 && 'Excellent!'}
                            {rating === 4 && 'Good'}
                            {rating === 3 && 'Average'}
                            {rating === 2 && 'Below Average'}
                            {rating === 1 && 'Poor'}
                        </span>
                    )}
                </div>
            </div>

            {/* Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="reviewer-name">Your Name *</Label>
                    <Input
                        id="reviewer-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reviewer-email">Email (optional)</Label>
                    <Input
                        id="reviewer-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                    />
                </div>
            </div>

            {/* Review Title */}
            <div className="space-y-2">
                <Label htmlFor="review-title">Review Title</Label>
                <Input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                />
            </div>

            {/* Review Comment */}
            <div className="space-y-2">
                <Label htmlFor="review-comment">Your Review</Label>
                <Textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell others about your experience with this product..."
                    rows={4}
                />
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={isSubmitting || rating === 0 || !name.trim()}
                className="w-full sm:w-auto"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Review
                    </>
                )}
            </Button>
        </form>
    );
}
