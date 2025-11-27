// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import ActivityLog from "@/lib/models/ActivityLog";
import { sendEmail, getVerificationEmailTemplate } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { username, email, password } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { message: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: "Email already registered" },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { message: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Create new user (not verified yet)
    const user = await User.create({
      username,
      email,
      password,
      role: "viewer",
      isActive: false, // Inactive until email verified
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Create verification URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/admin/verify-email?token=${verificationToken}`;

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: "Verify Your Email Address",
        html: getVerificationEmailTemplate(verificationUrl, username)
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Delete user if email fails
      await User.findByIdAndDelete(user._id);
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    // Log registration activity
    await ActivityLog.create({
      userId: user._id,
      username: user.username,
      email: user.email,
      action: "register",
      targetType: "user",
      targetId: user._id.toString(),
      details: { role: user.role, emailVerified: false }
    });

    return NextResponse.json(
      { 
        message: "Registration successful! Please check your email to verify your account.",
        requiresVerification: true
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error("Register error:", error);
    
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { message: "Validation failed. Please check your input." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Server error during registration" },
      { status: 500 }
    );
  }
}