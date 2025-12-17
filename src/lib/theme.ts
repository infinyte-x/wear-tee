import React from 'react';

export interface PageTheme {
    id: string;
    name: string;
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

// Helper to get CSS variables object from theme
// Converts hex to HSL string (h s% l%) for shadcn compatibility
function hexToHSL(hex: string): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
}

export function getThemeStyle(theme: PageTheme): React.CSSProperties {
    const radiusMap = {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        full: '9999px',
    };

    return {
        '--background': hexToHSL(theme.backgroundColor),
        '--foreground': hexToHSL(theme.textColor),
        '--primary': hexToHSL(theme.primaryColor),
        '--primary-foreground': '0 0% 100%', // Defaulting to white for simplicity
        '--accent': hexToHSL(theme.accentColor),
        '--accent-foreground': hexToHSL(theme.textColor),
        '--radius': radiusMap[theme.borderRadius],
        // Also map to theme-* for direct usage if needed
        '--theme-primary': theme.primaryColor,
        '--theme-background': theme.backgroundColor,
        fontFamily: theme.fontFamily,
    } as React.CSSProperties;
}

export const PRESET_THEMES: PageTheme[] = [
    {
        id: 'default',
        name: 'Default',
        primaryColor: '#18181b',
        backgroundColor: '#ffffff',
        textColor: '#09090b',
        accentColor: '#f4f4f5',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: 'md',
    },
    {
        id: 'modern-dark',
        name: 'Modern Dark',
        primaryColor: '#6366f1',
        backgroundColor: '#0f0f10',
        textColor: '#fafafa',
        accentColor: '#1f1f23',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: 'lg',
    },
    {
        id: 'elegant',
        name: 'Elegant',
        primaryColor: '#ca8a04',
        backgroundColor: '#fefce8',
        textColor: '#422006',
        accentColor: '#fef08a',
        fontFamily: 'Playfair Display, Georgia, serif',
        borderRadius: 'none',
    },
    {
        id: 'ocean',
        name: 'Ocean',
        primaryColor: '#0ea5e9',
        backgroundColor: '#f0f9ff',
        textColor: '#0c4a6e',
        accentColor: '#e0f2fe',
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        borderRadius: 'lg',
    },
    {
        id: 'forest',
        name: 'Forest',
        primaryColor: '#16a34a',
        backgroundColor: '#f0fdf4',
        textColor: '#14532d',
        accentColor: '#dcfce7',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        borderRadius: 'md',
    },
    {
        id: 'minimal',
        name: 'Minimal',
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        textColor: '#171717',
        accentColor: '#f5f5f5',
        fontFamily: 'Helvetica Neue, Arial, sans-serif',
        borderRadius: 'sm',
    },
];
