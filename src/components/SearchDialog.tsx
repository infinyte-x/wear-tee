/**
 * SearchDialog - Product search modal with autocomplete
 * 
 * Uses cmdk (Command Menu) for keyboard navigation and search.
 * Opens with Ctrl+K / Cmd+K keyboard shortcut.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, PackageSearch } from 'lucide-react';
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import { useProductSearch } from '@/hooks/useProductSearch';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const { results, isLoading } = useProductSearch(query, { limit: 6 });

    // Clear query when dialog closes
    useEffect(() => {
        if (!open) {
            setQuery('');
        }
    }, [open]);

    // Navigate to product and close dialog
    const handleSelect = (productId: string) => {
        onOpenChange(false);
        navigate({ to: '/product/$id', params: { id: productId } });
    };

    // Format price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput
                placeholder="Search products..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {/* Loading state */}
                {isLoading && (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && query.length >= 2 && results.length === 0 && (
                    <CommandEmpty>
                        <div className="flex flex-col items-center gap-2 py-4">
                            <PackageSearch className="h-10 w-10 text-muted-foreground/50" />
                            <p>No products found for "{query}"</p>
                            <p className="text-xs text-muted-foreground">Try a different search term</p>
                        </div>
                    </CommandEmpty>
                )}

                {/* Hint when query is too short */}
                {!isLoading && query.length > 0 && query.length < 2 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        Type at least 2 characters to search
                    </div>
                )}

                {/* Results */}
                {!isLoading && results.length > 0 && (
                    <CommandGroup heading="Products">
                        {results.map((product) => (
                            <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => handleSelect(product.id)}
                                className="flex items-center gap-3 py-3 cursor-pointer"
                            >
                                {/* Product thumbnail */}
                                <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <PackageSearch className="h-5 w-5 text-muted-foreground/50" />
                                        </div>
                                    )}
                                </div>

                                {/* Product info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{product.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {product.category}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="text-sm font-medium text-accent">
                                    {formatPrice(product.price)}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {/* Initial state */}
                {!isLoading && query.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        <p>Start typing to search products</p>
                        <p className="text-xs mt-1">Press <kbd className="px-1.5 py-0.5 bg-muted rounded">ESC</kbd> to close</p>
                    </div>
                )}
            </CommandList>
        </CommandDialog>
    );
}

export default SearchDialog;
