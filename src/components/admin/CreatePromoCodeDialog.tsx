import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2, RefreshCw, Percent, DollarSign } from 'lucide-react';
import { generatePromoCode, type CreatePromoCodeInput } from '@/hooks/usePromoCodes';

interface CreatePromoCodeDialogProps {
    onCreate: (input: CreatePromoCodeInput) => void;
    isCreating: boolean;
}

export function CreatePromoCodeDialog({ onCreate, isCreating }: CreatePromoCodeDialogProps) {
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState('');
    const [minOrderAmount, setMinOrderAmount] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [isActive, setIsActive] = useState(true);

    const handleGenerateCode = () => {
        setCode(generatePromoCode());
    };

    const resetForm = () => {
        setCode('');
        setType('percentage');
        setValue('');
        setMinOrderAmount('');
        setUsageLimit('');
        setExpiresAt('');
        setIsActive(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !value) return;

        onCreate({
            code: code.trim().toUpperCase(),
            type,
            value: parseFloat(value),
            min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
            usage_limit: usageLimit ? parseInt(usageLimit) : null,
            expires_at: expiresAt || null,
            is_active: isActive,
        });

        resetForm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Promo Code
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Promo Code</DialogTitle>
                    <DialogDescription>
                        Create a new discount code for your customers.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Code */}
                        <div className="space-y-2">
                            <Label htmlFor="code">Promo Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="code"
                                    placeholder="SUMMER20"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="font-mono uppercase"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleGenerateCode}
                                    title="Generate random code"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Type & Value */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Discount Type</Label>
                                <Select value={type} onValueChange={(v) => setType(v as 'percentage' | 'fixed')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">
                                            <div className="flex items-center gap-2">
                                                <Percent className="h-4 w-4" />
                                                Percentage
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="fixed">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Fixed Amount
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">
                                    {type === 'percentage' ? 'Discount %' : 'Discount Amount (৳)'}
                                </Label>
                                <Input
                                    id="value"
                                    type="number"
                                    min="0"
                                    max={type === 'percentage' ? '100' : undefined}
                                    placeholder={type === 'percentage' ? '10' : '500'}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Min Order & Usage Limit */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minOrder">Min Order Amount (৳)</Label>
                                <Input
                                    id="minOrder"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={minOrderAmount}
                                    onChange={(e) => setMinOrderAmount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usageLimit">Usage Limit</Label>
                                <Input
                                    id="usageLimit"
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited"
                                    value={usageLimit}
                                    onChange={(e) => setUsageLimit(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Expiry & Active */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expires">Expiry Date</Label>
                                <Input
                                    id="expires"
                                    type="datetime-local"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="flex items-center gap-3 pt-2">
                                    <Switch
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                    />
                                    <span className="text-sm">
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating || !code.trim() || !value}>
                            {isCreating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Code'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
