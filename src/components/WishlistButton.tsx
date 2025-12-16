import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
    productId: string;
    variant?: 'default' | 'icon' | 'minimal';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

export function WishlistButton({
    productId,
    variant = 'default',
    size = 'default',
    className,
}: WishlistButtonProps) {
    const { isInWishlist, toggleWishlist, isAdding, isRemoving } = useWishlist();
    const inWishlist = isInWishlist(productId);
    const isPending = isAdding || isRemoving;

    if (variant === 'minimal') {
        return (
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(productId);
                }}
                disabled={isPending}
                className={cn(
                    "p-2 rounded-full transition-all hover:bg-background/80",
                    isPending && "opacity-50 cursor-not-allowed",
                    className
                )}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Heart
                    className={cn(
                        "h-5 w-5 transition-all",
                        inWishlist ? "fill-red-500 text-red-500" : "text-foreground"
                    )}
                />
            </button>
        );
    }

    if (variant === 'icon') {
        return (
            <Button
                variant="ghost"
                size={size}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(productId);
                }}
                disabled={isPending}
                className={cn(className)}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Heart
                    className={cn(
                        "h-4 w-4 transition-all",
                        inWishlist && "fill-red-500 text-red-500"
                    )}
                />
            </Button>
        );
    }

    return (
        <Button
            variant={inWishlist ? 'secondary' : 'outline'}
            size={size}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(productId);
            }}
            disabled={isPending}
            className={cn(className)}
        >
            <Heart
                className={cn(
                    "h-4 w-4 mr-2 transition-all",
                    inWishlist && "fill-red-500 text-red-500"
                )}
            />
            {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </Button>
    );
}
