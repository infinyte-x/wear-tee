
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const PageRedirector = () => {
    const { slug } = useParams({ from: '/admin/pages/edit/$slug' });
    const navigate = useNavigate();

    const { data: page, isLoading } = useQuery({
        queryKey: ['admin_page_slug', slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('slug', slug)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
    });

    useEffect(() => {
        if (!isLoading) {
            if (page) {
                // Page exists, redirect to builder
                navigate({ to: '/admin/pages/$pageId', params: { pageId: page.id } });
            } else {
                // Page doesn't exist, create it then redirect
                createPage(slug);
            }
        }
    }, [page, isLoading, slug, navigate]);

    const createPage = async (slugToCreate: string) => {
        const title = slugToCreate.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

        const { data, error } = await supabase.from('pages').insert({
            title: title,
            slug: slugToCreate,
            status: 'draft',
            content: []
        }).select().single();

        if (error) {
            console.error("Failed to auto-create page", error);
            return;
        }

        if (data) {
            navigate({ to: '/admin/pages/$pageId', params: { pageId: data.id } });
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Loading page editor...</p>
            </div>
        </div>
    );
};

export default PageRedirector;
