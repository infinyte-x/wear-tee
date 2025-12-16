import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Search, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/admin/ImageUpload';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const collectionSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    image: z.string().optional(),
    is_active: z.boolean().default(true),
    product_ids: z.array(z.string()).default([]),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

const CollectionEditor = () => {
    const { collectionId } = useParams({ strict: false }) as { collectionId?: string };
    const isEditing = !!collectionId && collectionId !== 'new';
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [productSearch, setProductSearch] = useState('');

    const form = useForm<CollectionFormValues>({
        resolver: zodResolver(collectionSchema),
        defaultValues: {
            title: '',
            slug: '',
            description: '',
            image: '',
            is_active: true,
            product_ids: [],
        },
    });

    // Auto-generate slug from title if slug is empty
    const title = form.watch('title');
    useEffect(() => {
        if (title && !isEditing && !form.getValues('slug')) {
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            form.setValue('slug', slug);
        }
    }, [title, isEditing, form]);

    // Fetch all products for the selector
    const { data: allProducts } = useQuery({
        queryKey: ['products-list'],
        queryFn: async () => {
            const { data, error } = await supabase.from('products').select('id, name, images, price');
            if (error) throw error;
            return data;
        },
    });

    // Fetch collection data if editing
    const { data: collection, isLoading } = useQuery({
        queryKey: ['collection', collectionId],
        queryFn: async () => {
            if (!isEditing) return null;
            // Fetch collection info
            const { data: colData, error: colError } = await supabase
                .from('collections')
                .select('*')
                .eq('id', collectionId)
                .single();
            if (colError) throw colError;

            // Fetch linked products
            const { data: linkedData, error: linkedError } = await supabase
                .from('product_collections')
                .select('product_id')
                .eq('collection_id', collectionId);

            if (linkedError) throw linkedError;

            return {
                ...colData,
                product_ids: linkedData.map(p => p.product_id)
            };
        },
        enabled: isEditing,
    });

    useEffect(() => {
        if (collection) {
            form.reset({
                title: collection.title || '',
                slug: collection.slug || '',
                description: collection.description || '',
                image: collection.image || '',
                is_active: collection.is_active ?? true,
                product_ids: collection.product_ids || [],
            });
        }
    }, [collection, form]);

    const mutation = useMutation({
        mutationFn: async (values: CollectionFormValues) => {
            let activeCollectionId = collectionId;

            const collectionData = {
                title: values.title,
                slug: values.slug,
                description: values.description,
                image: values.image,
                is_active: values.is_active,
            };

            // 1. Upsert Collection
            if (isEditing) {
                const { error } = await supabase.from('collections').update(collectionData).eq('id', collectionId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('collections').insert(collectionData).select().single();
                if (error) throw error;
                activeCollectionId = data.id;
            }

            // 2. Manage Product Links (Delete all and re-insert is simplest for now)
            if (activeCollectionId) {
                // Delete existing
                const { error: deleteError } = await supabase
                    .from('product_collections')
                    .delete()
                    .eq('collection_id', activeCollectionId);
                if (deleteError) throw deleteError;

                // Insert new
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
            navigate({ to: '/admin/collections' });
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const onSubmit = (values: CollectionFormValues) => {
        mutation.mutate(values);
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

    if (isEditing && isLoading) return <AdminLayout>Loading...</AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-4xl mx-auto pb-10">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/admin/collections' })} type="button">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-serif text-foreground">
                            {isEditing ? 'Edit Collection' : 'New Collection'}
                        </h1>
                    </div>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={mutation.isPending}
                        className="bg-charcoal text-cream"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {mutation.isPending ? 'Saving...' : 'Save Collection'}
                    </Button>
                </div>

                <Form {...form}>
                    <form className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Collection Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                                <FormLabel>Slug</FormLabel>
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
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Active Status</FormLabel>
                                                    <CardDescription>
                                                        Visible on store
                                                    </CardDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
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
                                                <Textarea placeholder="Collection description..." {...field} />
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
                                            bucket="product-images" // Reusing bucket for now
                                        />
                                    </FormControl>
                                </FormItem>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Products</CardTitle>
                                <CardDescription>Select products to include in this collection</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        className="pl-9"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                </div>
                                <ScrollArea className="h-[300px] border rounded-md p-4">
                                    <div className="space-y-2">
                                        {filteredProducts.map(product => {
                                            const isSelected = form.watch('product_ids').includes(product.id);
                                            return (
                                                <div
                                                    key={product.id}
                                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted border-transparent'}`}
                                                    onClick={() => toggleProduct(product.id)}
                                                >
                                                    <div className={`h-4 w-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                                        {isSelected && <Check className="h-3 w-3" />}
                                                    </div>
                                                    <div className="h-10 w-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                                        {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">${product.price}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {filteredProducts.length === 0 && (
                                            <p className="text-center text-muted-foreground py-8">No products found</p>
                                        )}
                                    </div>
                                </ScrollArea>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    {form.watch('product_ids').length} products selected
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default CollectionEditor;
