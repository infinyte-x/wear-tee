
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
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminPages() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: pages, isLoading } = useQuery({
        queryKey: ["admin_pages"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("pages")
                .select("*")
                .order("is_home", { ascending: false }) // Home first
                .order("created_at", { ascending: false }); // Then newest

            if (error) throw error;
            return data;
        },
    });

    const deletePageMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("pages").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_pages"] });
            toast.success("Page deleted successfully");
        },
        onError: () => toast.error("Failed to delete page"),
    });

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this page? This cannot be undone.")) {
            deletePageMutation.mutate(id);
        }
    };

    const createPageMutation = useMutation({
        mutationFn: async () => {
            // Create a new draft immediately and redirect to it
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

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
                    <p className="text-muted-foreground">Manage your custom website pages.</p>
                </div>
                <Button onClick={() => createPageMutation.mutate()} disabled={createPageMutation.isPending}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Page
                </Button>
            </div>

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
                        ) : pages?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No pages found. Create your first page!
                                </TableCell>
                            </TableRow>
                        ) : (
                            pages?.map((page) => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
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
                                        {format(new Date(page.updated_at), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/admin/pages/$pageId" params={{ pageId: page.id }}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(page.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
}
