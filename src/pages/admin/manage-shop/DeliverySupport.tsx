import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Truck, Package, MapPin, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { connectPathao, disconnectPathao, testConnection } from '@/lib/pathao';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CourierService {
    id: string;
    name: string;
    logo: string;
    connected: boolean;
    description: string;
}

interface CourierIntegration {
    id: string;
    courier_name: string;
    client_id: string | null;
    client_secret: string | null;
    is_active: boolean;
}

const DeliverySupport = () => {
    const queryClient = useQueryClient();
    const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch courier integrations from database
    const { data: integrations, isLoading: isLoadingIntegrations } = useQuery({
        queryKey: ['courier-integrations'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('courier_integrations')
                .select('*');
            if (error) throw error;
            return (data || []) as CourierIntegration[];
        },
    });

    // Build courier services list with connection status
    const courierServices: CourierService[] = [
        {
            id: 'pathao',
            name: 'Pathao Courier',
            logo: '🚚',
            connected: integrations?.find(i => i.courier_name === 'pathao')?.is_active ?? false,
            description: 'Bangladesh\'s leading courier service with COD support'
        },
        {
            id: 'steadfast',
            name: 'Steadfast Courier',
            logo: '📦',
            connected: integrations?.find(i => i.courier_name === 'steadfast')?.is_active ?? false,
            description: 'Reliable nationwide delivery service'
        },
        {
            id: 'redx',
            name: 'RedX',
            logo: '🔴',
            connected: integrations?.find(i => i.courier_name === 'redx')?.is_active ?? false,
            description: 'Fast delivery with real-time tracking'
        },
        {
            id: 'paperfly',
            name: 'Paperfly',
            logo: '📄',
            connected: integrations?.find(i => i.courier_name === 'paperfly')?.is_active ?? false,
            description: 'E-commerce focused delivery solution'
        },
    ];

    // Connect courier mutation
    const connectMutation = useMutation({
        mutationFn: async ({ courierId, clientId, clientSecret }: { courierId: string; clientId: string; clientSecret: string }) => {
            if (courierId === 'pathao') {
                await connectPathao(clientId, clientSecret);
            } else {
                // For other couriers, just save credentials (implement their APIs later)
                await (supabase as any)
                    .from('courier_integrations')
                    .upsert({
                        courier_name: courierId,
                        client_id: clientId,
                        client_secret: clientSecret,
                        is_active: true,
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'courier_name' });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courier-integrations'] });
            toast.success('Courier connected successfully!');
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Disconnect courier mutation
    const disconnectMutation = useMutation({
        mutationFn: async (courierId: string) => {
            if (courierId === 'pathao') {
                await disconnectPathao();
            } else {
                await (supabase as any)
                    .from('courier_integrations')
                    .update({ is_active: false })
                    .eq('courier_name', courierId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courier-integrations'] });
            toast.success('Courier disconnected');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const resetForm = () => {
        setClientId('');
        setClientSecret('');
        setShowSecret(false);
        setSelectedCourier(null);
    };

    const handleConnect = (courierId: string) => {
        setSelectedCourier(courierId);
        setIsDialogOpen(true);
    };

    const handleDisconnect = (courierId: string) => {
        if (confirm('Are you sure you want to disconnect this courier?')) {
            disconnectMutation.mutate(courierId);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourier || !clientId || !clientSecret) {
            toast.error('Please fill in all fields');
            return;
        }
        connectMutation.mutate({ courierId: selectedCourier, clientId, clientSecret });
    };

    const getCourierInfo = (courierId: string) => {
        return courierServices.find(c => c.id === courierId);
    };

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
                            {isLoadingIntegrations ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                courierServices.map((courier) => (
                                    <div
                                        key={courier.id}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{courier.logo}</span>
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {courier.name}
                                                    {courier.connected && (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {courier.connected ? 'Connected' : courier.description}
                                                </div>
                                            </div>
                                        </div>
                                        {courier.connected ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleConnect(courier.id)}
                                                >
                                                    Configure
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDisconnect(courier.id)}
                                                    disabled={disconnectMutation.isPending}
                                                >
                                                    {disconnectMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        'Disconnect'
                                                    )}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => handleConnect(courier.id)}
                                            >
                                                Connect
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                💡 Connect with courier services to enable automatic order tracking and delivery management.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connect Courier Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">{getCourierInfo(selectedCourier || '')?.logo}</span>
                            Connect {getCourierInfo(selectedCourier || '')?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Enter your API credentials from the courier's merchant dashboard.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientId">Client ID</Label>
                            <Input
                                id="clientId"
                                placeholder="Enter your Client ID"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clientSecret">Client Secret</Label>
                            <div className="relative">
                                <Input
                                    id="clientSecret"
                                    type={showSecret ? 'text' : 'password'}
                                    placeholder="Enter your Client Secret"
                                    value={clientSecret}
                                    onChange={(e) => setClientSecret(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowSecret(!showSecret)}
                                >
                                    {showSecret ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {selectedCourier === 'pathao' && (
                            <div className="p-3 bg-blue-500/10 rounded-lg text-sm">
                                <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                                    Where to find your credentials:
                                </p>
                                <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                                    <li>Login to <a href="https://merchant.pathao.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">merchant.pathao.com</a></li>
                                    <li>Go to Settings → Developers API</li>
                                    <li>Copy your Client ID and Client Secret</li>
                                </ol>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={connectMutation.isPending}
                            >
                                {connectMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Connecting...
                                    </>
                                ) : (
                                    'Connect'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default DeliverySupport;
