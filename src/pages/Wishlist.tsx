import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useWishlist } from '@/hooks/useWishlist';
import { usePageBlocks } from '@/hooks/usePageBlocks';
import { PageBlocks } from '@/components/PageBlocks';
import { Button } from '@/components/ui/button';
import { addToCart, getCart, getCartCount } from '@/lib/cart';
import { toast } from 'sonner';
import { Heart, Loader2, X } from 'lucide-react';

const Wishlist = () => {
    const { items, isLoading, removeFromWishlist } = useWishlist();
    const [cartCount, setCartCount] = useState(getCartCount(getCart()));

    // Fetch page builder blocks for the wishlist page
    const { data: pageData } = usePageBlocks("wishlist");

    const handleAddToCart = (productId: string, productName: string, price: number, image: string) => {
        addToCart({
            productId,
            name: productName,
            price,
            image,
        });
        setCartCount(getCartCount(getCart()));
        toast.success('Added to bag');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar cartCount={cartCount} />
                <main className="flex-1 w-full px-4 md:px-6 lg:px-8 pt-20 pb-16">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-6 w-6 animate-spin text-[#666666]" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar cartCount={cartCount} />

            {/* Page Builder Blocks - Header Section */}
            {pageData?.blocks && pageData.blocks.length > 0 && (
                <PageBlocks blocks={pageData.blocks} position="top" />
            )}

            <main className="flex-1 w-full px-4 md:px-6 lg:px-8 pt-20 pb-16">
                {/* Header */}
                {(!pageData?.blocks || pageData.blocks.length === 0) && (
                    <div className="mb-12">
                        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#666666] mb-2">
                            Saved Items
                        </p>
                        <h1 className="text-[1rem] md:text-[1.25rem] uppercase tracking-[0.1em] font-normal text-[#181818]">
                            Wishlist ({items.length})
                        </h1>
                    </div>
                )}

                {/* Empty State */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Heart className="h-12 w-12 text-[#e5e5e5] mb-6" />
                        <p className="text-[0.875rem] text-[#666666] mb-6">
                            Your wishlist is empty
                        </p>
                        <Link to="/products">
                            <Button className="h-12 px-8 text-[0.65rem] tracking-[0.2em] uppercase bg-[#181818] hover:bg-[#181818]/90 text-white rounded-none">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                ) : (
                    /* Wishlist Grid */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
                        {items.map((item) => {
                            const product = item.product;
                            if (!product) return null;

                            return (
                                <div
                                    key={item.id}
                                    className="group relative bg-neutral-100"
                                >
                                    {/* Product Image */}
                                    <Link to="/product/$id" params={{ id: product.id }}>
                                        <div className="relative aspect-[3/4] overflow-hidden">
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                    <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[#666666]">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromWishlist(product.id)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white transition-all"
                                        aria-label="Remove from wishlist"
                                    >
                                        <X className="h-4 w-4 text-[#181818]" />
                                    </button>

                                    {/* Product Info */}
                                    <div className="p-3">
                                        <Link to="/product/$id" params={{ id: product.id }}>
                                            <h3 className="text-[0.75rem] uppercase tracking-[0.05em] text-[#181818] truncate mb-1">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-[0.75rem] text-[#666666] mb-3">
                                            ${product.price.toFixed(2)}
                                        </p>

                                        {/* Add to Cart Button */}
                                        <Button
                                            onClick={() => handleAddToCart(
                                                product.id,
                                                product.name,
                                                product.price,
                                                product.images[0]
                                            )}
                                            disabled={product.stock === 0}
                                            className="w-full h-10 text-[0.6rem] tracking-[0.15em] uppercase bg-[#181818] hover:bg-[#181818]/90 text-white rounded-none"
                                        >
                                            {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
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
