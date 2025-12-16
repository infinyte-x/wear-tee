import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';

interface ProductMediaProps {
    images: string[];
    onChange: (images: string[]) => void;
}

interface SortableImageProps {
    url: string;
    index: number;
    onRemove: () => void;
    onSetFeatured: () => void;
    isFeatured: boolean;
}

const SortableImage = ({ url, index, onRemove, onSetFeatured, isFeatured }: SortableImageProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group aspect-square bg-muted rounded-lg overflow-hidden border-2 ${isFeatured ? 'border-primary' : 'border-transparent'}`}
            {...attributes}
            {...listeners}
        >
            <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />

            {/* Featured Badge */}
            {isFeatured && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm z-10">
                    Featured
                </div>
            )}

            {/* Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isFeatured && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start
                            onSetFeatured();
                        }}
                        title="Set as featured"
                    >
                        <Star className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const ProductMedia = ({ images, onChange }: ProductMediaProps) => {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.indexOf(active.id as string);
            const newIndex = images.indexOf(over.id as string);
            onChange(arrayMove(images, oldIndex, newIndex));
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages: string[] = [];

        try {
            for (const file of Array.from(files)) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                newImages.push(data.publicUrl);
            }

            onChange([...images, ...newImages]);
            toast({ title: `${newImages.length} image(s) uploaded` });
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

    const removeImage = (indexToRemove: number) => {
        onChange(images.filter((_, index) => index !== indexToRemove));
    };

    const setFeatured = (indexToFeature: number) => {
        // To set featured, we just move it to the beginning of the array
        const newImages = [...images];
        const image = newImages.splice(indexToFeature, 1)[0];
        newImages.unshift(image);
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Product Media</h3>
                <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Add Media'}
                </Button>
            </div>

            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={images} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((url, index) => (
                            <SortableImage
                                key={url}
                                url={url}
                                index={index}
                                isFeatured={index === 0}
                                onRemove={() => removeImage(index)}
                                onSetFeatured={() => setFeatured(index)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {images.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground bg-muted/50">
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 opacity-50" />
                        <p>Drag files here or click Add Media</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductMedia;
