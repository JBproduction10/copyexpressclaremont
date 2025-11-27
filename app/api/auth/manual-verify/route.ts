// app/api/auth/manual-verify/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

// This endpoint allows you to manually verify users
// Remove this in production or add authentication
export async function POST(request: Request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Update user
    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json(
      { 
        message: "User verified successfully!",
        user: {
          email: user.email,
          username: user.username,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Manual verification error:", error);
    return NextResponse.json(
      { message: "Server error during verification" },
      { status: 500 }
    );
  }
}

// Get all users with verification status
export async function GET() {
  try {
    await connectDB();

    const users = await User.find()
      .select('username email isEmailVerified isActive createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        email: u.email,
        username: u.username,
        isEmailVerified: u.isEmailVerified,
        isActive: u.isActive,
        createdAt: u.createdAt
      }))
    });

  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}