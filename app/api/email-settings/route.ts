/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/email-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmailSettings from '@/lib/models/EmailSettings';
import { requireAuth } from '@/lib/auth-middleware';
import nodemailer from 'nodemailer';

// GET - Fetch current email settings
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();
    
    const settings = await EmailSettings.findOne({ isActive: true });
    
    // Return settings without exposing password
    if (settings) {
      const safeSettings = settings.toObject();
      safeSettings.smtpPassword = '********'; // Mask password
      return NextResponse.json({ success: true, settings: safeSettings });
    }
    
    return NextResponse.json({ success: true, settings: null });
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch email settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update email settings
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.smtpUser || !data.fromEmail || !data.adminEmail) {
      return NextResponse.json(
        { message: 'SMTP user, from email, and admin email are required' },
        { status: 400 }
      );
    }

    // Find existing settings
    let settings = await EmailSettings.findOne({ isActive: true });
    
    if (settings) {
      // Update existing settings
      // Only update password if a new one is provided
      if (data.smtpPassword && data.smtpPassword !== '********') {
        settings.smtpPassword = data.smtpPassword;
      }
      
      settings.smtpHost = data.smtpHost || settings.smtpHost;
      settings.smtpPort = data.smtpPort || settings.smtpPort;
      settings.smtpSecure = data.smtpSecure ?? settings.smtpSecure;
      settings.smtpUser = data.smtpUser;
      settings.fromEmail = data.fromEmail;
      settings.fromName = data.fromName || settings.fromName;
      settings.replyToEmail = data.replyToEmail || data.fromEmail;
      settings.adminEmail = data.adminEmail;
      settings.customerSubject = data.customerSubject || settings.customerSubject;
      settings.adminSubject = data.adminSubject || settings.adminSubject;
      settings.testMode = data.testMode ?? settings.testMode;
      settings.lastModifiedBy = session.user.username;
      
      await settings.save();
    } else {
      // Create new settings
      settings = await EmailSettings.create({
        ...data,
        replyToEmail: data.replyToEmail || data.fromEmail,
        lastModifiedBy: session.user.username
      });
    }

    const safeSettings = settings.toObject();
    safeSettings.smtpPassword = '********';

    return NextResponse.json({
      success: true,
      message: 'Email settings saved successfully',
      settings: safeSettings
    });
  } catch (error) {
    console.error('Error saving email settings:', error);
    return NextResponse.json(
      { message: 'Failed to save email settings' },
      { status: 500 }
    );
  }
}

// PUT - Test email configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await connectDB();
    
    const { testEmail } = await request.json();
    
    if (!testEmail) {
      return NextResponse.json(
        { message: 'Test email address is required' },
        { status: 400 }
      );
    }

    const settings = await EmailSettings.findOne({ isActive: true });
    
    if (!settings) {
      return NextResponse.json(
        { message: 'Email settings not configured' },
        { status: 400 }
      );
    }

    // Create transporter with current settings
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    // Send test email
    await transporter.sendMail({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: testEmail,
      subject: 'Test Email - CopyExpress Email Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff7849;">Email Configuration Test</h2>
          <p>This is a test email to verify your SMTP configuration.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>SMTP Host:</strong> ${settings.smtpHost}</p>
            <p><strong>SMTP Port:</strong> ${settings.smtpPort}</p>
            <p><strong>From Email:</strong> ${settings.fromEmail}</p>
            <p><strong>Test completed at:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            If you received this email, your SMTP configuration is working correctly!
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        message: 'Failed to send test email',
        error: error.message 
      },
      { status: 500 }
    );
  }
}