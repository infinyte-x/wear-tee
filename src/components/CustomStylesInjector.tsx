import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

/**
 * CustomStylesInjector - Injects custom CSS, JS, and fonts into the document
 */
export function CustomStylesInjector() {
    const { settings } = useSiteSettings();

    // Inject custom CSS
    useEffect(() => {
        if (!settings?.custom_css) return;

        const styleId = 'custom-css-injection';
        let styleElement = document.getElementById(styleId) as HTMLStyleElement;

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = settings.custom_css;

        return () => {
            styleElement.remove();
        };
    }, [settings?.custom_css]);

    // Inject custom JavaScript
    useEffect(() => {
        if (!settings?.custom_js) return;

        const scriptId = 'custom-js-injection';
        let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;

        if (!scriptElement) {
            scriptElement = document.createElement('script');
            scriptElement.id = scriptId;
            scriptElement.type = 'text/javascript';
            document.body.appendChild(scriptElement);
        }

        scriptElement.textContent = settings.custom_js;

        return () => {
            scriptElement.remove();
        };
    }, [settings?.custom_js]);

    // Load Google Fonts dynamically
    useEffect(() => {
        if (!settings) return;

        const headingFont = settings.heading_font || 'Syne';
        const bodyFont = settings.body_font || 'Inter';

        // Create font link IDs
        const fontLinkId = 'google-fonts-injection';
        let fontLink = document.getElementById(fontLinkId) as HTMLLinkElement;

        if (!fontLink) {
            fontLink = document.createElement('link');
            fontLink.id = fontLinkId;
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
        }

        // Construct Google Fonts URL with both fonts
        const fonts = Array.from(new Set([headingFont, bodyFont]));
        const fontUrl = `https://fonts.googleapis.com/css2?${fonts
            .map(font => `family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700`)
            .join('&')}&display=swap`;

        fontLink.href = fontUrl;

        // Apply fonts to CSS variables
        const styleId = 'font-variables-injection';
        let styleElement = document.getElementById(styleId) as HTMLStyleElement;

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
            :root {
                --font-heading: "${headingFont}", sans-serif;
                --font-body: "${bodyFont}", sans-serif;
            }
            h1, h2, h3, h4, h5, h6 {
                font-family: var(--font-heading) !important;
            }
            body, p, span, div, a, button, input, textarea, select {
                font-family: var(--font-body);
            }
        `;

        return () => {
            fontLink.remove();
            styleElement.remove();
        };
    }, [settings?.heading_font, settings?.body_font]);

    // Inject Google Analytics
    useEffect(() => {
        if (!settings?.analytics_id) return;

        const scriptId = 'google-analytics-injection';
        const existingScript = document.getElementById(scriptId);

        if (existingScript) return; // Already loaded

        // Google Analytics gtag.js
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${settings.analytics_id}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.id = scriptId;
        script2.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.analytics_id}');
        `;
        document.head.appendChild(script2);

        return () => {
            script1.remove();
            script2.remove();
        };
    }, [settings?.analytics_id]);

    return null; // This component doesn't render anything
}
