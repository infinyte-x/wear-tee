import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { AttributeList } from '@/components/admin/products/attributes/AttributeList';
import { AttributeEditor } from '@/components/admin/products/attributes/AttributeEditor';
import { Attribute } from '@/types/attributes';
import { toast } from 'sonner';

const GLOBAL_ATTRIBUTES_KEY = 'global_attributes';

const ProductAttributesPage = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);

    // Fetch Attributes from site_content
    const { data: attributes = [], isLoading } = useQuery({
        queryKey: ['admin-attributes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('site_content')
                .select('content')
                .eq('key', GLOBAL_ATTRIBUTES_KEY)
                .maybeSingle(); // Use maybeSingle to avoid 406 if not found

            if (error) throw error;

            // If data exists, parse content. If not (first time), return empty array.
            if (data?.content) {
                // Ensure it's treated as an array of Attributes, parsing JSON if needed
                const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
                return Array.isArray(content) ? content as Attribute[] : [];
            }
            return [];
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (updatedAttributes: Attribute[]) => {
            const { error } = await supabase
                .from('site_content')
                .upsert({
                    key: GLOBAL_ATTRIBUTES_KEY,
                    content: updatedAttributes as any, // Cast to any for Json type compatibility
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' }); // Ensure we update the existing row by key

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
            toast.success('Attributes saved successfully');
            setView('list');
            setEditingAttribute(null);
        },
        onError: () => {
            toast.error('Failed to save attributes');
        }
    });

    const handleSave = (attr: Attribute) => {
        let newAttributes = [...attributes];
        const index = newAttributes.findIndex(a => a.id === attr.id);

        if (index >= 0) {
            // Update existing
            newAttributes[index] = attr;
        } else {
            // Create new
            newAttributes.push(attr);
        }

        saveMutation.mutate(newAttributes);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this attribute?')) {
            const newAttributes = attributes.filter(a => a.id !== id);
            saveMutation.mutate(newAttributes);
        }
    };

    const handleCreate = () => {
        setEditingAttribute(null);
        setView('edit');
    };

    const handleEdit = (attr: Attribute) => {
        setEditingAttribute(attr);
        setView('edit');
    };

    const handleReload = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
        toast.info('Refreshed attributes');
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header is different based on view */}
                {view === 'list' && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-serif text-foreground">Product Attributes</h1>
                            <p className="text-muted-foreground mt-1">Manage global product attributes like Size, Color, etc.</p>
                        </div>
                    </div>
                )}
                {view === 'edit' && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-serif text-foreground">{editingAttribute ? `Edit "${editingAttribute.name}"` : 'Create New Attribute'}</h1>
                            <p className="text-muted-foreground mt-1">Configure values and display settings</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="py-20 text-center text-muted-foreground">Loading attributes...</div>
                ) : view === 'list' ? (
                    <AttributeList
                        attributes={attributes}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReload={handleReload}
                    />
                ) : (
                    <AttributeEditor
                        initialData={editingAttribute}
                        onSave={handleSave}
                        onCancel={() => setView('list')}
                    />
                )}
            </div>
        </AdminLayout>
    );
};

export default ProductAttributesPage;
