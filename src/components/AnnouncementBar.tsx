import { Link } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { cn } from '@/lib/utils';

export function AnnouncementBar() {
    const { settings } = useSiteSettings();
    const [isVisible, setIsVisible] = useState(true);

    if (!settings?.announcement_enabled || !settings?.announcement_text || !isVisible) {
        return null;
    }

    const bgColor = settings.announcement_bg_color || '#000000';
    const textColor = settings.announcement_text_color || '#ffffff';

    const content = (
        <div
            className="relative w-full py-2 px-4 text-center text-sm font-medium"
            style={{
                backgroundColor: bgColor,
                color: textColor,
            }}
        >
            <div className="container mx-auto flex items-center justify-center gap-4">
                <span>{settings.announcement_text}</span>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    aria-label="Close announcement"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );

    if (settings.announcement_link) {
        return (
            <Link to={settings.announcement_link as any} className="block">
                {content}
            </Link>
        );
    }

    return content;
}
