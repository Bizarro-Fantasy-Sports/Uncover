/**
 * Hook for face detection and image cropping
 * Loads face-api.js models and provides face detection functionality
 */

import { useState, useEffect } from 'react';
import { loadFaceDetectionModels, cropImageToFace } from '../utils/faceDetection';

export const useFaceDetection = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Load models on mount
  useEffect(() => {
    const initModels = async () => {
      try {
        await loadFaceDetectionModels();
        setModelsLoaded(true);
        console.log('[useFaceDetection] Face detection models loaded');
      } catch (error) {
        console.error('[useFaceDetection] Failed to load models:', error);
        setLoadingError('Failed to load face detection models');
      }
    };

    initModels();
  }, []);

  /**
   * Process photo URL to apply face detection and cropping
   * Returns cropped data URL or null if processing fails
   */
  const processFacePhoto = async (photoUrl: string): Promise<string | null> => {
    if (!modelsLoaded) {
      console.log('[useFaceDetection] Models not loaded yet, skipping face detection');
      return null;
    }

    try {
      return await cropImageToFace(photoUrl, 450);
    } catch (error) {
      console.error('[useFaceDetection] Error processing photo:', error);
      return null;
    }
  };

  return {
    modelsLoaded,
    loadingError,
    processFacePhoto,
  };
};
