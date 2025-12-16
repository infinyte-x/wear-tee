import { Attribute } from '@/types/attributes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Search, RotateCcw, Plus } from 'lucide-react';

interface AttributeListProps {
    attributes: Attribute[];
    onEdit: (attr: Attribute) => void;
    onDelete: (id: string) => void;
    onCreate: () => void;
    onReload: () => void;
}

export const AttributeList = ({ attributes, onEdit, onDelete, onCreate, onReload }: AttributeListProps) => {
    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="hidden sm:flex">Bulk Actions</Button>
                    <Button variant="outline" className="hidden sm:flex">Filters</Button>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-9" />
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button onClick={onCreate} className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4" /> Create
                    </Button>
                    <Button variant="outline" onClick={onReload} className="w-full sm:w-auto gap-2">
                        <RotateCcw className="h-4 w-4" /> Reload
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="uppercase text-xs font-medium text-muted-foreground">
                            <TableHead className="w-[50px]"><Input type="checkbox" /></TableHead>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Sort Order</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Operations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attributes.length > 0 ? (
                            attributes.map((attr) => (
                                <TableRow key={attr.id} className="group hover:bg-muted/5">
                                    <TableCell><Input type="checkbox" /></TableCell>
                                    <TableCell>{attr.id}</TableCell>
                                    <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => onEdit(attr)}>
                                        {attr.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{attr.slug}</TableCell>
                                    <TableCell>{attr.sort_order}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(attr.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={attr.is_active ? 'default' : 'secondary'} className={attr.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200 border-0' : ''}>
                                            {attr.is_active ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => onEdit(attr)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => onDelete(attr.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                    No attributes found. Click 'Create' to add one.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div className="p-4 border-t text-xs text-muted-foreground">
                    Show from 1 to {attributes.length} in {attributes.length} records
                </div>
            </div>
        </div>
    );
};
