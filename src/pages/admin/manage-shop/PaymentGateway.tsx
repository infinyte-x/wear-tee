import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, CreditCard, Banknote, Smartphone, Shield } from 'lucide-react';

const paymentMethods = [
    {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Accept payment when order is delivered',
        icon: Banknote,
        color: 'bg-green-500/10 text-green-500',
        enabled: true
    },
    {
        id: 'bkash',
        name: 'bKash',
        description: 'Mobile Financial Service',
        icon: Smartphone,
        color: 'bg-pink-500/10 text-pink-500',
        enabled: true
    },
    {
        id: 'nagad',
        name: 'Nagad',
        description: 'Digital Payment Service',
        icon: Smartphone,
        color: 'bg-orange-500/10 text-orange-500',
        enabled: false
    },
    {
        id: 'aamarpay',
        name: 'AamarPay',
        description: 'Payment Gateway',
        icon: CreditCard,
        color: 'bg-blue-500/10 text-blue-500',
        enabled: false
    },
    {
        id: 'ssl',
        name: 'SSLCommerz',
        description: 'Secure Payment Gateway',
        icon: Shield,
        color: 'bg-purple-500/10 text-purple-500',
        enabled: false
    }
];

const PaymentGateway = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/manage-shop" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Payment Gateway</h1>
                        <p className="text-muted-foreground text-sm">Configure payment methods for your store</p>
                    </div>
                </div>

                {/* Payment Methods Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                            <div
                                key={method.id}
                                className="bg-card border border-border rounded-xl p-5"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${method.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{method.name}</h3>
                                            <p className="text-sm text-muted-foreground">{method.description}</p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked={method.enabled} />
                                </div>

                                {method.id !== 'cod' && (
                                    <div className="space-y-3 pt-3 border-t border-border">
                                        <div className="space-y-2">
                                            <Label htmlFor={`${method.id}-key`}>API Key / Merchant ID</Label>
                                            <Input
                                                id={`${method.id}-key`}
                                                type="password"
                                                placeholder="Enter API key"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`${method.id}-secret`}>Secret Key</Label>
                                            <Input
                                                id={`${method.id}-secret`}
                                                type="password"
                                                placeholder="Enter secret key"
                                            />
                                        </div>
                                        <Button size="sm" variant="outline">Save Configuration</Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Security Notice */}
                <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                        <h3 className="font-medium text-sm">Secure Transactions</h3>
                        <p className="text-sm text-muted-foreground">
                            All payment information is encrypted and securely stored. We never store full card details on our servers.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PaymentGateway;
