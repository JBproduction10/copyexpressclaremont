/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/email-service.ts
import nodemailer from 'nodemailer';
import connectDB from './mongodb';
import EmailSettings from './models/EmailSettings';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await connectDB();
    
    // Fetch email settings from database
    const settings = await EmailSettings.findOne({ isActive: true });
    
    if (!settings) {
      throw new Error('Email settings not configured. Please configure email settings in the admin panel.');
    }

    console.log('Sending email with config:', {
      host: settings.smtpHost,
      port: settings.smtpPort,
      user: settings.smtpUser,
      to: to
    });

    // Create transporter using database settings
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection if not in test mode
    if (!settings.testMode) {
      await transporter.verify();
      console.log('SMTP connection verified');
    }

    // If test mode, just log and return
    if (settings.testMode) {
      console.log('TEST MODE: Email would be sent to:', to);
      console.log('Subject:', subject);
      return { messageId: 'test-mode-' + Date.now() };
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return info;

  } catch (error: any) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export function getVerificationEmailTemplate(verificationUrl: string, username: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Verify Your Email</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                    Hi ${username},
                  </p>
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                    Thank you for registering! Please verify your email address by clicking the button below:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          Verify Email
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 10px 0 0; font-size: 14px; line-height: 1.6; color: #3b82f6; word-break: break-all;">
                    ${verificationUrl}
                  </p>
                  <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                    This link will expire in 24 hours.
                  </p>
                  <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                    If you didn't create an account, please ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                    © ${new Date().getFullYear()} Your Company. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getPasswordResetEmailTemplate(resetUrl: string, username: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Reset Your Password</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                    Hi ${username},
                  </p>
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                    You requested to reset your password. Click the button below to create a new password:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 10px 0 0; font-size: 14px; line-height: 1.6; color: #3b82f6; word-break: break-all;">
                    ${resetUrl}
                  </p>
                  <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                    This link will expire in 1 hour.
                  </p>
                  <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                    © ${new Date().getFullYear()} Your Company. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}