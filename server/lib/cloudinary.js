import { v2 as cloudinary } from 'cloudinary';

// Support CLOUDINARY_URL (cloudinary://key:secret@cloud_name) OR individual env vars
const url = process.env.CLOUDINARY_URL;
if (url && url.startsWith('cloudinary://')) {
  try {
    // Parse cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const withoutScheme = url.replace('cloudinary://', '');
    const atIdx = withoutScheme.lastIndexOf('@');
    const cloud_name = withoutScheme.slice(atIdx + 1);
    const credPart = withoutScheme.slice(0, atIdx);
    const colonIdx = credPart.indexOf(':');
    const api_key = credPart.slice(0, colonIdx);
    const api_secret = credPart.slice(colonIdx + 1);
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    console.log(`✅ Cloudinary configured via CLOUDINARY_URL (cloud: ${cloud_name})`);
  } catch (e) {
    console.error('❌ Failed to parse CLOUDINARY_URL:', e.message);
  }
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloud) {
    console.log(`✅ Cloudinary configured via individual env vars (cloud: ${cloud})`);
  } else {
    console.warn('⚠️  Cloudinary env vars not set — uploads will fail!');
  }
}

export default cloudinary;
