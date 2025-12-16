import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, MessageSquare, Facebook } from 'lucide-react';

const ChatSupport = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/manage-shop" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Chat Support</h1>
                        <p className="text-muted-foreground text-sm">Configure chat widgets for customer support</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Facebook Messenger */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600/10 rounded-lg">
                                    <Facebook className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium">Facebook Messenger</h2>
                                    <p className="text-sm text-muted-foreground">Chat widget</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fbPageId">Facebook Page ID</Label>
                                <Input id="fbPageId" placeholder="Enter your Facebook Page ID" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fbThemeColor">Theme Color</Label>
                                <Input id="fbThemeColor" type="color" defaultValue="#0084ff" className="h-10 w-20" />
                            </div>

                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    The Messenger chat widget will appear on your store for customers to contact you directly.
                                </p>
                            </div>

                            <Button>Save Messenger Settings</Button>
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium">WhatsApp Business</h2>
                                    <p className="text-sm text-muted-foreground">Click to chat</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="waNumber">WhatsApp Number</Label>
                                <Input id="waNumber" placeholder="+880 1XXX-XXXXXX" />
                                <p className="text-xs text-muted-foreground">Include country code</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="waMessage">Default Message</Label>
                                <Input
                                    id="waMessage"
                                    placeholder="Hi! I'm interested in your products."
                                    defaultValue="Hi! I have a question about your products."
                                />
                            </div>

                            <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    A WhatsApp button will appear on your store for quick customer inquiries.
                                </p>
                            </div>

                            <Button>Save WhatsApp Settings</Button>
                        </div>
                    </div>
                </div>

                {/* Widget Position */}
                <div className="bg-card border border-border rounded-xl p-6 mt-6">
                    <h2 className="text-lg font-medium mb-4">Widget Position</h2>
                    <div className="flex gap-4">
                        <label className="flex-1 cursor-pointer">
                            <input type="radio" name="position" className="peer sr-only" defaultChecked />
                            <div className="p-4 border-2 border-border rounded-lg text-center peer-checked:border-accent peer-checked:bg-accent/5">
                                <div className="font-medium">Bottom Right</div>
                                <div className="text-sm text-muted-foreground">Recommended</div>
                            </div>
                        </label>
                        <label className="flex-1 cursor-pointer">
                            <input type="radio" name="position" className="peer sr-only" />
                            <div className="p-4 border-2 border-border rounded-lg text-center peer-checked:border-accent peer-checked:bg-accent/5">
                                <div className="font-medium">Bottom Left</div>
                                <div className="text-sm text-muted-foreground">Alternative</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ChatSupport;
