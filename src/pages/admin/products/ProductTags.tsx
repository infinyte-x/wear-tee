import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const ProductTags = () => {
    const queryClient = useQueryClient();
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [newTagName, setNewTagName] = useState('');

    const { data: products, isLoading } = useQuery({
        queryKey: ['admin-products-tags'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, tags');
            if (error) throw error;
            return data;
        },
    });

    // Derive tags from products
    const tagCounts = products?.reduce((acc, product) => {
        product.tags?.forEach((tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>) || {};

    const tags = Object.entries(tagCounts).map(([name, count]) => ({ name, count }));

    const deleteMutation = useMutation({
        mutationFn: async (tagName: string) => {
            if (!products) return;
            const updates = products
                .filter(p => p.tags?.includes(tagName))
                .map(p => {
                    const newTags = p.tags?.filter(t => t !== tagName) || [];
                    return supabase.from('products').update({ tags: newTags }).eq('id', p.id);
                });
            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products-tags'] });
            toast.success('Tag deleted from all products');
        },
        onError: () => toast.error('Failed to delete tag')
    });

    const renameMutation = useMutation({
        mutationFn: async ({ oldName, newName }: { oldName: string, newName: string }) => {
            if (!products) return;
            if (!newName.trim()) throw new Error("New name cannot be empty");

            const updates = products
                .filter(p => p.tags?.includes(oldName))
                .map(p => {
                    const newTags = p.tags?.map(t => t === oldName ? newName : t) || [];
                    return supabase.from('products').update({ tags: newTags }).eq('id', p.id);
                });
            await Promise.all(updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products-tags'] });
            toast.success('Tag renamed successfully');
            setEditingTag(null);
        },
        onError: () => toast.error('Failed to rename tag')
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif text-foreground">Product Tags</h1>
                    <p className="text-muted-foreground mt-1">Manage tags used across your products</p>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tag Name</TableHead>
                                <TableHead>Products Count</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : tags.length > 0 ? (
                                tags.map(({ name, count }) => (
                                    <TableRow key={name}>
                                        <TableCell>
                                            {editingTag === name ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={newTagName}
                                                        onChange={(e) => setNewTagName(e.target.value)}
                                                        className="h-8 w-40"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="font-medium bg-secondary px-2 py-1 rounded-md text-sm">{name}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{count}</TableCell>
                                        <TableCell className="text-right">
                                            {editingTag === name ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingTag(null)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" onClick={() => renameMutation.mutate({ oldName: name, newName: newTagName })}>
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => { setEditingTag(name); setNewTagName(name); }}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => {
                                                            if (confirm(`Remove tag "${name}" from ALL products?`)) {
                                                                deleteMutation.mutate(name);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No tags found in products
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProductTags;
