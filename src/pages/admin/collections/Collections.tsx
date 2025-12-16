import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Pencil, Trash2, Eye, EyeOff, Palette, ExternalLink } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
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
}

interface CollectionFormData {
    title: string;
    slug: string;
    description: string;
    image: string;
    is_visible: boolean;
    sort_order: number;
}

const Collections = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    const { register, handleSubmit, reset, setValue, watch } = useForm<CollectionFormData>({
        defaultValues: {
            title: '',
            slug: '',
            description: '',
            image: '',
            is_visible: true,
            sort_order: 0,
        },
    });

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

    // Create collection
    const createMutation = useMutation({
        mutationFn: async (data: CollectionFormData) => {
            const { error } = await supabase.from('collections').insert({
                title: data.title,
                slug: data.slug,
                description: data.description || null,
                image: data.image || null,
                is_visible: data.is_visible,
                sort_order: data.sort_order,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
            toast({ title: 'Collection created successfully' });
            closeDialog();
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    // Update collection
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...data }: CollectionFormData & { id: string }) => {
            const { error } = await supabase.from('collections').update({
                title: data.title,
                slug: data.slug,
                description: data.description || null,
                image: data.image || null,
                is_visible: data.is_visible,
                sort_order: data.sort_order,
            }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
            toast({ title: 'Collection updated successfully' });
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

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCollection(null);
        reset({
            title: '',
            slug: '',
            description: '',
            image: '',
            is_visible: true,
            sort_order: 0,
        });
    };

    const handleEdit = (collection: Collection) => {
        setEditingCollection(collection);
        reset({
            title: collection.title,
            slug: collection.slug,
            description: collection.description || '',
            image: collection.image || '',
            is_visible: collection.is_visible ?? true,
            sort_order: collection.sort_order ?? 0,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this collection?')) {
            deleteMutation.mutate(id);
        }
    };

    const onSubmit = (data: CollectionFormData) => {
        if (editingCollection) {
            updateMutation.mutate({ id: editingCollection.id, ...data });
        } else {
            createMutation.mutate(data);
        }
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
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" onClick={() => { reset(); setEditingCollection(null); }}>
                                <Plus className="h-4 w-4" />
                                Create Collection
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCollection ? 'Edit Collection' : 'Create New Collection'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Collection Title</Label>
                                    <Input
                                        id="title"
                                        {...register('title', { required: true })}
                                        placeholder="Summer Collection"
                                        onChange={(e) => {
                                            setValue('title', e.target.value);
                                            if (!editingCollection) {
                                                setValue('slug', generateSlug(e.target.value));
                                            }
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL Slug</Label>
                                    <Input
                                        id="slug"
                                        {...register('slug', { required: true })}
                                        placeholder="summer-collection"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        placeholder="Describe this collection..."
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Collection Image</Label>
                                    <ImageUpload
                                        images={watch('image') ? [watch('image')] : []}
                                        onChange={(images) => setValue('image', images[0] || '')}
                                        maxFiles={1}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Visible on Storefront</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Show this collection to customers
                                        </p>
                                    </div>
                                    <Switch
                                        checked={watch('is_visible')}
                                        onCheckedChange={(checked) => setValue('is_visible', checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        {...register('sort_order', { valueAsNumber: true })}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={closeDialog}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {editingCollection ? 'Update' : 'Create'} Collection
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                                                    <img
                                                        src={collection.image}
                                                        alt={collection.title}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                )}
                                                <span className="font-medium">{collection.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground font-mono">
                                            /{collection.slug}
                                        </TableCell>
                                        <TableCell>
                                            {collection.is_visible ? (
                                                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Visible
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    Hidden
                                                </Badge>
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
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                            >
                                                                <a href={`/collections/${collection.slug}`} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Preview</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(collection as Collection)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(collection.id)}
                                                            >
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
            </div>
        </AdminLayout>
    );
};

export default Collections;
