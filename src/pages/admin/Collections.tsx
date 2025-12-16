import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useCollections } from '@/hooks/useCollections';
import { useForm } from 'react-hook-form';
import ImageUpload from '@/components/admin/ImageUpload';

const Collections = () => {
    const { collections, isLoading, createCollection, updateCollection, deleteCollection } = useCollections();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<any>(null);

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            image_url: '',
            is_visible: true,
            sort_order: 0,
        },
    });

    const onSubmit = (data: any) => {
        if (editingCollection) {
            updateCollection({ id: editingCollection.id, ...data });
            setEditingCollection(null);
        } else {
            createCollection(data);
        }
        reset();
        setIsCreateDialogOpen(false);
    };

    const handleEdit = (collection: any) => {
        setEditingCollection(collection);
        reset(collection);
        setIsCreateDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this collection?')) {
            deleteCollection(id);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Collections</h1>
                        <p className="text-muted-foreground mt-1">Organize products into curated collections</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                                    <Label htmlFor="name">Collection Name</Label>
                                    <Input
                                        id="name"
                                        {...register('name', { required: true })}
                                        placeholder="Summer Collection"
                                        onChange={(e) => {
                                            setValue('name', e.target.value);
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
                                        images={watch('image_url') ? [watch('image_url')] : []}
                                        onChange={(images) => setValue('image_url', images[0] || '')}
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
                                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
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
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead>Sort Order</TableHead>
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
                                        <TableCell className="font-medium">{collection.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            /{collection.slug}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">0 products</Badge>
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
                                        <TableCell>{collection.sort_order}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(collection)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(collection.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
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
