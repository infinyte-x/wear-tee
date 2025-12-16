import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Smartphone, MessageSquare } from 'lucide-react';

const SmsSupport = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/manage-shop" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">SMS Support</h1>
                        <p className="text-muted-foreground text-sm">Configure SMS provider for OTP and notifications</p>
                    </div>
                </div>

                {/* SMS Provider */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Smartphone className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h2 className="text-lg font-medium">SMS Provider Configuration</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="smsProvider">SMS Provider</Label>
                                <Input id="smsProvider" defaultValue="BULK SMS BD" disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="smsApiKey">API Key</Label>
                                <Input id="smsApiKey" type="password" placeholder="Enter API key" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="senderId">Sender ID</Label>
                                <Input id="senderId" placeholder="e.g., BRANDLAUNCH" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="smsBalance">SMS Balance</Label>
                                <Input id="smsBalance" defaultValue="500 SMS" disabled className="bg-muted" />
                            </div>
                        </div>

                        <Button>Save SMS Configuration</Button>
                    </div>
                </div>

                {/* SMS Settings */}
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-medium">SMS Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <div>
                                <Label className="text-base">OTP for Order Verification</Label>
                                <p className="text-sm text-muted-foreground">Send OTP to verify customer phone</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <div>
                                <Label className="text-base">Order Confirmation SMS</Label>
                                <p className="text-sm text-muted-foreground">Notify customer when order is placed</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <div>
                                <Label className="text-base">Shipping Update SMS</Label>
                                <p className="text-sm text-muted-foreground">Notify when order is shipped</p>
                            </div>
                            <Switch />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <Label className="text-base">Delivery Confirmation SMS</Label>
                                <p className="text-sm text-muted-foreground">Notify when order is delivered</p>
                            </div>
                            <Switch />
                        </div>
                    </div>
                </div>

                {/* Custom Templates */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-lg font-medium mb-4">SMS Templates</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="orderTemplate">Order Confirmation Template</Label>
                            <Textarea
                                id="orderTemplate"
                                placeholder="Dear {customer_name}, your order #{order_id} has been placed successfully. Total: {total}. Thank you!"
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                Available variables: {'{customer_name}'}, {'{order_id}'}, {'{total}'}, {'{shop_name}'}
                            </p>
                        </div>

                        <Button>Save Templates</Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SmsSupport;
