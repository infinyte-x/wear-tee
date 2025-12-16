/**
 * Image resize utilities for logo and favicon uploads
 */

interface ResizeOptions {
    maxWidth: number;
    maxHeight: number;
    quality?: number;
}

/**
 * Resize an image file to fit within max dimensions
 * @param file - Original image file
 * @param options - Resize options
 * @returns Resized image as Blob
 */
export async function resizeImage(
    file: File,
    options: ResizeOptions
): Promise<Blob> {
    const { maxWidth, maxHeight, quality = 0.9 } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;

                    if (width > height) {
                        width = maxWidth;
                        height = maxWidth / aspectRatio;
                    } else {
                        height = maxHeight;
                        width = maxHeight * aspectRatio;
                    }
                }

                // Create canvas and resize
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    },
                    file.type,
                    quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Resize logo image (recommended 200x60, max 500KB)
 */
export async function resizeLogo(file: File): Promise<Blob> {
    return resizeImage(file, {
        maxWidth: 400,
        maxHeight: 120,
        quality: 0.85,
    });
}

/**
 * Resize favicon image (32x32)
 */
export async function resizeFavicon(file: File): Promise<Blob> {
    return resizeImage(file, {
        maxWidth: 32,
        maxHeight: 32,
        quality: 0.9,
    });
}
