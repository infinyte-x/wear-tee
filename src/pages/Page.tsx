import { getRouteApi } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { BlockData } from "@/components/builder/types";
import { BlockRenderer } from "@/components/builder/BlockRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getThemeStyle, PageTheme } from "@/lib/theme";

const routeApi = getRouteApi('/$')

// Template pages that should not be publicly accessible
const TEMPLATE_SLUGS = ['collection-template'];

export default function Page() {
    const { _splat: slug } = routeApi.useParams();

    const { data: page, isLoading, error } = useQuery({
        queryKey: ["page", slug],
        queryFn: async () => {
            // Block access to template pages
            if (TEMPLATE_SLUGS.includes(slug!)) {
                throw new Error("Template page not accessible");
            }

            const { data, error } = await supabase
                .from("pages")
                .select("*")
                .eq("slug", slug!)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!slug
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-muted-foreground">Page not found</p>
            </div>
        );
    }

    const blocks = (page.content as unknown as BlockData[]) || [];
    // @ts-ignore
    const themeStyle = page.theme ? getThemeStyle(page.theme as unknown as PageTheme) : undefined;

    return (
        <div className="min-h-screen flex flex-col" style={themeStyle}>
            <Navbar />
            <main className={`flex-1 ${page.is_home ? '' : 'pt-20'}`}>
                {page.is_home ? null : (
                    // Optional: Hide title if it's home, or custom header
                    <div className="container py-8">
                        <h1 className="text-3xl font-bold mb-8 hidden">{page.title}</h1>
                    </div>
                )}

                <div className={`${page.is_home ? '' : 'container'} space-y-8 pb-20`}>
                    {blocks.map((block) => (
                        <BlockRenderer key={block.id} block={block} />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
