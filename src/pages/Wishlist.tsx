import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { addToCart, getCart, getCartCount } from '@/lib/cart';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Wishlist = () => {
    const { items, isLoading, removeFromWishlist } = useWishlist();
    const [cartCount, setCartCount] = useState(getCartCount(getCart()));

    const handleAddToCart = (productId: string, productName: string, price: number, image: string) => {
        addToCart({
            productId,
            name: productName,
            price,
            image,
        });
        setCartCount(getCartCount(getCart()));
        toast.success('Added to cart');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar cartCount={cartCount} />
                <main className="flex-1 container mx-auto px-6 pt-24 pb-16">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar cartCount={cartCount} />

            <main className="flex-1 container mx-auto px-6 pt-24 pb-16">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-serif tracking-wide mb-2">My Wishlist</h1>
                    <p className="text-muted-foreground">
                        {items.length} {items.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>

                {/* Empty State */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <Heart className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Save your favorite products to your wishlist and come back to them later.
                        </p>
                        <Button asChild>
                            <Link to="/products">Browse Products</Link>
                        </Button>
                    </div>
                ) : (
                    /* Wishlist Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => {
                            const product = item.product;
                            if (!product) return null;

                            return (
                                <div
                                    key={item.id}
                                    className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                                >
                                    {/* Product Image */}
                                    <Link to="/product/$id" params={{ id: product.id }}>
                                        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <span className="text-white font-medium">Out of Stock</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromWishlist(product.id)}
                                        className={cn(
                                            "absolute top-3 right-3 p-2 rounded-full bg-background/90 backdrop-blur-sm",
                                            "hover:bg-background transition-all",
                                            "opacity-0 group-hover:opacity-100"
                                        )}
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </button>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <Link to="/product/$id" params={{ id: product.id }}>
                                            <h3 className="font-medium truncate mb-1 hover:text-accent transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-lg font-semibold mb-3">${product.price.toFixed(2)}</p>

                                        {/* Add to Cart Button */}
                                        <Button
                                            onClick={() => handleAddToCart(
                                                product.id,
                                                product.name,
                                                product.price,
                                                product.images[0]
                                            )}
                                            disabled={product.stock === 0}
                                            className="w-full"
                                            size="sm"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Wishlist;
