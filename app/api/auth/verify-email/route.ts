// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import ActivityLog from "@/lib/models/ActivityLog";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token and check expiration
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update user
    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Log verification activity
    await ActivityLog.create({
      userId: user._id,
      username: user.username,
      email: user.email,
      action: "update",
      targetType: "user",
      targetId: user._id.toString(),
      details: { emailVerified: true }
    });

    return NextResponse.json(
      { 
        message: "Email verified successfully! You can now log in.",
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Server error during verification" },
      { status: 500 }
    );
  }
}