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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, Star, Crop } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';
import { ImageCropDialog } from './ImageCropDialog';

// Image requirements
const MIN_WIDTH = 800;
const MIN_HEIGHT = 800;
const REQUIRED_ASPECT_RATIO = 1; // 1:1 (square)
const ASPECT_RATIO_TOLERANCE = 0.05; // 5% tolerance
const IMAGES_PER_COLOR = 4;

interface ProductMediaProps {
    images: string[];
    onChange: (images: string[]) => void;
    colors?: string[];
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

const ProductMedia = ({ images, onChange, colors = [] }: ProductMediaProps) => {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Crop dialog state
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [currentCropImage, setCurrentCropImage] = useState<string | null>(null);
    const [currentCropFileName, setCurrentCropFileName] = useState<string>('');
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Validate image dimensions and aspect ratio
    const validateImage = (file: File): Promise<{ valid: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                const aspectRatio = width / height;

                if (width < MIN_WIDTH || height < MIN_HEIGHT) {
                    resolve({
                        valid: false,
                        error: `${file.name}: Image must be at least ${MIN_WIDTH}x${MIN_HEIGHT}px (got ${width}x${height})`
                    });
                    return;
                }

                if (Math.abs(aspectRatio - REQUIRED_ASPECT_RATIO) > ASPECT_RATIO_TOLERANCE) {
                    resolve({
                        valid: false,
                        error: `${file.name}: Image must have 2:3 aspect ratio (${MIN_WIDTH}x${MIN_HEIGHT})`
                    });
                    return;
                }

                resolve({ valid: true });
            };
            img.onerror = () => {
                resolve({ valid: false, error: `${file.name}: Could not read image` });
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.indexOf(active.id as string);
            const newIndex = images.indexOf(over.id as string);
            onChange(arrayMove(images, oldIndex, newIndex));
        }
    };

    // Handle file selection - open crop dialog for each file
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setValidationErrors([]);
        const fileArray = Array.from(files);
        setPendingFiles(fileArray.slice(1)); // Store remaining files

        // Open crop dialog for first file
        const firstFile = fileArray[0];
        const imageUrl = URL.createObjectURL(firstFile);
        setCurrentCropImage(imageUrl);
        setCurrentCropFileName(firstFile.name);
        setCropDialogOpen(true);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload blob to Supabase
    const uploadBlob = async (blob: Blob, fileName: string): Promise<string> => {
        const fileExt = fileName.split('.').pop() || 'jpg';
        const newFileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(newFileName, blob);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(newFileName);

        return data.publicUrl;
    };

    // Handle crop completion
    const handleCropComplete = async (croppedBlob: Blob, fileName: string) => {
        setUploading(true);

        try {
            const publicUrl = await uploadBlob(croppedBlob, fileName);
            onChange([...images, publicUrl]);
            toast({ title: 'Image uploaded successfully' });

            // Process next file if any
            if (pendingFiles.length > 0) {
                const nextFile = pendingFiles[0];
                setPendingFiles(pendingFiles.slice(1));

                const imageUrl = URL.createObjectURL(nextFile);
                setCurrentCropImage(imageUrl);
                setCurrentCropFileName(nextFile.name);
                setCropDialogOpen(true);
            }
        } catch (error: any) {
            toast({
                title: 'Upload failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    // Handle crop dialog close (skip current file)
    const handleCropDialogClose = (open: boolean) => {
        if (!open) {
            // Clean up current image URL
            if (currentCropImage) {
                URL.revokeObjectURL(currentCropImage);
            }
            setCurrentCropImage(null);
            setCurrentCropFileName('');

            // Process next file if any
            if (pendingFiles.length > 0) {
                const nextFile = pendingFiles[0];
                setPendingFiles(pendingFiles.slice(1));

                const imageUrl = URL.createObjectURL(nextFile);
                setCurrentCropImage(imageUrl);
                setCurrentCropFileName(nextFile.name);
                setCropDialogOpen(true);
            } else {
                setCropDialogOpen(false);
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

    // Calculate required images based on colors
    const requiredImages = colors.length > 0 ? colors.length * IMAGES_PER_COLOR : IMAGES_PER_COLOR;
    const hasEnoughImages = images.length >= requiredImages;

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

            {/* Image Requirements */}
            <Alert variant="info" className="bg-muted/50">
                <AlertDescription className="text-xs">
                    <p className="font-medium mb-1">Image Requirements:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                        <li>Minimum size: <strong>800 × 800 pixels</strong></li>
                        <li>Aspect ratio: <strong>1:1</strong> (square)</li>
                        <li>Upload <strong>4 images per color variant</strong></li>
                        {colors.length > 0 && (
                            <li>
                                {colors.length} color(s) selected = <strong>{requiredImages} images required</strong>
                            </li>
                        )}
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <Alert variant="destructive">
                    <AlertDescription>
                        <p className="font-medium mb-1">Images rejected:</p>
                        <ul className="list-disc list-inside text-xs">
                            {validationErrors.map((error, i) => (
                                <li key={i}>{error}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            {/* Image count status */}
            {images.length > 0 && (
                <div className={`text-xs ${hasEnoughImages ? 'text-green-600' : 'text-amber-600'}`}>
                    {images.length} / {requiredImages} images uploaded
                    {!hasEnoughImages && ` (${requiredImages - images.length} more needed)`}
                </div>
            )}

            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
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

            {/* Image Crop Dialog */}
            {currentCropImage && (
                <ImageCropDialog
                    open={cropDialogOpen}
                    onOpenChange={handleCropDialogClose}
                    imageSrc={currentCropImage}
                    fileName={currentCropFileName}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
};

export default ProductMedia;
