/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EmailSettings from "@/lib/models/EmailSettings";
import { sendEmail, getVerificationEmailTemplate } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json(
        { message: "Email address is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email settings exist
    const settings = await EmailSettings.findOne({ isActive: true });

    if (!settings) {
      return NextResponse.json(
        { 
          message: "Email settings not configured. Please configure email settings in the admin panel first.",
          configured: false
        },
        { status: 400 }
      );
    }

    console.log('Email settings found:', {
      host: settings.smtpHost,
      port: settings.smtpPort,
      user: settings.smtpUser
    });

    // Send test email
    const testUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/verify-email?token=test123`;
    await sendEmail({
      to,
      subject: "Test Email - Verification System",
      html: getVerificationEmailTemplate(testUrl, "Test User")
    });

    return NextResponse.json(
      { 
        message: "Test email sent successfully!",
        config: {
          host: settings.smtpHost,
          port: settings.smtpPort,
          from: settings.fromEmail,
          testMode: settings.testMode
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { 
        message: "Failed to send test email",
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const settings = await EmailSettings.findOne({ isActive: true });

    if (!settings) {
      return NextResponse.json({
        message: "Email settings not configured",
        configured: false,
        instructions: "Please configure email settings in the admin panel under the 'Email' tab."
      });
    }

    return NextResponse.json({
      message: "Email settings configured",
      configured: true,
      config: {
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: settings.smtpSecure,
        user: settings.smtpUser,
        fromName: settings.fromName,
        fromEmail: settings.fromEmail,
        testMode: settings.testMode
      },
      instructions: {
        gmail: "Use smtp.gmail.com:587 with App Password from https://myaccount.google.com/apppasswords",
        outlook: "Use smtp-mail.outlook.com:587",
        yahoo: "Use smtp.mail.yahoo.com:587"
      }
    });
  } catch (error: any) {
    console.error("Config check error:", error);
    return NextResponse.json(
      { 
        message: "Failed to check configuration",
        error: error.message
      },
      { status: 500 }
    );
  }
}