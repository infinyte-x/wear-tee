import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const policyTabs = [
    { id: 'about', label: 'About Us' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'return', label: 'Return Policy' },
    { id: 'refund', label: 'Refund Policy' },
    { id: 'shipping', label: 'Shipping Policy' },
];

const ShopPolicy = () => {
    return (
        <AdminLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/manage-shop" className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Shop Policy</h1>
                        <p className="text-muted-foreground text-sm">Manage your store policies and legal pages</p>
                    </div>
                </div>

                {/* Policy Tabs */}
                <Tabs defaultValue="about" className="w-full">
                    <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted/50 p-1 mb-6">
                        {policyTabs.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-background">
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {policyTabs.map((tab) => (
                        <TabsContent key={tab.id} value={tab.id}>
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <FileText className="h-5 w-5 text-accent" />
                                    </div>
                                    <h2 className="text-lg font-medium">{tab.label}</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`${tab.id}-content`}>Content</Label>
                                        <Textarea
                                            id={`${tab.id}-content`}
                                            placeholder={`Enter your ${tab.label.toLowerCase()} content here...`}
                                            rows={12}
                                            className="font-mono text-sm"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            You can use HTML tags for formatting. This will appear on your store's {tab.label.toLowerCase()} page.
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline">Preview</Button>
                                        <Button>Save {tab.label}</Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default ShopPolicy;
