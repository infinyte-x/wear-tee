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
import { Truck, Package, Search } from 'lucide-react';
import { useShipments } from '@/hooks/useShipments';
import { format } from 'date-fns';

const Shipments = () => {
    const { shipments, isLoading, addTracking, updateStatus } = useShipments();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('USPS');

    const handleAddTracking = () => {
        if (!selectedOrder || !trackingNumber) return;

        addTracking({
            orderId: selectedOrder.id,
            trackingNumber,
            carrier,
        });

        setSelectedOrder(null);
        setTrackingNumber('');
        setCarrier('USPS');
    };

    // Filter shipments
    const filteredShipments = shipments?.filter((shipment) => {
        const matchesSearch =
            shipment.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            paid: { variant: 'secondary', label: 'Ready to Ship' },
            processing: { variant: 'secondary', label: 'Processing' },
            shipped: { variant: 'default', label: 'Shipped' },
            delivered: { variant: 'outline', label: 'Delivered' },
        };

        const config = variants[status] || { variant: 'secondary', label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">Shipments</h1>
                    <p className="text-muted-foreground mt-1">Track and manage order shipments</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by order ID, customer, or tracking..."
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
                            <SelectItem value="paid">Ready to Ship</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Shipments Table */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tracking</TableHead>
                                <TableHead>Shipped Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Loading shipments...
                                    </TableCell>
                                </TableRow>
                            ) : filteredShipments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No shipments found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredShipments?.map((shipment) => (
                                    <TableRow key={shipment.id}>
                                        <TableCell className="font-mono text-sm">
                                            #{shipment.order_number}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{shipment.customer_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {shipment.customer_email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            ${shipment.total.toFixed(2)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                                        <TableCell>
                                            {shipment.tracking_number ? (
                                                <div>
                                                    <div className="font-mono text-sm">{shipment.tracking_number}</div>
                                                    <div className="text-xs text-muted-foreground">{shipment.carrier}</div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No tracking</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {shipment.shipped_at ? (
                                                <span className="text-sm">
                                                    {format(new Date(shipment.shipped_at), 'MMM dd, yyyy')}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Not shipped</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!shipment.tracking_number ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => setSelectedOrder(shipment)}
                                                >
                                                    <Package className="h-4 w-4" />
                                                    Add Tracking
                                                </Button>
                                            ) : shipment.status === 'shipped' ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateStatus({ orderId: shipment.id, status: 'delivered' })}
                                                >
                                                    Mark Delivered
                                                </Button>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Add Tracking Dialog */}
                <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Tracking Information</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Order #{selectedOrder?.order_number}
                                </p>
                                <p className="font-medium">{selectedOrder?.customer_name}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="carrier">Shipping Carrier</Label>
                                <Select value={carrier} onValueChange={setCarrier}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USPS">USPS</SelectItem>
                                        <SelectItem value="FedEx">FedEx</SelectItem>
                                        <SelectItem value="UPS">UPS</SelectItem>
                                        <SelectItem value="DHL">DHL</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tracking">Tracking Number</Label>
                                <Input
                                    id="tracking"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter tracking number..."
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddTracking} disabled={!trackingNumber}>
                                    <Truck className="h-4 w-4 mr-2" />
                                    Add Tracking
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default Shipments;
