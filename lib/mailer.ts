import nodemailer from 'nodemailer';

interface SendMagicLinkParams {
  to: string;
  magicLinkUrl: string;
  pin: string;
}

export async function sendMagicLinkEmail({ to, magicLinkUrl, pin }: SendMagicLinkParams): Promise<{ sent: boolean; message?: string; error?: string }> {
  const subject = `🔐 Your Bookshelf Admin Login PIN: ${pin}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 22px; font-weight: 900; color: #0f172a; }
    .logo span { color: #f59e0b; }
    .btn { display: inline-block; background-color: #f59e0b; color: #0f172a !important; font-weight: 800; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; text-align: center; box-shadow: 0 4px 12px rgba(245,158,11,0.3); }
    .pin-box { background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
    .pin-code { font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #0f172a; margin: 4px 0; }
    .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">book<span>shelf</span></div>
      <h2 style="font-size: 20px; font-weight: 900; margin: 12px 0 4px;">Admin Security Login</h2>
      <p style="font-size: 13.5px; color: #64748b; margin: 0;">Authorized for ${to}</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #334155;">
      Hello Mohammad, click the button below to log in directly to your Bookshelf Admin Dashboard:
    </p>

    <div style="text-align: center;">
      <a href="${magicLinkUrl}" class="btn" target="_blank">⚡ Log In to Admin Panel</a>
    </div>

    <div class="pin-box">
      <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px;">Or Enter This 6-Digit PIN</span>
      <div class="pin-code">${pin}</div>
      <span style="font-size: 11px; color: #94a3b8;">Valid for 15 minutes · One-time use</span>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
      If you did not request this login, you can safely ignore this email.
    </p>

    <div class="footer">
      © 2026 Bookshelf Inc. · Secure Zero-Trust Authentication
    </div>
  </div>
</body>
</html>
  `;

  // 1. Gmail SMTP or Custom SMTP (via Nodemailer)
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"Bookshelf Admin" <${gmailUser}>`,
        to,
        subject,
        html: htmlContent,
      });

      return { sent: true };
    } catch (err: any) {
      console.error('Nodemailer SMTP Error:', err);
      return { sent: false, error: err.message };
    }
  }

  // 2. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Bookshelf <onboarding@resend.dev>',
          to,
          subject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        return { sent: true };
      }
    } catch (err: any) {
      console.error('Resend API Error:', err);
    }
  }

  // 3. Fallback when SMTP environment variables are not yet added
  console.log(`[AUTH] Login PIN generated for ${to}: ${pin}`);
  return {
    sent: false,
    message: 'SMTP credentials not configured in .env.local yet. Please configure GMAIL_USER and GMAIL_APP_PASSWORD or use the Secret Passcode.',
  };
}
