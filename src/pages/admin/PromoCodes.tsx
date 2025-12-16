import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2, Edit, Copy } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const mockPromoCodes = [
    { id: '1', code: 'WELCOME10', discount: '10%', type: 'Percentage', uses: 45, maxUses: 100, status: 'Active' },
    { id: '2', code: 'FREESHIP', discount: 'Free Shipping', type: 'Shipping', uses: 120, maxUses: 200, status: 'Active' },
    { id: '3', code: 'SAVE500', discount: '৳500', type: 'Fixed', uses: 30, maxUses: 50, status: 'Active' },
    { id: '4', code: 'SUMMER20', discount: '20%', type: 'Percentage', uses: 200, maxUses: 200, status: 'Expired' },
];

const PromoCodes = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Promo Codes</h1>
                        <p className="text-muted-foreground mt-1">
                            Create and manage promotional codes
                        </p>
                    </div>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Promo Code
                    </Button>
                </div>

                {/* Search */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search promo codes..." className="pl-10" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Uses</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPromoCodes.map((promo) => (
                                <TableRow key={promo.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                                {promo.code}
                                            </code>
                                            <button className="text-muted-foreground hover:text-foreground">
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{promo.discount}</TableCell>
                                    <TableCell>{promo.type}</TableCell>
                                    <TableCell>
                                        {promo.uses} / {promo.maxUses}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${promo.status === 'Active'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {promo.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
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

export default PromoCodes;
