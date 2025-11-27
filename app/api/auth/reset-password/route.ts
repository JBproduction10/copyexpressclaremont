// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import ActivityLog from "@/lib/models/ActivityLog";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
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
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log password reset activity
    await ActivityLog.create({
      userId: user._id,
      username: user.username,
      email: user.email,
      action: "update",
      targetType: "user",
      targetId: user._id.toString(),
      details: { passwordReset: true }
    });

    return NextResponse.json(
      { 
        message: "Password reset successfully! You can now log in with your new password.",
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Server error during password reset" },
      { status: 500 }
    );
  }
}