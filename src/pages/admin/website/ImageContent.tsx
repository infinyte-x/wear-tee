
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

const ImageContent = () => {
    // Placeholder for general image gallery management
    // In a real app this might connect to Supabase Storage bucket listing
    const [images, setImages] = useState<string[]>([]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-serif text-foreground">Image Content</h1>
                    <p className="text-muted-foreground mt-1">Upload and manage general site images.</p>
                </div>

                <div className="bg-card border border-border p-6 rounded-lg">
                    <ImageUpload
                        images={images}
                        onChange={setImages}
                        maxFiles={10}
                    />
                    <div className="mt-4 text-sm text-muted-foreground">
                        These images are uploaded to your storage and can be copied for use in other sections.
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ImageContent;
