/**
 * Face Detection Utility
 * Uses face-api.js to detect faces in images and calculate optimal cropping
 */

import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let modelsLoading = false;

/**
 * Load face-api.js models (TinyFaceDetector for performance)
 * Models are loaded from the public directory
 */
export const loadFaceDetectionModels = async (): Promise<void> => {
  if (modelsLoaded) {
    return;
  }

  if (modelsLoading) {
    // Wait for models to finish loading
    while (modelsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  try {
    modelsLoading = true;
    const MODEL_URL = process.env.PUBLIC_URL + '/models';

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

    modelsLoaded = true;
    console.log('[Face Detection] Models loaded successfully');
  } catch (error) {
    console.error('[Face Detection] Failed to load models:', error);
    throw error;
  } finally {
    modelsLoading = false;
  }
};

/**
 * Detect face in image and return optimal square crop coordinates
 * Returns null if no face is detected
 */
export const detectFaceAndGetCropBox = async (
  imageElement: HTMLImageElement
): Promise<{
  x: number;
  y: number;
  size: number;
} | null> => {
  try {
    // Ensure models are loaded
    if (!modelsLoaded) {
      await loadFaceDetectionModels();
    }

    // Detect single face using TinyFaceDetector (fastest)
    const detection = await faceapi.detectSingleFace(
      imageElement,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 224, // Smaller for better performance
        scoreThreshold: 0.5 // Lower threshold to catch more faces
      })
    );

    if (!detection) {
      console.log('[Face Detection] No face detected in image');
      return null;
    }

    const { box } = detection;
    const imgWidth = imageElement.naturalWidth;
    const imgHeight = imageElement.naturalHeight;

    // Calculate square crop centered on face with padding
    const padding = 1.8; // 80% padding around face for context
    const faceSize = Math.max(box.width, box.height) * padding;

    // Center the crop on the face
    const faceCenterX = box.x + box.width / 2;
    const faceCenterY = box.y + box.height / 2;

    // Calculate square size (use larger of face size or minimum)
    const minSize = Math.min(imgWidth, imgHeight) * 0.6; // At least 60% of smaller dimension
    const cropSize = Math.max(faceSize, minSize);

    // Calculate top-left corner of crop box
    let cropX = faceCenterX - cropSize / 2;
    let cropY = faceCenterY - cropSize / 2;

    // Ensure crop box stays within image bounds
    cropX = Math.max(0, Math.min(cropX, imgWidth - cropSize));
    cropY = Math.max(0, Math.min(cropY, imgHeight - cropSize));

    // Final size adjustment if needed
    const finalSize = Math.min(cropSize, imgWidth - cropX, imgHeight - cropY);

    console.log('[Face Detection] Face detected at:', {
      faceBox: box,
      cropBox: { x: cropX, y: cropY, size: finalSize },
      imageSize: { width: imgWidth, height: imgHeight }
    });

    return {
      x: cropX,
      y: cropY,
      size: finalSize
    };
  } catch (error) {
    console.error('[Face Detection] Error detecting face:', error);
    return null;
  }
};

/**
 * Crop image to face and return data URL
 * Falls back to center crop if no face is detected
 */
export const cropImageToFace = async (
  imageUrl: string,
  targetSize: number = 450
): Promise<string | null> => {
  try {
    // Load image
    const img = await loadImage(imageUrl);

    // Detect face and get crop box
    const cropBox = await detectFaceAndGetCropBox(img);

    // Create canvas for cropping
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('[Face Detection] Failed to get canvas context');
      return null;
    }

    if (cropBox) {
      // Crop to face
      ctx.drawImage(
        img,
        cropBox.x, cropBox.y, cropBox.size, cropBox.size, // Source
        0, 0, targetSize, targetSize // Destination
      );
    } else {
      // Fallback: center crop
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const minDim = Math.min(imgWidth, imgHeight);
      const cropX = (imgWidth - minDim) / 2;
      const cropY = (imgHeight - minDim) / 2;

      ctx.drawImage(
        img,
        cropX, cropY, minDim, minDim, // Source (center square)
        0, 0, targetSize, targetSize // Destination
      );

      console.log('[Face Detection] Using center crop fallback');
    }

    // Return as data URL
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (error) {
    console.error('[Face Detection] Error cropping image:', error);
    return null;
  }
};

/**
 * Helper function to load image
 */
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Get CSS background-position for cropped segment in 3x3 grid
 * Used when displaying face-cropped image as 9 tiles
 */
export const getFaceCroppedSegmentStyle = (
  croppedImageUrl: string,
  segmentIndex: number,
  gridSize: number = 3,
  tileSize: number = 150
): React.CSSProperties => {
  const col = segmentIndex % gridSize;
  const row = Math.floor(segmentIndex / gridSize);
  const xPos = col * tileSize;
  const yPos = row * tileSize;

  return {
    backgroundImage: `url(${croppedImageUrl})`,
    backgroundPosition: `-${xPos}px -${yPos}px`,
    backgroundSize: `${gridSize * tileSize}px ${gridSize * tileSize}px`,
  };
};
