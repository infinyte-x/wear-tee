import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AttributeType = 'select' | 'multi_select' | 'text' | 'color';

export interface ProductAttribute {
    id: string;
    name: string;
    slug: string;
    type: AttributeType;
    description: string | null;
    is_visible: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface AttributeValue {
    id: string;
    attribute_id: string;
    value: string;
    slug: string;
    color_code: string | null;
    sort_order: number;
    created_at: string;
}

export interface ProductAttributeWithValues extends ProductAttribute {
    values?: AttributeValue[];
}

export function useAttributes() {
    const queryClient = useQueryClient();

    // Fetch all attributes
    const { data: attributes, isLoading } = useQuery({
        queryKey: ['product-attributes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('product_attributes' as any)
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data as ProductAttribute[];
        },
    });

    // Fetch attribute with values
    const fetchAttributeWithValues = async (id: string) => {
        const { data: attribute, error: attrError } = await supabase
            .from('product_attributes' as any)
            .select('*')
            .eq('id', id)
            .single();

        if (attrError) throw attrError;

        const { data: values, error: valuesError } = await supabase
            .from('attribute_values' as any)
            .select('*')
            .eq('attribute_id', id)
            .order('sort_order', { ascending: true });

        if (valuesError) throw valuesError;

        return {
            ...attribute,
            values: values || [],
        } as ProductAttributeWithValues;
    };

    // Create attribute
    const createMutation = useMutation({
        mutationFn: async (attribute: Omit<ProductAttribute, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('product_attributes' as any)
                .insert([attribute])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            toast.success('Attribute created successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to create attribute: ${error.message}`);
        },
    });

    // Update attribute
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<ProductAttribute> & { id: string }) => {
            const { data, error } = await supabase
                .from('product_attributes' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            toast.success('Attribute updated successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update attribute: ${error.message}`);
        },
    });

    // Delete attribute
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('product_attributes' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            toast.success('Attribute deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete attribute: ${error.message}`);
        },
    });

    // Create attribute value
    const createValueMutation = useMutation({
        mutationFn: async (value: Omit<AttributeValue, 'id' | 'created_at'>) => {
            const { data, error } = await supabase
                .from('attribute_values' as any)
                .insert([value])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            toast.success('Value added successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to add value: ${error.message}`);
        },
    });

    // Delete attribute value
    const deleteValueMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('attribute_values' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            toast.success('Value deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete value: ${error.message}`);
        },
    });

    return {
        attributes,
        isLoading,
        fetchAttributeWithValues,
        createAttribute: createMutation.mutate,
        updateAttribute: updateMutation.mutate,
        deleteAttribute: deleteMutation.mutate,
        createValue: createValueMutation.mutate,
        deleteValue: deleteValueMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
