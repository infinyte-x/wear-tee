import { useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductMedia from '@/components/admin/products/ProductMedia';
import ProductAttributes from '@/components/admin/products/ProductAttributes';
import TagInput from '@/components/admin/products/TagInput';

// Define the schema
const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    stock: z.coerce.number().int().min(0),
    category: z.string().min(1, "Category is required"),
    status: z.enum(['active', 'draft', 'archived']).default('active'),
    images: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    sizes: z.array(z.string()).default([]),
    colors: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    attributes: z.record(z.string()).default({}),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductEditor = () => {
    const { productId } = useParams({ strict: false }) as { productId?: string };
    const isEditing = !!productId && productId !== 'new';
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            stock: 0,
            category: '',
            status: 'active',
            images: [],
            tags: [],
            sizes: [],
            colors: [],
            featured: false,
            attributes: {},
        },
    });

    // Fetch product if editing
    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            if (!isEditing) return null;
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: isEditing,
    });

    // Reset form when data loads
    useEffect(() => {
        if (product) {
            // Safe casting for the fetched data to match the form schema
            const formData: any = {
                ...product,
                description: product.description || '',
                sizes: product.sizes || [],
                colors: product.colors || [],
                tags: product.tags || [],
                images: product.images || [],
                attributes: (product.attributes as Record<string, string>) || {},
                featured: product.featured || false,
                // Ensure status is valid
                status: ['active', 'draft', 'archived'].includes(product.status as string) ? product.status : 'active'
            };
            form.reset(formData);
        }
    }, [product, form]);

    const mutation = useMutation({
        mutationFn: async (values: ProductFormValues) => {
            const productData = {
                name: values.name,
                description: values.description,
                price: values.price,
                stock: values.stock,
                category: values.category,
                status: values.status,
                images: values.images,
                tags: values.tags,
                sizes: values.sizes,
                colors: values.colors,
                featured: values.featured,
                attributes: values.attributes,
            };

            if (isEditing) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', productId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert(productData);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast({ title: isEditing ? 'Product updated' : 'Product created' });
            navigate({ to: '/admin/products' });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        },
    });

    const onSubmit = (values: ProductFormValues) => {
        mutation.mutate(values);
    };

    if (isEditing && isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">Loading...</div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-5xl mx-auto pb-10">

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/admin/products' })}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-serif text-foreground">
                                {isEditing ? 'Edit Product' : 'New Product'}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {isEditing ? 'Manage product details and settings' : 'Add a new product to your catalog'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate({ to: '/admin/products' })}>
                            Discard
                        </Button>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={mutation.isPending}
                            className="bg-charcoal text-cream"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {mutation.isPending ? 'Saving...' : 'Save Product'}
                        </Button>
                    </div>
                </div>

                <Form {...form}>
                    <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column (Main Content) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Product Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe your product..."
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Media</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="images"
                                        render={({ field }) => (
                                            <ProductMedia
                                                images={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing & Inventory</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price ($)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="stock"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stock Count</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <FormField
                                        control={form.control}
                                        name="attributes"
                                        render={({ field }) => (
                                            <ProductAttributes
                                                attributes={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column (Settings & Organization) */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="archived">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="featured"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Featured Product</FormLabel>
                                                    <p className="text-sm text-muted-foreground">
                                                        Display this product on the home page
                                                    </p>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Organization</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Dresses" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tags"
                                        render={({ field }) => (
                                            <TagInput
                                                label="Tags"
                                                placeholder="Add tag..."
                                                tags={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Variants</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="sizes"
                                        render={({ field }) => (
                                            <TagInput
                                                label="Sizes"
                                                placeholder="Add size (S, M, L)..."
                                                tags={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="colors"
                                        render={({ field }) => (
                                            <TagInput
                                                label="Colors"
                                                placeholder="Add color..."
                                                tags={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default ProductEditor;
