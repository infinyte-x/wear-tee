/**
 * ImageCropDialog - Modal for cropping and resizing images
 * 
 * Uses react-easy-crop for cropping with fixed 2:3 aspect ratio.
 * Outputs a cropped blob ready for upload.
 */

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCcw, RotateCw, ZoomIn, Loader2 } from 'lucide-react';

interface ImageCropDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imageSrc: string;
    fileName: string;
    onCropComplete: (croppedBlob: Blob, fileName: string) => void;
}

// Helper function to create cropped image
const createCroppedImage = async (
    imageSrc: string,
    croppedAreaPixels: Area,
    rotation: number = 0
): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
        image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    // Set canvas size to the cropped area
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    // Handle rotation
    if (rotation !== 0) {
        const radians = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));

        const rotatedWidth = image.width * cos + image.height * sin;
        const rotatedHeight = image.width * sin + image.height * cos;

        const rotationCanvas = document.createElement('canvas');
        rotationCanvas.width = rotatedWidth;
        rotationCanvas.height = rotatedHeight;
        const rotationCtx = rotationCanvas.getContext('2d');

        if (rotationCtx) {
            rotationCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
            rotationCtx.rotate(radians);
            rotationCtx.drawImage(image, -image.width / 2, -image.height / 2);

            ctx.drawImage(
                rotationCanvas,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );
        }
    } else {
        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );
    }

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas is empty'));
                }
            },
            'image/jpeg',
            0.95
        );
    });
};

export function ImageCropDialog({
    open,
    onOpenChange,
    imageSrc,
    fileName,
    onCropComplete,
}: ImageCropDialogProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = useCallback((location: Point) => {
        setCrop(location);
    }, []);

    const onZoomChange = useCallback((zoom: number) => {
        setZoom(zoom);
    }, []);

    const onCropCompleteHandler = useCallback(
        (_croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleRotateLeft = () => {
        setRotation((prev) => prev - 90);
    };

    const handleRotateRight = () => {
        setRotation((prev) => prev + 90);
    };

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;

        setIsProcessing(true);
        try {
            const croppedBlob = await createCroppedImage(
                imageSrc,
                croppedAreaPixels,
                rotation
            );
            onCropComplete(croppedBlob, fileName);
            onOpenChange(false);

            // Reset state
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setRotation(0);
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Cropper Area */}
                    <div className="relative h-[400px] bg-black rounded-lg overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1}
                            onCropChange={onCropChange}
                            onZoomChange={onZoomChange}
                            onCropComplete={onCropCompleteHandler}
                            showGrid
                        />
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                        {/* Zoom Control */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <ZoomIn className="h-4 w-4" />
                                    Zoom
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                    {Math.round(zoom * 100)}%
                                </span>
                            </div>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(value) => setZoom(value[0])}
                            />
                        </div>

                        {/* Rotation Controls */}
                        <div className="flex items-center gap-2">
                            <Label>Rotate:</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleRotateLeft}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleRotateRight}
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground ml-2">
                                {rotation}°
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <p className="text-xs text-muted-foreground text-center">
                        Crop area is locked to 1:1 aspect ratio (square)
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={isProcessing}>
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Apply Crop'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ImageCropDialog;
