
import { useState, useEffect, useCallback } from "react";
import { getRouteApi } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Save, Eye, Trash2, Undo2, Redo2 } from "lucide-react";
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
import { useBuilderHistory } from "@/hooks/useBuilderHistory";
import { PreviewModeToggle, PreviewMode, previewWidths } from "@/components/builder/PreviewModeToggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SEOPanel } from "@/components/builder/SEOPanel";
import { usePageVersions } from "@/hooks/usePageVersions";
import { CompactImageUpload } from "@/components/admin/CompactImageUpload";
import { VersionHistoryPanel } from "@/components/builder/VersionHistoryPanel";

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

    // Use history hook for undo/redo
    const { blocks, setBlocks, undo, redo, canUndo, canRedo, resetHistory } = useBuilderHistory([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeSidebarItem, setActiveSidebarItem] = useState<BlockType | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
    const [seoData, setSeoData] = useState<{
        meta_title?: string;
        description?: string;
        meta_image?: string;
    }>({});

    // Version history
    const {
        versions,
        isLoading: versionsLoading,
        createVersion,
        isCreatingVersion,
        restoreVersion,
        isRestoringVersion
    } = usePageVersions(id);

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
                resetHistory(content);
            }
        }
        // Also load SEO data from page
        if (page) {
            setSeoData({
                meta_title: page.meta_title || '',
                description: page.meta_description || '',
                meta_image: page.meta_image || '',
            });
        }
    }, [page, resetHistory]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Undo: Ctrl+Z
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            // Redo: Ctrl+Y or Ctrl+Shift+Z
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                redo();
            }
            // Delete selected block
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId) {
                // Don't delete if focused on an input
                if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
                    return;
                }
                e.preventDefault();
                handleDeleteBlock(selectedBlockId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, selectedBlockId]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from("pages")
                .update({
                    content: blocks as any,
                    meta_title: seoData.meta_title || null,
                    meta_description: seoData.description || null,
                    meta_image: seoData.meta_image || null,
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
        <TooltipProvider>
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
                        {/* Undo/Redo */}
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={undo}
                                disabled={!canUndo}
                                className="h-8 px-2 rounded-r-none"
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-4 bg-border" />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={redo}
                                disabled={!canRedo}
                                className="h-8 px-2 rounded-l-none"
                                title="Redo (Ctrl+Y)"
                            >
                                <Redo2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="w-px h-6 bg-border mx-1" />

                        {/* Preview Mode Toggle */}
                        <PreviewModeToggle value={previewMode} onChange={setPreviewMode} />

                        <div className="w-px h-6 bg-border mx-1" />

                        {/* SEO Panel */}
                        <SEOPanel
                            data={seoData}
                            onChange={setSeoData}
                            pageTitle={page.title}
                            pageSlug={page.slug}
                        />

                        {/* Version History */}
                        <VersionHistoryPanel
                            versions={versions}
                            isLoading={versionsLoading}
                            onRestore={restoreVersion}
                            isRestoring={isRestoringVersion}
                            onSaveVersion={() => createVersion({
                                content: blocks,
                                meta_title: seoData.meta_title,
                                description: seoData.description,
                                meta_image: seoData.meta_image,
                            })}
                            isSaving={isCreatingVersion}
                        />

                        <div className="w-px h-6 bg-border mx-1" />

                        <Button variant="outline" size="sm" asChild>
                            <a href={page.is_home ? '/' : `/${page.slug}`} target="_blank" rel="noopener noreferrer">
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
                            previewWidth={previewWidths[previewMode]}
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
                                                    {/* Slide Management */}
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">Slides ({(selectedBlock.content.slides || [{ title: '', subtitle: '' }]).length}/5)</label>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={(selectedBlock.content.slides || []).length >= 5}
                                                            onClick={() => {
                                                                const slides = selectedBlock.content.slides || [{ title: '', subtitle: '' }];
                                                                if (slides.length < 5) {
                                                                    updateContent('slides', [...slides, { title: '', subtitle: '' }]);
                                                                }
                                                            }}
                                                        >
                                                            + Add Slide
                                                        </Button>
                                                    </div>

                                                    {/* Slides List */}
                                                    <div className="space-y-4">
                                                        {(selectedBlock.content.slides || [{ title: 'Hero Title', subtitle: 'Subtitle' }]).map((slide: any, index: number) => (
                                                            <div key={index} className="p-3 border rounded bg-background relative">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className="text-xs font-semibold text-muted-foreground">Slide {index + 1}</span>
                                                                    {(selectedBlock.content.slides || []).length > 1 && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                            onClick={() => {
                                                                                const newSlides = [...(selectedBlock.content.slides || [])];
                                                                                newSlides.splice(index, 1);
                                                                                updateContent('slides', newSlides);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-3">
                                                                    {/* Background Image */}
                                                                    <div className="space-y-1">
                                                                        <label className="text-xs text-muted-foreground">Background Image (1440×800px, max 4MB)</label>
                                                                        <CompactImageUpload
                                                                            value={slide.image || ''}
                                                                            onChange={(url) => {
                                                                                const newSlides = [...(selectedBlock.content.slides || [{ title: '', subtitle: '' }])];
                                                                                newSlides[index] = { ...slide, image: url };
                                                                                updateContent('slides', newSlides);
                                                                            }}
                                                                            maxWidth={1440}
                                                                            maxHeight={800}
                                                                            maxSizeMB={4}
                                                                            aspectRatio="16/9"
                                                                        />
                                                                    </div>

                                                                    {/* Title */}
                                                                    <div className="space-y-1">
                                                                        <label className="text-xs text-muted-foreground">Title</label>
                                                                        <input
                                                                            className="w-full p-1.5 border rounded text-xs font-medium"
                                                                            value={slide.title || ''}
                                                                            onChange={(e) => {
                                                                                const newSlides = [...(selectedBlock.content.slides || [{ title: '', subtitle: '' }])];
                                                                                newSlides[index] = { ...slide, title: e.target.value };
                                                                                updateContent('slides', newSlides);
                                                                            }}
                                                                            placeholder="Hero Title"
                                                                        />
                                                                    </div>

                                                                    {/* Subtitle */}
                                                                    <div className="space-y-1">
                                                                        <label className="text-xs text-muted-foreground">Subtitle</label>
                                                                        <input
                                                                            className="w-full p-1.5 border rounded text-xs"
                                                                            value={slide.subtitle || ''}
                                                                            onChange={(e) => {
                                                                                const newSlides = [...(selectedBlock.content.slides || [{ title: '', subtitle: '' }])];
                                                                                newSlides[index] = { ...slide, subtitle: e.target.value };
                                                                                updateContent('slides', newSlides);
                                                                            }}
                                                                            placeholder="Subtitle text"
                                                                        />
                                                                    </div>

                                                                    {/* Button 1 */}
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs text-muted-foreground">Button 1 Text</label>
                                                                            <input
                                                                                className="w-full p-1.5 border rounded text-xs"
                                                                                value={slide.button1Text || ''}
                                                                                onChange={(e) => {
                                                                                    const newSlides = [...(selectedBlock.content.slides || [{ title: '', subtitle: '' }])];
                                                                                    newSlides[index] = { ...slide, button1Text: e.target.value };
                                                                                    updateContent('slides', newSlides);
                                                                                }}
                                                                                placeholder="Shop Now"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs text-muted-foreground">Button 1 Link</label>
                                                                            <input
                                                                                className="w-full p-1.5 border rounded text-xs"
                                                                                value={slide.button1Link || ''}
                                                                                onChange={(e) => {
                                                                                    const newSlides = [...(selectedBlock.content.slides || [{ title: '', subtitle: '' }])];
                                                                                    newSlides[index] = { ...slide, button1Link: e.target.value };
                                                                                    updateContent('slides', newSlides);
                                                                                }}
                                                                                placeholder="/products"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Button 2 */}
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs text-muted-foreground">Button 2 Text</label>
                                                                            <input
                                                                                className="w-full p-1.5 border rounded text-xs"
                                                                                value={slide.button2Text || ''}
                                                                                onChange={(e) => {
                                                                                    const newSlides = [...(selectedBlock.content.slides || [{ title: '', subtitle: '' }])];
                                                                                    newSlides[index] = { ...slide, button2Text: e.target.value };
                                                                                    updateContent('slides', newSlides);
                                                                                }}
                                                                                placeholder="Learn More"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs text-muted-foreground">Button 2 Link</label>
                                                                            <input
                                                                                className="w-full p-1.5 border rounded text-xs"
                                                                                value={slide.button2Link || ''}
                                                                                onChange={(e) => {
                                                                                    const newSlides = [...(selectedBlock.content.slides || [{ title: '', subtitle: '' }])];
                                                                                    newSlides[index] = { ...slide, button2Link: e.target.value };
                                                                                    updateContent('slides', newSlides);
                                                                                }}
                                                                                placeholder="/about"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Slider Settings */}
                                                    <div className="pt-4 border-t space-y-3">
                                                        <p className="text-xs font-semibold text-muted-foreground">Slider Settings</p>

                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id="heroAutoPlay"
                                                                checked={selectedBlock.content.autoPlay || false}
                                                                onChange={(e) => updateContent('autoPlay', e.target.checked)}
                                                            />
                                                            <label htmlFor="heroAutoPlay" className="text-sm">Auto-play slides</label>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id="heroShowDots"
                                                                checked={selectedBlock.content.showDots !== false}
                                                                onChange={(e) => updateContent('showDots', e.target.checked)}
                                                            />
                                                            <label htmlFor="heroShowDots" className="text-sm">Show dots navigation</label>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id="heroShowArrows"
                                                                checked={selectedBlock.content.showArrows !== false}
                                                                onChange={(e) => updateContent('showArrows', e.target.checked)}
                                                            />
                                                            <label htmlFor="heroShowArrows" className="text-sm">Show arrow navigation</label>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs text-muted-foreground">Overlay Opacity</label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="100"
                                                                value={(selectedBlock.content.overlayOpacity ?? 0.5) * 100}
                                                                onChange={(e) => updateContent('overlayOpacity', parseInt(e.target.value) / 100)}
                                                                className="w-full"
                                                            />
                                                        </div>
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

                                            {selectedBlock.type === 'faq' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Title</label>
                                                        <input
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.title || ''}
                                                            onChange={(e) => updateContent('title', e.target.value)}
                                                            placeholder="Frequently Asked Questions"
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
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">FAQ Items</label>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const items = selectedBlock.content.items || [];
                                                                updateContent('items', [...items, { question: 'New Question?', answer: 'Answer here...' }]);
                                                            }}
                                                        >
                                                            + Add
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {(selectedBlock.content.items || []).map((item: any, index: number) => (
                                                            <div key={index} className="p-3 border rounded bg-background relative">
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
                                                                        value={item.question}
                                                                        onChange={(e) => {
                                                                            const newItems = [...(selectedBlock.content.items || [])];
                                                                            newItems[index] = { ...item, question: e.target.value };
                                                                            updateContent('items', newItems);
                                                                        }}
                                                                        placeholder="Question"
                                                                    />
                                                                    <textarea
                                                                        className="w-full p-1 border rounded text-xs min-h-[60px]"
                                                                        value={item.answer}
                                                                        onChange={(e) => {
                                                                            const newItems = [...(selectedBlock.content.items || [])];
                                                                            newItems[index] = { ...item, answer: e.target.value };
                                                                            updateContent('items', newItems);
                                                                        }}
                                                                        placeholder="Answer"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedBlock.type === 'testimonials' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Title</label>
                                                        <input
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.title || ''}
                                                            onChange={(e) => updateContent('title', e.target.value)}
                                                            placeholder="What Our Customers Say"
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">Testimonials</label>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const items = selectedBlock.content.items || [];
                                                                updateContent('items', [...items, { name: 'Customer Name', role: 'Role', quote: 'Their testimonial...' }]);
                                                            }}
                                                        >
                                                            + Add
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {(selectedBlock.content.items || []).map((item: any, index: number) => (
                                                            <div key={index} className="p-3 border rounded bg-background relative">
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
                                                                        value={item.name}
                                                                        onChange={(e) => {
                                                                            const newItems = [...(selectedBlock.content.items || [])];
                                                                            newItems[index] = { ...item, name: e.target.value };
                                                                            updateContent('items', newItems);
                                                                        }}
                                                                        placeholder="Name"
                                                                    />
                                                                    <input
                                                                        className="w-full p-1 border rounded text-xs"
                                                                        value={item.role || ''}
                                                                        onChange={(e) => {
                                                                            const newItems = [...(selectedBlock.content.items || [])];
                                                                            newItems[index] = { ...item, role: e.target.value };
                                                                            updateContent('items', newItems);
                                                                        }}
                                                                        placeholder="Role (optional)"
                                                                    />
                                                                    <textarea
                                                                        className="w-full p-1 border rounded text-xs min-h-[60px]"
                                                                        value={item.quote}
                                                                        onChange={(e) => {
                                                                            const newItems = [...(selectedBlock.content.items || [])];
                                                                            newItems[index] = { ...item, quote: e.target.value };
                                                                            updateContent('items', newItems);
                                                                        }}
                                                                        placeholder="Quote"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedBlock.type === 'video' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Title (optional)</label>
                                                        <input
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.title || ''}
                                                            onChange={(e) => updateContent('title', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Video URL</label>
                                                        <input
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.url || ''}
                                                            onChange={(e) => updateContent('url', e.target.value)}
                                                            placeholder="YouTube or Vimeo URL"
                                                        />
                                                        <p className="text-xs text-muted-foreground">Supports YouTube and Vimeo links</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="autoplay"
                                                            checked={selectedBlock.content.autoplay || false}
                                                            onChange={(e) => updateContent('autoplay', e.target.checked)}
                                                        />
                                                        <label htmlFor="autoplay" className="text-sm">Autoplay</label>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedBlock.type === 'cta' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Title</label>
                                                        <input
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.title || ''}
                                                            onChange={(e) => updateContent('title', e.target.value)}
                                                            placeholder="Ready to get started?"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Description</label>
                                                        <textarea
                                                            className="w-full p-2 border rounded text-sm min-h-[80px]"
                                                            value={selectedBlock.content.description || ''}
                                                            onChange={(e) => updateContent('description', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Button Text</label>
                                                        <input
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.buttonText || ''}
                                                            onChange={(e) => updateContent('buttonText', e.target.value)}
                                                            placeholder="Get Started"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Button Link</label>
                                                        <input
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.buttonLink || ''}
                                                            onChange={(e) => updateContent('buttonLink', e.target.value)}
                                                            placeholder="/products"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Style Variant</label>
                                                        <select
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.variant || 'default'}
                                                            onChange={(e) => updateContent('variant', e.target.value)}
                                                        >
                                                            <option value="default">Light</option>
                                                            <option value="dark">Dark</option>
                                                            <option value="gradient">Gradient</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedBlock.type === 'columns' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Number of Columns</label>
                                                        <select
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.columns || 2}
                                                            onChange={(e) => updateContent('columns', parseInt(e.target.value))}
                                                        >
                                                            <option value={2}>2 Columns</option>
                                                            <option value={3}>3 Columns</option>
                                                            <option value={4}>4 Columns</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Gap Size</label>
                                                        <select
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.gap || 'medium'}
                                                            onChange={(e) => updateContent('gap', e.target.value)}
                                                        >
                                                            <option value="small">Small</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="large">Large</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-sm font-medium">Column Content</label>
                                                        {Array.from({ length: selectedBlock.content.columns || 2 }).map((_, index) => (
                                                            <div key={index} className="p-3 border rounded bg-background">
                                                                <p className="text-xs font-medium text-muted-foreground mb-2">Column {index + 1}</p>
                                                                <div className="space-y-2">
                                                                    <input
                                                                        className="w-full p-1 border rounded text-xs font-medium"
                                                                        value={(selectedBlock.content.items || [])[index]?.title || ''}
                                                                        onChange={(e) => {
                                                                            const items = [...(selectedBlock.content.items || [])];
                                                                            items[index] = { ...items[index], title: e.target.value };
                                                                            updateContent('items', items);
                                                                        }}
                                                                        placeholder="Title"
                                                                    />
                                                                    <textarea
                                                                        className="w-full p-1 border rounded text-xs min-h-[60px]"
                                                                        value={(selectedBlock.content.items || [])[index]?.content || ''}
                                                                        onChange={(e) => {
                                                                            const items = [...(selectedBlock.content.items || [])];
                                                                            items[index] = { ...items[index], content: e.target.value };
                                                                            updateContent('items', items);
                                                                        }}
                                                                        placeholder="Content (HTML supported)"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedBlock.type === 'gallery' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Title (optional)</label>
                                                        <input
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.title || ''}
                                                            onChange={(e) => updateContent('title', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Columns</label>
                                                        <select
                                                            className="w-full p-2 border rounded text-sm"
                                                            value={selectedBlock.content.columns || 3}
                                                            onChange={(e) => updateContent('columns', parseInt(e.target.value))}
                                                        >
                                                            <option value={2}>2 Columns</option>
                                                            <option value={3}>3 Columns</option>
                                                            <option value={4}>4 Columns</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-medium">Images</label>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const images = selectedBlock.content.images || [];
                                                                updateContent('images', [...images, { url: '', alt: '' }]);
                                                            }}
                                                        >
                                                            + Add
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {(selectedBlock.content.images || []).map((img: any, index: number) => (
                                                            <div key={index} className="p-3 border rounded bg-background relative">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                    onClick={() => {
                                                                        const newImages = [...(selectedBlock.content.images || [])];
                                                                        newImages.splice(index, 1);
                                                                        updateContent('images', newImages);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                                <div className="space-y-2">
                                                                    <input
                                                                        className="w-full p-1 border rounded text-xs"
                                                                        value={img.url}
                                                                        onChange={(e) => {
                                                                            const newImages = [...(selectedBlock.content.images || [])];
                                                                            newImages[index] = { ...img, url: e.target.value };
                                                                            updateContent('images', newImages);
                                                                        }}
                                                                        placeholder="Image URL"
                                                                    />
                                                                    <input
                                                                        className="w-full p-1 border rounded text-xs"
                                                                        value={img.alt || ''}
                                                                        onChange={(e) => {
                                                                            const newImages = [...(selectedBlock.content.images || [])];
                                                                            newImages[index] = { ...img, alt: e.target.value };
                                                                            updateContent('images', newImages);
                                                                        }}
                                                                        placeholder="Alt text"
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
        </TooltipProvider>
    );
}
