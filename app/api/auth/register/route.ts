// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import ActivityLog from "@/lib/models/ActivityLog";

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

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role: "admin", // First user or set default role
      isActive: true
    });

    // Log registration activity
    await ActivityLog.create({
      userId: user._id,
      username: user.username,
      email: user.email,
      action: "register",
      targetType: "user",
      targetId: user._id.toString(),
      details: { role: user.role }
    });

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error("Register error:", error);
    
    // Handle mongoose validation errors
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