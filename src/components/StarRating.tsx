import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

export function StarRating({
    rating,
    max = 5,
    size = 'md',
    showValue = false,
    interactive = false,
    onChange,
}: StarRatingProps) {
    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
                const isFilled = star <= rating;
                const isHalf = star - 0.5 <= rating && star > rating;

                return (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onChange?.(star)}
                        className={cn(
                            "relative transition-transform",
                            interactive && "cursor-pointer hover:scale-110",
                            !interactive && "cursor-default"
                        )}
                    >
                        {/* Background star (empty) */}
                        <Star
                            className={cn(
                                sizeClasses[size],
                                "text-muted-foreground/30"
                            )}
                        />
                        {/* Filled overlay */}
                        {(isFilled || isHalf) && (
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    "absolute inset-0 text-amber-400 fill-amber-400",
                                    isHalf && "clip-path-half"
                                )}
                            />
                        )}
                    </button>
                );
            })}
            {showValue && (
                <span className={cn(
                    "ml-1 font-medium",
                    size === 'sm' && "text-xs",
                    size === 'md' && "text-sm",
                    size === 'lg' && "text-base"
                )}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
