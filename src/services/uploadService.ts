import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function getAuthToken(forceRefresh = true): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in to upload files.');
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return await user.getIdToken(false);
  }
}

export interface UploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
];

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Allowed types: Images (JPEG, PNG, WebP, GIF), PDF, or Video (MP4, WebM, MOV, AVI, MKV).');
  }
  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(isVideo ? 'Video must be under 100 MB.' : 'File must be under 20 MB.');
  }
}

/**
 * Upload directly to Cloudinary using a server-issued signature.
 * The file goes browser → Cloudinary (no server relay for the body).
 * Only a tiny /api/upload/sign request needs the Firebase token, so
 * token-expiry issues are effectively eliminated.
 */
async function signedCloudinaryUpload(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  const token = await getAuthToken(true);

  // 1. Get signed params from our Express server
  const signRes = await fetch(`${API_BASE}/upload/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}));
    throw new Error((err as any).error || `Sign request failed: ${signRes.status}`);
  }
  const { signature, timestamp, public_id, api_key, cloud_name } = await signRes.json();

  // 2. Upload directly from browser to Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', api_key);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);
  formData.append('public_id', public_id);
  formData.append('resource_type', 'auto');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`);
    xhr.timeout = 180_000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve({
            secure_url: data.secure_url,
            public_id: data.public_id,
            resource_type: data.resource_type,
            format: data.format || '',
            bytes: data.bytes || 0,
          });
        } else {
          reject(new Error(data.error?.message || `Cloudinary error: ${xhr.status}`));
        }
      } catch {
        reject(new Error('Invalid Cloudinary response'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload. Check your connection.'));
    xhr.ontimeout = () => reject(new Error('Upload timed out. Try a smaller file or check your connection.'));
    xhr.send(formData);
  });
}

/**
 * Fallback: upload through our Express server (keeps old behaviour).
 * Used if signed upload is unavailable.
 */
async function serverRelayUpload(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  const token = await getAuthToken(true);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/upload/file`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 180_000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          resolve(data as UploadResult);
        } else {
          reject(new Error(data.error || 'Upload failed'));
        }
      } catch {
        reject(new Error('Invalid server response'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.send(formData);
  });
}

/**
 * Main upload entry point.
 * Tries signed direct-to-Cloudinary upload first (eliminates token-expiry issues),
 * falls back to server relay if signing fails.
 */
export async function uploadFile(
  file: File,
  folder: string = 'stunivoz/uploads',
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  validateFile(file);
  try {
    return await signedCloudinaryUpload(file, folder, onProgress);
  } catch (signErr: any) {
    const isAuthErr = signErr?.message?.includes('401') || signErr?.message?.includes('Unauthorized') || signErr?.message?.includes('logged in');
    if (isAuthErr) throw signErr;
    return await serverRelayUpload(file, folder, onProgress);
  }
}

export async function deleteFile(publicId: string): Promise<void> {
  const token = await getAuthToken(true);
  const res = await fetch(`${API_BASE}/upload/${encodeURIComponent(publicId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || 'Delete failed');
  }
}
