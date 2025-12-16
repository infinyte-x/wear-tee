/**
 * useProductSearch - Custom hook for product search with debounce
 * 
 * Searches products by name, description, and category using ILIKE.
 * Includes debouncing to prevent excessive API calls.
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    images: string[];
    description: string | null;
}

interface UseProductSearchOptions {
    limit?: number;
    debounceMs?: number;
}

interface UseProductSearchResult {
    results: Product[];
    isLoading: boolean;
    error: Error | null;
    query: string;
}

/**
 * Custom hook for searching products with debounce
 * 
 * @param searchQuery - The search query string
 * @param options - Configuration options
 * @returns Search results, loading state, and error
 * 
 * @example
 * const { results, isLoading } = useProductSearch(query, { limit: 5 });
 */
export function useProductSearch(
    searchQuery: string,
    options: UseProductSearchOptions = {}
): UseProductSearchResult {
    const { limit = 6, debounceMs = 300 } = options;

    // Debounced query state
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

    // Debounce the search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchQuery, debounceMs]);

    // Clean and prepare search term
    const searchTerm = useMemo(() => {
        const cleaned = debouncedQuery.trim().toLowerCase();
        return cleaned.length >= 2 ? cleaned : '';
    }, [debouncedQuery]);

    // Query products
    const { data, isLoading, error } = useQuery({
        queryKey: ['product-search', searchTerm],
        enabled: searchTerm.length >= 2,
        staleTime: 1000 * 60, // Cache for 1 minute
        queryFn: async () => {
            // Use ILIKE for case-insensitive search
            const searchPattern = `%${searchTerm}%`;

            const { data, error } = await supabase
                .from('products')
                .select('id, name, price, category, images, description')
                .or(`name.ilike.${searchPattern},category.ilike.${searchPattern},description.ilike.${searchPattern}`)
                .eq('status', 'active')
                .limit(limit);

            if (error) throw error;
            return data as Product[];
        },
    });

    return {
        results: data ?? [],
        isLoading: searchTerm.length >= 2 && isLoading,
        error: error as Error | null,
        query: debouncedQuery,
    };
}

export default useProductSearch;
