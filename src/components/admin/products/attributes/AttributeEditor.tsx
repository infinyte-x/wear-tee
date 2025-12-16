import { useState, useEffect } from 'react';
import { Attribute, AttributeValue } from '@/types/attributes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, GripVertical, Image as ImageIcon, Save, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AttributeEditorProps {
    initialData?: Attribute | null;
    onSave: (data: Attribute) => void;
    onCancel: () => void;
}

export const AttributeEditor = ({ initialData, onSave, onCancel }: AttributeEditorProps) => {
    const [name, setName] = useState(initialData?.name || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [sortOrder, setSortOrder] = useState<number>(initialData?.sort_order ?? 0);
    const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
    const [type, setType] = useState<Attribute['type']>(initialData?.type || 'select');
    const [values, setValues] = useState<AttributeValue[]>(initialData?.values || []);

    // Auto-generate slug from name if creating new
    useEffect(() => {
        if (!initialData && name) {
            setSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
        }
    }, [name, initialData]);

    const handleAddValue = () => {
        setValues([...values, {
            id: crypto.randomUUID(),
            label: '',
            value: '',
            color: '#000000',
            isDefault: false
        }]);
    };

    const handleRemoveValue = (id: string) => {
        setValues(values.filter(v => v.id !== id));
    };

    const updateValue = (id: string, field: keyof AttributeValue, data: any) => {
        setValues(values.map(v => v.id === id ? { ...v, [field]: data } : v));
        // If sorting/auto-slug logic for values is needed, add here
        if (field === 'label') {
            setValues(current => current.map(v =>
                (v.id === id && !v.value) // simple heuristic: if value is empty, auto-fill from label
                    ? { ...v, [field]: data, value: data }
                    : v
            ));
        }
    };

    const handleSetDefault = (id: string) => {
        setValues(values.map(v => ({ ...v, isDefault: v.id === id })));
    };

    const handleSave = () => {
        if (!name) return; // Add validation toast here
        const data: Attribute = {
            id: initialData?.id || crypto.randomUUID(),
            name,
            slug,
            sort_order: sortOrder,
            is_active: isActive,
            type,
            values,
            created_at: initialData?.created_at || new Date().toISOString()
        };
        onSave(data);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Title *</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Size, Color"
                        />
                        <div className="flex items-center gap-2 pt-2">
                            <Switch id="visual-swatch" checked={type === 'color' || type === 'image'} onCheckedChange={(c) => setType(c ? 'color' : 'select')} />
                            <Label htmlFor="visual-swatch" className="text-sm text-muted-foreground font-normal">Use image from product variation (for Visual Swatch only)</Label>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg">Attributes list</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleAddValue}>Add new attribute</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/20 border rounded-md">
                            {/* Header */}
                            <div className="grid grid-cols-[40px_40px_1fr_100px_80px_60px] gap-2 p-3 text-xs font-semibold text-muted-foreground uppercase border-b bg-muted/40">
                                <div className="text-center">#</div>
                                <div className="text-center" title="Is Default?">Def</div>
                                <div>Title</div>
                                <div className="text-center">Color</div>
                                <div className="text-center">Image</div>
                                <div className="text-center">Rm</div>
                            </div>

                            {/* Rows */}
                            <div className="max-h-[500px] overflow-y-auto">
                                {values.length > 0 ? values.map((val, idx) => (
                                    <div key={val.id} className="grid grid-cols-[40px_40px_1fr_100px_80px_60px] gap-2 p-3 items-center border-b last:border-0 hover:bg-card/50 transition-colors">
                                        <div className="flex items-center justify-center cursor-move text-muted-foreground">
                                            <span className="text-xs mr-1">{idx + 1}</span>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="default-val"
                                                checked={!!val.isDefault}
                                                onChange={() => handleSetDefault(val.id)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                value={val.label}
                                                onChange={(e) => updateValue(val.id, 'label', e.target.value)}
                                                className="h-8"
                                            />
                                        </div>
                                        <div className="flex justify-center">
                                            <div className="flex items-center border rounded-md p-1 h-8 w-16 bg-background">
                                                <input
                                                    type="color"
                                                    value={val.color || '#000000'}
                                                    onChange={(e) => updateValue(val.id, 'color', e.target.value)}
                                                    className="w-full h-full border-none p-0 cursor-pointer bg-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground border border-dashed">
                                                <ImageIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex justify-center">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveValue(val.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No values added yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-sm font-medium">Publish</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex gap-2">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" /> Save
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={handleSave} title="Save & Exit">
                            <LogOut className="h-4 w-4 mr-2" /> & Exit
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-red-500 font-medium text-xs uppercase">Status *</Label>
                            <Select value={isActive ? 'true' : 'false'} onValueChange={(v) => setIsActive(v === 'true')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Published</SelectItem>
                                    <SelectItem value="false">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-red-500 font-medium text-xs uppercase">Display Layout *</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="select">Dropdown / Text</SelectItem>
                                    <SelectItem value="color">Visual Swatch (Color)</SelectItem>
                                    <SelectItem value="image">Visual Swatch (Image)</SelectItem>
                                    <SelectItem value="button">Button / Pill</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-muted-foreground font-normal">Searchable</Label>
                                <Switch checked={true} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <Label className="text-muted-foreground font-normal">Comparable</Label>
                                <Switch checked={true} />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <Label className="text-muted-foreground font-normal">Used in product listing</Label>
                                <Switch checked={true} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground font-normal">Sort Order</Label>
                            <Input
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(parseInt(e.target.value))}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-3 flex justify-end">
                <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">Back to list</Button>
            </div>
        </div>
    );
};
