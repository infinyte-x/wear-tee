import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Search, Check, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ImageUpload from '@/components/admin/ImageUpload';

interface Collection {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    image: string | null;
    is_visible: boolean | null;
    is_active: boolean | null;
    sort_order: number | null;
    created_at: string;
    meta_title?: string | null;
    meta_description?: string | null;
}

const collectionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    image: z.string().optional(),
    is_active: z.boolean().default(true),
    product_ids: z.array(z.string()).default([]),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

const Collections = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
    const [productSearch, setProductSearch] = useState('');

    const isEditing = !!editingCollectionId;

    const form = useForm<CollectionFormValues>({
        resolver: zodResolver(collectionSchema),
        defaultValues: {
            title: '',
            slug: '',
            description: '',
            image: '',
            is_active: true,
            product_ids: [],
            meta_title: '',
            meta_description: '',
        },
    });

    // Auto-generate slug from title
    const title = form.watch('title');
    useEffect(() => {
        if (title && !isEditing && !form.getValues('slug')) {
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            form.setValue('slug', slug);
        }
    }, [title, isEditing, form]);

    // Fetch collections
    const { data: collections, isLoading } = useQuery({
        queryKey: ['admin-collections'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .order('sort_order', { ascending: true });
            if (error) throw error;
            return data;
        },
    });

    // Fetch all products for the selector
    const { data: allProducts } = useQuery({
        queryKey: ['products-list'],
        queryFn: async () => {
            const { data, error } = await supabase.from('products').select('id, name, images, price');
            if (error) throw error;
            return data;
        },
    });

    // Fetch collection data when editing
    const { data: editingCollection, isLoading: isLoadingCollection } = useQuery({
        queryKey: ['collection', editingCollectionId],
        queryFn: async () => {
            if (!editingCollectionId) return null;

            const { data: colData, error: colError } = await supabase
                .from('collections')
                .select('*')
                .eq('id', editingCollectionId)
                .single();
            if (colError) throw colError;

            const { data: linkedData, error: linkedError } = await supabase
                .from('product_collections')
                .select('product_id')
                .eq('collection_id', editingCollectionId);

            if (linkedError) throw linkedError;

            return {
                ...colData,
                product_ids: linkedData.map(p => p.product_id)
            };
        },
        enabled: !!editingCollectionId,
    });

    // Reset form when editing collection loads
    useEffect(() => {
        if (editingCollection) {
            form.reset({
                title: editingCollection.title || '',
                slug: editingCollection.slug || '',
                description: editingCollection.description || '',
                image: editingCollection.image || '',
                is_active: editingCollection.is_active ?? true,
                product_ids: editingCollection.product_ids || [],
                meta_title: (editingCollection as any).meta_title || '',
                meta_description: (editingCollection as any).meta_description || '',
            });
        }
    }, [editingCollection, form]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (values: CollectionFormValues) => {
            let activeCollectionId = editingCollectionId;

            const collectionData = {
                title: values.title,
                slug: values.slug,
                description: values.description,
                image: values.image,
                is_active: values.is_active,
                meta_title: values.meta_title || null,
                meta_description: values.meta_description || null,
            };

            if (isEditing) {
                const { error } = await supabase.from('collections').update(collectionData).eq('id', editingCollectionId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('collections').insert(collectionData).select().single();
                if (error) throw error;
                activeCollectionId = data.id;
            }

            // Manage Product Links
            if (activeCollectionId) {
                const { error: deleteError } = await supabase
                    .from('product_collections')
                    .delete()
                    .eq('collection_id', activeCollectionId);
                if (deleteError) throw deleteError;

                if (values.product_ids.length > 0) {
                    const links = values.product_ids.map(pid => ({
                        collection_id: activeCollectionId,
                        product_id: pid
                    }));
                    const { error: linkError } = await supabase.from('product_collections').insert(links);
                    if (linkError) throw linkError;
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
            toast({ title: isEditing ? 'Collection updated' : 'Collection created' });
            closeDialog();
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Delete collection
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('collections').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
            toast({ title: 'Collection deleted' });
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCollectionId(null);
        setProductSearch('');
        form.reset({
            title: '',
            slug: '',
            description: '',
            image: '',
            is_active: true,
            product_ids: [],
            meta_title: '',
            meta_description: '',
        });
    };

    const handleCreate = () => {
        setEditingCollectionId(null);
        form.reset();
        setIsDialogOpen(true);
    };

    const handleEdit = (collection: Collection) => {
        setEditingCollectionId(collection.id);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this collection?')) {
            deleteMutation.mutate(id);
        }
    };

    const toggleProduct = (pid: string) => {
        const current = form.getValues('product_ids');
        if (current.includes(pid)) {
            form.setValue('product_ids', current.filter(id => id !== pid));
        } else {
            form.setValue('product_ids', [...current, pid]);
        }
    };

    const filteredProducts = allProducts?.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    ) || [];

    const onSubmit = (values: CollectionFormValues) => {
        saveMutation.mutate(values);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Collections</h1>
                        <p className="text-muted-foreground mt-1">Organize products into curated collections</p>
                    </div>
                    <Button className="gap-2" onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Create Collection
                    </Button>
                </div>

                {/* Collections Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Collection</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead>Sort Order</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Loading collections...
                                    </TableCell>
                                </TableRow>
                            ) : collections?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No collections yet. Create your first collection!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                collections?.map((collection) => (
                                    <TableRow key={collection.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {collection.image && (
                                                    <img src={collection.image} alt={collection.title} className="w-10 h-10 rounded object-cover" />
                                                )}
                                                <span className="font-medium">{collection.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground font-mono">/{collection.slug}</TableCell>
                                        <TableCell>
                                            {collection.is_visible ? (
                                                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                                    <Eye className="h-3 w-3 mr-1" />Visible
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary"><EyeOff className="h-3 w-3 mr-1" />Hidden</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{collection.sort_order ?? 0}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(collection.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <TooltipProvider>
                                                <div className="flex justify-end gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <a href={`/collections/${collection.slug}`} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Preview</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(collection as Collection)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(collection.id)}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Delete</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Collection Editor Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
                        </DialogHeader>

                        {isLoadingCollection && isEditing ? (
                            <div className="flex items-center justify-center py-8">Loading...</div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <Tabs defaultValue="details" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 mb-4">
                                            <TabsTrigger value="details">Details</TabsTrigger>
                                            <TabsTrigger value="products">Products ({form.watch('product_ids').length})</TabsTrigger>
                                            <TabsTrigger value="seo">SEO</TabsTrigger>
                                        </TabsList>

                                        {/* Details Tab */}
                                        <TabsContent value="details" className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Summer Sale" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="slug"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>URL Slug</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="summer-sale" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="is_active"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-full">
                                                            <div className="space-y-0.5">
                                                                <FormLabel>Active</FormLabel>
                                                                <p className="text-xs text-muted-foreground">Show on store</p>
                                                            </div>
                                                            <FormControl>
                                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Collection description..." rows={3} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormItem>
                                                <FormLabel>Cover Image</FormLabel>
                                                <FormControl>
                                                    <ImageUpload
                                                        images={form.watch('image') ? [form.watch('image')!] : []}
                                                        onChange={(imgs) => form.setValue('image', imgs[0] || '')}
                                                        maxFiles={1}
                                                        bucket="product-images"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        </TabsContent>

                                        {/* Products Tab */}
                                        <TabsContent value="products" className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search products..."
                                                    className="pl-9"
                                                    value={productSearch}
                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                />
                                            </div>
                                            <div className="border rounded-lg max-h-[350px] overflow-y-auto">
                                                <div className="divide-y">
                                                    {filteredProducts.map(product => {
                                                        const isSelected = form.watch('product_ids').includes(product.id);
                                                        return (
                                                            <div
                                                                key={product.id}
                                                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted'}`}
                                                                onClick={() => toggleProduct(product.id)}
                                                            >
                                                                <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/50'}`}>
                                                                    {isSelected && <Check className="h-3 w-3" />}
                                                                </div>
                                                                <div className="h-12 w-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                                                    {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-sm truncate">{product.name}</p>
                                                                    <p className="text-sm text-muted-foreground">${product.price}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {filteredProducts.length === 0 && (
                                                        <p className="text-center text-muted-foreground py-8">No products found</p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {form.watch('product_ids').length} products selected
                                            </p>
                                        </TabsContent>

                                        {/* SEO Tab */}
                                        <TabsContent value="seo" className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="meta_title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Meta Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="SEO title (defaults to collection title)" {...field} />
                                                        </FormControl>
                                                        <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="meta_description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Meta Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Brief description for search results..." {...field} rows={4} />
                                                        </FormControl>
                                                        <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TabsContent>
                                    </Tabs>

                                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                                        <Button type="button" variant="outline" onClick={closeDialog}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={saveMutation.isPending}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {saveMutation.isPending ? 'Saving...' : (isEditing ? 'Update' : 'Create')} Collection
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default Collections;
