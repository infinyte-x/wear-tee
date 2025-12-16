import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Settings2, Globe } from "lucide-react";

interface SEOData {
    meta_title?: string;
    description?: string;
    meta_image?: string;
}

interface SEOPanelProps {
    data: SEOData;
    onChange: (data: SEOData) => void;
    pageTitle: string;
    pageSlug: string;
}

export function SEOPanel({ data, onChange, pageTitle, pageSlug }: SEOPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    const updateField = (field: keyof SEOData, value: string) => {
        onChange({ ...data, [field]: value });
    };

    const displayTitle = data.meta_title || pageTitle || "Page Title";
    const displayDescription = data.description || "Add a meta description for better SEO...";
    const displayUrl = `yoursite.com/${pageSlug}`;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings2 className="h-4 w-4 mr-2" />
                    SEO
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>SEO Settings</SheetTitle>
                    <SheetDescription>
                        Optimize this page for search engines and social sharing.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Meta Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="meta_title">Meta Title</Label>
                            <Input
                                id="meta_title"
                                value={data.meta_title || ""}
                                onChange={(e) => updateField("meta_title", e.target.value)}
                                placeholder={pageTitle}
                                maxLength={60}
                            />
                            <p className="text-xs text-muted-foreground">
                                {(data.meta_title || "").length}/60 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Meta Description</Label>
                            <Textarea
                                id="description"
                                value={data.description || ""}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Enter a compelling description for search results..."
                                rows={3}
                                maxLength={160}
                            />
                            <p className="text-xs text-muted-foreground">
                                {(data.description || "").length}/160 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meta_image">Social Share Image</Label>
                            <Input
                                id="meta_image"
                                value={data.meta_image || ""}
                                onChange={(e) => updateField("meta_image", e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                            <p className="text-xs text-muted-foreground">
                                Recommended: 1200x630px for optimal display
                            </p>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Search Preview</Label>
                        <div className="border rounded-lg p-4 bg-white">
                            <div className="space-y-1">
                                <p className="text-sm text-blue-600 hover:underline cursor-pointer truncate">
                                    {displayTitle}
                                </p>
                                <p className="text-xs text-green-700 truncate">
                                    {displayUrl}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {displayDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Open Graph Preview */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Social Share Preview</Label>
                        <div className="border rounded-lg overflow-hidden bg-white">
                            {data.meta_image ? (
                                <div className="aspect-[1200/630] bg-muted relative">
                                    <img
                                        src={data.meta_image}
                                        alt="OG Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="aspect-[1200/630] bg-muted flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">No image set</p>
                                    </div>
                                </div>
                            )}
                            <div className="p-3 border-t">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                    {displayUrl}
                                </p>
                                <p className="text-sm font-medium truncate">{displayTitle}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {displayDescription}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
