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
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Truck, Package, Search, Loader2, ExternalLink } from 'lucide-react';
import { useShipments } from '@/hooks/useShipments';
import { usePathaoConnection, usePathaoStores, usePathaoCities, usePathaoZones, usePathaoAreas, useBookPathaoParcel } from '@/hooks/usePathao';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

const Shipments = () => {
    const { shipments, isLoading, addTracking, updateStatus } = useShipments();
    const { data: isPathaoConnected } = usePathaoConnection();
    const { data: pathaoStores } = usePathaoStores();
    const { data: pathaoCities } = usePathaoCities();
    const bookPathaoParcel = useBookPathaoParcel();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('Pathao');

    // Pathao booking state
    const [pathaoDialogOpen, setPathaoDialogOpen] = useState(false);
    const [pathaoOrder, setPathaoOrder] = useState<any>(null);
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedZone, setSelectedZone] = useState<string>('');
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [itemWeight, setItemWeight] = useState('0.5');

    const { data: pathaoZones } = usePathaoZones(selectedCity ? parseInt(selectedCity) : null);
    const { data: pathaoAreas } = usePathaoAreas(selectedZone ? parseInt(selectedZone) : null);

    const handleAddTracking = () => {
        if (!selectedOrder || !trackingNumber) return;

        addTracking({
            orderId: selectedOrder.id,
            trackingNumber,
            carrier,
        });

        setSelectedOrder(null);
        setTrackingNumber('');
        setCarrier('Pathao');
    };

    const handleBookWithPathao = (order: any) => {
        setPathaoOrder(order);
        setPathaoDialogOpen(true);
        // Reset selections
        setSelectedStore('');
        setSelectedCity('');
        setSelectedZone('');
        setSelectedArea('');
        setItemWeight('0.5');
    };

    const handlePathaoSubmit = async () => {
        if (!pathaoOrder || !selectedStore || !selectedCity || !selectedZone) {
            toast.error('Please fill in all required fields');
            return;
        }

        bookPathaoParcel.mutate({
            orderId: pathaoOrder.id,
            parcelData: {
                store_id: parseInt(selectedStore),
                merchant_order_id: pathaoOrder.order_number,
                recipient_name: pathaoOrder.customer_name,
                recipient_phone: pathaoOrder.phone || '01700000000', // TODO: Get from order
                recipient_address: pathaoOrder.shipping_address || 'N/A',
                recipient_city: parseInt(selectedCity),
                recipient_zone: parseInt(selectedZone),
                recipient_area: selectedArea ? parseInt(selectedArea) : 0,
                delivery_type: 48, // Normal delivery
                item_type: 2, // Parcel
                item_quantity: 1,
                item_weight: parseFloat(itemWeight),
                amount_to_collect: pathaoOrder.total || 0, // COD amount
                item_description: `Order #${pathaoOrder.order_number}`,
            },
        }, {
            onSuccess: () => {
                setPathaoDialogOpen(false);
                setPathaoOrder(null);
            },
        });
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Shipments</h1>
                        <p className="text-muted-foreground mt-1">Track and manage order shipments</p>
                    </div>
                    {!isPathaoConnected && (
                        <Link to="/admin/manage-shop/delivery">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Truck className="h-4 w-4" />
                                Connect Pathao
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Pathao Connected Banner */}
                {isPathaoConnected && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
                        <span className="text-lg">🚚</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                Pathao Courier Connected
                            </p>
                            <p className="text-xs text-muted-foreground">
                                You can book deliveries directly from this page
                            </p>
                        </div>
                    </div>
                )}

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
                                            ৳{shipment.total.toFixed(2)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                                        <TableCell>
                                            {shipment.tracking_number ? (
                                                <div>
                                                    <div className="font-mono text-sm flex items-center gap-1">
                                                        {shipment.tracking_number}
                                                        {shipment.carrier === 'Pathao' && (
                                                            <a
                                                                href={`https://merchant.pathao.com/tracking?consignment_id=${shipment.tracking_number}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-600"
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        )}
                                                    </div>
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
                                            <div className="flex items-center justify-end gap-2">
                                                {!shipment.tracking_number ? (
                                                    <>
                                                        {isPathaoConnected && (
                                                            <Button
                                                                size="sm"
                                                                className="gap-2"
                                                                onClick={() => handleBookWithPathao(shipment)}
                                                            >
                                                                🚚 Book Pathao
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2"
                                                            onClick={() => setSelectedOrder(shipment)}
                                                        >
                                                            <Package className="h-4 w-4" />
                                                            Manual
                                                        </Button>
                                                    </>
                                                ) : shipment.status === 'shipped' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => updateStatus({ orderId: shipment.id, status: 'delivered' })}
                                                    >
                                                        Mark Delivered
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Manual Tracking Dialog */}
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
                                        <SelectItem value="Pathao">Pathao</SelectItem>
                                        <SelectItem value="Steadfast">Steadfast</SelectItem>
                                        <SelectItem value="RedX">RedX</SelectItem>
                                        <SelectItem value="Paperfly">Paperfly</SelectItem>
                                        <SelectItem value="Sundarban">Sundarban Courier</SelectItem>
                                        <SelectItem value="SA Paribahan">SA Paribahan</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tracking">Tracking Number / Consignment ID</Label>
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

                {/* Pathao Booking Dialog */}
                <Dialog open={pathaoDialogOpen} onOpenChange={setPathaoDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                🚚 Book with Pathao
                            </DialogTitle>
                            <DialogDescription>
                                Create a delivery request for Order #{pathaoOrder?.order_number}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Order Summary */}
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Customer:</span>
                                    <span className="font-medium">{pathaoOrder?.customer_name}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-muted-foreground">COD Amount:</span>
                                    <span className="font-medium">৳{pathaoOrder?.total?.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Pickup Store */}
                            <div className="space-y-2">
                                <Label>Pickup Store *</Label>
                                <Select value={selectedStore} onValueChange={setSelectedStore}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select pickup location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pathaoStores?.map((store) => (
                                            <SelectItem key={store.store_id} value={store.store_id.toString()}>
                                                {store.store_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(!pathaoStores || pathaoStores.length === 0) && (
                                    <p className="text-xs text-amber-600">
                                        No pickup stores found. Create one in your Pathao merchant dashboard.
                                    </p>
                                )}
                            </div>

                            {/* Destination City */}
                            <div className="space-y-2">
                                <Label>Destination City *</Label>
                                <Select value={selectedCity} onValueChange={(v) => { setSelectedCity(v); setSelectedZone(''); setSelectedArea(''); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pathaoCities?.map((city) => (
                                            <SelectItem key={city.city_id} value={city.city_id.toString()}>
                                                {city.city_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Destination Zone */}
                            <div className="space-y-2">
                                <Label>Zone *</Label>
                                <Select value={selectedZone} onValueChange={(v) => { setSelectedZone(v); setSelectedArea(''); }} disabled={!selectedCity}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pathaoZones?.map((zone) => (
                                            <SelectItem key={zone.zone_id} value={zone.zone_id.toString()}>
                                                {zone.zone_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Destination Area */}
                            <div className="space-y-2">
                                <Label>Area (Optional)</Label>
                                <Select value={selectedArea} onValueChange={setSelectedArea} disabled={!selectedZone}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select area" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pathaoAreas?.map((area) => (
                                            <SelectItem key={area.area_id} value={area.area_id.toString()}>
                                                {area.area_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Item Weight */}
                            <div className="space-y-2">
                                <Label>Item Weight (kg)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    value={itemWeight}
                                    onChange={(e) => setItemWeight(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setPathaoDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePathaoSubmit}
                                    disabled={bookPathaoParcel.isPending || !selectedStore || !selectedCity || !selectedZone}
                                >
                                    {bookPathaoParcel.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Booking...
                                        </>
                                    ) : (
                                        <>
                                            🚚 Book Delivery
                                        </>
                                    )}
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
