/**
 * FaviconUploader - Component for uploading shop favicon
 *
 * Features:
 * - Square preview
 * - Upload to Supabase Storage
 * - Validation (.ico or .png, 32x32 recommended)
 * - Delete old favicon when replacing
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { resizeFavicon } from '@/lib/image-resize';

interface FaviconUploaderProps {
    currentUrl?: string | null;
    onUploadComplete: (url: string) => void;
}

const MAX_FILE_SIZE = 100 * 1024; // 100KB

export function FaviconUploader({ currentUrl, onUploadComplete }: FaviconUploaderProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: 'File too large',
                description: 'Favicon must be under 100KB',
                variant: 'destructive',
            });
            return;
        }

        // Validate file type
        const validTypes = ['image/x-icon', 'image/png', 'image/vnd.microsoft.icon'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.ico')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload a .ico or .png file',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);

        try {
            // Resize image to 32x32 before upload
            const resizedBlob = await resizeFavicon(file);

            // Check resized size
            if (resizedBlob.size > MAX_FILE_SIZE) {
                toast({
                    title: 'Image too complex',
                    description: 'Please try a simpler image',
                    variant: 'destructive',
                });
                return;
            }

            // Delete old favicon if exists
            if (currentUrl) {
                const oldPath = currentUrl.split('/').pop();
                if (oldPath) {
                    await supabase.storage.from('logos').remove([oldPath]);
                }
            }

            // Upload resized favicon
            const fileExt = file.name.endsWith('.ico') ? 'png' : 'png'; // Always save as PNG after resize
            const fileName = `favicon-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(fileName, resizedBlob, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('logos').getPublicUrl(fileName);

            setPreview(data.publicUrl);
            onUploadComplete(data.publicUrl);

            toast({
                title: 'Favicon uploaded',
                description: 'Your shop favicon has been updated',
            });
        } catch (error: any) {
            toast({
                title: 'Upload failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUploadComplete('');
    };

    return (
        <div className="space-y-3">
            {/* Preview */}
            <div className="h-20 w-20 mx-auto bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border overflow-hidden relative">
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Shop Favicon"
                            className="h-full w-full object-contain p-2"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute -top-1 -right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </>
                ) : (
                    <span className="text-xs text-muted-foreground">Favicon</span>
                )}
            </div>

            {/* Upload Button */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".ico,.png,image/x-icon,image/png"
                className="hidden"
                onChange={handleFileSelect}
            />

            <Button
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Shop Favicon
                    </>
                )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                32×32px .ico or .png, Max 100KB
            </p>
        </div>
    );
}

export default FaviconUploader;
