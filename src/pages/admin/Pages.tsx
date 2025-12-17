
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText, LayoutGrid, Settings } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type PageItem = {
    id: string;
    title: string;
    slug: string;
    status: string;
    updated_at: string | null;
    is_home?: boolean;
    type: 'page' | 'collection';
}

// System page slugs - these are core pages that come with the system
const SYSTEM_PAGE_SLUGS = ['cart', 'checkout', 'collection-template', 'order-confirmation', 'wishlist'];

const isSystemPage = (slug: string) => {
    const normalizedSlug = slug.toLowerCase().replace(/^\//, '');
    return SYSTEM_PAGE_SLUGS.some(systemSlug =>
        normalizedSlug === systemSlug ||
        normalizedSlug.includes(systemSlug)
    );
};

export default function AdminPages() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: pages, isLoading } = useQuery({
        queryKey: ["admin_pages_combined"],
        queryFn: async () => {
            const pagesPromise = supabase
                .from("pages")
                .select("*")
                .order("is_home", { ascending: false })
                .order("created_at", { ascending: false });

            const categoriesPromise = supabase
                .from("categories")
                .select("*")
                .order("created_at", { ascending: false });

            const [pagesRes, catsRes] = await Promise.all([pagesPromise, categoriesPromise]);

            if (pagesRes.error) throw pagesRes.error;
            if (catsRes.error) throw catsRes.error;

            const pagesData = (pagesRes.data || []).map(p => ({
                id: p.id,
                title: p.title,
                slug: p.slug,
                status: p.status,
                updated_at: p.updated_at,
                is_home: p.is_home,
                type: 'page' as const
            }));

            const categoriesData = (catsRes.data || []).map(c => ({
                id: c.id,
                title: c.name,
                slug: `collections/${c.slug}`,
                status: c.is_active ? 'published' : 'draft',
                updated_at: c.updated_at || c.created_at || null,
                is_home: false,
                type: 'collection' as const
            }));

            // Sort: Home page first, then by updated_at desc
            return [...pagesData, ...categoriesData].sort((a, b) => {
                if (a.is_home) return -1;
                if (b.is_home) return 1;
                const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
                const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
                return dateB - dateA;
            });
        },
    });

    // Separate pages into system pages and custom pages
    const systemPages = pages?.filter(p => p.type === 'page' && isSystemPage(p.slug)) || [];
    const customPages = pages?.filter(p => p.type === 'page' && !isSystemPage(p.slug)) || [];
    const collectionPages = pages?.filter(p => p.type === 'collection') || [];

    const deletePageMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("pages").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_pages_combined"] });
            toast.success("Page deleted successfully");
        },
        onError: () => toast.error("Failed to delete page"),
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("categories").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_pages_combined"] });
            toast.success("Collection deleted successfully");
        },
        onError: () => toast.error("Failed to delete collection"),
    });

    const handleDelete = async (item: PageItem) => {
        if (!confirm(`Are you sure you want to delete this ${item.type}? This cannot be undone.`)) return;

        if (item.type === 'page') {
            deletePageMutation.mutate(item.id);
        } else {
            deleteCategoryMutation.mutate(item.id);
        }
    };

    const createPageMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.from("pages").insert({
                title: "Untitled Page",
                slug: `untitled-${Date.now()}`,
                status: "draft",
                content: []
            }).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: (newPage) => {
            toast.success("Draft created");
            navigate({ to: '/admin/pages/$pageId', params: { pageId: newPage.id } });
        },
        onError: () => toast.error("Failed to create new page")
    });

    const renderPageRow = (page: PageItem, isSystem: boolean = false) => (
        <TableRow key={`${page.type}-${page.id}`}>
            <TableCell className="font-medium">
                <div className="flex items-center">
                    {page.type === 'page' ? (
                        isSystem ? (
                            <Settings className="mr-2 h-4 w-4 text-orange-500" />
                        ) : (
                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        )
                    ) : (
                        <LayoutGrid className="mr-2 h-4 w-4 text-blue-500" />
                    )}
                    {page.title}
                    {page.is_home && (
                        <Badge variant="secondary" className="ml-2">Home</Badge>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm">/{page.slug}</code>
            </TableCell>
            <TableCell>
                <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                    {page.status}
                </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
                {page.updated_at ? format(new Date(page.updated_at), "MMM d, yyyy") : "-"}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        {page.type === 'page' ? (
                            <Link to="/admin/pages/$pageId" params={{ pageId: page.id }}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link to="/admin/collections/$collectionId" params={{ collectionId: page.id }}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        )}
                    </Button>
                    {!isSystem && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(page)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
                    <p className="text-muted-foreground">Manage your custom pages and collections.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/admin/collections/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Collection
                        </Link>
                    </Button>
                    <Button onClick={() => createPageMutation.mutate()} disabled={createPageMutation.isPending}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Page
                    </Button>
                </div>
            </div>

            {/* Custom Pages Section */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Custom Pages
                </h2>
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>URL Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Loading pages...
                                    </TableCell>
                                </TableRow>
                            ) : customPages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                                        No custom pages. Create your first page!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customPages.map((page) => renderPageRow(page, false))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Collection Templates Section */}
            {collectionPages.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-blue-500" />
                        Collection Templates
                    </h2>
                    <div className="rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>URL Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {collectionPages.map((page) => renderPageRow(page, false))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* System Pages Section */}
            {systemPages.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-orange-500" />
                        System Pages
                    </h2>
                    <p className="text-sm text-muted-foreground mb-3">
                        These are core pages that power your store. Edit with caution.
                    </p>
                    <div className="rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>URL Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {systemPages.map((page) => renderPageRow(page, true))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
