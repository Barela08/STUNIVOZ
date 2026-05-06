import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in to upload files.');
  try {
    return await user.getIdToken(true);
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

export async function uploadFile(
  file: File,
  folder: string = 'stunivoz/uploads',
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const token = await getAuthToken();

  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
  ];
  if (!allowed.includes(file.type)) {
    throw new Error('Allowed types: Images (JPEG, PNG, WebP, GIF), PDF, or Video (MP4, WebM, MOV, AVI, MKV).');
  }
  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(isVideo ? 'Video must be under 100 MB.' : 'File size must be under 10 MB.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/upload/file`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

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
    xhr.timeout = 120000;

    xhr.send(formData);
  });
}

export async function deleteFile(publicId: string): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/upload/${encodeURIComponent(publicId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Delete failed');
  }
}
