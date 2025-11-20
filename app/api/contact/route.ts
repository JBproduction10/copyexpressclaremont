import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'jbangala90@gmail.com',
      subject: `New Quote Request from ${name}`,
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
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We received your quote request - CopyExpress Claremont',
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
            <li>Phone: +27 (0) 21 140 3228</li>
            <li>WhatsApp: +27 66 292 4870</li>
            <li>Email: info@copyexpressclaremont.com</li>
          </ul>
          <p>Best regards,<br><strong>CopyExpress Claremont Team</strong></p>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(customerMailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Failed to send email' },
      { status: 500 }
    );
  }
}