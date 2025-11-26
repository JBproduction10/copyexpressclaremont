/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongodb';
import EmailSettings from '@/lib/models/EmailSettings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, service, message } = body;

    // Validate input
    if (!name || !email || !service || !message) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Connect to database and get email settings
    await connectDB();
    const settings = await EmailSettings.findOne({ isActive: true });

    if (!settings) {
      console.error('Email settings not configured');
      return NextResponse.json(
        { message: 'Email service not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // If in test mode, log but don't send
    if (settings.testMode) {
      console.log('TEST MODE - Email not sent:', {
        to: [settings.adminEmail, email],
        from: settings.fromEmail,
        name,
        service,
        message
      });
      
      return NextResponse.json(
        { 
          message: 'Test mode: Email logged but not sent',
          testMode: true 
        },
        { status: 200 }
      );
    }

    // Create transporter with settings from database
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
    });

    // Email to admin
    const adminMailOptions = {
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: settings.adminEmail,
      replyTo: email,
      subject: settings.adminSubject.replace('{name}', name),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff7849;">New Quote Request</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service Needed:</strong> ${service}</p>
            <p><strong>Message:</strong></p>
            <p style="background-color: white; padding: 15px; border-radius: 4px;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from the CopyExpress Claremont contact form.
          </p>
        </div>
      `,
    };

    // Email to customer (confirmation)
    const customerMailOptions = {
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: email,
      replyTo: settings.replyToEmail,
      subject: settings.customerSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff7849;">Thank You for Contacting Us!</h2>
          <p>Hi ${name},</p>
          <p>We've received your quote request for <strong>${service}</strong>.</p>
          <p>Our team will review your request and get back to you within 24 hours.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Request Details:</h3>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Message:</strong></p>
            <p style="background-color: white; padding: 15px; border-radius: 4px;">${message}</p>
          </div>
          <p>If you have any urgent questions, feel free to contact us directly:</p>
          <ul>
            <li>Email: ${settings.replyToEmail}</li>
          </ul>
          <p>Best regards,<br><strong>${settings.fromName} Team</strong></p>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        message: 'Failed to send email',
        error: error.message 
      },
      { status: 500 }
    );
  }
}