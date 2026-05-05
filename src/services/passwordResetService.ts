const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
  return data;
}

export async function verifyResetToken(token: string): Promise<{ valid: boolean; email?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
  return res.json();
}

export async function submitNewPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
  return data;
}
