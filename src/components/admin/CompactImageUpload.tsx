/**
 * CompactImageUpload - Compact image upload for Page Builder
 * 
 * Features:
 * - Single file upload with drag & drop
 * - Client-side image resize with canvas
 * - Max 4MB file size limit
 * - Square preview with remove option
 */

import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { X, Upload, FileImage, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompactImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    bucket?: string;
    maxWidth?: number;
    maxHeight?: number;
    maxSizeMB?: number;
    aspectRatio?: string;
    className?: string;
}

export function CompactImageUpload({
    value,
    onChange,
    bucket = 'product-images',
    maxWidth = 1440,
    maxHeight = 800,
    maxSizeMB = 4,
    aspectRatio = '16/9',
    className = '',
}: CompactImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Resize image using canvas
    const resizeImage = useCallback((file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);

                let { width, height } = img;

                // Calculate scaling factor
                const widthRatio = maxWidth / width;
                const heightRatio = maxHeight / height;
                const ratio = Math.min(widthRatio, heightRatio, 1);

                width = Math.round(width * ratio);
                height = Math.round(height * ratio);

                // Create canvas and resize
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    },
                    'image/webp',
                    0.85
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }, [maxWidth, maxHeight]);

    const handleUpload = async (file: File) => {
        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: `Maximum file size is ${maxSizeMB}MB`,
                variant: 'destructive',
            });
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file',
                description: 'Please upload an image file',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);

        try {
            // Resize image
            const resizedBlob = await resizeImage(file);
            const fileName = `${crypto.randomUUID()}.webp`;

            // Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, resizedBlob, {
                    contentType: 'image/webp',
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
            onChange(data.publicUrl);

            toast({ title: 'Image uploaded successfully' });
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleUpload(file);
        },
        [handleUpload]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {value ? (
                // Preview with remove button
                <div className="relative group">
                    <div
                        className="w-full rounded-lg overflow-hidden border bg-muted"
                        style={{ aspectRatio }}
                    >
                        <img
                            src={value}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                // Upload zone
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        w-full rounded-lg border-2 border-dashed cursor-pointer
                        flex flex-col items-center justify-center gap-2 p-4
                        transition-colors
                        ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                        ${uploading ? 'pointer-events-none opacity-50' : ''}
                    `}
                    style={{ aspectRatio }}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <FileImage className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground text-center">
                                Drop image here or click to upload
                            </span>
                            <span className="text-xs text-muted-foreground/60">
                                {maxWidth}x{maxHeight}px • Max {maxSizeMB}MB
                            </span>
                        </>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}

export default CompactImageUpload;
