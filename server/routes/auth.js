import express from 'express';
import crypto from 'crypto';
import { getFirebaseAdmin } from '../lib/firebaseAdmin.js';
import { sendPasswordResetEmail } from '../lib/mailer.js';

const router = express.Router();

// In-memory token store (works for single-instance; use Redis/Firestore for multi-instance)
const resetTokens = new Map(); // token -> { email, expiresAt }
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// POST /api/auth/get-profile
// Returns full profile via Admin SDK (bypasses Firestore client rules)
router.post('/get-profile', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken is required.' });
  try {
    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const profileDoc = await admin.firestore().collection('profiles').doc(uid).get();
    if (!profileDoc.exists) {
      const usersDoc = await admin.firestore().collection('users').doc(uid).get();
      if (!usersDoc.exists) return res.status(404).json({ error: 'Profile not found.' });
      return res.json({ success: true, profile: { ...usersDoc.data(), id: uid } });
    }
    return res.json({ success: true, profile: { ...profileDoc.data(), id: uid } });
  } catch (err) {
    console.error('get-profile error:', err);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// POST /api/auth/verify-admin
// Accepts Firebase ID token, verifies admin role via Admin SDK (bypasses Firestore rules)
router.post('/verify-admin', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken is required.' });

  try {
    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const profileDoc = await admin.firestore().collection('profiles').doc(uid).get();
    if (!profileDoc.exists) {
      return res.status(403).json({ error: 'No profile found for this account.' });
    }

    const profile = profileDoc.data();
    if (profile.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. This account does not have admin role.' });
    }

    return res.json({ success: true, profile: { ...profile, id: uid } });
  } catch (err) {
    console.error('verify-admin error:', err);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

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

// POST /api/auth/provision-admin
// Creates or fixes a Firebase Auth account for an email that already has role='admin' in Firestore
router.post('/provision-admin', async (req, res) => {
  const { email, password, setupKey } = req.body;

  if (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ error: 'Invalid setup key.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const adminSDK = getFirebaseAdmin();
    const db = adminSDK.firestore();

    // Must already have role='admin' in Firestore profiles
    const snap = await db.collection('profiles')
      .where('email', '==', email.trim().toLowerCase())
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(403).json({ error: 'No admin profile found for this email. Make sure the account has role=admin in Firestore first.' });
    }

    const profileData = snap.docs[0].data();
    let uid;

    try {
      // User already exists in Firebase Auth — just update password
      const existing = await adminSDK.auth().getUserByEmail(email.trim().toLowerCase());
      await adminSDK.auth().updateUser(existing.uid, { password });
      uid = existing.uid;
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Create the Firebase Auth user from scratch
        const newUser = await adminSDK.auth().createUser({
          email: email.trim().toLowerCase(),
          password,
          displayName: profileData.full_name || '',
          emailVerified: true,
        });
        uid = newUser.uid;

        // Sync Firestore profile to new uid if it differs
        if (snap.docs[0].id !== uid) {
          await db.collection('profiles').doc(uid).set(
            { ...profileData, id: uid, updatedAt: new Date().toISOString() },
            { merge: true }
          );
        }
      } else {
        throw err;
      }
    }

    return res.json({ success: true, message: 'Admin credentials set successfully. You can now log in.' });
  } catch (err) {
    console.error('Provision admin error:', err);
    return res.status(500).json({ error: err.message || 'Failed to provision admin account.' });
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
