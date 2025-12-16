import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Copy, Loader2, Tag, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { usePromoCodes } from '@/hooks/usePromoCodes';
import { CreatePromoCodeDialog } from '@/components/admin/CreatePromoCodeDialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PromoCodes = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const {
        promoCodes,
        stats,
        isLoading,
        createPromoCode,
        isCreating,
        deletePromoCode,
        isDeleting,
        toggleActive,
        isToggling,
    } = usePromoCodes();

    // Filter promo codes by search
    const filteredCodes = promoCodes.filter((code) =>
        code.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Check if code is expired
    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    // Copy code to clipboard
    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied to clipboard');
    };

    const statCards = [
        { label: 'Total Codes', value: stats.total, icon: Tag, color: 'bg-blue-500/10 text-blue-500' },
        { label: 'Active', value: stats.active, icon: CheckCircle, color: 'bg-green-500/10 text-green-500' },
        { label: 'Expired', value: stats.expired, icon: XCircle, color: 'bg-red-500/10 text-red-500' },
        { label: 'Total Uses', value: stats.totalUses, icon: BarChart3, color: 'bg-purple-500/10 text-purple-500' },
    ];

    return (
        <AdminLayout>
            <div className="p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Promo Codes</h1>
                        <p className="text-muted-foreground mt-1">
                            Create and manage promotional discount codes
                        </p>
                    </div>
                    <CreatePromoCodeDialog onCreate={createPromoCode} isCreating={isCreating} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", stat.color)}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xl font-semibold">{stat.value}</div>
                                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search promo codes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredCodes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Tag className="h-12 w-12 mb-3 opacity-50" />
                            <p className="font-medium">
                                {searchQuery ? 'No codes match your search' : 'No promo codes yet'}
                            </p>
                            <p className="text-sm mt-1">
                                {searchQuery ? 'Try a different search term' : 'Create your first promo code to get started'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="font-semibold">Code</TableHead>
                                    <TableHead className="font-semibold">Discount</TableHead>
                                    <TableHead className="font-semibold">Min Order</TableHead>
                                    <TableHead className="font-semibold">Uses</TableHead>
                                    <TableHead className="font-semibold">Expires</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCodes.map((promo) => {
                                    const expired = isExpired(promo.expires_at);
                                    const usageFull = promo.usage_limit !== null && promo.used_count >= promo.usage_limit;

                                    return (
                                        <TableRow key={promo.id} className="group">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono font-medium">
                                                        {promo.code}
                                                    </code>
                                                    <button
                                                        onClick={() => copyCode(promo.code)}
                                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {promo.type === 'percentage' ? `${promo.value}%` : `৳${promo.value}`}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {promo.min_order_amount > 0 ? `৳${promo.min_order_amount}` : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    usageFull && "text-destructive"
                                                )}>
                                                    {promo.used_count}
                                                    {promo.usage_limit && ` / ${promo.usage_limit}`}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {promo.expires_at
                                                    ? expired
                                                        ? <span className="text-destructive">Expired</span>
                                                        : formatDistanceToNow(new Date(promo.expires_at), { addSuffix: true })
                                                    : 'Never'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={promo.is_active && !expired && !usageFull}
                                                        onCheckedChange={(checked) => toggleActive({ id: promo.id, is_active: checked })}
                                                        disabled={isToggling || expired || usageFull}
                                                    />
                                                    <Badge
                                                        variant={promo.is_active && !expired && !usageFull ? 'default' : 'secondary'}
                                                        className={cn(
                                                            promo.is_active && !expired && !usageFull
                                                                ? 'bg-green-500/10 text-green-600 border-green-200'
                                                                : ''
                                                        )}
                                                    >
                                                        {expired ? 'Expired' : usageFull ? 'Limit Reached' : promo.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Promo Code?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the promo code "{promo.code}". This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => deletePromoCode(promo.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                {isDeleting ? 'Deleting...' : 'Delete'}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default PromoCodes;
