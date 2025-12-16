import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BlockData } from "@/components/builder/types";

interface PageVersion {
    id: string;
    page_id: string;
    content: BlockData[];
    meta_title: string | null;
    description: string | null;
    meta_image: string | null;
    version_number: number;
    created_at: string;
    created_by: string | null;
}

export function usePageVersions(pageId: string | undefined) {
    const queryClient = useQueryClient();

    // Fetch all versions for a page
    const { data: versions, isLoading } = useQuery({
        queryKey: ["page_versions", pageId],
        queryFn: async () => {
            if (!pageId) return [];

            const { data, error } = await supabase
                .from("page_versions")
                .select("*")
                .eq("page_id", pageId)
                .order("version_number", { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as PageVersion[];
        },
        enabled: !!pageId,
    });

    // Create a new version
    const createVersionMutation = useMutation({
        mutationFn: async ({
            content,
            meta_title,
            description,
            meta_image,
        }: {
            content: BlockData[];
            meta_title?: string;
            description?: string;
            meta_image?: string;
        }) => {
            if (!pageId) throw new Error("Page ID is required");

            // Get next version number
            const currentMax = versions?.[0]?.version_number || 0;
            const nextVersion = currentMax + 1;

            const { data, error } = await supabase
                .from("page_versions")
                .insert({
                    page_id: pageId,
                    content: content as any,
                    meta_title: meta_title || null,
                    description: description || null,
                    meta_image: meta_image || null,
                    version_number: nextVersion,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["page_versions", pageId] });
            toast.success("Version saved");
        },
        onError: () => toast.error("Failed to save version"),
    });

    // Restore a version
    const restoreVersionMutation = useMutation({
        mutationFn: async (versionId: string) => {
            if (!pageId) throw new Error("Page ID is required");

            // Get the version to restore
            const version = versions?.find(v => v.id === versionId);
            if (!version) throw new Error("Version not found");

            // Update the page with the version's content
            const { error } = await supabase
                .from("pages")
                .update({
                    content: version.content as any,
                    meta_title: version.meta_title,
                    description: version.description,
                    meta_image: version.meta_image,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", pageId);

            if (error) throw error;
            return version;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["page", pageId] });
            queryClient.invalidateQueries({ queryKey: ["page_versions", pageId] });
            toast.success("Version restored successfully");
        },
        onError: () => toast.error("Failed to restore version"),
    });

    return {
        versions: versions || [],
        isLoading,
        createVersion: createVersionMutation.mutate,
        isCreatingVersion: createVersionMutation.isPending,
        restoreVersion: restoreVersionMutation.mutate,
        isRestoringVersion: restoreVersionMutation.isPending,
    };
}
