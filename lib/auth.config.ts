// lib/auth.config.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./mongodb";
import User from "./models/User";
import ActivityLog from "./models/ActivityLog";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await connectDB();

          const user = await User.findOne({ 
            email: credentials.email
          });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          // Check if email is verified
          if (!user.isEmailVerified) {
            throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
          }

          // Check if account is active
          if (!user.isActive) {
            throw new Error("Your account has been deactivated. Please contact support.");
          }

          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          // Log activity
          await ActivityLog.create({
            userId: user._id,
            username: user.username,
            email: user.email,
            action: "login",
            targetType: "user",
            targetId: user._id.toString(),
            details: { role: user.role }
          });

          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/admin/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET
};