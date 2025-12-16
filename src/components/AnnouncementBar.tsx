import { Link, useLocation } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { cn } from '@/lib/utils';

type AnimationType = 'none' | 'marquee' | 'pulse' | 'bounce' | 'slide';

export function AnnouncementBar() {
    const { settings } = useSiteSettings();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    // Check if dismissed in session storage
    useEffect(() => {
        const dismissed = sessionStorage.getItem('announcement_dismissed');
        if (dismissed === 'true') {
            setIsDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        sessionStorage.setItem('announcement_dismissed', 'true');
    };

    // Don't show in admin panel
    const isAdminPage = location.pathname.startsWith('/admin');
    if (isAdminPage) {
        return null;
    }

    // Check if announcement is enabled and has text
    if (!settings?.announcement_enabled || !settings?.announcement_text || !isVisible || isDismissed) {
        return null;
    }

    // Check page visibility settings
    const showOnPages = (settings as any).announcement_show_on || 'all';
    const currentPath = location.pathname;

    if (showOnPages === 'home' && currentPath !== '/') {
        return null;
    }
    if (showOnPages === 'products' && !currentPath.startsWith('/products') && !currentPath.startsWith('/collections')) {
        return null;
    }

    const bgColor = settings.announcement_bg_color || '#000000';
    const textColor = settings.announcement_text_color || '#ffffff';
    const animationType = ((settings as any).announcement_animation as AnimationType) || 'none';

    // Animation classes
    const getAnimationClass = () => {
        switch (animationType) {
            case 'marquee':
                return 'animate-marquee';
            case 'pulse':
                return 'animate-pulse';
            case 'bounce':
                return 'animate-bounce-subtle';
            case 'slide':
                return 'animate-slide-in';
            default:
                return '';
        }
    };

    const content = (
        <div
            className="fixed top-0 left-0 right-0 z-[60] w-full py-2.5 px-4 text-center text-sm font-medium overflow-hidden"
            style={{
                backgroundColor: bgColor,
                color: textColor,
            }}
        >
            <div className="container mx-auto flex items-center justify-center gap-4">
                {animationType === 'marquee' ? (
                    <div className="flex whitespace-nowrap">
                        <span className="animate-marquee inline-block">{settings.announcement_text}</span>
                        <span className="animate-marquee inline-block ml-8">{settings.announcement_text}</span>
                    </div>
                ) : (
                    <span className={cn("inline-block", getAnimationClass())}>
                        {settings.announcement_text}
                    </span>
                )}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDismiss();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-all duration-200"
                    aria-label="Close announcement"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );

    if (settings.announcement_link) {
        return (
            <Link to={settings.announcement_link as any} className="block hover:opacity-95 transition-opacity">
                {content}
            </Link>
        );
    }

    return content;
}

// Add required keyframes to global CSS or component
// These should be in your tailwind.config.js or index.css
