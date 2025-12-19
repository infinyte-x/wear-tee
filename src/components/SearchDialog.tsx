/**
 * SearchDialog - Product search modal with autocomplete
 * 
 * Uses cmdk (Command Menu) for keyboard navigation and search.
 * Opens with Ctrl+K / Cmd+K keyboard shortcut.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Search, X } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProductSearch';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { results, isLoading } = useProductSearch(query, { limit: 8 });

    // Clear query when dialog closes
    useEffect(() => {
        if (!open) {
            setQuery('');
        }
    }, [open]);

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        };
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, onOpenChange]);

    // Navigate to product and close dialog
    const handleSelect = (productId: string) => {
        onOpenChange(false);
        navigate({ to: '/product/$id', params: { id: productId } });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Search Panel */}
            <div className="absolute top-0 left-0 right-0 bg-white shadow-xl animate-in slide-in-from-top duration-200">
                {/* Search Input */}
                <div className="w-full px-4 md:px-6 lg:px-8 py-6 border-b border-[#e5e5e5]">
                    <div className="flex items-center gap-4 max-w-3xl mx-auto">
                        <Search className="h-5 w-5 text-[#666666] flex-shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products..."
                            className="flex-1 text-[1rem] text-[#181818] placeholder:text-[#999999] bg-transparent focus:outline-none"
                            autoFocus
                        />
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 hover:bg-neutral-100 transition-colors"
                        >
                            <X className="h-5 w-5 text-[#666666]" />
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="w-full px-4 md:px-6 lg:px-8 py-6 max-h-[60vh] overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        {/* Loading state */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-[#666666]" />
                            </div>
                        )}

                        {/* Empty state */}
                        {!isLoading && query.length >= 2 && results.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-[0.875rem] text-[#666666]">
                                    No products found for "{query}"
                                </p>
                            </div>
                        )}

                        {/* Hint when query is too short */}
                        {!isLoading && query.length > 0 && query.length < 2 && (
                            <div className="text-center py-8">
                                <p className="text-[0.75rem] text-[#666666]">
                                    Type at least 2 characters to search
                                </p>
                            </div>
                        )}

                        {/* Results Grid */}
                        {!isLoading && results.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {results.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleSelect(product.id)}
                                        className="text-left group"
                                    >
                                        {/* Product Image */}
                                        <div className="aspect-[3/4] bg-neutral-100 overflow-hidden mb-2">
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Search className="h-8 w-8 text-[#e5e5e5]" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <h3 className="text-[0.75rem] uppercase tracking-[0.05em] text-[#181818] truncate mb-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-[0.75rem] text-[#666666]">
                                            ৳{product.price.toFixed(0)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Initial state */}
                        {!isLoading && query.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-[0.75rem] text-[#666666]">
                                    Start typing to search products
                                </p>
                                <p className="text-[0.65rem] text-[#999999] mt-2">
                                    Press ESC to close
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchDialog;
