/**
 * useSiteSettings - Hook for managing site settings
 * 
 * Provides CRUD operations for the site_settings table.
 * Settings are publicly readable but only admins can modify.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SiteSettings {
    id: string;
    // Store Identity
    store_name: string;
    site_title: string;
    store_address: string | null;
    business_hours: string;
    currency_symbol: string;
    seo_description: string | null;
    announcement_message: string | null;
    // Contact Information
    shop_email: string | null;
    phone_number: string | null;
    whatsapp_number: string | null;
    // Social Media
    facebook_url: string | null;
    instagram_url: string | null;
    youtube_url: string | null;
    twitter_url: string | null;
    tiktok_url: string | null;
    // Media
    logo_url: string | null;
    favicon_url: string | null;
    // Footer Settings
    footer_newsletter_title: string;
    footer_newsletter_text: string;
    footer_copyright_text: string | null;
    // Shop Settings
    maintain_stock: boolean;
    show_sold_count: boolean;
    allow_image_downloads: boolean;
    show_email_field: boolean;
    enable_promo_codes: boolean;
    // Other
    vat_percentage: number;
    theme_color: string;
    default_language: string;
    // Announcement Bar
    announcement_enabled: boolean;
    announcement_text: string | null;
    announcement_link: string | null;
    announcement_bg_color: string;
    announcement_text_color: string;
    // Typography
    heading_font: string;
    body_font: string;
    font_size_base: string;
    // Navigation
    navigation_items: Array<{ label: string; href: string; order: number }>;
    show_search: boolean;
    show_cart_count: boolean;
    show_wishlist: boolean;
    // Advanced Settings
    custom_css: string | null;
    custom_js: string | null;
    default_meta_title: string | null;
    default_meta_description: string | null;
    analytics_id: string | null;
    // Color Scheme
    background_color: string;
    foreground_color: string;
    accent_color: string;
    color_scheme: 'light' | 'dark' | 'custom';
    // Metadata
    created_at: string;
    updated_at: string;
}

export function useSiteSettings() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // LocalStorage key for caching
    const CACHE_KEY = 'site-settings-cache';

    // Get cached settings from localStorage
    const getCachedSettings = (): SiteSettings | undefined => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            return cached ? JSON.parse(cached) : undefined;
        } catch {
            return undefined;
        }
    };

    // Save settings to localStorage
    const setCachedSettings = (settings: SiteSettings) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
        } catch {
            // Ignore storage errors
        }
    };

    // Fetch settings (public) - heavily cached for fast loads
    const { data: settings, isLoading, error } = useQuery({
        queryKey: ['site-settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('site_settings' as any)
                .select('*')
                .single();

            if (error) throw error;

            // Cache to localStorage for instant fallback
            setCachedSettings(data as any as SiteSettings);

            return data as any as SiteSettings;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes - data considered fresh
        gcTime: 1000 * 60 * 60, // 1 hour - keep in cache
        refetchOnWindowFocus: false, // Don't refetch when switching tabs
        refetchOnMount: false, // Don't refetch on component mount if data exists
        placeholderData: getCachedSettings(), // Use localStorage as instant fallback
    });

    // Update settings (admin only)
    const updateMutation = useMutation({
        mutationFn: async (values: Partial<SiteSettings>) => {
            console.log('🔧 useSiteSettings: updateMutation called with values:', values);

            if (!settings?.id) {
                console.error('❌ useSiteSettings: Settings not loaded, id:', settings?.id);
                throw new Error('Settings not loaded');
            }

            console.log('✅ useSiteSettings: Updating settings with id:', settings.id);

            const { data, error } = await supabase
                .from('site_settings' as any)
                .update(values)
                .eq('id', settings.id)
                .select()
                .single();

            if (error) {
                console.error('❌ useSiteSettings: Update error:', error);
                throw error;
            }

            console.log('✅ useSiteSettings: Update successful:', data);
            return data as any as SiteSettings;
        },
        onSuccess: () => {
            console.log('✅ useSiteSettings: onSuccess triggered');
            queryClient.invalidateQueries({ queryKey: ['site-settings'] });
            toast({
                title: 'Settings updated',
                description: 'Your shop settings have been saved successfully',
            });
        },
        onError: (error: Error) => {
            console.error('❌ useSiteSettings: onError triggered:', error);
            toast({
                title: 'Update failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return {
        settings,
        isLoading,
        error,
        updateSettings: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
    };
}

export default useSiteSettings;
