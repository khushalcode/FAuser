/**
 * Image upload helper — POSTs files to /api/upload (admin backend),
 * which stores them in Supabase Storage and returns the public URL.
 *
 * Buckets the customer app writes to (per task spec):
 *   - user_avatars      (avatar upload, prefix = userId)
 *   - review_images     (order review images)
 *   - chat_attachments  (chat attachments, prefix = userId)
 *
 * Falls back to a data-URL placeholder when the API isn't configured
 * (mock mode) so the UI is still testable.
 */
import * as ImagePicker from 'expo-image-picker';
import apiClient, { isApiConfigured } from './api-client';

export type StorageBucket =
  | 'user_avatars'
  | 'review_images'
  | 'chat_attachments'
  | 'product_images'
  | 'store_logos'
  | 'store_covers';

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface UploadResult {
  success: boolean;
  url: string;
  path?: string;
  error?: string;
}

const DEFAULT_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7
};

/**
 * Pick an image from the device library.
 * Requests camera-roll permission first.
 * Returns null if the user cancels.
 */
export async function pickImage(
  options?: ImagePicker.ImagePickerOptions
): Promise<PickedImage | null> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera roll permission denied');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      ...DEFAULT_PICKER_OPTIONS,
      ...(options || {})
    });
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName || `upload_${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      size: asset.fileSize
    };
  } catch (e: any) {
    console.warn('[storage] pickImage failed', e);
    throw e;
  }
}

/**
 * Take a photo with the camera.
 */
export async function takePhoto(
  options?: ImagePicker.ImagePickerOptions
): Promise<PickedImage | null> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission denied');
    }
    const result = await ImagePicker.launchCameraAsync({
      ...DEFAULT_PICKER_OPTIONS,
      ...(options || {})
    });
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName || `photo_${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
      size: asset.fileSize
    };
  } catch (e: any) {
    console.warn('[storage] takePhoto failed', e);
    throw e;
  }
}

/**
 * Upload an image to Supabase Storage via the admin /api/upload endpoint.
 *
 * When `isApiConfigured` is false (mock mode), returns the local URI as
 * the "url" so the UI can still preview the selected image.
 */
export async function uploadImage(
  image: PickedImage,
  bucket: StorageBucket,
  prefix?: string
): Promise<UploadResult> {
  if (!isApiConfigured) {
    return {
      success: true,
      url: image.uri,
      path: `mock/${bucket}/${prefix || ''}/${image.name}`
    };
  }

  try {
    const result = await apiClient.upload<UploadResult>(
      '/api/upload',
      { bucket, prefix },
      { uri: image.uri, name: image.name, type: image.type }
    );
    if (!result.success) {
      return { success: false, url: '', error: result.error || 'Upload failed' };
    }
    return {
      success: true,
      url: result.url,
      path: (result as any).path
    };
  } catch (e: any) {
    console.warn('[storage] uploadImage failed', e);
    return {
      success: false,
      url: image.uri, // fallback to local URI so UI keeps working
      error: e?.message || 'Upload failed'
    };
  }
}

/**
 * Convenience: pick + upload in one call.
 */
export async function pickAndUpload(
  bucket: StorageBucket,
  prefix?: string,
  source: 'library' | 'camera' = 'library'
): Promise<UploadResult | null> {
  const image = source === 'camera' ? await takePhoto() : await pickImage();
  if (!image) return null;
  return uploadImage(image, bucket, prefix);
}
