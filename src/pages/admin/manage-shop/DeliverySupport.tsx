import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Truck, Package, MapPin } from 'lucide-react';

const courierServices = [
    { id: 'pathao', name: 'Pathao Courier', logo: '🚚', connected: false },
    { id: 'steadfast', name: 'Steadfast Courier', logo: '📦', connected: true },
    { id: 'redx', name: 'RedX', logo: '🔴', connected: false },
    { id: 'paperfly', name: 'Paperfly', logo: '📄', connected: false },
];

const DeliverySupport = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/manage-shop" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Delivery Support</h1>
                        <p className="text-muted-foreground text-sm">Configure delivery charges and courier integrations</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Delivery Settings */}
                    <div className="space-y-6">
                        {/* Default Delivery Charge */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <Truck className="h-5 w-5 text-orange-500" />
                                </div>
                                <h2 className="text-lg font-medium">Default Delivery Charge</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="insideDhaka">Inside Dhaka</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                                            <Input id="insideDhaka" type="number" defaultValue="60" className="pl-8" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="outsideDhaka">Outside Dhaka</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                                            <Input id="outsideDhaka" type="number" defaultValue="120" className="pl-8" />
                                        </div>
                                    </div>
                                </div>
                                <Button>Save Delivery Charges</Button>
                            </div>
                        </div>

                        {/* Delivery Options */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Package className="h-5 w-5 text-blue-500" />
                                </div>
                                <h2 className="text-lg font-medium">Delivery Options</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <div>
                                        <Label className="text-base">Cash on Delivery (COD)</Label>
                                        <p className="text-sm text-muted-foreground">Allow customers to pay on delivery</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <div>
                                        <Label className="text-base">Weight-based Charges</Label>
                                        <p className="text-sm text-muted-foreground">Calculate delivery based on product weight</p>
                                    </div>
                                    <Switch />
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <Label className="text-base">Zone-based Delivery</Label>
                                        <p className="text-sm text-muted-foreground">Set different prices for different zones</p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Courier Integrations */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <MapPin className="h-5 w-5 text-green-500" />
                            </div>
                            <h2 className="text-lg font-medium">Courier Services</h2>
                        </div>

                        <div className="space-y-3">
                            {courierServices.map((courier) => (
                                <div
                                    key={courier.id}
                                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{courier.logo}</span>
                                        <div>
                                            <div className="font-medium">{courier.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {courier.connected ? 'Connected' : 'Not connected'}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant={courier.connected ? 'outline' : 'default'}
                                        size="sm"
                                    >
                                        {courier.connected ? 'Configure' : 'Connect'}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                💡 Connect with courier services to enable automatic order tracking and delivery management.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DeliverySupport;
