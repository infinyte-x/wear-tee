
import { useState, useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Save, Eye, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { BlockData, BlockType } from "@/components/builder/types";
import { BlockSidebar } from "@/components/builder/BlockSidebar";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { DraggableBlockItem } from "@/components/builder/DraggableBlockItem";
import { Type, Image, LayoutGrid, Layers, ShoppingBag } from "lucide-react";

// Helper to get icon for overlay
const getIconForType = (type: BlockType) => {
    switch (type) {
        case 'hero': return Layers;
        case 'text': return Type;
        case 'image': return Image;
        case 'product-grid': return ShoppingBag;
        default: return LayoutGrid;
    }
};

const routeApi = getRouteApi('/admin/pages/$pageId')

export default function PageBuilder() {
    const { pageId: id } = routeApi.useParams();
    const queryClient = useQueryClient();

    // Local state for builder
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeSidebarItem, setActiveSidebarItem] = useState<BlockType | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        })
    );

    const { data: page, isLoading, error } = useQuery({
        queryKey: ["page", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("pages")
                .select("*")
                .eq("id", id!)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id
    });

    // Sync state when page loads
    useEffect(() => {
        if (page?.content) {
            // Type assertion since content is Json
            const content = page.content as unknown as BlockData[];
            if (Array.isArray(content)) {
                setBlocks(content);
            }
        }
    }, [page]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from("pages")
                .update({
                    content: blocks as any, // Cast to any to satisfy Json type
                    updated_at: new Date().toISOString()
                })
                .eq("id", id!);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Page saved successfully");
            queryClient.invalidateQueries({ queryKey: ["page", id] });
        },
        onError: () => toast.error("Failed to save page")
    });

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeData = active.data.current;

        if (activeData?.isSidebar) {
            setActiveSidebarItem(activeData.type);
            setActiveId(null);
        } else {
            setActiveId(active.id as string);
            setActiveSidebarItem(null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // Cleanup overlay state
        setActiveId(null);
        setActiveSidebarItem(null);

        if (!over) return;

        // Dropping a sidebar item into the canvas
        if (active.data.current?.isSidebar) {
            const type = active.data.current.type as BlockType;
            const newBlock: BlockData = {
                id: crypto.randomUUID(),
                type,
                content: {} // Initial content based on type
            };

            setBlocks((current) => [...current, newBlock]);
            setSelectedBlockId(newBlock.id);
            return;
        }

        // Reordering existing blocks
        if (active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleDeleteBlock = (blockId: string) => {
        setBlocks(prev => prev.filter(b => b.id !== blockId));
        if (selectedBlockId === blockId) setSelectedBlockId(null);
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="h-[60vh] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AdminLayout>
        );
    }

    if (error || !page) {
        return (
            <AdminLayout>
                <div className="h-[60vh] flex flex-col items-center justify-center text-destructive">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <h2 className="text-xl font-semibold">Page not found</h2>
                </div>
            </AdminLayout>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Top Bar */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-white dark:bg-zinc-950 shrink-0 z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                        &larr; Back
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <h1 className="font-semibold text-lg">{page.title}</h1>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider bg-muted px-2 py-0.5 rounded">
                        {page.status}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </a>
                    </Button>
                    <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Builder Wrapper */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex overflow-hidden h-[calc(100vh-64px)]">

                    {/* Left Sidebar */}
                    <BlockSidebar />

                    {/* Center Canvas */}
                    <BuilderCanvas
                        blocks={blocks}
                        selectedBlockId={selectedBlockId}
                        onSelectBlock={setSelectedBlockId}
                        onDeleteBlock={handleDeleteBlock}
                    />

                    {/* Right Sidebar: Settings */}
                    <div className="w-80 border-l bg-white overflow-y-auto p-4 shrink-0">
                        <h3 className="font-medium mb-4 text-sm text-muted-foreground">Properties</h3>
                        {selectedBlockId ? (
                            (() => {
                                const selectedBlock = blocks.find(b => b.id === selectedBlockId);
                                if (!selectedBlock) return null;

                                const updateContent = (key: string, value: any) => {
                                    setBlocks(prev => prev.map(b =>
                                        b.id === selectedBlockId
                                            ? { ...b, content: { ...b.content, [key]: value } }
                                            : b
                                    ));
                                };

                                return (
                                    <div className="space-y-4">
                                        <div className="p-4 border rounded bg-muted/20 mb-4">
                                            <p className="text-xs font-mono text-muted-foreground mb-1">ID: {selectedBlockId.slice(0, 8)}</p>
                                            <p className="text-sm font-semibold capitalize">{selectedBlock.type} Block</p>
                                        </div>

                                        {selectedBlock.type === 'text' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Content (HTML allowed)</label>
                                                <textarea
                                                    className="w-full min-h-[200px] p-2 border rounded text-sm font-mono"
                                                    value={selectedBlock.content.text || ''}
                                                    onChange={(e) => updateContent('text', e.target.value)}
                                                    placeholder="Enter text..."
                                                />
                                            </div>
                                        )}

                                        {selectedBlock.type === 'hero' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Title</label>
                                                    <input
                                                        className="w-full p-2 border rounded text-sm"
                                                        value={selectedBlock.content.title || ''}
                                                        onChange={(e) => updateContent('title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Subtitle</label>
                                                    <input
                                                        className="w-full p-2 border rounded text-sm"
                                                        value={selectedBlock.content.subtitle || ''}
                                                        onChange={(e) => updateContent('subtitle', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {selectedBlock.type === 'image' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Image URL</label>
                                                    <input
                                                        className="w-full p-2 border rounded text-sm"
                                                        value={selectedBlock.content.url || ''}
                                                        onChange={(e) => updateContent('url', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Alt Text</label>
                                                    <input
                                                        className="w-full p-2 border rounded text-sm"
                                                        value={selectedBlock.content.alt || ''}
                                                        onChange={(e) => updateContent('alt', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {selectedBlock.type === 'product-grid' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Title</label>
                                                    <input
                                                        className="w-full p-2 border rounded text-sm"
                                                        value={selectedBlock.content.title || ''}
                                                        onChange={(e) => updateContent('title', e.target.value)}
                                                        placeholder="Featured Pieces"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Subtitle</label>
                                                    <input
                                                        className="w-full p-2 border rounded text-sm"
                                                        value={selectedBlock.content.subtitle || ''}
                                                        onChange={(e) => updateContent('subtitle', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="featuredOnly"
                                                        checked={selectedBlock.content.featuredOnly !== false}
                                                        onChange={(e) => updateContent('featuredOnly', e.target.checked)}
                                                    />
                                                    <label htmlFor="featuredOnly" className="text-sm">Show Featured Only</label>
                                                </div>
                                            </div>
                                        )}

                                        {selectedBlock.type === 'newsletter' && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Title</label>
                                                    <input
                                                        className="w-full p-2 border rounded text-sm"
                                                        value={selectedBlock.content.title || ''}
                                                        onChange={(e) => updateContent('title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Description</label>
                                                    <input
                                                        className="w-full p-2 border rounded text-sm"
                                                        value={selectedBlock.content.description || ''}
                                                        onChange={(e) => updateContent('description', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {selectedBlock.type === 'features' && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium">Features</label>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const items = selectedBlock.content.items || [];
                                                            updateContent('items', [...items, { title: 'New Feature', description: 'Description', icon: 'Star' }]);
                                                        }}
                                                    >
                                                        + Add
                                                    </Button>
                                                </div>
                                                <div className="space-y-4">
                                                    {(selectedBlock.content.items || []).map((item: any, index: number) => (
                                                        <div key={index} className="p-3 border rounded bg-background relative group">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                onClick={() => {
                                                                    const newItems = [...(selectedBlock.content.items || [])];
                                                                    newItems.splice(index, 1);
                                                                    updateContent('items', newItems);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                            <div className="space-y-2">
                                                                <input
                                                                    className="w-full p-1 border rounded text-xs font-medium"
                                                                    value={item.title}
                                                                    onChange={(e) => {
                                                                        const newItems = [...(selectedBlock.content.items || [])];
                                                                        newItems[index] = { ...item, title: e.target.value };
                                                                        updateContent('items', newItems);
                                                                    }}
                                                                    placeholder="Title"
                                                                />
                                                                <input
                                                                    className="w-full p-1 border rounded text-xs"
                                                                    value={item.description}
                                                                    onChange={(e) => {
                                                                        const newItems = [...(selectedBlock.content.items || [])];
                                                                        newItems[index] = { ...item, description: e.target.value };
                                                                        updateContent('items', newItems);
                                                                    }}
                                                                    placeholder="Description"
                                                                />
                                                                <input
                                                                    className="w-full p-1 border rounded text-xs font-mono text-muted-foreground"
                                                                    value={item.icon}
                                                                    onChange={(e) => {
                                                                        const newItems = [...(selectedBlock.content.items || [])];
                                                                        newItems[index] = { ...item, icon: e.target.value };
                                                                        updateContent('items', newItems);
                                                                    }}
                                                                    placeholder="Icon (e.g. Star)"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()
                        ) : (
                            <p className="text-sm text-muted-foreground">Select a block to edit its properties.</p>
                        )}
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeSidebarItem ? (
                        <div className="p-2 bg-white border rounded shadow opacity-80 w-[200px]">
                            {/* Simplified overlay for sidebar item */}
                            Dragging {activeSidebarItem}
                        </div>
                    ) : null}
                    {activeId ? (
                        <div className="p-4 bg-white border rounded shadow-lg opacity-80 w-[600px]">
                            Dragging Block
                        </div>
                    ) : null}
                </DragOverlay>

            </DndContext>
        </div>
    );
}
