import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2, Edit, ExternalLink, Eye } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const mockLandingPages = [
    { id: '1', title: 'Summer Sale 2024', product: 'Summer Collection', views: 1250, conversions: 89, status: 'Published' },
    { id: '2', title: 'New Arrivals', product: 'Latest Products', views: 890, conversions: 45, status: 'Published' },
    { id: '3', title: 'Flash Deal Friday', product: 'Flash Deals', views: 2100, conversions: 156, status: 'Draft' },
];

const LandingPages = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Landing Pages</h1>
                        <p className="text-muted-foreground mt-1">
                            Create product-specific landing pages
                        </p>
                    </div>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Landing Page
                    </Button>
                </div>

                {/* Search */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search landing pages..." className="pl-10" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Views</TableHead>
                                <TableHead>Conversions</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockLandingPages.map((page) => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">{page.title}</TableCell>
                                    <TableCell>{page.product}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                            {page.views.toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>{page.conversions}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${page.status === 'Published'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-warning/10 text-warning'
                                            }`}>
                                            {page.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon">
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default LandingPages;
