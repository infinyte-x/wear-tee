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
import { UndoDot, Check, X, Search } from 'lucide-react';
import { useReturns, ReturnStatus } from '@/hooks/useReturns';
import { format } from 'date-fns';

const Returns = () => {
    const { returns, isLoading, updateStatus } = useReturns();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedReturn, setSelectedReturn] = useState<any>(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    const handleApprove = () => {
        if (!selectedReturn) return;

        updateStatus({
            id: selectedReturn.id,
            status: 'approved',
            refundAmount: parseFloat(refundAmount) || selectedReturn.order.total,
            notes: adminNotes,
        });

        setSelectedReturn(null);
        setRefundAmount('');
        setAdminNotes('');
    };

    const handleReject = () => {
        if (!selectedReturn) return;

        updateStatus({
            id: selectedReturn.id,
            status: 'rejected',
            notes: adminNotes,
        });

        setSelectedReturn(null);
        setAdminNotes('');
    };

    // Filter returns
    const filteredReturns = returns?.filter((ret) => {
        const matchesSearch =
            ret.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ret.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ret.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: ReturnStatus) => {
        const config: Record<ReturnStatus, { variant: any; label: string }> = {
            pending: { variant: 'secondary', label: 'Pending Review' },
            approved: { variant: 'default', label: 'Approved' },
            rejected: { variant: 'destructive', label: 'Rejected' },
            completed: { variant: 'outline', label: 'Completed' },
        };

        const { variant, label } = config[status];
        return <Badge variant={variant}>{label}</Badge>;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Returns & Refunds</h1>
                    <p className="text-muted-foreground mt-1">Manage product return requests</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by order ID or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Returns Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Loading returns...
                                    </TableCell>
                                </TableRow>
                            ) : filteredReturns?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No return requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReturns?.map((ret) => (
                                    <TableRow key={ret.id}>
                                        <TableCell className="font-mono text-sm">
                                            #{ret.order_id.slice(0, 8).toUpperCase()}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{ret.customer?.full_name || 'Guest'}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {ret.customer?.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate" title={ret.reason}>
                                            {ret.reason}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            ${(ret.refund_amount || ret.order?.total || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(ret.status)}</TableCell>
                                        <TableCell className="text-sm">
                                            {format(new Date(ret.created_at), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {ret.status === 'pending' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedReturn(ret);
                                                        setRefundAmount(ret.order?.total?.toString() || '');
                                                        setAdminNotes(ret.admin_notes || '');
                                                    }}
                                                >
                                                    Review
                                                </Button>
                                            ) : ret.status === 'approved' ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateStatus({ id: ret.id, status: 'completed' })}
                                                >
                                                    Mark Completed
                                                </Button>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Review Return Dialog */}
                <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Review Return Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Order ID</Label>
                                    <p className="font-mono">#{selectedReturn?.order_id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Order Total</Label>
                                    <p className="font-semibold">${selectedReturn?.order?.total.toFixed(2)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Customer</Label>
                                    <p>{selectedReturn?.customer?.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedReturn?.customer?.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Requested Date</Label>
                                    <p>{selectedReturn && format(new Date(selectedReturn.created_at), 'MMM dd, yyyy')}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Return Reason</Label>
                                <p className="text-sm p-3 bg-muted rounded-lg">{selectedReturn?.reason}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="refund">Refund Amount</Label>
                                <Input
                                    id="refund"
                                    type="number"
                                    step="0.01"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Admin Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this return..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setSelectedReturn(null)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleReject} className="gap-2">
                                    <X className="h-4 w-4" />
                                    Reject
                                </Button>
                                <Button onClick={handleApprove} className="gap-2">
                                    <Check className="h-4 w-4" />
                                    Approve & Refund
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default Returns;
