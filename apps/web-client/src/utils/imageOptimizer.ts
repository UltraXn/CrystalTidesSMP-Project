const CONSTANTS = {
    DEFAULT_MAX_WIDTH: 500,
    DEFAULT_QUALITY: 0.8,
    WEBP_MIME_TYPE: 'image/webp',
} as const;

const ERROR_MESSAGES = {
    READ_FAILED: 'Failed to read file as data URL',
    CANVAS_CONTEXT_FAILED: 'Failed to get canvas context',
    BLOB_CONVERSION_FAILED: 'Canvas to Blob conversion failed',
    IMAGE_LOAD_FAILED: 'Failed to load image',
} as const;

interface ImageDimensions {
    width: number;
    height: number;
}

/**
 * Reads a File instance and resolves its content as a Data URL string.
 */
const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                reject(new Error(ERROR_MESSAGES.READ_FAILED));
            }
        };

        reader.onerror = () => {
            reject(reader.error ?? new Error(ERROR_MESSAGES.READ_FAILED));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Loads an image element asynchronously from a source URL.
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(ERROR_MESSAGES.IMAGE_LOAD_FAILED));
        img.src = src;
    });
};

/**
 * Calculates resized dimensions while preserving the original aspect ratio.
 */
const calculateResizedDimensions = (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number
): ImageDimensions => {
    if (originalWidth <= maxWidth) {
        return { width: originalWidth, height: originalHeight };
    }

    const scaledHeight = Math.round((originalHeight * maxWidth) / originalWidth);
    return { width: maxWidth, height: scaledHeight };
};

/**
 * Renders an HTMLImageElement to an offscreen canvas at the target dimensions.
 */
const renderToCanvas = (
    img: HTMLImageElement,
    width: number,
    height: number
): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error(ERROR_MESSAGES.CANVAS_CONTEXT_FAILED);
    }

    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
};

/**
 * Converts a canvas element to a Blob with the specified mime type and quality.
 */
const convertCanvasToBlob = (
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error(ERROR_MESSAGES.BLOB_CONVERSION_FAILED));
                }
            },
            mimeType,
            quality
        );
    });
};

/**
 * Compresses and converts an image file to WebP format.
 * @param {File} file - The image file to compress.
 * @param {number} maxWidth - Maximum width of the output image.
 * @param {number} quality - Quality of the WebP output (0 to 1).
 * @returns {Promise<Blob>} - A promise that resolves to the compressed WebP blob.
 */
export const compressImage = async (
    file: File,
    maxWidth = CONSTANTS.DEFAULT_MAX_WIDTH,
    quality = CONSTANTS.DEFAULT_QUALITY
): Promise<Blob> => {
    const dataUrl = await readFileAsDataUrl(file);
    const img = await loadImage(dataUrl);

    const { width, height } = calculateResizedDimensions(img.width, img.height, maxWidth);
    const canvas = renderToCanvas(img, width, height);

    return convertCanvasToBlob(canvas, CONSTANTS.WEBP_MIME_TYPE, quality);
};