import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Check } from 'lucide-react';

// Popular Google Fonts
const GOOGLE_FONTS = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Syne', label: 'Syne' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'Ubuntu', label: 'Ubuntu' },
];

interface FontPickerProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
}

export function FontPicker({ value, onChange, label }: FontPickerProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {GOOGLE_FONTS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                            <div className="flex items-center gap-2">
                                <span style={{ fontFamily: font.value }}>{font.label}</span>
                                {value === font.value && (
                                    <Check className="h-4 w-4 ml-auto" />
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
                Preview: <span style={{ fontFamily: value }}>The quick brown fox jumps</span>
            </p>
        </div>
    );
}
