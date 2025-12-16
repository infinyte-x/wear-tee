import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_visible: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CollectionWithProducts extends Collection {
    products?: Array<{
        id: string;
        name: string;
        slug: string;
        price: number;
        image_url: string | null;
    }>;
}

export function useCollections() {
    const queryClient = useQueryClient();

    // Fetch all collections
    const { data: collections, isLoading } = useQuery({
        queryKey: ['collections'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('collections' as any)
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data as Collection[];
        },
    });

    // Fetch single collection with products
    const fetchCollectionWithProducts = async (id: string) => {
        const { data: collection, error: collectionError } = await supabase
            .from('collections' as any)
            .select('*')
            .eq('id', id)
            .single();

        if (collectionError) throw collectionError;

        const { data: products, error: productsError } = await supabase
            .from('collection_products' as any)
            .select(`
                product_id,
                sort_order,
                products:product_id (
                    id,
                    name,
                    slug,
                    price,
                    image_url
                )
            `)
            .eq('collection_id', id)
            .order('sort_order', { ascending: true });

        if (productsError) throw productsError;

        return {
            ...collection,
            products: products?.map((p: any) => p.products) || [],
        } as CollectionWithProducts;
    };

    // Create collection
    const createMutation = useMutation({
        mutationFn: async (collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('collections' as any)
                .insert([collection])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            toast.success('Collection created successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to create collection: ${error.message}`);
        },
    });

    // Update collection
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Collection> & { id: string }) => {
            const { data, error } = await supabase
                .from('collections' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            toast.success('Collection updated successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update collection: ${error.message}`);
        },
    });

    // Delete collection
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('collections' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            toast.success('Collection deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete collection: ${error.message}`);
        },
    });

    // Add product to collection
    const addProductMutation = useMutation({
        mutationFn: async ({ collectionId, productId }: { collectionId: string; productId: string }) => {
            const { error } = await supabase
                .from('collection_products' as any)
                .insert([{ collection_id: collectionId, product_id: productId, sort_order: 0 }]);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            toast.success('Product added to collection');
        },
        onError: (error: Error) => {
            toast.error(`Failed to add product: ${error.message}`);
        },
    });

    // Remove product from collection
    const removeProductMutation = useMutation({
        mutationFn: async ({ collectionId, productId }: { collectionId: string; productId: string }) => {
            const { error } = await supabase
                .from('collection_products' as any)
                .delete()
                .eq('collection_id', collectionId)
                .eq('product_id', productId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            toast.success('Product removed from collection');
        },
        onError: (error: Error) => {
            toast.error(`Failed to remove product: ${error.message}`);
        },
    });

    return {
        collections,
        isLoading,
        fetchCollectionWithProducts,
        createCollection: createMutation.mutate,
        updateCollection: updateMutation.mutate,
        deleteCollection: deleteMutation.mutate,
        addProduct: addProductMutation.mutate,
        removeProduct: removeProductMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
