import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import cloudinary from '../lib/cloudinary.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { sendUploadConfirmationEmail } from '../lib/mailer.js';

const router = express.Router();

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
];
const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB (covers videos)

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, PDF, MP4, WebM, MOV, AVI, MKV.'));
    }
    cb(null, true);
  },
});

// POST /api/upload/file — authenticated direct upload via server
router.post('/file', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { mimetype, buffer, originalname } = req.file;
    const folder = req.body.folder || 'stunivoz/uploads';
    const isPdf = mimetype === 'application/pdf';
    const isVideo = mimetype.startsWith('video/');
    const isImage = mimetype.startsWith('image/');

    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimetype};base64,${base64}`;

    const ext = isPdf ? '.pdf' : '';
    const publicId = `${req.user.uid}_${Date.now()}${ext}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'auto',
      public_id: publicId,
      use_filename: false,
      unique_filename: false,
      overwrite: false,
      ...(isImage ? { transformation: [{ quality: 'auto', fetch_format: 'auto' }] } : {}),
    });

    // Send confirmation email (non-blocking)
    if (req.user.email) {
      sendUploadConfirmationEmail(
        req.user.email,
        originalname,
        result.secure_url,
        req.user.name || req.user.email
      ).catch((err) => console.error('Email send error:', err));
    }

    return res.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// POST /api/upload/sign — generate a Cloudinary signed upload params for client-side upload
router.post('/sign', requireAuth, (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = req.body.folder || 'stunivoz/uploads';
    const paramsToSign = {
      timestamp,
      folder,
      public_id: `${req.user.uid}_${timestamp}`,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.json({
      signature,
      timestamp,
      folder,
      public_id: paramsToSign.public_id,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    console.error('Sign error:', err);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
});

// DELETE /api/upload/:publicId — delete a file from Cloudinary
router.delete('/*publicId', requireAuth, async (req, res) => {
  try {
    const publicId = req.params.publicId;
    if (!publicId.startsWith(`stunivoz/`)) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete files outside your folder' });
    }
    const result = await cloudinary.uploader.destroy(publicId);
    return res.json({ success: true, result });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Multer error handler
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
