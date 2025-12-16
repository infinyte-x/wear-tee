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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye, EyeOff, Tag as TagIcon } from 'lucide-react';
import { useAttributes, AttributeType } from '@/hooks/useAttributes';
import { useForm } from 'react-hook-form';

const Attributes = () => {
    const { attributes, isLoading, createAttribute, updateAttribute, deleteAttribute, createValue, deleteValue } = useAttributes();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<any>(null);
    const [managingValues, setManagingValues] = useState<any>(null);
    const [newValueName, setNewValueName] = useState('');

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            name: '',
            slug: '',
            type: 'select' as AttributeType,
            description: '',
            is_visible: true,
            sort_order: 0,
        },
    });

    const onSubmit = (data: any) => {
        if (editingAttribute) {
            updateAttribute({ id: editingAttribute.id, ...data });
            setEditingAttribute(null);
        } else {
            createAttribute(data);
        }
        reset();
        setIsCreateDialogOpen(false);
    };

    const handleEdit = (attribute: any) => {
        setEditingAttribute(attribute);
        reset(attribute);
        setIsCreateDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure? This will delete all associated values.')) {
            deleteAttribute(id);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleAddValue = (attributeId: string) => {
        if (!newValueName.trim()) return;

        createValue({
            attribute_id: attributeId,
            value: newValueName,
            slug: generateSlug(newValueName),
            color_code: null,
            sort_order: 0,
        });

        setNewValueName('');
    };

    const typeLabels: Record<AttributeType, string> = {
        select: 'Select',
        multi_select: 'Multi-Select',
        text: 'Text',
        color: 'Color'
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Product Attributes</h1>
                        <p className="text-muted-foreground mt-1">Manage product attributes and their values</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" onClick={() => { reset(); setEditingAttribute(null); }}>
                                <Plus className="h-4 w-4" />
                                Create Attribute
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingAttribute ? 'Edit Attribute' : 'Create New Attribute'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Attribute Name</Label>
                                    <Input
                                        id="name"
                                        {...register('name', { required: true })}
                                        placeholder="Size, Color, Material..."
                                        onChange={(e) => {
                                            setValue('name', e.target.value);
                                            if (!editingAttribute) {
                                                setValue('slug', generateSlug(e.target.value));
                                            }
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        {...register('slug', { required: true })}
                                        placeholder="size, color, material..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={watch('type')} onValueChange={(value: AttributeType) => setValue('type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="select">Select</SelectItem>
                                            <SelectItem value="multi_select">Multi-Select</SelectItem>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="color">Color</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        placeholder="Describe this attribute..."
                                        rows={2}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Visible on Storefront</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Show this attribute to customers
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
                                        {editingAttribute ? 'Update' : 'Create'} Attribute
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Attributes Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Values</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Loading attributes...
                                    </TableCell>
                                </TableRow>
                            ) : attributes?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No attributes yet. Create your first attribute!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attributes?.map((attribute) => (
                                    <TableRow key={attribute.id}>
                                        <TableCell className="font-medium">{attribute.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{typeLabels[attribute.type]}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {attribute.slug}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => setManagingValues(attribute)}
                                            >
                                                <TagIcon className="h-3 w-3" />
                                                Manage Values
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {attribute.is_visible ? (
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
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(attribute)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(attribute.id)}
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

                {/* Manage Values Dialog */}
                <Dialog open={!!managingValues} onOpenChange={() => setManagingValues(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                Manage Values for "{managingValues?.name}"
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add new value..."
                                    value={newValueName}
                                    onChange={(e) => setNewValueName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddValue(managingValues?.id);
                                        }
                                    }}
                                />
                                <Button onClick={() => handleAddValue(managingValues?.id)}>
                                    Add
                                </Button>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                Coming soon: Edit and reorder values, manage colors for color-type attributes
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default Attributes;
