import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlockData } from "@/components/builder/types";

/**
 * Hook to fetch page building blocks by slug
 * Used by system pages (Cart, Checkout, etc.) to render customizable content
 */
export function usePageBlocks(slug: string) {
    return useQuery({
        queryKey: ["page-blocks", slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("pages")
                .select("id, content, meta_title, meta_description")
                .eq("slug", slug)
                .single();

            if (error) {
                // Page might not exist yet, return empty blocks
                if (error.code === "PGRST116") {
                    return { blocks: [], meta: null };
                }
                throw error;
            }

            const blocks = (data?.content as unknown as BlockData[]) || [];
            return {
                pageId: data?.id,
                blocks,
                meta: {
                    title: data?.meta_title,
                    description: data?.meta_description,
                },
            };
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
}
