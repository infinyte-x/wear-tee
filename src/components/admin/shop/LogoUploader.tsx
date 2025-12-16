/**
 * LogoUploader - Component for uploading shop logo
 *
 * Features:
 * - Image preview
 * - Upload to Supabase Storage
 * - Validation (max 500KB, recommended 200x60px)
 * - Delete old image when replacing
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { resizeLogo } from '@/lib/image-resize';

interface LogoUploaderProps {
    currentUrl?: string | null;
    onUploadComplete: (url: string) => void;
}

const MAX_FILE_SIZE = 500 * 1024; // 500KB

export function LogoUploader({ currentUrl, onUploadComplete }: LogoUploaderProps) {
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
                description: 'Logo must be under 500KB',
                variant: 'destructive',
            });
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload an image file',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);

        try {
            // Resize image before upload
            const resizedBlob = await resizeLogo(file);

            // Check resized size
            if (resizedBlob.size > MAX_FILE_SIZE) {
                toast({
                    title: 'Image too complex',
                    description: 'Please try a simpler image',
                    variant: 'destructive',
                });
                return;
            }

            // Delete old logo if exists
            if (currentUrl) {
                const oldPath = currentUrl.split('/').pop();
                if (oldPath) {
                    await supabase.storage.from('logos').remove([oldPath]);
                }
            }

            // Upload resized logo
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;

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
                title: 'Logo uploaded',
                description: 'Your shop logo has been updated',
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
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
                {preview ? (
                    <div className="relative w-full h-full p-4 flex items-center justify-center">
                        <img
                            src={preview}
                            alt="Shop Logo"
                            className="max-h-full max-w-full object-contain"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground">Shop Logo</span>
                )}
            </div>

            {/* Upload Button */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
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
                        Upload Shop Logo
                    </>
                )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                Recommended: 200×60px, Max 500KB
            </p>
        </div>
    );
}

export default LogoUploader;
