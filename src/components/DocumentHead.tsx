import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

/**
 * DocumentHead - Updates browser tab title and favicon dynamically
 * 
 * This component runs in the background and updates the document head
 * based on site settings (title and favicon)
 */
export function DocumentHead() {
    const { settings } = useSiteSettings();

    useEffect(() => {
        if (!settings) return;

        // Update page title
        document.title = settings.site_title || 'BrandLaunch Studio';

        // Update favicon
        if (settings.favicon_url) {
            // Remove existing favicon links
            const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
            existingFavicons.forEach(link => link.remove());

            // Add new favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/x-icon';
            link.href = settings.favicon_url;
            document.head.appendChild(link);
        }
    }, [settings?.site_title, settings?.favicon_url]);

    return null; // This component doesn't render anything
}

export default DocumentHead;
