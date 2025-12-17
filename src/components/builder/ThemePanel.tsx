import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageTheme, PRESET_THEMES } from '@/lib/theme';

interface ThemePanelProps {
    currentTheme: PageTheme | null;
    onThemeChange: (theme: PageTheme) => void;
}

export function ThemePanel({ currentTheme, onThemeChange }: ThemePanelProps) {
    const [open, setOpen] = useState(false);
    const [customizing, setCustomizing] = useState(false);
    const [customTheme, setCustomTheme] = useState<PageTheme>(
        currentTheme || PRESET_THEMES[0]
    );

    const handlePresetSelect = (theme: PageTheme) => {
        setCustomTheme(theme);
        onThemeChange(theme);
    };

    const handleCustomChange = (key: keyof PageTheme, value: string) => {
        const updated = { ...customTheme, [key]: value };
        setCustomTheme(updated);
    };

    const applyCustomTheme = () => {
        onThemeChange({ ...customTheme, id: 'custom', name: 'Custom' });
    };

    const activeTheme = currentTheme || PRESET_THEMES[0];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Theme</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Page Theme</DialogTitle>
                    <DialogDescription>
                        Choose a preset theme or customize colors
                    </DialogDescription>
                </DialogHeader>

                {!customizing ? (
                    <div className="space-y-4">
                        {/* Preset Themes */}
                        <div className="grid grid-cols-3 gap-3">
                            {PRESET_THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    className={cn(
                                        "relative p-3 rounded-lg border-2 transition-all text-left",
                                        activeTheme.id === theme.id
                                            ? "border-primary ring-2 ring-primary/20"
                                            : "border-transparent hover:border-muted-foreground/20"
                                    )}
                                    style={{ backgroundColor: theme.backgroundColor }}
                                    onClick={() => handlePresetSelect(theme)}
                                >
                                    {activeTheme.id === theme.id && (
                                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                    <div className="flex gap-1 mb-2">
                                        <div
                                            className="w-4 h-4 rounded-full border"
                                            style={{ backgroundColor: theme.primaryColor }}
                                        />
                                        <div
                                            className="w-4 h-4 rounded-full border"
                                            style={{ backgroundColor: theme.accentColor }}
                                        />
                                    </div>
                                    <p
                                        className="text-xs font-medium"
                                        style={{ color: theme.textColor }}
                                    >
                                        {theme.name}
                                    </p>
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setCustomizing(true)}
                        >
                            Customize Colors
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="primaryColor">Primary Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        id="primaryColor"
                                        value={customTheme.primaryColor}
                                        onChange={(e) => handleCustomChange('primaryColor', e.target.value)}
                                        className="w-12 h-12 rounded border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={customTheme.primaryColor}
                                        onChange={(e) => handleCustomChange('primaryColor', e.target.value)}
                                        className="flex-1 px-2 border rounded text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="backgroundColor">Background</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        id="backgroundColor"
                                        value={customTheme.backgroundColor}
                                        onChange={(e) => handleCustomChange('backgroundColor', e.target.value)}
                                        className="w-12 h-12 rounded border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={customTheme.backgroundColor}
                                        onChange={(e) => handleCustomChange('backgroundColor', e.target.value)}
                                        className="flex-1 px-2 border rounded text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="textColor">Text Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        id="textColor"
                                        value={customTheme.textColor}
                                        onChange={(e) => handleCustomChange('textColor', e.target.value)}
                                        className="w-12 h-12 rounded border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={customTheme.textColor}
                                        onChange={(e) => handleCustomChange('textColor', e.target.value)}
                                        className="flex-1 px-2 border rounded text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accentColor">Accent Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        id="accentColor"
                                        value={customTheme.accentColor}
                                        onChange={(e) => handleCustomChange('accentColor', e.target.value)}
                                        className="w-12 h-12 rounded border cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={customTheme.accentColor}
                                        onChange={(e) => handleCustomChange('accentColor', e.target.value)}
                                        className="flex-1 px-2 border rounded text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Border Radius</Label>
                            <div className="flex gap-2">
                                {(['none', 'sm', 'md', 'lg', 'full'] as const).map((radius) => (
                                    <button
                                        key={radius}
                                        className={cn(
                                            "px-3 py-1.5 text-sm border rounded transition-colors",
                                            customTheme.borderRadius === radius
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted"
                                        )}
                                        onClick={() => handleCustomChange('borderRadius', radius)}
                                    >
                                        {radius}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div
                            className="p-4 rounded-lg border"
                            style={{
                                backgroundColor: customTheme.backgroundColor,
                                color: customTheme.textColor,
                            }}
                        >
                            <p className="font-semibold mb-2">Preview</p>
                            <p className="text-sm mb-3">This is how your theme will look.</p>
                            <button
                                className="px-4 py-2 text-sm font-medium text-white"
                                style={{
                                    backgroundColor: customTheme.primaryColor,
                                    borderRadius:
                                        customTheme.borderRadius === 'none' ? '0' :
                                            customTheme.borderRadius === 'sm' ? '4px' :
                                                customTheme.borderRadius === 'md' ? '8px' :
                                                    customTheme.borderRadius === 'lg' ? '12px' : '9999px'
                                }}
                            >
                                Sample Button
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setCustomizing(false)}
                            >
                                Back
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    applyCustomTheme();
                                    setOpen(false);
                                }}
                            >
                                Apply Theme
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// Helper to get CSS variables object from theme
export { getThemeStyle } from '@/lib/theme';
