import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendPasswordResetEmail(toEmail, resetLink, userName) {
  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f6f8; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 36px 40px; text-align: center; }
    .header img { height: 48px; margin-bottom: 12px; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; }
    .body { padding: 40px; }
    .body p { color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; margin: 24px 0; padding: 14px 36px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; }
    .note { background: #f9fafb; border-radius: 10px; padding: 16px; margin-top: 24px; }
    .note p { color: #6b7280; font-size: 13px; margin: 0; }
    .link-text { word-break: break-all; color: #3b82f6; font-size: 12px; margin-top: 8px; }
    .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #f3f4f6; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>STUNIVOZ</h1>
    </div>
    <div class="body">
      <p>Hi ${userName || 'there'},</p>
      <p>We received a request to reset the password for your STUNIVOZ account. Click the button below to set a new password:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="btn">Reset My Password</a>
      </div>
      <div class="note">
        <p><strong>This link expires in 1 hour.</strong> If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>
        <p class="link-text">Or copy this link: ${resetLink}</p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} STUNIVOZ. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const info = await transporter.sendMail({
    from: `"STUNIVOZ" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your STUNIVOZ password',
    html,
    text: `Hi ${userName || 'there'},\n\nReset your STUNIVOZ password using this link (expires in 1 hour):\n\n${resetLink}\n\nIf you didn't request this, ignore this email.\n\n— STUNIVOZ Team`,
  });

  return info;
}

export async function sendUploadConfirmationEmail(toEmail, fileName, fileUrl, userName) {
  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>File Uploaded Successfully</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f6f8; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 36px 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; margin: 0; font-weight: 700; }
    .body { padding: 40px; }
    .body p { color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .file-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; margin: 16px 0; }
    .file-card p { margin: 4px 0; font-size: 14px; color: #374151; }
    .btn { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #f3f4f6; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>STUNIVOZ</h1>
    </div>
    <div class="body">
      <p>Hi ${userName || 'there'},</p>
      <p>Your file has been uploaded successfully to STUNIVOZ!</p>
      <div class="file-card">
        <p><strong>File:</strong> ${fileName}</p>
        <p><strong>Uploaded:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <div style="text-align:center; margin-top: 20px;">
        <a href="${fileUrl}" class="btn">View File</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} STUNIVOZ. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"STUNIVOZ" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your file "${fileName}" was uploaded`,
    html,
  });
}
