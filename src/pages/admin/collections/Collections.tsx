import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Collection {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    image: string | null;
    is_active: boolean;
    created_at: string;
}

const Collections = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: collections, isLoading } = useQuery({
        queryKey: ['admin-collections'],
        queryFn: async () => {
            const { data, error } = await supabase.from('collections').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data as Collection[];
        },
    });

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

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif text-foreground">Collections</h1>
                        <p className="text-muted-foreground mt-1">Manage product collections (e.g. Summer Sale, Featured)</p>
                    </div>
                    <Button
                        onClick={() => navigate({ to: '/admin/collections/new' })}
                        className="bg-charcoal text-cream hover:bg-charcoal/90"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Collection
                    </Button>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : collections && collections.length > 0 ? (
                                collections.map((collection) => (
                                    <TableRow key={collection.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {collection.image && (
                                                    <img
                                                        src={collection.image}
                                                        alt={collection.title}
                                                        className="w-8 h-8 rounded object-cover"
                                                    />
                                                )}
                                                <span className="font-medium">{collection.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-sm">{collection.slug}</TableCell>
                                        <TableCell>
                                            <Badge variant={collection.is_active ? 'default' : 'secondary'}>
                                                {collection.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(collection.created_at), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => navigate({ to: '/admin/collections/$collectionId', params: { collectionId: collection.id } })}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteMutation.mutate(collection.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No collections yet
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

export default Collections;
