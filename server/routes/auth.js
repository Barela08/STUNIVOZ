import express from 'express';
import crypto from 'crypto';
import { getFirebaseAdmin } from '../lib/firebaseAdmin.js';
import { sendPasswordResetEmail } from '../lib/mailer.js';

const router = express.Router();

// In-memory token store (works for single-instance; use Redis/Firestore for multi-instance)
const resetTokens = new Map(); // token -> { email, expiresAt }
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  try {
    const admin = getFirebaseAdmin();

    // Check if the user exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch {
      // Don't reveal if user exists or not — always respond with success
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + TOKEN_TTL_MS;

    // Clean up old tokens for this email
    for (const [t, v] of resetTokens.entries()) {
      if (v.email === email || v.expiresAt < Date.now()) {
        resetTokens.delete(t);
      }
    }

    resetTokens.set(token, { email, expiresAt, uid: userRecord.uid });

    // Build reset link pointing to our frontend reset page
    const baseUrl = process.env.FRONTEND_URL || `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}`;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send the email
    await sendPasswordResetEmail(email, resetLink, userRecord.displayName || '');

    return res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({
      error: 'Failed to send reset email. Please try again later.',
    });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const record = resetTokens.get(token);
  if (!record) {
    return res.status(400).json({ error: 'Invalid or expired reset token.' });
  }
  if (Date.now() > record.expiresAt) {
    resetTokens.delete(token);
    return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
  }

  try {
    const admin = getFirebaseAdmin();
    await admin.auth().updateUser(record.uid, { password: newPassword });
    resetTokens.delete(token);

    return res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to update password. Please try again.' });
  }
});

// GET /api/auth/verify-reset-token?token=xxx
router.get('/verify-reset-token', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ valid: false, error: 'Token is required.' });

  const record = resetTokens.get(token);
  if (!record || Date.now() > record.expiresAt) {
    if (record) resetTokens.delete(token);
    return res.json({ valid: false, error: 'Invalid or expired token.' });
  }
  return res.json({ valid: true, email: record.email });
});

export default router;
